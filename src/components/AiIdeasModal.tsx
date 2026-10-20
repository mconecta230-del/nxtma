import React, { useState } from 'react';
import { Loader2, Plus, Sparkles, X } from 'lucide-react';
import { ClientProject, Publication, SocialNetwork } from '../types';
import { getOffsetDateISO, SOCIAL_NETWORKS } from '../utils/initialData';

interface GeneratedIdea {
  title: string;
  network: string;
  notes: string;
  caption: string;
  hashtags: string;
}

interface AiIdeasModalProps {
  clients: ClientProject[];
  initialClientId?: string;
  onClose: () => void;
  onAddPublication: (pub: Publication) => void;
  onNotify: (msg: string) => void;
}

export const AiIdeasModal: React.FC<AiIdeasModalProps> = ({
  clients,
  initialClientId,
  onClose,
  onAddPublication,
  onNotify,
}) => {
  const [selectedClientId, setSelectedClientId] = useState(
    initialClientId && initialClientId !== 'all'
      ? initialClientId
      : clients[0]?.id || ''
  );
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [addedIndexes, setAddedIndexes] = useState<number[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    setAddedIndexes([]);
    try {
      const clientName =
        clients.find((c) => c.id === selectedClientId)?.name || 'Geral';
      const res = await fetch('/api/ai/publication-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ideas',
          clientName,
          network: selectedNetwork,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao gerar ideias');
      setIdeas(data.ideas || []);
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : 'Erro ao gerar ideias com IA');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIdeaToKanban = (idea: GeneratedIdea, idx: number) => {
    const matchedNet =
      SOCIAL_NETWORKS.find(
        (n) => n.id.toLowerCase() === idea.network.toLowerCase()
      )?.id || ('Instagram' as SocialNetwork);

    const newPub: Publication = {
      id: `pub-ai-${Date.now()}-${idx}`,
      title: idea.title,
      clientId: selectedClientId,
      date: getOffsetDateISO(idx + 1),
      time: '18:00',
      network: matchedNet,
      stage: 'idea',
      caption: idea.caption || '',
      hashtags: idea.hashtags || '',
      notes: idea.notes || '',
      attachments: [],
      referenceLinks: [],
      deletedAt: null,
      createdAt: new Date().toISOString(),
    };

    onAddPublication(newPub);
    setAddedIndexes((prev) => [...prev, idx]);
    onNotify('Ideia adicionada à coluna Ideias do Planejamento!');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Ideias de Publicação com IA
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Cliente ou projeto
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Rede social
              </label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="all">Todas as redes</option>
                {SOCIAL_NETWORKS.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-xs hover:bg-[#EAB308] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Gerando sugestões estratégicas...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Gerar 4 ideias de conteúdo com IA</span>
              </>
            )}
          </button>

          {ideas.length > 0 && (
            <div className="space-y-3 pt-2">
              {ideas.map((idea, idx) => {
                const alreadyAdded = addedIndexes.includes(idx);
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {idea.network}
                        </div>
                        <h4 className="mt-0.5 font-display text-sm font-bold text-slate-900 dark:text-white">
                          {idea.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => handleAddIdeaToKanban(idea, idx)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          alreadyAdded
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{alreadyAdded ? 'Adicionada' : 'Adicionar ao Kanban'}</span>
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      {idea.notes}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
