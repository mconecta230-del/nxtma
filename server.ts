import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure valid PNG icons exist in public/ for PWA installability
function ensurePwaPngIcons() {
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const createSolidYellowNotePng = (size: number, padded = false): Buffer => {
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    const crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c;
    }

    const crc32 = (buf: Buffer): number => {
      let c = 0xffffffff;
      for (let i = 0; i < buf.length; i++) {
        c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
      }
      return (c ^ 0xffffffff) >>> 0;
    };

    const makeChunk = (type: string, data: Buffer): Buffer => {
      const len = Buffer.alloc(4);
      len.writeUInt32BE(data.length, 0);
      const typeBuf = Buffer.from(type, 'ascii');
      const crcBuf = Buffer.alloc(4);
      crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
      return Buffer.concat([len, typeBuf, data, crcBuf]);
    };

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // RGBA
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const rawData = Buffer.alloc(size * (size * 4 + 1));
    const margin = padded ? Math.floor(size * 0.22) : Math.floor(size * 0.16);

    for (let y = 0; y < size; y++) {
      const rowStart = y * (size * 4 + 1);
      rawData[rowStart] = 0; // filter type 0
      for (let x = 0; x < size; x++) {
        const px = rowStart + 1 + x * 4;
        // Golden yellow background (#FACC15)
        let r = 250, g = 204, b = 21, a = 255;

        // Inner note card (#FEF9C3)
        if (x >= margin && x < size - margin && y >= margin && y < size - margin) {
          r = 254; g = 249; b = 195;
          // Lines inside note (#1E293B)
          const relY = (y - margin) / (size - margin * 2);
          const relX = (x - margin) / (size - margin * 2);
          if (relX >= 0.18 && relX <= 0.82) {
            if (
              (relY >= 0.26 && relY <= 0.34) ||
              (relY >= 0.48 && relY <= 0.55 && relX <= 0.68) ||
              (relY >= 0.68 && relY <= 0.75 && relX <= 0.55)
            ) {
              r = 30; g = 41; b = 59;
            }
          }
        }
        rawData[px] = r;
        rawData[px + 1] = g;
        rawData[px + 2] = b;
        rawData[px + 3] = a;
      }
    }

    const idat = makeChunk('IDAT', zlib.deflateSync(rawData));
    const iend = makeChunk('IEND', Buffer.alloc(0));
    return Buffer.concat([signature, makeChunk('IHDR', ihdr), idat, iend]);
  };

  const icons: Array<{ file: string; size: number; padded: boolean }> = [
    { file: 'apple-touch-icon.png', size: 180, padded: false },
    { file: 'pwa-192x192.png', size: 192, padded: false },
    { file: 'pwa-512x512.png', size: 512, padded: false },
    { file: 'pwa-maskable-512x512.png', size: 512, padded: true },
  ];

  for (const icon of icons) {
    const filePath = path.join(publicDir, icon.file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, createSolidYellowNotePng(icon.size, icon.padded));
    }
  }
}

ensurePwaPngIcons();

function getAiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // AI Assistant for Notes
  app.post('/api/ai/note-assist', async (req, res) => {
    try {
      const { action, title, content } = req.body as {
        action: 'summarize' | 'topics' | 'improve' | 'checklist' | 'find_tasks';
        title: string;
        content: string;
      };

      const ai = getAiClient();
      const noteContext = `Título: ${title || 'Sem título'}\nConteúdo:\n${content || ''}`;

      if (action === 'checklist' || action === 'find_tasks') {
        const prompt =
          action === 'checklist'
            ? `Transforme o texto da nota abaixo em itens práticos e diretos de checklist em português do Brasil.\n\n${noteContext}`
            : `Identifique e extraia todas as tarefas acionáveis presentes na nota abaixo em português do Brasil.\n\n${noteContext}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                items: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Lista de itens ou tarefas extraídas da nota.',
                },
              },
              required: ['items'],
            },
          },
        });

        const parsed = JSON.parse(response.text?.trim() || '{"items":[]}');
        res.json({ items: parsed.items || [] });
        return;
      }

      let instruction = '';
      if (action === 'summarize') {
        instruction =
          'Crie um resumo executivo curto, claro e objetivo (em 2 a 3 frases) do conteúdo desta nota em português do Brasil. Retorne apenas o texto do resumo.';
      } else if (action === 'topics') {
        instruction =
          'Organize e estruture o conteúdo desta nota em tópicos claros usando marcadores (- ) em português do Brasil. Retorne apenas o texto organizado.';
      } else if (action === 'expand') {
        instruction =
          'Expanda e desenvolva as ideias desta nota em português do Brasil, acrescentando sugestões práticas, argumentos e próximos passos relevantes para marketing e produtividade. Retorne apenas o texto expandido.';
      } else if (action === 'copy_post') {
        instruction =
          'Transforme o conteúdo desta nota em uma copy atraente e persuasiva para redes sociais ou WhatsApp em português do Brasil, com gancho inicial, desenvolvimento escaneável e chamada para ação (CTA). Retorne apenas o texto pronto.';
      } else {
        instruction =
          'Corrija a gramática, melhore a clareza e deixe o texto desta nota mais fluido e bem escrito em português do Brasil, mantendo o sentido original. Retorne apenas o texto melhorado.';
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${instruction}\n\n${noteContext}`,
      });

      res.json({ result: response.text?.trim() || '' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao processar com Assistente de IA';
      res.status(500).json({ error: message });
    }
  });

  // AI Copywriter & Script Generator for Estúdio & Ferramentas
  app.post('/api/ai/copywriter', async (req, res) => {
    try {
      const { framework, clientName, tone, topic } = req.body as {
        framework?: string;
        clientName?: string;
        tone?: string;
        topic?: string;
      };

      const ai = getAiClient();
      const prompt = `Você é um estrategista e copywriter sênior da agência Next Marketing.
Crie um material completo em português do Brasil seguindo exatamente as especificações abaixo:
- Formato/Framework solicitado: ${framework || 'AIDA (Atenção, Interesse, Desejo, Ação)'}
- Cliente/Projeto: ${clientName || 'Prime Cursos'}
- Tom de voz: ${tone || 'Profissional, persuasivo e direto'}
- Tema, produto ou oferta: ${topic || 'Campanha de captação de alunos e engajamento'}

Estruture o texto de forma clara, pronta para uso imediato, incluindo gancho forte, desenvolvimento persuasivo e chamada para ação (CTA).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({ result: response.text?.trim() || '' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao gerar copy com IA';
      res.status(500).json({ error: message });
    }
  });

  // AI Assistant for Publications (Ideas, Captions, Hashtags)
  app.post('/api/ai/publication-assist', async (req, res) => {
    try {
      const { action, title, clientName, network, caption, notes } = req.body as {
        action: 'ideas' | 'caption' | 'hashtags';
        title?: string;
        clientName?: string;
        network?: string;
        caption?: string;
        notes?: string;
      };

      const ai = getAiClient();

      if (action === 'ideas') {
        const prompt = `Gere 4 ideias criativas e estratégicas de publicações para redes sociais em português do Brasil.
Cliente/Projeto: ${clientName || 'Prime Cursos'}
Rede preferencial: ${network && network !== 'all' ? network : 'Instagram, Facebook, WhatsApp ou TikTok'}
Retorne cada ideia com um título atraente, a rede sugerida e uma breve observação prática de formato ou abordagem.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                ideas: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      network: { type: Type.STRING },
                      notes: { type: Type.STRING },
                      caption: { type: Type.STRING },
                      hashtags: { type: Type.STRING },
                    },
                    required: ['title', 'network', 'notes', 'caption', 'hashtags'],
                  },
                },
              },
              required: ['ideas'],
            },
          },
        });

        const parsed = JSON.parse(response.text?.trim() || '{"ideas":[]}');
        res.json({ ideas: parsed.ideas || [] });
        return;
      }

      if (action === 'caption') {
        const prompt = `Escreva uma legenda envolvente, autêntica e pronta para publicação em português do Brasil.
Tema/Título: ${title || 'Publicação'}
Cliente/Projeto: ${clientName || 'Geral'}
Rede social: ${network || 'Instagram'}
Observações: ${notes || 'Focar em clareza, valor prático e chamada para ação (CTA) ao final.'}
Retorne apenas o texto da legenda (sem hashtags no final, pois elas têm campo próprio).`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        res.json({ result: response.text?.trim() || '' });
        return;
      }

      if (action === 'hashtags') {
        const prompt = `Sugira de 8 a 12 hashtags estratégicas e relevantes em português do Brasil para a seguinte publicação:
Tema/Título: ${title || ''}
Cliente/Projeto: ${clientName || ''}
Rede social: ${network || 'Instagram'}
Legenda: ${caption || ''}
Retorne apenas as hashtags separadas por espaço (ex: #marketingdigital #conteudo ...).`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        res.json({ result: response.text?.trim() || '' });
        return;
      }

      res.status(400).json({ error: 'Ação inválida' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao processar com Assistente de IA';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Meu Espaço rodando na porta ${PORT}`);
  });
}

startServer();
