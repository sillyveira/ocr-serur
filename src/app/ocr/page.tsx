"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import imageToText from "@/lib/ocr";

function OCRPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    
    const router = useRouter();      
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };
    
    const handleFileUpload = async () => {
        if (!file) return;

        setUploadedFileName(file.name);
        setIsLoading(true);

        const output = await imageToText([file])

        if (typeof output[0] === "string") {
            alert(output[0]);
        } else {
            alert(output[0].data.text);
        }

        setIsLoading(false);
    };
    
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="max-w-2xl w-full space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-black text-4xl font-bold mb-2">
                            Upload de Documento
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Selecione seu documento para extrair o texto automaticamente
                        </p>
                    </div>

                    {/* Upload Section */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-full flex flex-col items-center">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                                />
                            </div>
                            
                            {file && (
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        Arquivo selecionado: <span className="font-medium">{file.name}</span>
                                    </p>
                                </div>
                            )}
                            
                            <button
                                onClick={handleFileUpload}
                                disabled={!file || isLoading}
                                className={`px-8 py-3 rounded-lg font-semibold text-lg transition ${
                                    !file || isLoading
                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                        : 'bg-red-500 text-white hover:bg-red-700'
                                }`}
                            >
                                {isLoading ? 'Processando...' : 'UPLOAD'}
                            </button>
                            
                            {isLoading && (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Processando {uploadedFileName}...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default OCRPage;
