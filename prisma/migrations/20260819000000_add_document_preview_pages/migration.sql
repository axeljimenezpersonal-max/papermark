-- Vista previa parcial por documento.
-- Columna anulable: los documentos existentes quedan sin límite (completos).
ALTER TABLE "Document" ADD COLUMN "previewPages" INTEGER;
