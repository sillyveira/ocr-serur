import { Dispatch, SetStateAction } from "react";
import Tesseract from "tesseract.js";
import type { OcrResult } from "@/types/ocr";
const { createWorker } = Tesseract;

//TODO: Refatorar para deixar o código mais legível

export default async function imageToText(
  file: File[],
  setResult: Dispatch<SetStateAction<OcrResult[] | null>>
) {
  if (!file) return "Imagem não encontrada";

  let imageIndex = 0;

  const worker = await createWorker("por", 1, { // TODO: Adicionar suporte a inglês/português
    logger: (m) => {
      setResult((prev) => {
        let oldList = prev ?? [];
        const newList = [...oldList];
        newList[imageIndex] = {
          ...newList[imageIndex],
          status: m.status,
          progress: m.progress,
        };
        return newList;
      });
      console.log(m);
    },
  });

  for (let imageIndex = 0; imageIndex < file.length; imageIndex++) {
    // percorre todas as imagens; considerando uma lista por conta do PDF
    const input = await worker.recognize(file[imageIndex]);
    setResult((prev) => {
      let oldList = prev ?? [];
      const newList = [...oldList];
      newList[imageIndex] = {
        ...newList[imageIndex],
        result: input.data.text
      };
      return newList;
    });
  }
  await worker.terminate()
}