import Tesseract from "tesseract.js";

const { createWorker } = Tesseract;

export default async function imageToText(file: File[], ) {
  if (!file) return "Imagem não encontrada";
  const worker = await createWorker('por', 1, {logger: m => console.log(m)} ) // TODO: Permitir escolher a linguagem ('por'/'eng')
  let output = []

  for (let imageIndex = 0; imageIndex < file.length; imageIndex++) { // percorre todas as imagens; considerando uma lista por conta do PDF  
    const input = await worker.recognize(file[imageIndex]);
    output.push(input);
    
  }
  await worker.terminate()

  return output;
}
