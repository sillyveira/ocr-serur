"use client";
import { useState } from "react";
import Image from "next/image";
import imageToText from "@/lib/ocr";
import type { OcrResult } from "@/types/ocr";
import { pdfToImage } from "@/lib/pdf";

export default function OCRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OcrResult[] | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setUploadedFileName(file.name);

    let imageList: File[] = [file];

    if (file.type === "application/pdf") {
      imageList = await pdfToImage(file);
    }

    await imageToText(imageList, setResult);
    setIsLoading(false);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setUploadedFileName("");
  };

  const calculateOverallProgress = (results: OcrResult[] | null): number => {
    if (!results || results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + (r.progress || 0), 0);
    return total / results.length;
  };

  const overallProgress = calculateOverallProgress(result);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-200 flex flex-col">
      {/* Header */}
      <header className="flex justify-center pt-8">
        <Image
          src="/logo_serur.svg"
          alt="SERUR"
          width={120}
          height={48}
          className="h-12 md:h-16"
        />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full">
        {result && result.length > 0 ? (
          <div className="max-w-4xl w-full space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isLoading ? "Processando documento..." : "Resultado da extração"}
              </h2>
            </div>

            {/* Barra de progresso geral */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Progresso Total</span>
                <span className="text-sm text-gray-500">{Math.round(overallProgress * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                <div
                  className="bg-red-600 h-5 rounded-full transition-all duration-300 text-white flex items-center justify-center text-xs font-semibold"
                  style={{ width: `${overallProgress * 100}%` }}
                >
                  {Math.round(overallProgress * 100)}%
                </div>
              </div>
            </div>

            {/* Resultados por página */}
            <div className="w-full max-h-[32rem] overflow-y-auto space-y-4 p-4 bg-white rounded-xl shadow-lg">
              {result.map((item, idx) => (
                <div key={idx} className="mb-6 border-b pb-4 last:border-b-0">
                  <div className="flex justify-between mb-2">
                    <span className="text-lg font-medium text-gray-700">Página {idx + 1}</span>
                    <span className="text-sm text-gray-500">
                      {Math.round((item.progress ?? 0) * 100)}%
                    </span>
                  </div>

                  {/* Barra individual */}
                  <div className="relative w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-4 rounded-full transition-all duration-300 ${
                        item.result ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ width: `${item.result ? 100 : (item.progress ?? 0) * 100}%` }}
                    />
                  </div>

                  {/* Status da página */}
                  <p className="text-sm text-gray-500 text-center mb-2">
                    {item.result ? "Concluído" : item.status || "Processando..."}
                  </p>

                  {/* Texto extraído */}
                  {item.result && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">{item.result}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!isLoading && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-700 transition"
                >
                  Refazer OCR
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl w-full space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-black text-4xl font-bold mb-2">Upload de Documento</h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Selecione seu documento para extrair o texto automaticamente
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex flex-col items-center gap-6">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                />

                {file && (
                  <p className="text-sm text-gray-600 text-center">
                    Arquivo selecionado: <span className="font-medium">{file.name}</span>
                  </p>
                )}

                <button
                  onClick={handleFileUpload}
                  disabled={!file || isLoading}
                  className={`px-8 py-3 rounded-lg font-semibold text-lg transition ${
                    !file || isLoading
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-700"
                  }`}
                >
                  {isLoading ? "Processando..." : "UPLOAD"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
