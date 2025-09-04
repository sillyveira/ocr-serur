// app/api/log/route.ts
import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const logFile = path.join(process.cwd(), "logs.json");

import type { LogEntry } from "@/types/log";

// Lê e parseia o arquivo
async function readLogs(): Promise<LogEntry[]> {
  try {
    const data = await fs.readFile(logFile, "utf-8");
    return JSON.parse(data);
  } catch {
    return []; // se o arquivo não existir ainda
  }
}

// Cria um novo log
export async function POST(req: NextRequest) {
  try {
    const { filename, size, type, status, language } = await req.json();

    if (!filename || !size || !type || !language) {
      return Response.json({ message: "Campos obrigatórios: filename, size, type, language." }, { status: 400 });
    }

    const logs = await readLogs();

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      filename,
      size,
      type,
      status,
      language,
    };

    logs.push(entry);

    await fs.writeFile(logFile, JSON.stringify(logs, null, 2), "utf-8");

    return new Response(JSON.stringify({ success: true, entry }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return Response.json({ message: "O log foi escrito com sucesso." }, { status: 200 });
  }
}

// Rota para retornar os logs
export async function GET() {
  const logs = await readLogs();

  return Response.json({ count: logs.length, logs}, { status: 200 });
}
