import React, { useRef, useState } from 'react';
import {
  Archive,
  CheckSquare,
  Copy,
  ExternalLink,
  Kanban,
  Link2,
  Loader2,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  MonitorUp,
  MoreHorizontal,
  Paperclip,
  Pin,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import { AttachmentItem, ClientProject, Note, NoteColor } from '../types';
import { formatRelativeTime, NOTE_COLORS } from '../utils/initialData';

interface NoteModalProps {
  note: Note;
  clients: ClientProject[];
  onClose: () => void;
  onUpdate: (updated: Note) => void;
  onConvertToTask: (note: Note) => void;
  onConvertToPublication?: (note: Note) => void;
  onDuplicate: (note: Note) => void;
  onArchiveToggle: (note: Note) => void;
  onDelete: (note: Note) => void;
  onCreateTasksFromAI: (taskTitles: string[], clientId?: string) => void;
  onNotify: (msg: string) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  note,
  clients,
  onClose,
  onUpdate,
  onConvertToTask,
  onConvertToPublication,
  onDuplicate,
  onArchiveToggle,
  onDelete,
  onCreateTasksFromAI,
  onNotify,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [showChecklistSection, setShowChecklistSection] = useState(note.checklist.length > 0);
  const [showLinkInput, setShowLinkInput] = useState(note.links.length > 0);
  const [showTagInput, setShowTagInput] = useState(note.tags.length > 0);

  const [newChecklistText, setNewChecklistText] = useState('');
  const [newLinkText, setNewLinkText] = useState('');
  const [newTagText, setNewTagText] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const colorObj = NOTE_COLORS.find((c) => c.id === note.color) || NOTE_COLORS[0];

  const handleToggleDictation = () => {
    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
      return;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      onNotify('Seu navegador não suporta ditado por voz.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsDictating(true);
      onNotify('Ouvindo... Fale o conteúdo da nota.');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        handleFieldChange(
          'content',
          `${note.content}${note.content && !note.content.endsWith(' ') ? ' ' : ''}${transcript}`
        );
        onNotify('Texto inserido por voz!');
      }
    };

    recognition.onerror = () => {
      setIsDictating(false);
      onNotify('Não foi possível capturar o áudio.');
    };

    recognition.onend = () => {
      setIsDictating(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSpeakNote = () => {
    if (!('speechSynthesis' in window)) {
      onNotify('Leitura em voz alta não suportada neste navegador.');
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      onNotify('Leitura interrompida.');
      return;
    }
    const textToRead = `${note.title ? note.title + '. ' : ''}${note.content}`;
    if (!textToRead.trim()) {
      onNotify('A nota está vazia.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
    onNotify('Lendo nota em voz alta...');
  };

  const handleFieldChange = <K extends keyof Note>(field: K, value: Note[K]) => {
    onUpdate({
      ...note,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newChecklistText.trim();
    if (!trimmed) return;
    handleFieldChange('checklist', [
      ...note.checklist,
      { id: `ck-${Date.now()}`, text: trimmed, completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleToggleChecklistItem = (id: string) => {
    handleFieldChange(
      'checklist',
      note.checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleRemoveChecklistItem = (id: string) => {
    handleFieldChange(
      'checklist',
      note.checklist.filter((item) => item.id !== id)
    );
  };

  const handleAddLink = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = newLinkText.trim();
      if (!trimmed) return;
      const formatted = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      if (!note.links.includes(formatted)) {
        handleFieldChange('links', [...note.links, formatted]);
      }
      setNewLinkText('');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = newTagText.trim().replace(/^#/, '');
      if (!trimmed) return;
      if (!note.tags.includes(trimmed)) {
        handleFieldChange('tags', [...note.tags, trimmed]);
      }
      setNewTagText('');
    }
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const item: AttachmentItem = {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            type: file.type,
            dataUrl: reader.result,
          };
          onUpdate({
            ...note,
            attachments: [...note.attachments, item],
            updatedAt: new Date().toISOString(),
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const dt = new DataTransfer();
          dt.items.add(file);
          handleFilesSelected(dt.files);
          onNotify('Imagem colada na nota!');
        }
      }
    }
  };

  const runAiAction = async (
    action:
      | 'summarize'
      | 'topics'
      | 'improve'
      | 'expand'
      | 'copy_post'
      | 'checklist'
      | 'find_tasks'
  ) => {
    setShowAiMenu(false);
    if (!note.content.trim() && !note.title.trim()) {
      onNotify('Escreva algum conteúdo na nota primeiro para usar o Assistente de IA.');
      return;
    }

    setAiLoading(action);
    try {
      const res = await fetch('/api/ai/note-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          title: note.title,
          content: note.content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao consultar Assistente de IA');
      }

      if (action === 'summarize') {
        handleFieldChange('aiSummary', data.result);
        onNotify('Resumo gerado com IA!');
      } else if (
        action === 'topics' ||
        action === 'improve' ||
        action === 'expand' ||
        action === 'copy_post'
      ) {
        handleFieldChange('content', data.result);
        onNotify(
          action === 'topics'
            ? 'Nota organizada em tópicos com IA!'
            : action === 'expand'
            ? 'Ideias expandidas com IA!'
            : action === 'copy_post'
            ? 'Transformada em Copy com IA!'
            : 'Texto revisado e melhorado com IA!'
        );
      } else if (action === 'checklist') {
        const newItems = (data.items || []).map((txt: string, idx: number) => ({
          id: `ck-ai-${Date.now()}-${idx}`,
          text: txt,
          completed: false,
        }));
        setShowChecklistSection(true);
        handleFieldChange('checklist', [...note.checklist, ...newItems]);
        onNotify(`${newItems.length} itens adicionados ao checklist!`);
      } else if (action === 'find_tasks') {
        const tasksFound: string[] = data.items || [];
        if (tasksFound.length > 0) {
          onCreateTasksFromAI(tasksFound, note.clientId);
        } else {
          onNotify('Nenhuma tarefa específica identificada na nota.');
        }
      }
    } catch (err: unknown) {
      onNotify(
        err instanceof Error ? err.message : 'Não foi possível executar o Assistente de IA.'
      );
    } finally {
      setAiLoading(null);
    }
  };

  const completedChecks = note.checklist.filter((c) => c.completed).length;
  const checklistPercent =
    note.checklist.length > 0
      ? Math.round((completedChecks / note.checklist.length) * 100)
      : 0;
  const wordCount = note.content.trim()
    ? note.content.trim().split(/\s+/).length
    : 0;

  const handleCopyFullNote = () => {
    const checklistStr =
      note.checklist.length > 0
        ? '\n\nChecklist:\n' +
          note.checklist
            .map((c) => `${c.completed ? '[x]' : '[ ]'} ${c.text}`)
            .join('\n')
        : '';
    const full = `${note.title ? note.title + '\n\n' : ''}${note.content}${checklistStr}`;
    navigator.clipboard.writeText(full);
    onNotify('Conteúdo da nota copiado!');
  };

  const handleExportTxt = () => {
    const checklistStr =
      note.checklist.length > 0
        ? '\n\nChecklist:\n' +
          note.checklist
            .map((c) => `${c.completed ? '[x]' : '[ ]'} ${c.text}`)
            .join('\n')
        : '';
    const full = `${note.title || 'Nota'}\n\n${note.content}${checklistStr}`;
    const blob = new Blob([full], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(note.title || 'nota').toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Nota exportada em .txt!');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 sm:p-6 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onPaste={handlePaste}
        className={`relative flex flex-col rounded-3xl border shadow-2xl transition-all duration-200 ${
          isExpanded
            ? 'h-[92vh] w-[96vw] max-w-6xl'
            : 'max-h-[90vh] w-full max-w-3xl'
        } ${colorObj.bgCard} ${colorObj.borderLight}`}
      >
        {/* HEADER: Color Palette, Client Selector & Primary Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-6 py-4 dark:border-white/10">
          {/* Left: 7 Color Circles + Client Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-1.5 dark:bg-white/10">
              {NOTE_COLORS.map((c) => {
                const active = note.color === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    title={`Cor: ${c.label}`}
                    onClick={() => handleFieldChange('color', c.id as NoteColor)}
                    className={`h-5 w-5 rounded-full transition-all ${c.dot} ${
                      active
                        ? 'ring-2 ring-slate-900 dark:ring-white scale-115'
                        : 'opacity-75 hover:opacity-100 hover:scale-105'
                    }`}
                  />
                );
              })}
            </div>

            <select
              value={note.clientId || ''}
              onChange={(e) => handleFieldChange('clientId', e.target.value)}
              className="rounded-xl border border-black/10 bg-black/5 px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-black/10 focus:outline-none dark:border-white/15 dark:bg-white/10 dark:text-slate-100"
            >
              <option value="">Sem cliente vinculado</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  Cliente: {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Pin, Desktop Post-it, Expand, More Menu & Close */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleFieldChange('pinned', !note.pinned)}
              title={note.pinned ? 'Desafixar do mural' : 'Fixar no topo do mural'}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                note.pinned
                  ? 'bg-slate-900 text-[#FACC15] dark:bg-white dark:text-slate-950'
                  : 'text-slate-700 hover:bg-black/10 dark:text-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <Pin className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {note.pinned ? 'Fixada' : 'Fixar'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextState = !note.floating;
                handleFieldChange('floating', nextState);
                onNotify(
                  nextState
                    ? 'Nota destacada como Post-it na área de trabalho!'
                    : 'Post-it recolhido da área de trabalho.'
                );
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                note.floating
                  ? 'bg-[#FACC15] text-slate-950 shadow-2xs ring-1 ring-slate-900/15'
                  : 'bg-black/5 hover:bg-black/10 text-slate-800 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15'
              }`}
            >
              <MonitorUp className="h-3.5 w-3.5" />
              <span>
                {note.floating ? 'Na área de trabalho' : 'Post-it na tela'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              title={isExpanded ? 'Reduzir janela' : 'Modo leitura e foco amplo'}
              className="rounded-xl p-2 text-slate-700 hover:bg-black/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>

            {/* More options dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(!showMoreMenu);
                  setShowAiMenu(false);
                }}
                className="rounded-xl p-2 text-slate-700 hover:bg-black/10 dark:text-slate-200 dark:hover:bg-white/10"
                title="Mais ações da nota"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-11 z-30 w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Ações e Integrações
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onConvertToTask(note);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    <CheckSquare className="h-4 w-4 text-slate-500" />
                    Transformar em tarefa
                  </button>
                  {onConvertToPublication && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false);
                        onConvertToPublication(note);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                    >
                      <Kanban className="h-4 w-4 text-slate-500" />
                      Transformar em publicação
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      handleCopyFullNote();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    <Copy className="h-4 w-4 text-slate-500" />
                    Copiar texto completo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onDuplicate(note);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    <Copy className="h-4 w-4 text-slate-500" />
                    Duplicar nota
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onArchiveToggle(note);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    <Archive className="h-4 w-4 text-slate-500" />
                    {note.archived ? 'Desarquivar nota' : 'Arquivar nota'}
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onDelete(note);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                    Mover para a lixeira
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-700 hover:bg-black/10 dark:text-slate-200 dark:hover:bg-white/10"
              title="Fechar (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE EDITOR BODY */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
          {/* Note Title & Formatting Subbar */}
          <div className="space-y-3">
            <input
              type="text"
              value={note.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Título da nota..."
              className="w-full bg-transparent font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 placeholder:text-slate-500/60 focus:outline-none dark:text-white dark:placeholder:text-slate-400"
            />

            {/* Streamlined Formatting, Voice & Export Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-black/5 px-3 py-2 dark:bg-white/10">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    handleFieldChange(
                      'content',
                      `${note.content}${
                        note.content && !note.content.endsWith('\n') ? '\n' : ''
                      }## Subtítulo\n`
                    )
                  }
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10"
                  title="Inserir subtítulo"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleFieldChange(
                      'content',
                      `${note.content}${
                        note.content && !note.content.endsWith('\n') ? '\n' : ''
                      }- `
                    )
                  }
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10"
                  title="Inserir item em lista"
                >
                  • Tópico
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleFieldChange(
                      'content',
                      `${note.content}${
                        note.content && !note.content.endsWith('\n') ? '\n' : ''
                      }\n────────────────────\n`
                    )
                  }
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10"
                  title="Inserir linha divisória"
                >
                  ― Divisor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const stamp = new Date().toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    handleFieldChange(
                      'content',
                      `${note.content}${note.content ? '\n' : ''}[${stamp}] `
                    );
                  }}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10"
                  title="Inserir carimbo de data e hora"
                >
                  + Data/Hora
                </button>

                <span className="mx-1 h-4 w-px bg-black/10 dark:bg-white/15" />

                <button
                  type="button"
                  onClick={handleToggleDictation}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    isDictating
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10'
                  }`}
                  title="Ditar conteúdo por voz"
                >
                  {isDictating ? (
                    <MicOff className="h-3.5 w-3.5" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                  <span>{isDictating ? 'Ouvindo...' : 'Ditar'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSpeakNote}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10"
                  title="Ouvir leitura da nota em voz alta"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Ouvir</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyFullNote}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10"
                  title="Copiar texto da nota"
                >
                  Copiar
                </button>
                <button
                  type="button"
                  onClick={handleExportTxt}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10"
                  title="Exportar nota como arquivo .txt"
                >
                  Exportar .txt
                </button>
              </div>
            </div>
          </div>

          {/* Spacious Main Content Textarea */}
          <textarea
            value={note.content}
            onChange={(e) => handleFieldChange('content', e.target.value)}
            placeholder="Escreva suas ideias, cole imagens (Ctrl+V) ou utilize o Assistente de IA abaixo..."
            rows={isExpanded ? 14 : 8}
            className="w-full min-h-[200px] resize-y bg-transparent text-[15px] sm:text-base leading-relaxed text-slate-900 placeholder:text-slate-500/65 focus:outline-none dark:text-slate-100"
          />

          {/* AI Summary Callout */}
          {note.aiSummary && (
            <div className="rounded-2xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Resumo Executivo (IA)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFieldChange('aiSummary', undefined)}
                  className="rounded-lg p-1 text-slate-600 hover:bg-black/10 dark:text-slate-300"
                  title="Remover resumo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                {note.aiSummary}
              </p>
            </div>
          )}

          {/* Checklist Section with Visual Progress Indicator */}
          {(showChecklistSection || note.checklist.length > 0) && (
            <div className="rounded-2xl border border-black/10 bg-black/5 p-4 space-y-3 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Checklist da Nota
                  </span>
                </div>
                {note.checklist.length > 0 && (
                  <span className="font-mono-tabular text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {completedChecks} de {note.checklist.length} concluídos ({checklistPercent}%)
                  </span>
                )}
              </div>

              {note.checklist.length > 0 && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${checklistPercent}%` }}
                  />
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                {note.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-3 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-400 text-slate-900 focus:ring-0"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        item.completed
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-slate-500 hover:text-red-600 transition-opacity"
                      title="Remover item"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleAddChecklistItem}
                className="flex items-center gap-2.5 border-t border-black/10 pt-2.5 dark:border-white/10"
              >
                <Plus className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="Adicionar novo item ao checklist e pressionar Enter..."
                  className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-600/75 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
                />
              </form>
            </div>
          )}

          {/* Attachments Section */}
          {note.attachments.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Arquivos e Imagens Anexadas ({note.attachments.length})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {note.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="group relative overflow-hidden rounded-2xl border border-black/10 bg-black/5 p-2 dark:border-white/10 dark:bg-white/5"
                  >
                    {att.type.startsWith('image/') ? (
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        className="h-28 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center px-2 text-center text-xs font-medium text-slate-700 dark:text-slate-300">
                        {att.name}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleFieldChange(
                          'attachments',
                          note.attachments.filter((a) => a.id !== att.id)
                        )
                      }
                      className="absolute top-3 right-3 rounded-full bg-slate-900/80 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remover anexo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links Section */}
          {(showLinkInput || note.links.length > 0) && (
            <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Links de Referência
              </div>
              {note.links.map((lnk, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-xl bg-black/5 px-3.5 py-2 text-xs dark:bg-white/10"
                >
                  <a
                    href={lnk}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 font-medium text-slate-900 underline hover:text-blue-700 dark:text-slate-100 truncate"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{lnk}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      handleFieldChange(
                        'links',
                        note.links.filter((_, i) => i !== idx)
                      )
                    }
                    className="text-slate-500 hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2.5 rounded-xl bg-black/5 px-3.5 py-2.5 dark:bg-white/10">
                <Link2 className="h-4 w-4 text-slate-600 dark:text-slate-300 shrink-0" />
                <input
                  type="text"
                  value={newLinkText}
                  onChange={(e) => setNewLinkText(e.target.value)}
                  onKeyDown={handleAddLink}
                  placeholder="Cole uma URL e pressione Enter para anexar..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-600/80 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-300"
                />
              </div>
            </div>
          )}

          {/* Tags Section */}
          {(showTagInput || note.tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/10 dark:border-white/10">
              <Tag className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              {note.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-lg bg-black/10 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:bg-white/10 dark:text-slate-100"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() =>
                      handleFieldChange(
                        'tags',
                        note.tags.filter((tg) => tg !== t)
                      )
                    }
                    className="ml-0.5 opacity-70 hover:opacity-100 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1 rounded-lg bg-black/5 px-2.5 py-1 text-xs text-slate-700 dark:bg-white/5 dark:text-slate-300">
                <span>#</span>
                <input
                  type="text"
                  value={newTagText}
                  onChange={(e) => setNewTagText(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Nova etiqueta + Enter"
                  className="w-36 bg-transparent text-xs text-slate-900 placeholder:text-slate-600/80 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER: Content Modules, AI Assistant & Metadata */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-6 py-3.5 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowChecklistSection((v) => !v)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                showChecklistSection || note.checklist.length > 0
                  ? 'bg-black/15 text-slate-900 dark:bg-white/20 dark:text-white'
                  : 'text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Checklist</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10 whitespace-nowrap shrink-0"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span>Anexar</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLinkInput((v) => !v)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                showLinkInput || note.links.length > 0
                  ? 'bg-black/15 text-slate-900 dark:bg-white/20 dark:text-white'
                  : 'text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>Link</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTagInput((v) => !v)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                showTagInput || note.tags.length > 0
                  ? 'bg-black/15 text-slate-900 dark:bg-white/20 dark:text-white'
                  : 'text-slate-800 hover:bg-black/10 dark:text-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Etiquetas</span>
            </button>

            {/* Compact & Accessible AI Assistant Popover */}
            <div className="relative ml-1">
              <button
                type="button"
                disabled={!!aiLoading}
                onClick={() => {
                  setShowAiMenu((v) => !v);
                  setShowMoreMenu(false);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  showAiMenu || aiLoading
                    ? 'bg-slate-900 text-[#FACC15] shadow-sm dark:bg-[#FACC15] dark:text-slate-950'
                    : 'bg-slate-900/90 text-white hover:bg-slate-900 dark:bg-amber-400/90 dark:text-slate-950 dark:hover:bg-amber-400'
                }`}
              >
                {aiLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-[#FACC15] dark:text-slate-950" />
                )}
                <span>{aiLoading ? 'Processando IA...' : 'Assistente IA'}</span>
              </button>

              {showAiMenu && (
                <div className="absolute bottom-11 left-0 z-30 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Escrita & Estrutura
                  </div>
                  <button
                    type="button"
                    onClick={() => runAiAction('summarize')}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    Resumir nota
                  </button>
                  <button
                    type="button"
                    onClick={() => runAiAction('topics')}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    Organizar em tópicos
                  </button>
                  <button
                    type="button"
                    onClick={() => runAiAction('improve')}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    Corrigir e melhorar o texto
                  </button>
                  <button
                    type="button"
                    onClick={() => runAiAction('expand')}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    Expandir e desenvolver ideias
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Ação & Conversão
                  </div>
                  <button
                    type="button"
                    onClick={() => runAiAction('copy_post')}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    Transformar em Copy / Post
                  </button>
                  <button
                    type="button"
                    onClick={() => runAiAction('checklist')}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    Criar checklist a partir do texto
                  </button>
                  <button
                    type="button"
                    onClick={() => runAiAction('find_tasks')}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  >
                    Extrair tarefas da nota
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quiet Typographic Metadata */}
          <div className="flex items-center gap-2 text-xs text-slate-700/80 dark:text-slate-300/80 font-mono-tabular">
            <span>{wordCount} palavras</span>
            {note.checklist.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {completedChecks}/{note.checklist.length} itens
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>Editada {formatRelativeTime(note.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
