import { createHash, randomBytes } from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { fetchAndDeleteLoginCodeData } from "@/lib/emails/send-verification-request";
import prisma from "@/lib/prisma";
import { ratelimit } from "@/lib/redis";

// NextAuth guarda el token cifrado con este mismo algoritmo; lo replicamos
// para poder emitir uno nuevo desde aquí.
const hashToken = (token: string) =>
  createHash("sha256")
    .update(`${token}${process.env.NEXTAUTH_SECRET}`)
    .digest("hex");

// Rate limiters
const emailRateLimit = ratelimit(5, "1 m"); // 5 attempts per minute per email
const ipRateLimit = ratelimit(10, "1 m"); // 10 attempts per minute per IP

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

// POST: Verify via email + code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    // Type checks first to prevent calling .trim() on non-strings
    if (typeof email !== "string" || typeof code !== "string") {
      return NextResponse.json(
        { error: "Email and code are required." },
        { status: 400 },
      );
    }

    // Normalize after type check
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim().toUpperCase();

    // Validate non-empty email and exact code length
    if (!normalizedEmail || normalizedCode.length !== 10) {
      return NextResponse.json(
        { error: "Invalid email or code format." },
        { status: 400 },
      );
    }

    const ip = getClientIp(request);

    // Check both rate limits
    const [emailLimit, ipLimit] = await Promise.all([
      emailRateLimit.limit(`verify_code:${normalizedEmail}`),
      ipRateLimit.limit(`verify_code:ip:${ip}`),
    ]);

    if (!emailLimit.success) {
      return NextResponse.json(
        {
          error: "Too many attempts. Please wait before trying again.",
          retryAfter: Math.ceil((emailLimit.reset - Date.now()) / 1000),
          remaining: 0,
        },
        { status: 429 },
      );
    }

    if (!ipLimit.success) {
      return NextResponse.json(
        {
          error: "Too many attempts. Please wait before trying again.",
          retryAfter: Math.ceil((ipLimit.reset - Date.now()) / 1000),
          remaining: 0,
        },
        { status: 429 },
      );
    }

    // Atomically fetch and delete to prevent TOCTOU race condition
    const loginCodeData = await fetchAndDeleteLoginCodeData(
      normalizedEmail,
      normalizedCode,
    );

    if (!loginCodeData) {
      return NextResponse.json(
        {
          error: "Invalid code. Please check your email and try again.",
          remaining: emailLimit.remaining,
        },
        { status: 401 },
      );
    }

    // Parche self-host: aquí se devolvía el MISMO enlace que viajó en el
    // correo. Ese enlace es de un solo uso y los escáneres de correo (Gmail
    // entre ellos) lo abren al recibirlo, así que ya venía consumido: el
    // usuario escribía su código correcto y aun así rebotaba al login con
    // "error=Verification", sin explicación. Ahora emitimos un acceso nuevo.
    const destino = (() => {
      try {
        return (
          new URL(loginCodeData.callbackUrl).searchParams.get("callbackUrl") ??
          "/dashboard"
        );
      } catch {
        return "/dashboard";
      }
    })();

    const nuevoToken = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: hashToken(nuevoToken),
        expires: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    const base = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_BASE_URL;
    const callbackUrl =
      `${base}/api/auth/callback/email` +
      `?callbackUrl=${encodeURIComponent(destino)}` +
      `&token=${nuevoToken}` +
      `&email=${encodeURIComponent(normalizedEmail)}`;

    return NextResponse.json({ callbackUrl });
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 },
    );
  }
}
