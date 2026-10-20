import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Hash,
  Link2,
  Loader2,
  Paperclip,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  AttachmentItem,
  ClientProject,
  Publication,
  PublicationStage,
  SocialNetwork,
} from '../types';
import { getTodayISO, SOCIAL_NETWORKS } from '../utils/initialData';

interface PublicationModalProps {
  publication: Publication | null; // null means creating new
  initialStage?: PublicationStage;
  initialDate?: string;
  initialClientId?: string;
  clients: ClientProject[];
  onClose: () => void;
  onSave: (pub: Publication) => void;
  onDelete?: (pub: Publication) => void;
  onNotify: (msg: string) => void;
}

export const PublicationModal: React.FC<PublicationModalProps> = ({
  publication,
  initialStage = 'idea',
  initialDate,
  initialClientId,
  clients,
  onClose,
  onSave,
  onDelete,
  onNotify,
}) => {
  const [title, setTitle] = useState(publication?.title || '');
  const [clientId, setClientId] = useState(
    publication?.clientId ?? initialClientId ?? (clients[0]?.id || '')
  );
  const [date, setDate] = useState(publication?.date || initialDate || getTodayISO());
  const [time, setTime] = useState(publication?.time || '');
  const [network, setNetwork] = useState<SocialNetwork>(
    publication?.network || 'Instagram'
  );
  const [stage, setStage] = useState<PublicationStage>(
    publication?.stage || initialStage
  );
  const [caption, setCaption] = useState(publication?.caption || '');
  const [hashtags, setHashtags] = useState(publication?.hashtags || '');
  const [notes, setNotes] = useState(publication?.notes || '');
  const [attachments, setAttachments] = useState<AttachmentItem[]>(
    publication?.attachments || []
  );
  const [referenceLinks, setReferenceLinks] = useState<string[]>(
    publication?.referenceLinks || []
  );
  const [newLink, setNewLink] = useState('');

  const [aiCaptionLoading, setAiCaptionLoading] = useState(false);
  const [aiHashtagsLoading, setAiHashtagsLoading] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = () => {
    if (!title.trim()) {
      onNotify('Informe o tema ou título da publicação.');
      return;
    }
    const saved: Publication = {
      id: publication?.id || `pub-${Date.now()}`,
      title: title.trim(),
      clientId,
      date,
      time,
      network,
      stage,
      caption,
      hashtags,
      notes,
      attachments,
      referenceLinks,
      deletedAt: null,
      createdAt: publication?.createdAt || new Date().toISOString(),
    };
    onSave(saved);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleGenerateCaption = async () => {
    if (!title.trim()) {
      onNotify('Preencha primeiro o tema ou título para gerar a legenda com IA.');
      return;
    }
    setAiCaptionLoading(true);
    try {
      const clientName = clients.find((c) => c.id === clientId)?.name || '';
      const res = await fetch('/api/ai/publication-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'caption',
          title,
          clientName,
          network,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar legenda');
      setCaption(data.result || '');
      onNotify('Legenda criada com IA!');
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : 'Erro ao escrever legenda com IA');
    } finally {
      setAiCaptionLoading(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!title.trim() && !caption.trim()) {
      onNotify('Preencha o título ou legenda para sugerir hashtags com IA.');
      return;
    }
    setAiHashtagsLoading(true);
    try {
      const clientName = clients.find((c) => c.id === clientId)?.name || '';
      const res = await fetch('/api/ai/publication-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'hashtags',
          title,
          clientName,
          network,
          caption,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao sugerir hashtags');
      setHashtags(data.result || '');
      onNotify('Hashtags sugeridas com IA!');
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : 'Erro ao sugerir hashtags');
    } finally {
      setAiHashtagsLoading(false);
    }
  };

  const handleCopyCaption = () => {
    const fullText = [caption.trim(), hashtags.trim()].filter(Boolean).join('\n\n');
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopiedCaption(true);
    onNotify('Legenda copiada para a área de transferência!');
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result;
        if (typeof resultStr === 'string') {
          setAttachments((prev) => [
            ...prev,
            {
              id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: file.name,
              type: file.type,
              dataUrl: resultStr,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddReferenceLink = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = newLink.trim();
      if (!trimmed) return;
      const formatted = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      setReferenceLinks((prev) => [...prev, formatted]);
      setNewLink('');
    }
  };

  const STAGES: Array<{ id: PublicationStage; label: string }> = [
    { id: 'idea', label: 'Ideia' },
    { id: 'creating', label: 'Em criação' },
    { id: 'ready', label: 'Pronto' },
    { id: 'published', label: 'Publicado' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {publication ? 'Editar publicação' : 'Nova publicação'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Tema ou título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Carrossel: 5 Mudanças no Código de Trânsito Brasileiro"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Cliente ou projeto
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Sem cliente específico</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono-tabular text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Hora
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono-tabular text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Rede */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Rede
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {SOCIAL_NETWORKS.map((net) => {
                const active = network === net.id;
                return (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => setNetwork(net.id)}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-slate-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: net.dotColor }}
                    />
                    <span>{net.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Etapa */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Etapa
            </label>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {STAGES.map((st) => {
                const active = stage === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStage(st.id)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legenda */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Legenda
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={aiCaptionLoading}
                  onClick={handleGenerateCaption}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400"
                >
                  {aiCaptionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  <span>Escrever com IA</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {copiedCaption ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedCaption ? 'Copiada' : 'Copiar legenda'}</span>
                </button>
              </div>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              placeholder="Escreva a legenda da publicação ou clique em Escrever com IA..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Hashtags */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Hashtags
              </label>
              <button
                type="button"
                disabled={aiHashtagsLoading}
                onClick={handleGenerateHashtags}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400"
              >
                {aiHashtagsLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Hash className="h-3.5 w-3.5" />
                )}
                <span>Sugerir com IA</span>
              </button>
            </div>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#marketingdigital #seunicho"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex.: Disparar na lista de transmissão de alunos."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Artes e arquivos */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Artes e arquivos
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300"
              >
                <Paperclip className="h-3.5 w-3.5" />
                <span>Anexar</span>
              </button>
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFilesSelected(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50/60 py-5 px-4 text-center text-xs text-slate-500 hover:border-amber-400 hover:bg-amber-50/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400"
            >
              Arraste as artes para cá, cole com Ctrl+V ou use Anexar.
            </div>
            {attachments.length > 0 && (
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="group relative overflow-hidden rounded-lg border border-slate-200 p-1.5 dark:border-slate-700"
                  >
                    {att.type.startsWith('image/') ? (
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        className="h-20 w-full rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-20 items-center justify-center text-xs text-slate-600 truncate px-2">
                        {att.name}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) => prev.filter((a) => a.id !== att.id))
                      }
                      className="absolute top-2 right-2 rounded-full bg-slate-900/75 p-1 text-white opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links de referência */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Links de referência
            </label>
            {referenceLinks.length > 0 && (
              <div className="mb-2 space-y-1">
                {referenceLinks.map((lnk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-1.5 text-xs dark:bg-slate-800"
                  >
                    <a
                      href={lnk}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-slate-700 underline dark:text-slate-300 truncate"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{lnk}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setReferenceLinks((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-slate-400 hover:text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800">
              <Link2 className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyDown={handleAddReferenceLink}
                placeholder="Cole um link e pressione Enter"
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            {publication && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(publication)}
                className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                <span>Mover para a lixeira</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-400">
              Ctrl+Enter salva
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-[#FACC15] px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-xs hover:bg-[#EAB308] transition-colors whitespace-nowrap shrink-0"
            >
              Salvar publicação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
