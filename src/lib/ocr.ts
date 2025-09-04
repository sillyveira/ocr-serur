import { Dispatch, SetStateAction } from "react";
import Tesseract from "tesseract.js";
import type { OcrResult } from "@/types/ocr";
const { createWorker } = Tesseract;

export default async function imageToText(
  file: File[],
  setResult: Dispatch<SetStateAction<OcrResult[] | null>>,
  language?: string[]
) {
  if (!file) return "Imagem não encontrada";

  // Inicializar o array de resultados para todas as páginas aparecerem o progresso antes de serem processadas
  setResult(Array(file.length).fill({}).map(() => ({ 
    status: "carregando", 
    progress: 0 
  })));
  
  // Variável para rastrear o índice atual e conseguir atualizar o progresso com o logger do tesseract
  let currentImageIndex = 0;
  const lang = language ?? ["por"];
  const worker = await createWorker(lang, 1, { 
    logger: (m) => {
      setResult((prev) => {
        const newList = [...(prev || [])];
        newList[currentImageIndex] = {
          ...newList[currentImageIndex],
          status: m.status,
          progress: m.progress,
        };
        return newList;
      });
    },
  });
  
  for (let i = 0; i < file.length; i++) {
    // Atualizar o índice atual
    currentImageIndex = i;
    
    // Processar a imagem atual
    const input = await worker.recognize(file[i]);
    
    setResult((prev) => {
      const newList = [...(prev || [])];
      newList[i] = {
        ...newList[i],
        result: input.data.text
      };
      return newList;
    });
  }
  
  await worker.terminate();
}