import { useState } from "react";

import { toast } from "sonner";
import { mutate } from "swr";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Vista previa parcial de un documento.
 *
 * El visitante ve las primeras N páginas; a partir de ahí el servidor entrega
 * una imagen de aviso con la marca SINAPSYS. Las páginas restringidas no
 * viajan al navegador, así que no hay nada que recuperar desde el cliente.
 */
export function LimitarVistaPreviaModal({
  open,
  setOpen,
  documentId,
  documentName,
  numPages,
  previewPages,
  teamId,
  dataroomId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  documentId: string;
  documentName: string;
  numPages?: number | null;
  previewPages?: number | null;
  teamId?: string;
  dataroomId: string;
}) {
  const [valor, setValor] = useState<string>(
    previewPages ? String(previewPages) : "",
  );
  const [guardando, setGuardando] = useState(false);

  const guardar = async (limite: number | null) => {
    if (limite !== null && (!Number.isInteger(limite) || limite < 1)) {
      toast.error("Escriba un número entero mayor o igual a 1.");
      return;
    }
    if (limite !== null && numPages && limite >= numPages) {
      toast.error(
        `El documento tiene ${numPages} páginas: use un número menor para que la restricción tenga efecto.`,
      );
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(
        `/api/teams/${teamId}/documents/${documentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ previewPages: limite }),
        },
      );
      if (!res.ok) throw new Error(await res.text());

      toast.success(
        limite === null
          ? "El documento se mostrará completo."
          : `Se mostrarán ${limite} de ${numPages ?? "?"} páginas.`,
      );
      mutate(`/api/teams/${teamId}/datarooms/${dataroomId}/documents`);
      setOpen(false);
    } catch {
      toast.error("No se pudo guardar el límite.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Limitar vista previa</DialogTitle>
          <DialogDescription className="pt-1">
            {documentName}
            {numPages ? ` · ${numPages} páginas` : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="paginas-visibles">Páginas visibles</Label>
          <Input
            id="paginas-visibles"
            type="number"
            min={1}
            placeholder="Ejemplo: 5"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            autoFocus
          />
          <p className="text-sm text-muted-foreground">
            El visitante verá las primeras páginas con normalidad. A partir del
            límite aparecerá un aviso con su marca y su correo de contacto —{" "}
            <span className="font-medium text-foreground">
              las páginas restringidas no se envían a su navegador
            </span>
            .
          </p>
          {previewPages ? (
            <p className="text-sm text-muted-foreground">
              Actualmente muestra {previewPages} página(s).
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Actualmente se muestra completo.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            disabled={guardando}
            onClick={() => guardar(null)}
          >
            Mostrar completo
          </Button>
          <Button
            disabled={guardando || valor.trim() === ""}
            onClick={() => guardar(Number(valor.trim()))}
          >
            {guardando ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
