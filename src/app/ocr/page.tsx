"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import imageToText from "@/lib/ocr";
import type { OcrResult } from "@/types/ocr";
import { pdfToImage } from "@/lib/pdf";
import type { LogEntry } from "@/types/log";
import toast, { Toaster } from "react-hot-toast";
import Modal from "../components/modal";
import { applyBlackWhiteFilter } from "@/lib/filter";


export default function OCRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OcrResult[] | null>(null); // Lista do progresso e resultado das leituras
  const [language, setLanguage] = useState<string[]>(["por"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [filteredImagesFiles, setFilteredImagesFiles] = useState<File[]>([]);
  const [filteredImages, setFilteredImages] = useState<string[]>([]);
  const [processedImageFiles, setProcessedImageFiles] = useState<File[]>([]);
  const [blackAndWhiteFilter, setBlackAndWhiteFilter] = useState(false);



  const handleBWFilter = async () => {
    if (!processedImageFiles) return;
    
    try {
      const { filteredUrls, filteredFiles } = await applyBlackWhiteFilter(processedImages);
      setFilteredImages(filteredUrls);
      setFilteredImagesFiles(filteredFiles);
    } catch (error) {
      console.error("Erro ao aplicar filtro:", error);
      toast.error("Erro ao aplicar filtro preto e branco");
    }
  };

  // Monitorar mudanças no checkbox do filtro preto e branco
  useEffect(() => {
    if (blackAndWhiteFilter) {
      // Aplicar filtro preto e branco
      handleBWFilter();
    } else {
      // Voltar para as imagens originais
      setFilteredImages(processedImages);
      setFilteredImagesFiles(processedImageFiles);
    }
  }, [blackAndWhiteFilter, processedImages, processedImageFiles]);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Processar imagens para preview
      try {
        let imageList: File[] = [selectedFile];

        if (selectedFile.type === "application/pdf") {
          imageList = await pdfToImage(selectedFile);
        }

        // Converter files para URLs para preview
        const imageUrls = imageList.map(file => URL.createObjectURL(file));
        setProcessedImages(imageUrls);
        setFilteredImages(imageUrls);
        setProcessedImageFiles(imageList); // Armazenar os files também
        setFilteredImagesFiles(imageList); // Armazenando duas vezes pois a primeira será para reverter filtros.
      } catch (error) {
        console.error("Erro ao processar imagens:", error);
        // Para imagens simples, criar URL diretamente
        if (selectedFile.type.startsWith('image/')) {
          setProcessedImages([URL.createObjectURL(selectedFile)]);
          setProcessedImageFiles([selectedFile]);
          setFilteredImagesFiles([selectedFile]);
          setFilteredImages([URL.createObjectURL(selectedFile)]);
        }
      }
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    if (file.size > 15 * 1000000) return toast.error("O arquivo pesa mais de 15MB.");
    if (language.length === 0) {
      return toast.error("Selecione pelo menos um idioma.");
    }
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado. Aceitamos apenas PDF, PNG, JPG ou JPEG.");
      return;
    }
    // restrições impostas acima


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
      // Usar as imagens filtradas (que podem ser originais ou com filtro aplicado)
      let imageList: File[] = filteredImagesFiles.length > 0 ? filteredImagesFiles : [file];

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

    // Limpar URLs dos objetos para evitar vazamentos de memória
    processedImages.forEach(url => URL.revokeObjectURL(url));
    setProcessedImages([]);
    setFilteredImages([]);
    setProcessedImageFiles([]);
    setFilteredImagesFiles([]);
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
      <Toaster position="top-right" />
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
                      className={`absolute left-0 top-0 h-4 rounded-full transition-all duration-300 ${item.result ? "bg-green-500" : "bg-red-500"
                        }`}
                      style={{
                        width: `${item.result ? 100 : (item.progress ?? 0) * 100
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
                    className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 font-medium ${language.includes("por")
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
                    className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 font-medium ${language.includes("eng")
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
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Tamanho máximo do arquivo: 15MB
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Tipos aceitos: PDF, PNG e JPG
                </p>

                {/* UPLOAD + EDIT */}
                <div className="flex flex-row gap-2">
                  <button
                    onClick={handleFileUpload}
                    disabled={!file || isLoading}
                    className={`px-8 py-3 rounded-lg font-semibold text-lg transition ${!file || isLoading
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-700"
                      }`}
                  >
                    {isLoading ? "Processando..." : "UPLOAD"}
                  </button>


                  <button
                    onClick={() => {
                      if (file && !isLoading) {
                        setIsModalOpen(true);
                      }
                    }}
                    disabled={!file || isLoading}
                    className={`flex items-center rounded-2xl outline-1 transition ${!file || isLoading
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed hidden"
                      : "bg-red-500 text-white hover:bg-red-700 cursor-pointer"
                      }`}
                  >
                    <img src="/edit.svg" className="p-3" />
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Editor de Documento</h2>
          <p className="text-gray-600 mb-6">
            Essas são as imagens enviadas, você pode melhorar a visualização ativando o filtro preto e branco.
          </p>

          {file && (
            <div className="space-y-6">


              {
                filteredImages.length > 0 && (
                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Páginas/Imagens ({
                        filteredImages.length}):
                    </label>
                    <div className="max-h-96 overflow-y-auto space-y-4">
                      {
                        filteredImages.map((imageUrl, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-gray-50">
                            <p className="text-sm font-medium text-gray-600 mb-2">
                              Página {index + 1}
                            </p>
                            <img
                              src={imageUrl}
                              alt={`Página ${index + 1}`}
                              className="w-full max-w-sm mx-auto rounded border shadow-sm"
                            />
                          </div>

                        ))}
                    </div>

                    {/* Checkbox estilizado para filtro preto e branco */}
                    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <label className="flex items-center cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            name="blackWhiteFilter"
                            checked={blackAndWhiteFilter}
                            onChange={(e) => setBlackAndWhiteFilter(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${blackAndWhiteFilter
                            ? 'bg-red-500 border-red-500 shadow-md'
                            : 'bg-white border-gray-300 group-hover:border-red-400'
                            }`}>
                            {blackAndWhiteFilter && (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                            Ativar filtro preto e branco
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Melhora a leitura de documentos com baixo contraste
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
