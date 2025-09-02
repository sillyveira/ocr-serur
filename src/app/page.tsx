import Image from "next/image";
import Link from "next/link";
import HomeFeature from "./components/home-feature";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-200 flex flex-col">
      {/* Header */}
      <header className="flex justify-center py-8">
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
              Extração de Texto
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Faça upload do seu documento e extraia o texto automaticamente com
              precisão profissional
            </p>
          </div>

          {/* Upload Section como link */}
          <Link href="/ocr" className="block">
            <div className="flex justify-center">
              <span className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold text-lg hover:bg-red-700 transition">
                Acessar
              </span>
            </div>
          </Link>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <HomeFeature image={"/file.svg"} title="Múltiplos Formatos" subtitle="Suporte para PDF, JPG e PNG com alta precisão" />
            <HomeFeature image={"/next.svg"} title="Processamento Rápido" subtitle="Extração automatizada em segundos" />
            <HomeFeature image={"/window.svg"} title="Seguro e Confiável" subtitle="Seus documentos são processados com segurança" />
          </div>
        </div>
      </main>
    </div>
  );
}
