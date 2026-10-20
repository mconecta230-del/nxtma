import React, { useMemo, useState } from 'react';
import {
  Calculator,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Hash,
  Kanban,
  Link2,
  Loader2,
  MessageSquare,
  Plus,
  QrCode,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import {
  ClientProject,
  MarketingSnippet,
  Publication,
  SocialNetwork,
} from '../types';
import { getTodayISO } from '../utils/initialData';

interface MarketingStudioViewProps {
  clients: ClientProject[];
  snippets: MarketingSnippet[];
  onAddSnippet: (snippet: Omit<MarketingSnippet, 'id'>) => void;
  onDeleteSnippet: (id: string) => void;
  onCreateNoteFromContent: (title: string, content: string, tags: string[]) => void;
  onCreatePublicationFromCopy: (pub: Publication) => void;
  onNotify: (msg: string) => void;
}

type StudioTab = 'copywriter' | 'whatsapp_utm' | 'snippets' | 'calculator';

const COPY_FRAMEWORKS = [
  {
    id: 'Roteiro de Reels / TikTok (Gancho + Conteúdo + CTA)',
    label: 'Roteiro de Reels / TikTok',
    desc: 'Gancho de 3s, desenvolvimento dinâmico e chamada final.',
    defaultNetwork: 'Instagram' as SocialNetwork,
  },
  {
    id: 'Fórmula AIDA (Atenção, Interesse, Desejo e Ação)',
    label: 'Legenda AIDA',
    desc: 'Estrutura clássica para posts de feed e carrosséis de vendas.',
    defaultNetwork: 'Instagram' as SocialNetwork,
  },
  {
    id: 'Fórmula PAS (Problema, Agitação e Solução)',
    label: 'Copy PAS (Conversão)',
    desc: 'Toca na dor do público e apresenta o curso/serviço como solução.',
    defaultNetwork: 'Facebook' as SocialNetwork,
  },
  {
    id: 'Anúncio para Tráfego Pago (Meta Ads / Instagram Ads)',
    label: 'Anúncio Meta Ads',
    desc: 'Texto principal, título persuasivo e CTA para campanhas.',
    defaultNetwork: 'Instagram' as SocialNetwork,
  },
  {
    id: 'Sequência de 4 Stories de Engajamento e Conversão',
    label: 'Sequência de Stories',
    desc: 'Roteiro de 4 telas com enquete, prova social e link.',
    defaultNetwork: 'Instagram' as SocialNetwork,
  },
  {
    id: 'Script de Abordagem e Fechamento no WhatsApp',
    label: 'Script Comercial WhatsApp',
    desc: 'Mensagem humanizada para converter leads em matrículas.',
    defaultNetwork: 'WhatsApp' as SocialNetwork,
  },
];

export const MarketingStudioView: React.FC<MarketingStudioViewProps> = ({
  clients,
  snippets,
  onAddSnippet,
  onDeleteSnippet,
  onCreateNoteFromContent,
  onCreatePublicationFromCopy,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('copywriter');

  // 1. Copywriter State
  const [selectedFramework, setSelectedFramework] = useState(
    COPY_FRAMEWORKS[0].id
  );
  const [copyClientId, setCopyClientId] = useState(
    clients[0]?.id || 'client-prime'
  );
  const [copyTone, setCopyTone] = useState('Profissional, didático e persuasivo');
  const [copyTopic, setCopyTopic] = useState('');
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  // 2. WhatsApp & UTM State
  const [waPhone, setWaPhone] = useState('5547999999999');
  const [waMessage, setWaMessage] = useState(
    'Olá! Vim pelo Instagram da Prime Cursos e gostaria de saber mais sobre os cursos e certificados.'
  );
  const [utmBaseUrl, setUtmBaseUrl] = useState('https://www.primecursos.com.br');
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmMedium, setUtmMedium] = useState('stories');
  const [utmCampaign, setUtmCampaign] = useState('campanha_cursos');
  const [utmContent, setUtmContent] = useState('botao_bio');

  // 3. Snippets / Vault State
  const [snippetFilter, setSnippetFilter] = useState<
    'all' | 'hashtags' | 'cta' | 'whatsapp' | 'links'
  >('all');
  const [newSnippetTitle, setNewSnippetTitle] = useState('');
  const [newSnippetCategory, setNewSnippetCategory] = useState<
    'hashtags' | 'cta' | 'whatsapp' | 'links'
  >('hashtags');
  const [newSnippetContent, setNewSnippetContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 4. Campaign ROI Calculator State
  const [calcBudget, setCalcBudget] = useState(1500);
  const [calcCpc, setCalcCpc] = useState(1.25);
  const [calcLeadConvRate, setCalcLeadConvRate] = useState(18);
  const [calcSaleConvRate, setCalcSaleConvRate] = useState(12);
  const [calcTicket, setCalcTicket] = useState(89.9);

  const handleCopyText = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
    onNotify('Copiado para a área de transferência!');
  };

  const handleGenerateCopy = async () => {
    if (!copyTopic.trim()) {
      onNotify('Descreva o tema, curso ou oferta antes de gerar.');
      return;
    }
    setIsGeneratingCopy(true);
    try {
      const clientObj = clients.find((c) => c.id === copyClientId);
      const res = await fetch('/api/ai/copywriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework: selectedFramework,
          clientName: clientObj?.name || 'Prime Cursos',
          tone: copyTone,
          topic: copyTopic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao gerar copy');
      setGeneratedCopy(data.result || '');
      onNotify('Copy gerada com sucesso pelo Assistente IA!');
    } catch {
      const clientObj = clients.find((c) => c.id === copyClientId);
      const fallback = `🎯 [${selectedFramework}]\nCliente: ${
        clientObj?.name || 'Prime Cursos'
      }\nTema: ${copyTopic}\n\n🔥 GANCHO / ATENÇÃO:\nVocê sabia que dominar "${copyTopic}" pode abrir novas portas no mercado ainda este mês?\n\n💡 DESENVOLVIMENTO:\n- Conteúdo 100% online e atualizado para você estudar no seu ritmo\n- Opção de certificado válido para horas complementares e currículo\n- Passo a passo direto ao ponto com foco prático\n\n👉 CHAMADA PARA AÇÃO (CTA):\nComente "QUERO" ou clique no link da bio para começar hoje mesmo na ${
        clientObj?.name || 'Prime Cursos'
      }!`;
      setGeneratedCopy(fallback);
      onNotify('Copy estruturada gerada!');
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const whatsappGeneratedLink = useMemo(() => {
    const digits = waPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(waMessage.trim());
    if (!digits) return '';
    return `https://wa.me/${digits}${encoded ? `?text=${encoded}` : ''}`;
  }, [waPhone, waMessage]);

  const utmGeneratedLink = useMemo(() => {
    if (!utmBaseUrl.trim()) return '';
    try {
      const url = new URL(
        utmBaseUrl.startsWith('http') ? utmBaseUrl : `https://${utmBaseUrl}`
      );
      if (utmSource.trim()) url.searchParams.set('utm_source', utmSource.trim());
      if (utmMedium.trim()) url.searchParams.set('utm_medium', utmMedium.trim());
      if (utmCampaign.trim())
        url.searchParams.set('utm_campaign', utmCampaign.trim());
      if (utmContent.trim())
        url.searchParams.set('utm_content', utmContent.trim());
      return url.toString();
    } catch {
      return utmBaseUrl;
    }
  }, [utmBaseUrl, utmSource, utmMedium, utmCampaign, utmContent]);

  const filteredSnippets = useMemo(() => {
    if (snippetFilter === 'all') return snippets;
    return snippets.filter((s) => s.category === snippetFilter);
  }, [snippets, snippetFilter]);

  const calcMetrics = useMemo(() => {
    const safeCpc = calcCpc > 0 ? calcCpc : 0.1;
    const clicks = Math.floor(calcBudget / safeCpc);
    const leads = Math.floor(clicks * (calcLeadConvRate / 100));
    const sales = Math.floor(leads * (calcSaleConvRate / 100));
    const cpl = leads > 0 ? calcBudget / leads : 0;
    const cpa = sales > 0 ? calcBudget / sales : 0;
    const revenue = sales * calcTicket;
    const profit = revenue - calcBudget;
    const roas = calcBudget > 0 ? revenue / calcBudget : 0;
    return { clicks, leads, sales, cpl, cpa, revenue, profit, roas };
  }, [calcBudget, calcCpc, calcLeadConvRate, calcSaleConvRate, calcTicket]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Estúdio & Ferramentas
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Central de ferramentas práticas da Next Marketing: Copywriter IA,
            Gerador de Links WhatsApp/UTM, Cofre de Hashtags & CTAs e Simulador
            de Campanhas.
          </p>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        {(
          [
            {
              id: 'copywriter',
              label: 'Copywriter & Roteiros IA',
              icon: Wand2,
            },
            {
              id: 'whatsapp_utm',
              label: 'Gerador WhatsApp & UTM',
              icon: Link2,
            },
            {
              id: 'snippets',
              label: 'Cofre de Hashtags & Scripts',
              icon: Hash,
            },
            {
              id: 'calculator',
              label: 'Calculadora de Tráfego & ROI',
              icon: Calculator,
            },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap ${
                active
                  ? 'bg-[#FACC15] text-slate-950 shadow-2xs'
                  : 'bg-white/90 text-slate-600 hover:bg-white hover:text-slate-900 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          TAB 1: COPYWRITER & ROTEIROS IA
         ========================================================= */}
      {activeTab === 'copywriter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Form Configuration (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95 space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Configurar Copy ou Roteiro
              </h2>
            </div>

            {/* Framework Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                1. Escolha a estrutura (Framework)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COPY_FRAMEWORKS.map((fw) => {
                  const selected = selectedFramework === fw.id;
                  return (
                    <button
                      key={fw.id}
                      type="button"
                      onClick={() => setSelectedFramework(fw.id)}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                        selected
                          ? 'border-amber-400 bg-amber-50/70 dark:border-amber-400 dark:bg-amber-950/30'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {fw.label}
                      </span>
                      <span className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                        {fw.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Client & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  2. Cliente / Projeto
                </label>
                <select
                  value={copyClientId}
                  onChange={(e) => setCopyClientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  3. Tom de voz
                </label>
                <select
                  value={copyTone}
                  onChange={(e) => setCopyTone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="Profissional, didático e persuasivo">
                    Didático e Persuasivo
                  </option>
                  <option value="Direto, urgente e focado em conversão">
                    Focado em Conversão / Oferta
                  </option>
                  <option value="Descontraído, jovem e engajador para Reels/TikTok">
                    Dinâmico para Reels / TikTok
                  </option>
                  <option value="Consultivo, empático e acolhedor para WhatsApp">
                    Consultivo para WhatsApp
                  </option>
                </select>
              </div>
            </div>

            {/* Topic / Offer Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                4. Sobre qual curso, produto ou tema é a publicação?
              </label>
              <textarea
                rows={4}
                value={copyTopic}
                onChange={(e) => setCopyTopic(e.target.value)}
                placeholder="Ex.: Curso de Excel Básico ao Avançado da Prime Cursos para quem busca destaque no currículo e horas complementares..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateCopy}
              disabled={isGeneratingCopy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-4 py-3 text-xs font-bold text-slate-950 shadow-2xs hover:bg-[#EAB308] disabled:opacity-60 transition-colors"
            >
              {isGeneratingCopy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Gerando copy estratégica...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Gerar Copy / Roteiro com IA</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Output & Quick Actions (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Resultado editável
              </h2>
              {generatedCopy && (
                <button
                  type="button"
                  onClick={() => handleCopyText(generatedCopy, 'copy-main')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  {copiedId === 'copy-main' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>Copiar</span>
                </button>
              )}
            </div>

            <textarea
              rows={13}
              value={generatedCopy}
              onChange={(e) => setGeneratedCopy(e.target.value)}
              placeholder="O roteiro ou copy gerada aparecerá aqui. Você pode editar livremente antes de salvar como nota ou enviar para o Kanban de Planejamento."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
            />

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                disabled={!generatedCopy.trim()}
                onClick={() => {
                  onCreateNoteFromContent(
                    copyTopic.trim()
                      ? `Copy: ${copyTopic.trim().slice(0, 45)}`
                      : 'Nova Copy / Roteiro',
                    generatedCopy,
                    ['copy', 'estudio']
                  );
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <FileText className="h-4 w-4 text-amber-500" />
                <span>Salvar como Nota</span>
              </button>

              <button
                type="button"
                disabled={!generatedCopy.trim()}
                onClick={() => {
                  const fwObj =
                    COPY_FRAMEWORKS.find((f) => f.id === selectedFramework) ||
                    COPY_FRAMEWORKS[0];
                  const newPub: Publication = {
                    id: `pub-${Date.now()}`,
                    title: copyTopic.trim()
                      ? copyTopic.trim().slice(0, 60)
                      : fwObj.label,
                    clientId: copyClientId || clients[0]?.id || 'client-prime',
                    date: getTodayISO(),
                    time: '18:00',
                    network: fwObj.defaultNetwork,
                    stage: 'creating',
                    caption: generatedCopy,
                    hashtags: '#primecursos #cursosonline #qualificacao',
                    notes: `Gerado no Estúdio Next Marketing (${fwObj.label})`,
                    attachments: [],
                    referenceLinks: [],
                    deletedAt: null,
                    createdAt: new Date().toISOString(),
                  };
                  onCreatePublicationFromCopy(newPub);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-950"
              >
                <Kanban className="h-4 w-4" />
                <span>Enviar ao Planejamento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: GERADOR DE LINK WHATSAPP + UTM BUILDER
         ========================================================= */}
      {activeTab === 'whatsapp_utm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* WhatsApp Link & QR Generator (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Gerador de Link de WhatsApp & QR Code
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crie links personalizados com mensagem pronta para bio do
              Instagram, anúncios e atendimento comercial.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Número com DDD (apenas números)
              </label>
              <input
                type="text"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                placeholder="Ex.: 5547999999999"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-mono-tabular text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mensagem automática ao clicar
              </label>
              <textarea
                rows={3}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                placeholder="Olá! Quero saber mais sobre..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Link gerado:
              </div>
              <div className="mt-1 break-all font-mono-tabular text-xs text-slate-800 dark:text-slate-200">
                {whatsappGeneratedLink || 'Informe o número acima'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={!whatsappGeneratedLink}
                onClick={() => handleCopyText(whatsappGeneratedLink, 'wa-link')}
                className="flex items-center gap-2 rounded-xl bg-[#FACC15] px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-[#EAB308] disabled:opacity-50"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar link WhatsApp</span>
              </button>

              {whatsappGeneratedLink && (
                <a
                  href={whatsappGeneratedLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Testar link</span>
                </a>
              )}
            </div>

            {/* Instant QR Code Preview */}
            {whatsappGeneratedLink && (
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    whatsappGeneratedLink
                  )}`}
                  alt="QR Code WhatsApp"
                  className="h-24 w-24 rounded-lg border border-slate-200 bg-white p-1.5 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <QrCode className="h-3.5 w-3.5 text-amber-500" />
                    <span>QR Code pronto para artes</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Escaneie com a câmera ou clique com o botão direito na
                    imagem para copiar/salvar o QR Code e aplicar em criativos
                    da Prime Cursos.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* UTM Campaign URL Builder (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95 space-y-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-amber-500" />
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Construtor de URL Rastreável (UTM)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gere links com parâmetros UTM para identificar no Google Analytics
              exatamente de qual post, story ou anúncio vieram as matrículas.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL do site ou página de destino
              </label>
              <input
                type="text"
                value={utmBaseUrl}
                onChange={(e) => setUtmBaseUrl(e.target.value)}
                placeholder="https://www.primecursos.com.br"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Origem (utm_source)
                </label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="instagram, facebook, whatsapp"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mídia (utm_medium)
                </label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="stories, reels, cpc, bio"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campanha (utm_campaign)
                </label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="captacao_outubro"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Conteúdo (utm_content)
                </label>
                <input
                  type="text"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  placeholder="criativo_01_video"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                URL rastreável completa:
              </div>
              <div className="mt-1 break-all font-mono-tabular text-xs text-slate-800 dark:text-slate-200">
                {utmGeneratedLink}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleCopyText(utmGeneratedLink, 'utm-link')}
                className="flex items-center gap-2 rounded-xl bg-[#FACC15] px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-[#EAB308]"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar URL com UTM</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAddSnippet({
                    title: `Link UTM: ${utmCampaign || 'Campanha'} (${utmSource})`,
                    category: 'links',
                    content: utmGeneratedLink,
                    clientId: clients[0]?.id || 'client-prime',
                  });
                  onNotify('Link UTM salvo no Cofre de Links!');
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Salvar no Cofre</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: COFRE DE HASHTAGS, CTAS & SCRIPTS RÁPIDOS
         ========================================================= */}
      {activeTab === 'snippets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Create New Snippet (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95 space-y-4">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Novo bloco rápido
            </h2>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Título identificador
              </label>
              <input
                type="text"
                value={newSnippetTitle}
                onChange={(e) => setNewSnippetTitle(e.target.value)}
                placeholder="Ex.: Hashtags Cursos de TI"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Categoria
              </label>
              <select
                value={newSnippetCategory}
                onChange={(e) =>
                  setNewSnippetCategory(
                    e.target.value as 'hashtags' | 'cta' | 'whatsapp' | 'links'
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="hashtags">Kit de #Hashtags</option>
                <option value="cta">Chamadas para Ação (CTAs)</option>
                <option value="whatsapp">Script / Resposta de WhatsApp</option>
                <option value="links">Links Úteis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Conteúdo para copiar com 1 clique
              </label>
              <textarea
                rows={4}
                value={newSnippetContent}
                onChange={(e) => setNewSnippetContent(e.target.value)}
                placeholder="Cole aqui as hashtags, frase de CTA ou script..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!newSnippetTitle.trim() || !newSnippetContent.trim()) {
                  onNotify('Preencha o título e o conteúdo do bloco.');
                  return;
                }
                onAddSnippet({
                  title: newSnippetTitle.trim(),
                  category: newSnippetCategory,
                  content: newSnippetContent.trim(),
                  clientId: clients[0]?.id || 'client-prime',
                });
                setNewSnippetTitle('');
                setNewSnippetContent('');
                onNotify('Bloco adicionado ao Cofre!');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-[#EAB308]"
            >
              <Plus className="h-4 w-4" />
              <span>Salvar no Cofre</span>
            </button>
          </div>

          {/* Right: Snippets List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'hashtags', label: '#Hashtags' },
                  { id: 'cta', label: 'CTAs' },
                  { id: 'whatsapp', label: 'Scripts WhatsApp' },
                  { id: 'links', label: 'Links' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSnippetFilter(cat.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    snippetFilter === cat.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-white/80 text-slate-600 hover:bg-white dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSnippets.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-lg bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                        {item.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteSnippet(item.id)}
                        className="text-slate-400 hover:text-red-500"
                        title="Excluir bloco"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h3 className="mt-2 font-display text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {item.content}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleCopyText(item.content, item.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FEF08A] px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-[#FACC15]"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar bloco</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onCreateNoteFromContent(item.title, item.content, [
                          item.category,
                        ])
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                      title="Transformar em nota"
                    >
                      + Nota
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: CALCULADORA DE TRÁFEGO, FUNIL E ROI
         ========================================================= */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sliders / Inputs (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-amber-500" />
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Parâmetros da Campanha (Prime Cursos / Clientes)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Investimento em Anúncios (R$)
                </label>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={calcBudget}
                  onChange={(e) => setCalcBudget(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-mono-tabular font-semibold text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CPC Médio Estimado (R$)
                </label>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={calcCpc}
                  onChange={(e) => setCalcCpc(Number(e.target.value) || 0.1)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-mono-tabular font-semibold text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Conversão da Página em Lead (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={calcLeadConvRate}
                  onChange={(e) =>
                    setCalcLeadConvRate(Number(e.target.value) || 1)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-mono-tabular font-semibold text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Conversão de Lead em Aluno (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={calcSaleConvRate}
                  onChange={(e) =>
                    setCalcSaleConvRate(Number(e.target.value) || 1)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-mono-tabular font-semibold text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ticket Médio do Certificado / Curso (R$)
                </label>
                <input
                  type="number"
                  min={10}
                  step={5}
                  value={calcTicket}
                  onChange={(e) => setCalcTicket(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-mono-tabular font-semibold text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Results Panel (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95 space-y-5">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Projeção de Resultados do Funil
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-[11px] text-slate-500">Cliques Estimados</div>
                <div className="mt-1 font-mono-tabular text-lg font-extrabold text-slate-900 dark:text-white">
                  {calcMetrics.clicks.toLocaleString('pt-BR')}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-[11px] text-slate-500">Leads / Cadastros</div>
                <div className="mt-1 font-mono-tabular text-lg font-extrabold text-slate-900 dark:text-white">
                  {calcMetrics.leads.toLocaleString('pt-BR')}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-[11px] text-slate-500">Custo por Lead</div>
                <div className="mt-1 font-mono-tabular text-lg font-extrabold text-slate-900 dark:text-white">
                  R$ {calcMetrics.cpl.toFixed(2)}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-[11px] text-slate-500">Vendas / Certificados</div>
                <div className="mt-1 font-mono-tabular text-lg font-extrabold text-emerald-600">
                  {calcMetrics.sales}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-[11px] text-slate-500">CPA (Custo/Venda)</div>
                <div className="mt-1 font-mono-tabular text-lg font-extrabold text-slate-900 dark:text-white">
                  R$ {calcMetrics.cpa.toFixed(2)}
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 dark:border-amber-800/60 dark:bg-amber-950/30">
                <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  ROAS Estimado
                </div>
                <div className="mt-1 font-mono-tabular text-lg font-extrabold text-amber-900 dark:text-amber-200">
                  {calcMetrics.roas.toFixed(2)}x
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Faturamento Bruto Projetado
                </div>
                <div className="font-mono-tabular text-xl font-extrabold text-slate-950 dark:text-white">
                  R${' '}
                  {calcMetrics.revenue.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Retorno Líquido
                </div>
                <div
                  className={`font-mono-tabular text-lg font-bold ${
                    calcMetrics.profit >= 0
                      ? 'text-emerald-600'
                      : 'text-red-500'
                  }`}
                >
                  R${' '}
                  {calcMetrics.profit.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const summary = `SIMULAÇÃO DE CAMPANHA — NEXT MARKETING\n\n- Investimento: R$ ${calcBudget.toFixed(
                  2
                )}\n- CPC Médio: R$ ${calcCpc.toFixed(
                  2
                )}\n- Cliques Estimados: ${
                  calcMetrics.clicks
                }\n- Leads Projetados (${calcLeadConvRate}%): ${
                  calcMetrics.leads
                } (CPL: R$ ${calcMetrics.cpl.toFixed(
                  2
                )})\n- Vendas / Certificados (${calcSaleConvRate}%): ${
                  calcMetrics.sales
                } (CPA: R$ ${calcMetrics.cpa.toFixed(
                  2
                )})\n- Faturamento Estimado: R$ ${calcMetrics.revenue.toFixed(
                  2
                )}\n- ROAS: ${calcMetrics.roas.toFixed(2)}x`;
                onCreateNoteFromContent(
                  `Projeção de Tráfego — R$ ${calcBudget}`,
                  summary,
                  ['trafego', 'metas', 'roi']
                );
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-[#EAB308]"
            >
              <FileText className="h-4 w-4" />
              <span>Salvar Simulação como Nota</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
