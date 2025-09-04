"use client";
import { useState } from "react";
import Image from "next/image";
import imageToText from "@/lib/ocr";
import type { OcrResult } from "@/types/ocr";
import { pdfToImage } from "@/lib/pdf";
import type { LogEntry } from "@/types/log";
import toast, { Toaster } from "react-hot-toast";

export default function OCRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OcrResult[] | null>(null); // Lista do progresso e resultado das leituras
  const [language, setLanguage] = useState<string[]>(["por"]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    if (file.size > 15 * 1000000) return toast.error("O arquivo pesa mais de 15MB."); // 15MB
    setIsLoading(true);
    setUploadedFileName(file.name);

    const log: LogEntry = {
      timestamp: new Date().toISOString(),
      status: "",
      filename: file.name,
      size: file.size,
      type: file.type,
      language,
    };

    try {
      let imageList: File[] = [file];

      if (file.type === "application/pdf") {
        imageList = await pdfToImage(file);
      }

      await imageToText(imageList, setResult, language);
      toast.success(
        "O texto foi lido com sucesso. Clique para copiar ou baixar!"
      );
    } catch (error) {
      toast.error(`Erro ao processar o arquivo: ${error}`);
      log.status = "erro";
    } finally {
      setIsLoading(false);

      await fetch("/api/log", { method: "POST", body: JSON.stringify(log) });
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setUploadedFileName("");
  };

  // Se a linguagem já estiver, é removida, se não, adiciona
  const handleLanguageChange = (lang: string) => {
    setLanguage((prev) => {
      if (prev.includes(lang)) {
        return prev.filter((l) => l !== lang);
      } else {
        return [...prev, lang];
      }
    });
  };

  const handleCopyText = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast.success("Texto copiado com sucesso.");
    } catch (err) {
      toast.error(`Erro ao copiar: ${err}`);
    }
  };

  const handleDownloadText = (text: string, filename: string) => {
    try {
      // Cria um elemento no HTML com o txt e clica para baixar.
      const element = document.createElement("a");
      const file = new Blob([text], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${filename.split(".")[0]}_texto.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (e) {
      toast.error(`Erro ao baixar: ${e}`);
    }
  };

  // Calcula a média das porcentagens de todos itens
  const calculateOverallProgress = (results: OcrResult[] | null): number => {
    if (!results || results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + (r.progress || 0), 0);
    return total / results.length;
  };

  const overallProgress = calculateOverallProgress(result);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-200 flex flex-col">
      {/* Header fixo */}
      <Toaster />
      <header className="fixed top-0 left-0 w-full bg-gradient-to-b from-red-50 to-red-100 shadow-sm z-10 py-4">
        <div className="flex justify-center">
          <Image
            src="/logo_serur.svg"
            alt="SERUR"
            width={120}
            height={48}
            className="h-12 md:h-16"
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full mt-24">
        {result && result.length > 0 ? (
          <div className="max-w-4xl w-full space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isLoading
                  ? "Processando documento..."
                  : "Resultado da extração"}
              </h2>
            </div>

            {/* Barra de progresso geral */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Progresso Total
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(overallProgress * 100)}%
                </span>
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
            <div className="w-full max-h-[28rem] overflow-y-auto space-y-4 p-4 bg-white rounded-xl shadow-lg">
              {result.map((item, idx) => (
                <div key={idx} className="mb-6 border-b pb-4 last:border-b-0">
                  <div className="flex justify-between mb-2">
                    <span className="text-lg font-medium text-gray-700">
                      Página {idx + 1}
                    </span>
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
                      style={{
                        width: `${
                          item.result ? 100 : (item.progress ?? 0) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <div></div>
                  {/* Status da página */}
                  <p className="text-sm text-gray-500 text-center mb-2">
                    {item.result
                      ? "Concluído"
                      : item.status || "Processando..."}
                  </p>

                  {/* Texto extraído */}
                  {item.result && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-end gap-2 mb-3">
                        <button
                          onClick={() => handleCopyText(item.result || "")}
                          className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm font-medium border border-red-200"
                        >
                          Copiar
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadText(
                              item.result || "",
                              `${uploadedFileName}_pagina_${idx + 1}`
                            )
                          }
                          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          Baixar
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">
                        {item.result}
                      </pre>
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
            {/* Título e subtítulo */}
            <div className="text-center space-y-4">
              <h1 className="text-black text-4xl font-bold mb-2">
                Upload de Documento
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Selecione seu documento para extrair o texto automaticamente
              </p>
            </div>

            {/* Linguagem*/}
            <div className="w-full max-w-2xl mx-auto mb-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-4">
                <h3 className="text-center text-gray-700 font-medium mb-3">
                  Idiomas para reconhecimento
                </h3>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("por")}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 font-medium ${
                      language.includes("por")
                        ? "bg-red-500 text-white border-red-600 shadow-md transform scale-105"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-red-50"
                    }`}
                  >
                    <span className="mr-2 text-xl">🇧🇷</span>
                    <span>Português</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("eng")}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 font-medium ${
                      language.includes("eng")
                        ? "bg-red-500 text-white border-red-600 shadow-md transform scale-105"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-red-50"
                    }`}
                  >
                    <span className="mr-2 text-xl">🇺🇸</span>
                    <span>Inglês</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Upload*/}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex flex-col items-center gap-6">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Tamanho máximo do arquivo: 15MB
                </p>
                {file && (
                  <p className="text-sm text-gray-600 text-center">
                    Arquivo selecionado:{" "}
                    <span className="font-medium">{file.name}</span>
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
