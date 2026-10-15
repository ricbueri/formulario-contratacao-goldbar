import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";

const pdfPath =
  "C:/Users/bueri/OneDrive/Área de Trabalho/Gestão de Bar - Cursor/templates/cardapio_anexo.pdf";
const outDir = path.resolve("scripts/cardapio-pages");
fs.mkdirSync(outDir, { recursive: true });

const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
const shots = await parser.getScreenshot({ scale: 2, firstPage: 1, lastPage: 4 });
for (const page of shots.pages) {
  const file = path.join(outDir, `page-${page.pageNumber}.png`);
  fs.writeFileSync(file, page.data);
  console.log("wrote", file);
}
await parser.destroy();
