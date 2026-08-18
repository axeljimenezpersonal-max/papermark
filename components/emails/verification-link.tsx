import React from "react";

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const VerificationCodeEmail = ({
  email = "user@example.com",
  code = "45PFSNUDYW",
  url,
}: {
  email?: string;
  code?: string;
  url?: string;
}) => {
  return (
    <Html>
      <Head />
      <Preview>Su código de acceso a la Bóveda SINAPSYS: {code}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded border border-solid border-neutral-200 px-10 py-5">
            <Section className="mt-8">
              <Text className="text-2xl font-bold tracking-tighter">
                SINAPSYS
              </Text>
            </Section>
            <Heading className="mx-0 my-7 p-0 text-xl font-semibold text-black">
              Su código de acceso
            </Heading>
            <Text className="text-sm leading-6 text-neutral-600">
              Ingrese este código para acceder a la Bóveda SINAPSYS:
            </Text>
            <Section className="my-6">
              <Text
                className="m-0 rounded-lg bg-neutral-100 px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] text-black"
                style={{ fontFamily: "monospace", letterSpacing: "0.3em" }}
              >
                {code}
              </Text>
            </Section>
            {url ? (
              <Section className="my-6 text-center">
                <Button
                  className="rounded-[4px] bg-black px-6 py-3 text-sm font-semibold text-white no-underline"
                  href={url}
                >
                  Entrar a la bóveda
                </Button>
                <Text className="mt-4 text-xs leading-5 text-neutral-500">
                  También puede entrar con el botón. Si no funciona, copie esta
                  dirección en su navegador:
                  <br />
                  {url}
                </Text>
              </Section>
            ) : null}
            <Text className="text-sm leading-6 text-neutral-600">
              El código y el enlace caducan en 15 minutos.
            </Text>
            <Text className="mt-4 text-sm leading-5 text-neutral-500">
              Si usted no solicitó este acceso, puede ignorar este correo.
            </Text>
            <Hr className="my-6" />
            <Section className="text-gray-400">
              <Text className="text-xs text-neutral-500">
                SINAPSYS CONSULTORIA IA · sinapsys.mx
                Dover, DE 19904
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerificationCodeEmail;
