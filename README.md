# OCR SERUR 📄

Aplicação web para extração de texto de documentos usando OCR. Desenvolvida com Next.js, Tesseract.js e PDF.js.

🌐 **[Ver online](https://ocr-serur.vercel.app/)**

## Como rodar local

```bash
git clone https://github.com/sillyveira/ocr-serur.git
cd ocr-serur
npm install
npm run dev
```

Acesse: http://localhost:3000

## Limitações

- **Tamanho**: Máximo 15MB
- **Tipos**: PDF, PNG, JPG
- **Idiomas**: Português e Inglês

## Como funciona

**Upload** → **OCR** → **Resultado**

1. Usuário faz upload do arquivo e seleciona idioma.
2. Sistema processa com Tesseract.js (PDFs são convertidos para imagem através do PDF.js)  
3. Texto extraído pode ser copiado ou baixado
4. O log de cada ação é gerada no servidor e guardado em /logs.json, os logs podem ser acessados com uma requsição GET a localhost:3000/api/log.

## O que aprendi

> Foquei em ler as documentações de todas as bibliotecas usadas e do Next. Também aprendi bastante com meus erros durante o desenvolvimento, por mais que não tenha conseguido implementar o PDF.js no servidor (limitações do Vercel), aprendi a lidar com envio e recebimento de arquivos por requisição HTTP (manipular Blob, o que é um buffer, etc.), entendi como funciona a conversão de pdf->imagem por trás e fiz no lado do client. 

> Melhorei a minha tipagem e estruturação de projetos no Next. Enfrentei alguns desafios técnicos, como na parte de demonstrar o progresso do OCR (ao usar um único worker, é necessário manipular o logger da função para monitorar o progresso de múltiplas páginas) e isso me levou a melhorar minhas capacidades de resolução de problema e uso melhor do JS puro.

> Foi a minha primeira vez usando as API Routes do Next, estudei as tipagens e entendi melhor como funcionam a partir da documentação e uso no projeto. 