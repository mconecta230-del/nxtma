import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  CheckSquare,
  FileText,
  Kanban,
  LayoutGrid,
  MonitorUp,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { NavSection, Note, Publication, Task } from '../types';

interface CommandPaletteModalProps {
  notes: Note[];
  tasks: Task[];
  publications: Publication[];
  onClose: () => void;
  onNavigate: (section: NavSection) => void;
  onNewNote: (initialTitle?: string, floating?: boolean) => void;
  onNewTask: (rawInput?: string) => void;
  onNewPublication: () => void;
  onOpenAiIdeas: () => void;
  onToggleFloatingTodayTasks: () => void;
  onOpenNote: (note: Note) => void;
  onOpenTask: (task: Task) => void;
  onOpenPublication: (pub: Publication) => void;
}

interface CommandOption {
  id: string;
  group: string;
  label: string;
  sublabel?: string;
  shortcut?: string;
  icon: React.FC<{ className?: string }>;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  notes,
  tasks,
  publications,
  onClose,
  onNavigate,
  onNewNote,
  onNewTask,
  onNewPublication,
  onOpenAiIdeas,
  onToggleFloatingTodayTasks,
  onOpenNote,
  onOpenTask,
  onOpenPublication,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const options = useMemo<CommandOption[]>(() => {
    const trimmed = query.trim();
    const lower = trimmed.toLowerCase();

    if (!trimmed) {
      return [
        {
          id: 'cmd-new-note',
          group: 'Ações',
          label: 'Nova nota',
          shortcut: 'Ctrl+N',
          icon: Plus,
          action: () => {
            onClose();
            onNewNote();
          },
        },
        {
          id: 'cmd-new-floating-note',
          group: 'Ações',
          label: 'Novo post-it na área de trabalho',
          shortcut: 'Ctrl+Alt+N',
          icon: MonitorUp,
          action: () => {
            onClose();
            onNewNote('', true);
          },
        },
        {
          id: 'cmd-new-task',
          group: 'Ações',
          label: 'Nova tarefa',
          shortcut: 'Ctrl+T',
          icon: CheckSquare,
          action: () => {
            onClose();
            onNewTask();
          },
        },
        {
          id: 'cmd-new-pub',
          group: 'Ações',
          label: 'Nova publicação',
          icon: Kanban,
          action: () => {
            onClose();
            onNewPublication();
          },
        },
        {
          id: 'cmd-ai-ideas',
          group: 'Ações',
          label: 'Ideias de publicação com IA',
          icon: Sparkles,
          action: () => {
            onClose();
            onOpenAiIdeas();
          },
        },
        {
          id: 'cmd-pin-tasks',
          group: 'Ações',
          label: 'Fixar as tarefas de hoje na área de trabalho',
          icon: MonitorUp,
          action: () => {
            onClose();
            onToggleFloatingTodayTasks();
          },
        },
        {
          id: 'nav-home',
          group: 'Ir para',
          label: 'Início',
          shortcut: 'Ctrl+1',
          icon: LayoutGrid,
          action: () => {
            onClose();
            onNavigate('home');
          },
        },
        {
          id: 'nav-notes',
          group: 'Ir para',
          label: 'Notas',
          shortcut: 'Ctrl+2',
          icon: FileText,
          action: () => {
            onClose();
            onNavigate('notes');
          },
        },
        {
          id: 'nav-tasks',
          group: 'Ir para',
          label: 'Tarefas',
          shortcut: 'Ctrl+3',
          icon: CheckSquare,
          action: () => {
            onClose();
            onNavigate('tasks');
          },
        },
        {
          id: 'nav-agenda',
          group: 'Ir para',
          label: 'Agenda',
          shortcut: 'Ctrl+4',
          icon: Calendar,
          action: () => {
            onClose();
            onNavigate('agenda');
          },
        },
        {
          id: 'nav-planning',
          group: 'Ir para',
          label: 'Planejamento',
          shortcut: 'Ctrl+5',
          icon: Kanban,
          action: () => {
            onClose();
            onNavigate('planning');
          },
        },
        {
          id: 'nav-studio',
          group: 'Ir para',
          label: 'Estúdio & Utilitários',
          shortcut: 'Ctrl+6',
          icon: Wand2,
          action: () => {
            onClose();
            onNavigate('studio');
          },
        },
      ];
    }

    const list: CommandOption[] = [
      {
        id: 'create-task-direct',
        group: 'Criar',
        label: `Criar tarefa: ${trimmed}`,
        sublabel: 'Para hoje',
        icon: CheckSquare,
        action: () => {
          onClose();
          onNewTask(trimmed);
        },
      },
      {
        id: 'create-note-direct',
        group: 'Criar',
        label: `Criar nota: ${trimmed}`,
        icon: FileText,
        action: () => {
          onClose();
          onNewNote(trimmed, false);
        },
      },
    ];

    const matchedNotes = notes.filter(
      (n) =>
        !n.deletedAt &&
        (n.title.toLowerCase().includes(lower) || n.content.toLowerCase().includes(lower))
    );
    matchedNotes.forEach((n) => {
      list.push({
        id: `note-${n.id}`,
        group: 'Notas',
        label: n.title || 'Nota sem título',
        sublabel: n.content.split('\n')[0] || '',
        icon: FileText,
        action: () => {
          onClose();
          onOpenNote(n);
        },
      });
    });

    const matchedTasks = tasks.filter(
      (t) =>
        !t.deletedAt &&
        (t.title.toLowerCase().includes(lower) ||
          t.description.toLowerCase().includes(lower))
    );
    matchedTasks.forEach((t) => {
      list.push({
        id: `task-${t.id}`,
        group: 'Tarefas',
        label: t.title,
        sublabel: t.completed ? 'Concluída' : 'Pendente',
        icon: CheckSquare,
        action: () => {
          onClose();
          onOpenTask(t);
        },
      });
    });

    const matchedPubs = publications.filter(
      (p) =>
        !p.deletedAt &&
        (p.title.toLowerCase().includes(lower) ||
          p.caption.toLowerCase().includes(lower))
    );
    matchedPubs.forEach((p) => {
      list.push({
        id: `pub-${p.id}`,
        group: 'Publicações',
        label: p.title,
        sublabel: p.network,
        icon: Kanban,
        action: () => {
          onClose();
          onOpenPublication(p);
        },
      });
    });

    return list;
  }, [
    query,
    notes,
    tasks,
    publications,
    onClose,
    onNavigate,
    onNewNote,
    onNewTask,
    onNewPublication,
    onOpenAiIdeas,
    onToggleFloatingTodayTasks,
    onOpenNote,
    onOpenTask,
    onOpenPublication,
  ]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, options.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + Math.max(1, options.length)) % Math.max(1, options.length)
      );
    } else if (e.key === 'Enter' && options[selectedIndex]) {
      e.preventDefault();
      options[selectedIndex].action();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Group options preserving order
  const groups: Array<{ name: string; items: Array<{ opt: CommandOption; idx: number }> }> = [];
  options.forEach((opt, idx) => {
    let grp = groups.find((g) => g.name === opt.group);
    if (!grp) {
      grp = { name: opt.group, items: [] };
      groups.push(grp);
    }
    grp.items.push({ opt, idx });
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 pt-20 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Top search bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar notas, tarefas e publicações, ou digitar um comando"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            Esc
          </button>
        </div>

        {/* Options list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {groups.map((grp) => (
            <div key={grp.name}>
              <div className="px-3 pb-1.5 text-[11px] font-semibold text-slate-400">
                {grp.name}
              </div>
              <div className="space-y-0.5">
                {grp.items.map(({ opt, idx }) => {
                  const Icon = opt.icon;
                  const active = idx === selectedIndex;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={opt.action}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs transition-colors ${
                        active
                          ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{opt.label}</span>
                        {opt.sublabel && (
                          <span className="text-slate-400 dark:text-slate-500 truncate">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                      {opt.shortcut && (
                        <kbd className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-mono-tabular text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 shrink-0">
                          {opt.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] dark:border-slate-700 dark:bg-slate-800">
              ↑
            </kbd>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] dark:border-slate-700 dark:bg-slate-800">
              ↓
            </kbd>
            <span>navegar</span>
            <kbd className="ml-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] dark:border-slate-700 dark:bg-slate-800">
              Enter
            </kbd>
            <span>abrir</span>
          </div>
          <div>
            Dica: digite &quot;reunião amanhã 15h&quot; e crie a tarefa direto daqui.
          </div>
        </div>
      </div>
    </div>
  );
};
