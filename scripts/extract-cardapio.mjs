import fs from "fs";
import { PDFParse } from "pdf-parse";

const path =
  "C:/Users/bueri/OneDrive/Área de Trabalho/Gestão de Bar - Cursor/templates/cardapio_anexo.pdf";
const parser = new PDFParse({ data: fs.readFileSync(path) });
const result = await parser.getText();
console.log(result.text);
await parser.destroy();
