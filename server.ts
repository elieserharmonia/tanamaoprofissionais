import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to avoid crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment. Please add it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// AI Endpoints
app.post('/api/generate-bio', async (req, res) => {
  try {
    const { nome, especialidade, anos, servicos, diferencial } = req.body;
    
    if (!nome || !especialidade) {
      res.status(400).json({ error: 'Nome e Especialidade são campos obrigatórios.' });
      return;
    }

    const client = getAiClient();
    
    const prompt = `Crie uma BIO profissional para um profissional autônomo chamado ${nome}, especialista em ${especialidade} com ${anos || 0} anos de experiência. Principais serviços: ${Array.isArray(servicos) ? servicos.join(', ') : (servicos || 'serviços gerais')}. Diferencial: ${diferencial || 'atendimento caprichado'}. A BIO deve ter no máximo 300 caracteres, tom profissional e convidativo, em português brasileiro. Retorne apenas o texto da BIO, sem aspas.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const bio = response.text?.trim() || '';
    res.json({ bio });
  } catch (error: any) {
    console.error('Error generating bio:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar bio com IA.' });
  }
});

app.post('/api/suggest-response', async (req, res) => {
  try {
    const { nome, categoria, sobreServicos, mensagemCliente } = req.body;

    if (!mensagemCliente) {
      res.status(400).json({ error: 'Mensagem do cliente é obrigatória.' });
      return;
    }

    const client = getAiClient();

    const systemInstruction = `Você é assistente do profissional ${nome || 'do TáNaMão'}, especializado em ${categoria || 'serviços diversos'}. Responda de forma cordial, prestativa e profissional em português brasileiro. Contexto sobre os serviços do profissional: ${sobreServicos || 'não especificado'}. Forneça uma sugestão de resposta curta (no máximo 3 a 4 linhas) direta e amigável. Retorne apenas a sugestão de resposta limpa, sem aspas ou marcações.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: mensagemCliente,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    const suggestion = response.text?.trim() || '';
    res.json({ suggestion });
  } catch (error: any) {
    console.error('Error suggesting response:', error);
    res.status(500).json({ error: error.message || 'Erro ao sugerir resposta automática.' });
  }
});

// Configure Vite or Static Files
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupVite();
