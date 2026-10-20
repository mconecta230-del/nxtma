import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  ArrowUpDown,
  Calendar as CalendarIcon,
  CalendarPlus,
  Camera,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Flag,
  Kanban,
  LayoutGrid,
  List,
  ListTodo,
  MonitorUp,
  Moon,
  MoreHorizontal,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Pause,
  PenLine,
  Pin,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Sun,
  Tag,
  Timer,
  Trash2,
  Wand2,
  WifiOff,
  X,
} from 'lucide-react';
import {
  AppDataBackup,
  AppSettings,
  AttachmentItem,
  ClientProject,
  MarketingSnippet,
  NavSection,
  Note,
  NoteColor,
  Publication,
  PublicationStage,
  SocialNetwork,
  Task,
  TaskListType,
} from './types';
import {
  formatRelativeTime,
  formatShortDayMonth,
  getOffsetDateISO,
  getTodayISO,
  INITIAL_CLIENTS,
  INITIAL_NOTES,
  INITIAL_PUBLICATIONS,
  INITIAL_SETTINGS,
  INITIAL_SNIPPETS,
  INITIAL_TASKS,
  NOTE_COLORS,
  NOTE_TEMPLATES,
  parseSmartTaskInput,
  SOCIAL_NETWORKS,
} from './utils/initialData';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWAInstall';
import { NoteModal } from './components/NoteModal';
import { PublicationModal } from './components/PublicationModal';
import { SettingsModal, SettingsTab } from './components/SettingsModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { DesktopFloatingLayer } from './components/DesktopFloatingLayer';
import { AiIdeasModal } from './components/AiIdeasModal';
import { TaskDetailsDrawer } from './components/TaskDetailsDrawer';
import { MarketingStudioView } from './components/MarketingStudioView';

const STORAGE_KEYS = {
  notes: 'nextmarketing_notes_v3',
  tasks: 'nextmarketing_tasks_v3',
  publications: 'nextmarketing_publications_v3',
  clients: 'nextmarketing_clients_v3',
  settings: 'nextmarketing_settings_v3',
  snippets: 'nextmarketing_snippets_v3',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  // Core Persistent State
  const [notes, setNotes] = useState<Note[]>(() =>
    loadFromStorage(STORAGE_KEYS.notes, INITIAL_NOTES)
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage(STORAGE_KEYS.tasks, INITIAL_TASKS)
  );
  const [publications, setPublications] = useState<Publication[]>(() =>
    loadFromStorage(STORAGE_KEYS.publications, INITIAL_PUBLICATIONS)
  );
  const [clients, setClients] = useState<ClientProject[]>(() =>
    loadFromStorage(STORAGE_KEYS.clients, INITIAL_CLIENTS)
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromStorage(STORAGE_KEYS.settings, INITIAL_SETTINGS)
  );
  const [snippets, setSnippets] = useState<MarketingSnippet[]>(() =>
    loadFromStorage(STORAGE_KEYS.snippets, INITIAL_SNIPPETS)
  );

  // Navigation & Active Filters
  const [activeNav, setActiveNav] = useState<NavSection>('home');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');

  // Home Quick Capture
  const [quickCaptureText, setQuickCaptureText] = useState('');

  // Notes View State
  const [noteColorFilter, setNoteColorFilter] = useState<NoteColor | 'all'>('all');
  const [noteClientFilter, setNoteClientFilter] = useState<string>('all');
  const [noteTagFilter, setNoteTagFilter] = useState<string>('all');
  const [noteSearch, setNoteSearch] = useState('');
  const [noteSortOrder, setNoteSortOrder] = useState<'updated' | 'title'>('updated');
  const [noteViewMode, setNoteViewMode] = useState<'grid' | 'list'>(() =>
    loadFromStorage<'grid' | 'list'>('nextmarketing_notes_view_mode', 'grid')
  );
  const [openNoteMenuId, setOpenNoteMenuId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Tasks View State
  const [taskTab, setTaskTab] = useState<'today' | 'tomorrow' | 'pending' | 'completed'>('today');
  const [taskProjectFilter, setTaskProjectFilter] = useState<string>('all');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [showCompletedToday, setShowCompletedToday] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Agenda View State
  const [agendaMonthDate, setAgendaMonthDate] = useState<Date>(() => new Date());
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<string>(() => getTodayISO());
  const [agendaTaskInput, setAgendaTaskInput] = useState('');

  // Planning (Kanban) View State
  const [planningClientFilter, setPlanningClientFilter] = useState<string>('all');
  const [planningNetworkFilter, setPlanningNetworkFilter] = useState<string>('all');
  const [draggedPubId, setDraggedPubId] = useState<string | null>(null);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [isPublicationModalOpen, setIsPublicationModalOpen] = useState(false);
  const [newPublicationDefaults, setNewPublicationDefaults] = useState<{
    stage?: PublicationStage;
    date?: string;
    clientId?: string;
  }>({});
  const [showAiIdeasModal, setShowAiIdeasModal] = useState(false);

  // Archive & Trash State
  const [archiveTab, setArchiveTab] = useState<'archived' | 'trash'>('archived');

  // Top Bar & Modals State
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>('appearance');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pomodoro Timer State
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');
  const [activePomodoroTaskId, setActivePomodoroTaskId] = useState<string | null>(null);
  const [showPomodoroWidget, setShowPomodoroWidget] = useState(false);

  // PWA & Online Hooks
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const createDropdownRef = useRef<HTMLDivElement | null>(null);
  const brandLogoInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleTopBarLogoUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/png');
          setSettings((prev) => ({ ...prev, brandLogoUrl: dataUrl }));
          showToast('Logo da Next Marketing atualizada com sucesso!');
        } else {
          setSettings((prev) => ({
            ...prev,
            brandLogoUrl: reader.result as string,
          }));
          showToast('Logo da Next Marketing atualizada!');
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.publications, JSON.stringify(publications));
  }, [publications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.snippets, JSON.stringify(snippets));
  }, [snippets]);

  // Apply Dark/Light/System Theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (settings.theme === 'dark') {
      applyTheme(true);
    } else if (settings.theme === 'light') {
      applyTheme(false);
    } else {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(media.matches);
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // Pomodoro Interval
  useEffect(() => {
    if (!pomodoroRunning) return;
    const interval = setInterval(() => {
      setPomodoroSeconds((prev) => {
        if (prev <= 1) {
          setPomodoroRunning(false);
          if (pomodoroMode === 'work') {
            if (activePomodoroTaskId) {
              setTasks((curr) =>
                curr.map((t) =>
                  t.id === activePomodoroTaskId
                    ? { ...t, pomodorosCompleted: (t.pomodorosCompleted || 0) + 1 }
                    : t
                )
              );
            }
            showToast('Ciclo Pomodoro concluído! Hora de 5 minutos de pausa.');
            setPomodoroMode('break');
            return 5 * 60;
          } else {
            showToast('Pausa encerrada! Pronto para mais um bloco de foco.');
            setPomodoroMode('work');
            return 25 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroMode, activePomodoroTaskId]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((v) => !v);
        return;
      }
      // Ctrl+Alt+N -> New floating post-it
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNewNote('', true);
        return;
      }
      // Ctrl+N -> New Note
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNewNote('', false);
        return;
      }
      // Ctrl+T -> Go to Tasks
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setActiveNav('tasks');
        return;
      }
      // Ctrl+, -> Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setShowSettingsModal(true);
        return;
      }
      // Ctrl+1..6 -> Navigation
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveNav('home');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveNav('notes');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveNav('tasks');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveNav('agenda');
        } else if (e.key === '5') {
          e.preventDefault();
          setActiveNav('planning');
        } else if (e.key === '6') {
          e.preventDefault();
          setActiveNav('studio');
        }
      }
      // Escape -> Close open panels/modals
      if (e.key === 'Escape') {
        setShowCreateDropdown(false);
        setShowCommandPalette(false);
        setActiveNoteId(null);
        setActiveTaskId(null);
        setIsPublicationModalOpen(false);
        setShowSettingsModal(false);
        setShowAiIdeasModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Close Create Dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        createDropdownRef.current &&
        !createDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCreateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derived active lists (excluding trash)
  const activeNotes = useMemo(
    () => notes.filter((n) => !n.deletedAt && !n.archived),
    [notes]
  );
  const archivedNotes = useMemo(
    () => notes.filter((n) => !n.deletedAt && n.archived),
    [notes]
  );
  const activeTasks = useMemo(() => tasks.filter((t) => !t.deletedAt), [tasks]);
  const activePublications = useMemo(
    () => publications.filter((p) => !p.deletedAt),
    [publications]
  );

  const trashedItemsCount = useMemo(() => {
    const nCount = notes.filter((n) => !!n.deletedAt).length;
    const tCount = tasks.filter((t) => !!t.deletedAt).length;
    const pCount = publications.filter((p) => !!p.deletedAt).length;
    return nCount + tCount + pCount;
  }, [notes, tasks, publications]);

  const todayISO = getTodayISO();
  const todayTasks = useMemo(
    () => activeTasks.filter((t) => t.list === 'today' || t.dueDate === todayISO),
    [activeTasks, todayISO]
  );
  const pendingTodayTasks = useMemo(
    () => todayTasks.filter((t) => !t.completed),
    [todayTasks]
  );
  const completedTodayTasks = useMemo(
    () => todayTasks.filter((t) => t.completed),
    [todayTasks]
  );

  const floatingNotes = useMemo(
    () => activeNotes.filter((n) => n.floating),
    [activeNotes]
  );

  // Actions: Notes
  const handleCreateNewNote = (
    initialTitle = '',
    floating = false,
    initialAttachments: AttachmentItem[] = []
  ) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: initialTitle,
      content: '',
      color: 'yellow',
      pinned: false,
      floating,
      floatingPos: {
        x: Math.max(40, Math.floor(window.innerWidth / 2 - 140)),
        y: 120,
      },
      checklist: [],
      links: [],
      tags: [],
      attachments: initialAttachments,
      clientId: selectedClientFilter !== 'all' ? selectedClientFilter : '',
      archived: false,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    if (!floating) {
      setActiveNoteId(newNote.id);
    } else {
      setSettings((s) => ({ ...s, hideFloatingNotes: false }));
      showToast('Novo post-it fixado na área de trabalho!');
    }
  };

  const handleUpdateNote = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleDuplicateNote = (note: Note) => {
    const copy: Note = {
      ...note,
      id: `note-${Date.now()}`,
      title: `${note.title || 'Nota'} (Cópia)`,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [copy, ...prev]);
    setActiveNoteId(copy.id);
    showToast('Nota duplicada!');
  };

  const handleArchiveToggleNote = (note: Note) => {
    const nextArchived = !note.archived;
    handleUpdateNote({ ...note, archived: nextArchived, floating: false });
    setActiveNoteId(null);
    showToast(nextArchived ? 'Nota arquivada!' : 'Nota restaurada ao mural!');
  };

  const handleDeleteNoteToTrash = (note: Note) => {
    handleUpdateNote({
      ...note,
      deletedAt: new Date().toISOString(),
      floating: false,
    });
    setActiveNoteId(null);
    showToast('Nota movida para a lixeira.');
  };

  const handleConvertNoteToTask = (note: Note) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: note.title || note.content.split('\n')[0] || 'Nova tarefa da nota',
      description: note.content,
      list: 'today',
      dueDate: getTodayISO(),
      dueTime: '',
      reminder: 'none',
      repeat: 'none',
      priority: 'medium',
      clientId: note.clientId || '',
      completed: false,
      completedAt: null,
      pomodorosCompleted: 0,
      deletedAt: null,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setActiveNoteId(null);
    setActiveNav('tasks');
    setActiveTaskId(newTask.id);
    showToast('Nota transformada em tarefa!');
  };

  const handleConvertNoteToPublication = (note: Note) => {
    const newPub: Publication = {
      id: `pub-from-note-${Date.now()}`,
      title: note.title || note.content.split('\n')[0] || 'Nova publicação da nota',
      clientId: note.clientId || clients[0]?.id || '',
      date: getTodayISO(),
      time: '18:00',
      network: 'Instagram',
      stage: 'idea',
      caption: note.content,
      hashtags: note.tags.map((t) => `#${t}`).join(' '),
      notes: note.aiSummary || '',
      attachments: note.attachments || [],
      referenceLinks: note.links || [],
      deletedAt: null,
      createdAt: new Date().toISOString(),
    };
    setPublications((prev) => [newPub, ...prev]);
    setActiveNoteId(null);
    setActiveNav('planning');
    setEditingPublication(newPub);
    setIsPublicationModalOpen(true);
    showToast('Nota enviada como Publicação no Kanban!');
  };

  const handleCreateTasksFromAI = (taskTitles: string[], clientId?: string) => {
    const created: Task[] = taskTitles.map((title, idx) => ({
      id: `task-ai-${Date.now()}-${idx}`,
      title,
      description: 'Extraída automaticamente pelo Assistente de IA.',
      list: 'today',
      dueDate: getTodayISO(),
      dueTime: '',
      reminder: 'none',
      repeat: 'none',
      priority: 'medium',
      clientId: clientId || '',
      completed: false,
      completedAt: null,
      pomodorosCompleted: 0,
      deletedAt: null,
      createdAt: new Date().toISOString(),
    }));
    setTasks((prev) => [...created, ...prev]);
    showToast(`${created.length} tarefa(s) criada(s) a partir da nota!`);
  };

  // Actions: Tasks
  const handleAddQuickTask = (
    rawText: string,
    defaultList: TaskListType = 'today',
    overrideDate?: string
  ) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;
    const parsed = parseSmartTaskInput(trimmed, defaultList);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: parsed.title,
      description: '',
      list: parsed.list,
      dueDate: overrideDate || parsed.dueDate,
      dueTime: parsed.dueTime,
      reminder: 'none',
      repeat: 'none',
      priority: parsed.priority,
      clientId:
        taskProjectFilter !== 'all'
          ? taskProjectFilter
          : selectedClientFilter !== 'all'
          ? selectedClientFilter
          : '',
      completed: false,
      completedAt: null,
      pomodorosCompleted: 0,
      deletedAt: null,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Tarefa adicionada!');
  };

  const handleToggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : null,
            }
          : t
      )
    );
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTaskToTrash = (task: Task) => {
    handleUpdateTask({ ...task, deletedAt: new Date().toISOString() });
    setActiveTaskId(null);
    showToast('Tarefa movida para a lixeira.');
  };

  const handleConvertTaskToNote = (task: Task) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: task.title,
      content: task.description || '',
      color: 'yellow',
      pinned: false,
      floating: false,
      checklist: [],
      links: [],
      tags: [],
      attachments: [],
      clientId: task.clientId || '',
      archived: false,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveTaskId(null);
    setActiveNav('notes');
    setActiveNoteId(newNote.id);
    showToast('Tarefa transformada em nota!');
  };

  // Actions: Publications
  const handleSavePublication = (pub: Publication) => {
    setPublications((prev) => {
      const exists = prev.some((p) => p.id === pub.id);
      if (exists) {
        return prev.map((p) => (p.id === pub.id ? pub : p));
      }
      return [pub, ...prev];
    });
    setIsPublicationModalOpen(false);
    setEditingPublication(null);
    showToast('Publicação salva!');
  };

  const handleDeletePublicationToTrash = (pub: Publication) => {
    setPublications((prev) =>
      prev.map((p) =>
        p.id === pub.id ? { ...p, deletedAt: new Date().toISOString() } : p
      )
    );
    setIsPublicationModalOpen(false);
    setEditingPublication(null);
    showToast('Publicação movida para a lixeira.');
  };

  const handleMovePublicationStage = (pubId: string, nextStage: PublicationStage) => {
    setPublications((prev) =>
      prev.map((p) => (p.id === pubId ? { ...p, stage: nextStage } : p))
    );
  };

  // Actions: Clients & Settings & Backup
  const handleAddClient = (name: string, color: string) => {
    const newClient: ClientProject = {
      id: `client-${Date.now()}`,
      name,
      color,
    };
    setClients((prev) => [...prev, newClient]);
    showToast(`Cliente "${name}" adicionado!`);
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (selectedClientFilter === id) setSelectedClientFilter('all');
    if (planningClientFilter === id) setPlanningClientFilter('all');
    showToast('Cliente removido.');
  };

  const handleExportBackup = () => {
    const backup: AppDataBackup = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      notes,
      tasks,
      publications,
      clients,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `next-marketing-backup-${getTodayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup .json exportado com sucesso!');
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<AppDataBackup>;
        if (Array.isArray(parsed.notes)) setNotes(parsed.notes);
        if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
        if (Array.isArray(parsed.publications)) setPublications(parsed.publications);
        if (Array.isArray(parsed.clients)) setClients(parsed.clients);
        if (parsed.settings) setSettings((s) => ({ ...s, ...parsed.settings }));
        showToast('Backup importado com sucesso!');
      } catch {
        showToast('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleTestNotification = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Next Marketing', {
          body: `Você tem ${pendingTodayTasks.length} tarefa(s) para hoje e ${activePublications.length} publicação(ões) no planejamento.`,
          icon: '/pwa-192x192.png',
        });
        showToast('Notificação de teste enviada!');
        return;
      }
      if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification('Next Marketing', {
            body: 'Notificações ativadas com sucesso no seu computador!',
            icon: '/pwa-192x192.png',
          });
          showToast('Notificações ativadas e teste enviado!');
          return;
        }
      }
    }
    showToast(
      `Teste de notificação: ${pendingTodayTasks.length} tarefa(s) para hoje na Next Marketing!`
    );
  };

  const handleCreateNoteFromTemplate = (
    template: (typeof NOTE_TEMPLATES)[number]
  ) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: template.title,
      content: template.content,
      color: template.color,
      pinned: false,
      floating: false,
      checklist: template.checklist.map((item, idx) => ({
        id: `chk-${Date.now()}-${idx}`,
        text: item.text,
        completed: item.completed,
      })),
      links: [],
      tags: [...template.tags],
      attachments: [],
      clientId: clients[0]?.id || 'client-prime',
      archived: false,
      deletedAt: null,
      updatedAt: now,
      createdAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    showToast(`Nota criada com o modelo "${template.label}"!`);
  };

  const allNoteTags = useMemo(() => {
    const set = new Set<string>();
    activeNotes.forEach((n) => {
      n.tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [activeNotes]);

  // Date & Greeting Helpers
  const greetingInfo = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const greeting =
      hour < 12 ? 'Bom dia.' : hour < 18 ? 'Boa tarde.' : 'Boa noite.';
    const formattedDate = now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const capitalizedDate =
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    return { greeting, capitalizedDate };
  }, []);

  // Filtered Notes for Notes View
  const filteredNotes = useMemo(() => {
    const list = activeNotes.filter((n) => {
      if (noteColorFilter !== 'all' && n.color !== noteColorFilter) return false;
      if (noteClientFilter !== 'all' && (n.clientId || '') !== noteClientFilter) {
        return false;
      }
      if (noteTagFilter !== 'all' && !n.tags.includes(noteTagFilter)) {
        return false;
      }
      if (noteSearch.trim()) {
        const q = noteSearch.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchContent = n.content.toLowerCase().includes(q);
        const matchTag = n.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchTag) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (noteSortOrder === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [
    activeNotes,
    noteColorFilter,
    noteClientFilter,
    noteTagFilter,
    noteSearch,
    noteSortOrder,
  ]);

  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.pinned),
    [filteredNotes]
  );
  const unpinnedNotes = useMemo(
    () => filteredNotes.filter((n) => !n.pinned),
    [filteredNotes]
  );

  // Filtered Tasks for Tasks View
  const filteredTasksByTab = useMemo(() => {
    return activeTasks.filter((t) => {
      if (taskProjectFilter !== 'all' && t.clientId !== taskProjectFilter) {
        return false;
      }
      if (taskTab === 'completed') return t.completed;
      if (taskTab === 'today') {
        return !t.completed && (t.list === 'today' || t.dueDate === todayISO);
      }
      if (taskTab === 'tomorrow') {
        return !t.completed && t.list === 'tomorrow';
      }
      return !t.completed && t.list === 'pending';
    });
  }, [activeTasks, taskProjectFilter, taskTab, todayISO]);

  const todayCompletionPercent = useMemo(() => {
    if (todayTasks.length === 0) return 0;
    return Math.round((completedTodayTasks.length / todayTasks.length) * 100);
  }, [todayTasks.length, completedTodayTasks.length]);

  // Calendar Grid Generation for Agenda View
  const calendarDays = useMemo(() => {
    const year = agendaMonthDate.getFullYear();
    const month = agendaMonthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      dateISO: string;
      dayNumber: number;
      isCurrentMonth: boolean;
    }> = [];

    // Previous month trailing days
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dt = new Date(year, month - 1, d);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(dt.getDate()).padStart(2, '0')}`;
      cells.push({ dateISO: iso, dayNumber: d, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      cells.push({ dateISO: iso, dayNumber: d, isCurrentMonth: true });
    }

    // Next month leading days to fill 42 cells (6 weeks)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const dt = new Date(year, month + 1, d);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(dt.getDate()).padStart(2, '0')}`;
      cells.push({ dateISO: iso, dayNumber: d, isCurrentMonth: false });
    }

    return cells;
  }, [agendaMonthDate]);

  // Filtered Publications for Kanban View
  const filteredPublications = useMemo(() => {
    return activePublications.filter((p) => {
      if (planningClientFilter !== 'all' && p.clientId !== planningClientFilter) {
        return false;
      }
      if (planningNetworkFilter !== 'all' && p.network !== planningNetworkFilter) {
        return false;
      }
      return true;
    });
  }, [activePublications, planningClientFilter, planningNetworkFilter]);

  const activeNoteModalObj = useMemo(
    () => notes.find((n) => n.id === activeNoteId) || null,
    [notes, activeNoteId]
  );

  const activeTaskDrawerObj = useMemo(
    () => tasks.find((t) => t.id === activeTaskId) || null,
    [tasks, activeTaskId]
  );

  const stageLabelMap: Record<PublicationStage, string> = {
    idea: 'Ideia',
    creating: 'Em criação',
    ready: 'Pronto',
    published: 'Publicado',
  };

  return (
    <div
      className={`relative flex h-screen w-screen flex-col overflow-hidden text-slate-900 dark:text-slate-100 ${
        settings.backgroundStyle === 'warm_gradient'
          ? 'bg-gradient-to-br from-amber-50 via-[#F4F5F7] to-orange-50 dark:from-slate-950 dark:via-[#0F172A] dark:to-amber-950/30'
          : settings.backgroundStyle === 'cool_gradient'
          ? 'bg-gradient-to-br from-sky-50 via-[#F4F5F7] to-indigo-50 dark:from-slate-950 dark:via-[#0F172A] dark:to-indigo-950/30'
          : 'bg-[#F4F5F7] dark:bg-[#0F172A]'
      }`}
    >
      {/* Dynamic Background Pattern / Custom Wallpaper Layer */}
      {settings.backgroundStyle === 'dots' && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-60 dark:opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(#94A3B8 1.25px, transparent 1.25px)',
            backgroundSize: '20px 20px',
          }}
        />
      )}
      {settings.backgroundStyle === 'grid' && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-45 dark:opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, #CBD5E1 1px, transparent 1px), linear-gradient(to bottom, #CBD5E1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      )}
      {settings.backgroundStyle === 'custom_image' &&
        settings.customWallpaperUrl && (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <img
              src={settings.customWallpaperUrl}
              alt=""
              className={`h-full w-full object-cover transition-all duration-300 ${
                settings.wallpaperBlur ? 'scale-105 blur-md' : ''
              }`}
            />
            <div
              className="absolute inset-0 bg-[#F4F5F7] dark:bg-[#0F172A]"
              style={{
                opacity: (settings.wallpaperOverlayOpacity ?? 65) / 100,
              }}
            />
          </div>
        )}

      {/* TOP BAR */}
      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 dark:border-slate-800 dark:bg-slate-900/90">
        {/* Left: Brand Logo (Direct Profile/Logo Upload) + Brand Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <input
            ref={brandLogoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleTopBarLogoUpload(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => brandLogoInputRef.current?.click()}
            title="Clique para enviar ou alterar a logo da Next Marketing"
            className="group relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-slate-200/80 bg-[#FACC15] shadow-2xs transition-transform hover:scale-105 dark:border-slate-700"
          >
            {settings.brandLogoUrl ? (
              <img
                src={settings.brandLogoUrl}
                alt="Next Marketing Logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <FileText className="h-4 w-4 text-slate-950" />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-3.5 w-3.5 text-white" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveNav('home')}
            className="text-left focus:outline-none"
          >
            <span className="font-display text-[15px] font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Next Marketing
            </span>
          </button>
        </div>

        {/* Center: Search / Command Palette Trigger */}
        <button
          type="button"
          onClick={() => setShowCommandPalette(true)}
          className="flex w-full max-w-md items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-100/80 px-3.5 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:border-slate-600"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">Buscar ou executar um comando</span>
          </div>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono-tabular text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 shrink-0">
            Ctrl K
          </kbd>
        </button>

        {/* Right: Primary Create Action & Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={install}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0"
              title="Instalar aplicativo no computador"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Instalar App</span>
            </button>
          )}

          {/* + Criar Dropdown */}
          <div ref={createDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setShowCreateDropdown((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-2xs hover:bg-[#EAB308] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Criar</span>
              <ChevronDown className="h-3.5 w-3.5 ml-0.5 opacity-80" />
            </button>

            {showCreateDropdown && (
              <div className="absolute right-0 top-10 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateDropdown(false);
                    handleCreateNewNote('', false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    Nova nota
                  </span>
                  <span className="font-mono-tabular text-[10px] text-slate-400">
                    Ctrl+N
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateDropdown(false);
                    handleCreateNewNote('', true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                >
                  <span className="flex items-center gap-2">
                    <MonitorUp className="h-3.5 w-3.5 text-slate-500" />
                    Post-it na área de trabalho
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateDropdown(false);
                    setActiveNav('tasks');
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                >
                  <span className="flex items-center gap-2">
                    <ListTodo className="h-3.5 w-3.5 text-slate-500" />
                    Nova tarefa
                  </span>
                  <span className="font-mono-tabular text-[10px] text-slate-400">
                    Ctrl+T
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateDropdown(false);
                    setEditingPublication(null);
                    setNewPublicationDefaults({ stage: 'idea' });
                    setIsPublicationModalOpen(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                >
                  <span className="flex items-center gap-2">
                    <Kanban className="h-3.5 w-3.5 text-slate-500" />
                    Nova publicação
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateDropdown(false);
                    setActiveNav('studio');
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                >
                  <span className="flex items-center gap-2">
                    <Wand2 className="h-3.5 w-3.5 text-amber-500" />
                    Gerar Copy / Link no Estúdio
                  </span>
                  <span className="font-mono-tabular text-[10px] text-slate-400">
                    Ctrl+6
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Toggle Floating Post-its Visibility (Pin-off / Eye icon from header) */}
          <button
            type="button"
            onClick={() => {
              const nextHide = !settings.hideFloatingNotes;
              setSettings((s) => ({ ...s, hideFloatingNotes: nextHide }));
              showToast(
                nextHide
                  ? 'Post-its flutuantes ocultados temporariamente.'
                  : 'Post-its flutuantes visíveis na tela.'
              );
            }}
            title={
              settings.hideFloatingNotes
                ? 'Mostrar post-its na área de trabalho'
                : 'Ocultar post-its da área de trabalho'
            }
            className={`rounded-xl p-2 transition-colors ${
              floatingNotes.length > 0 && !settings.hideFloatingNotes
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {settings.hideFloatingNotes ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </button>

          {/* Quick Wallpaper / Background Style Button */}
          <button
            type="button"
            onClick={() => {
              setSettingsInitialTab('appearance');
              setShowSettingsModal(true);
            }}
            title="Personalizar logo, papel de parede e aparência"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Palette className="h-4 w-4" />
          </button>

          {/* Toggle Theme Light / Dark */}
          <button
            type="button"
            onClick={() =>
              setSettings((s) => ({
                ...s,
                theme: s.theme === 'dark' ? 'light' : 'dark',
              }))
            }
            title="Alternar tema claro/escuro"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {settings.theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* BODY: SIDEBAR + MAIN VIEWPORT */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside
          className={`flex flex-col justify-between border-r border-slate-200/80 bg-[#FBFBFB]/90 backdrop-blur-md transition-all duration-150 dark:border-slate-800 dark:bg-slate-900/80 shrink-0 ${
            settings.sidebarCollapsed ? 'w-16 px-2 py-4' : 'w-64 px-3 py-4'
          }`}
        >
          {/* Main Nav & Clients */}
          <div className="space-y-6 overflow-y-auto">
            <nav className="space-y-1">
              {(
                [
                  {
                    id: 'home',
                    label: 'Início',
                    icon: LayoutGrid,
                    count: 0,
                  },
                  {
                    id: 'notes',
                    label: 'Notas',
                    icon: FileText,
                    count: activeNotes.length,
                  },
                  {
                    id: 'tasks',
                    label: 'Tarefas',
                    icon: ListTodo,
                    count: pendingTodayTasks.length,
                  },
                  {
                    id: 'agenda',
                    label: 'Agenda',
                    icon: CalendarIcon,
                    count: 0,
                  },
                  {
                    id: 'planning',
                    label: 'Planejamento',
                    icon: Kanban,
                    count: activePublications.length,
                  },
                  {
                    id: 'studio',
                    label: 'Estúdio & Utilitários',
                    icon: Wand2,
                    count: snippets.length,
                  },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeNav === item.id && selectedClientFilter === 'all';
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={settings.sidebarCollapsed ? item.label : undefined}
                    onClick={() => {
                      setSelectedClientFilter('all');
                      if (item.id === 'planning') {
                        setPlanningClientFilter('all');
                      }
                      setActiveNav(item.id);
                    }}
                    className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-200/65 text-slate-950 font-semibold dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-200/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#FACC15]" />
                    )}
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      {!settings.sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {!settings.sidebarCollapsed && item.count > 0 && (
                      <span className="font-mono-tabular text-[11px] text-slate-400 dark:text-slate-500">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Clientes e projetos section */}
            {!settings.sidebarCollapsed && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between px-3 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  <span>Clientes e projetos</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsInitialTab('clients');
                      setShowSettingsModal(true);
                    }}
                    className="hover:text-slate-700 dark:hover:text-slate-300"
                    title="Gerenciar clientes"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-0.5">
                  {clients.map((client) => {
                    const pubCount = activePublications.filter(
                      (p) => p.clientId === client.id
                    ).length;
                    const isSelected =
                      activeNav === 'planning' &&
                      planningClientFilter === client.id &&
                      selectedClientFilter === client.id;
                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setSelectedClientFilter(client.id);
                          setPlanningClientFilter(client.id);
                          setActiveNav('planning');
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-slate-200/65 font-semibold text-slate-950 dark:bg-slate-800 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-200/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: client.color }}
                          />
                          <span className="truncate">{client.name}</span>
                        </div>
                        {pubCount > 0 && (
                          <span className="font-mono-tabular text-[11px] text-slate-400 shrink-0">
                            {pubCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Sidebar Actions */}
          <div className="space-y-1 border-t border-slate-200/60 pt-3 dark:border-slate-800">
            <button
              type="button"
              title={settings.sidebarCollapsed ? 'Arquivo e lixeira' : undefined}
              onClick={() => {
                setSelectedClientFilter('all');
                setActiveNav('archive');
              }}
              className={`relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                activeNav === 'archive'
                  ? 'bg-slate-200/65 font-semibold text-slate-950 dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-200/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50'
              }`}
            >
              {activeNav === 'archive' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#FACC15]" />
              )}
              <div className="flex items-center gap-3">
                <Archive className="h-4 w-4 shrink-0" />
                {!settings.sidebarCollapsed && <span>Arquivo e lixeira</span>}
              </div>
            </button>

            <button
              type="button"
              title={settings.sidebarCollapsed ? 'Configurações' : undefined}
              onClick={() => {
                setSettingsInitialTab('appearance');
                setShowSettingsModal(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white whitespace-nowrap"
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!settings.sidebarCollapsed && <span>Configurações</span>}
            </button>

            <button
              type="button"
              title={
                settings.sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'
              }
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  sidebarCollapsed: !s.sidebarCollapsed,
                }))
              }
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-200/40 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white whitespace-nowrap"
            >
              {settings.sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4 shrink-0" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 shrink-0" />
                  <span>Recolher menu</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          {/* =========================================================
              VIEW 1: INÍCIO (HOME)
             ========================================================= */}
          {activeNav === 'home' && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {greetingInfo.capitalizedDate}
                </div>
                <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                  {greetingInfo.greeting}
                </h1>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                  Você tem{' '}
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    {pendingTodayTasks.length}{' '}
                    {pendingTodayTasks.length === 1 ? 'tarefa' : 'tarefas'}
                  </strong>{' '}
                  para hoje e{' '}
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">
                    {activePublications.length}{' '}
                    {activePublications.length === 1
                      ? 'publicação'
                      : 'publicações'}
                  </strong>{' '}
                  planejadas para os próximos dias.
                </p>
              </div>

              {/* Quick Capture Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={quickCaptureText}
                    onChange={(e) => setQuickCaptureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && quickCaptureText.trim()) {
                        handleAddQuickTask(quickCaptureText, 'today');
                        setQuickCaptureText('');
                      }
                    }}
                    placeholder="O que você precisa lembrar? Ex.: Enviar orçamento amanhã 15h"
                    className="flex-1 bg-transparent px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (!quickCaptureText.trim()) {
                          handleCreateNewNote('', false);
                          return;
                        }
                        const newNote: Note = {
                          id: `note-${Date.now()}`,
                          title: quickCaptureText.trim(),
                          content: '',
                          color: 'yellow',
                          pinned: false,
                          floating: false,
                          checklist: [],
                          links: [],
                          tags: [],
                          attachments: [],
                          clientId: clients[0]?.id || 'client-prime',
                          archived: false,
                          deletedAt: null,
                          updatedAt: new Date().toISOString(),
                          createdAt: new Date().toISOString(),
                        };
                        setNotes((prev) => [newNote, ...prev]);
                        setQuickCaptureText('');
                        showToast('Salvo como nota!');
                      }}
                      className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Salvar como nota</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!quickCaptureText.trim()) {
                          setActiveNav('tasks');
                          return;
                        }
                        handleAddQuickTask(quickCaptureText, 'today');
                        setQuickCaptureText('');
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-[#FEF08A] px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-[#FACC15] transition-colors whitespace-nowrap shrink-0"
                    >
                      <ListTodo className="h-3.5 w-3.5" />
                      <span>Criar tarefa</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Today's Tasks Summary Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Hoje
                    </h2>
                    <span className="font-mono-tabular text-xs text-slate-400">
                      {completedTodayTasks.length} de {todayTasks.length}{' '}
                      concluídas
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav('tasks')}
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    Ver tarefas
                  </button>
                </div>

                {pendingTodayTasks.length === 0 ? (
                  <div className="py-4 text-xs text-slate-400">
                    Tudo em dia! Nenhuma tarefa pendente para hoje.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pendingTodayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTaskCompletion(task.id)}
                            className="text-slate-300 hover:text-emerald-600 dark:text-slate-600 shrink-0"
                          >
                            <Circle className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTaskId(task.id)}
                            className="truncate text-left text-sm font-medium text-slate-800 hover:text-slate-950 dark:text-slate-200"
                          >
                            {task.title}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {task.dueTime && (
                            <span className="font-mono-tabular text-xs text-slate-400">
                              {task.dueTime}
                            </span>
                          )}
                          {task.priority === 'high' && (
                            <Flag className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agenda in List Format Card (Inside Início) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <CalendarIcon className="h-4 w-4 text-amber-500" />
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Agenda
                    </h2>
                    <span className="font-mono-tabular text-xs text-slate-400">
                      Próximos compromissos, tarefas e publicações
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav('agenda')}
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    Ver agenda
                  </button>
                </div>

                {(() => {
                  const dateSet = new Set<string>([todayISO]);
                  activeTasks.forEach((t) => {
                    if (t.dueDate && t.dueDate >= todayISO) {
                      dateSet.add(t.dueDate);
                    }
                  });
                  activePublications.forEach((p) => {
                    if (p.date && p.date >= todayISO) {
                      dateSet.add(p.date);
                    }
                  });
                  const sortedDates = Array.from(dateSet)
                    .sort((a, b) => a.localeCompare(b))
                    .slice(0, 6);

                  return (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sortedDates.map((dateISO) => {
                        const dt = formatShortDayMonth(dateISO);
                        const [y, m, d] = dateISO.split('-').map(Number);
                        const dateObj = new Date(y, (m || 1) - 1, d || 1);
                        const weekdayLabel = dateObj.toLocaleDateString(
                          'pt-BR',
                          { weekday: 'short' }
                        );
                        const isTodayDate = dateISO === todayISO;
                        const dayTasksList = activeTasks.filter(
                          (t) => t.dueDate === dateISO
                        );
                        const dayPubsList = activePublications.filter(
                          (p) => p.date === dateISO
                        );

                        return (
                          <div
                            key={dateISO}
                            className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                          >
                            {/* Left Date Badge */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAgendaDate(dateISO);
                                setActiveNav('agenda');
                              }}
                              className="flex items-center gap-3 text-left sm:w-44 shrink-0 group"
                            >
                              <div
                                className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border transition-colors ${
                                  isTodayDate
                                    ? 'border-amber-400 bg-[#FEF08A]/70 text-slate-950 dark:border-amber-400 dark:bg-amber-400/20 dark:text-amber-300'
                                    : 'border-slate-200 bg-slate-50/70 text-slate-900 group-hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                                }`}
                              >
                                <span className="font-mono-tabular text-xs font-bold leading-none">
                                  {dt.day}
                                </span>
                                <span className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                                  {dt.month}
                                </span>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                                  {isTodayDate ? 'Hoje' : weekdayLabel}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono-tabular">
                                  {dayTasksList.length + dayPubsList.length}{' '}
                                  {dayTasksList.length + dayPubsList.length === 1
                                    ? 'item'
                                    : 'itens'}
                                </div>
                              </div>
                            </button>

                            {/* Right Items List for this Date */}
                            <div className="flex-1 space-y-2 min-w-0">
                              {dayTasksList.length === 0 &&
                              dayPubsList.length === 0 ? (
                                <div className="text-xs text-slate-400 py-2">
                                  Nenhum compromisso agendado neste dia.
                                </div>
                              ) : (
                                <>
                                  {dayTasksList.map((task) => {
                                    const clientObj = clients.find(
                                      (c) => c.id === task.clientId
                                    );
                                    return (
                                      <div
                                        key={task.id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-800/80 dark:bg-slate-800/40"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleToggleTaskCompletion(
                                                task.id
                                              )
                                            }
                                            className="shrink-0"
                                          >
                                            {task.completed ? (
                                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                              <Circle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                            )}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setActiveTaskId(task.id)
                                            }
                                            className={`truncate text-left text-xs ${
                                              task.completed
                                                ? 'line-through text-slate-400'
                                                : 'font-medium text-slate-800 dark:text-slate-200'
                                            }`}
                                          >
                                            {task.title}
                                          </button>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400 font-mono-tabular">
                                          {clientObj && (
                                            <span className="hidden sm:inline text-slate-500 dark:text-slate-400">
                                              {clientObj.name}
                                            </span>
                                          )}
                                          {task.dueTime && (
                                            <span>{task.dueTime}</span>
                                          )}
                                          <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                            Tarefa
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {dayPubsList.map((pub) => {
                                    const netObj = SOCIAL_NETWORKS.find(
                                      (n) => n.id === pub.network
                                    );
                                    const clientObj = clients.find(
                                      (c) => c.id === pub.clientId
                                    );
                                    return (
                                      <button
                                        key={pub.id}
                                        type="button"
                                        onClick={() => {
                                          setEditingPublication(pub);
                                          setIsPublicationModalOpen(true);
                                        }}
                                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-left hover:border-slate-200 dark:border-slate-800/80 dark:bg-slate-800/40"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <span
                                            className="h-2.5 w-2.5 rounded-full shrink-0"
                                            style={{
                                              backgroundColor:
                                                netObj?.dotColor || '#E11D48',
                                            }}
                                          />
                                          <span className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                                            {pub.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
                                          {clientObj && (
                                            <span className="hidden sm:inline">
                                              {clientObj.name}
                                            </span>
                                          )}
                                          <span>{pub.network}</span>
                                          <span className="rounded bg-amber-100/80 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                                            {stageLabelMap[pub.stage]}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Upcoming Publications Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Próximas publicações
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setPlanningClientFilter('all');
                      setActiveNav('planning');
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    Ver planejamento
                  </button>
                </div>

                {activePublications.length === 0 ? (
                  <div className="py-4 text-xs text-slate-400">
                    Nenhuma publicação agendada no momento.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...activePublications]
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .slice(0, 5)
                      .map((pub) => {
                        const dt = formatShortDayMonth(pub.date);
                        const netObj = SOCIAL_NETWORKS.find(
                          (n) => n.id === pub.network
                        );
                        const clientObj = clients.find(
                          (c) => c.id === pub.clientId
                        );
                        return (
                          <button
                            key={pub.id}
                            type="button"
                            onClick={() => {
                              setEditingPublication(pub);
                              setIsPublicationModalOpen(true);
                            }}
                            className="flex w-full items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0 text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 -mx-2 transition-colors"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800">
                                <span className="font-mono-tabular text-sm font-bold leading-none text-slate-900 dark:text-white">
                                  {dt.day}
                                </span>
                                <span className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                                  {dt.month}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-display text-sm font-semibold text-slate-900 dark:text-white">
                                  {pub.title}
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                  <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{
                                      backgroundColor:
                                        netObj?.dotColor || '#64748B',
                                    }}
                                  />
                                  <span>{pub.network}</span>
                                  {clientObj && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="truncate">
                                        {clientObj.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                              {stageLabelMap[pub.stage]}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 2: NOTAS (NOTES) — REDESIGNED MODULE
             ========================================================= */}
          {activeNav === 'notes' && (
            <div
              onClick={() => {
                if (openNoteMenuId) setOpenNoteMenuId(null);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  const file = files[0];
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') {
                      handleCreateNewNote(file.name, false, [
                        {
                          id: `att-${Date.now()}`,
                          name: file.name,
                          type: file.type,
                          dataUrl: reader.result,
                        },
                      ]);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="mx-auto max-w-6xl space-y-6 pb-8"
            >
              {/* 1. Header & Discreet View Mode Selector (Mural / Lista) */}
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                      Notas
                    </h1>
                    <span className="rounded-lg border border-slate-200/80 bg-white/90 px-2.5 py-0.5 font-mono-tabular text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {activeNotes.length}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Mural inteligente de ideias, briefings e roteiros. Cole uma imagem ou arraste arquivos para criar.
                  </p>
                </div>

                {/* Discreet Segmented Toggle: Mural vs Lista */}
                <div className="inline-flex items-center rounded-xl border border-slate-200/90 bg-white/90 p-1 shadow-2xs dark:border-slate-800 dark:bg-slate-900/90">
                  <button
                    type="button"
                    onClick={() => {
                      setNoteViewMode('grid');
                      localStorage.setItem(
                        'nextmarketing_notes_view_mode',
                        JSON.stringify('grid')
                      );
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      noteViewMode === 'grid'
                        ? 'bg-slate-900 text-[#FACC15] shadow-2xs dark:bg-[#FACC15] dark:text-slate-950'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Mural</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteViewMode('list');
                      localStorage.setItem(
                        'nextmarketing_notes_view_mode',
                        JSON.stringify('list')
                      );
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      noteViewMode === 'list'
                        ? 'bg-slate-900 text-[#FACC15] shadow-2xs dark:bg-[#FACC15] dark:text-slate-950'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    <span>Lista</span>
                  </button>
                </div>
              </div>

              {/* 2. Unified Toolbar & Quick Creation Strip */}
              <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 space-y-4">
                {/* Top Row: Primary Actions + Quick Creation Templates */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleCreateNewNote('', false)}
                      className="flex items-center gap-2 rounded-xl bg-[#FACC15] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-2xs hover:bg-[#EAB308] transition-all active:scale-[0.99] whitespace-nowrap shrink-0"
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                      <span>Nova nota</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCreateNewNote('', true)}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700/80 transition-colors whitespace-nowrap shrink-0"
                    >
                      <MonitorUp className="h-4 w-4 text-amber-500" />
                      <span>Post-it na área de trabalho</span>
                    </button>
                  </div>

                  {/* Quick Creation Templates */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1 whitespace-nowrap">
                      Criação rápida:
                    </span>
                    {NOTE_TEMPLATES.map((tpl) => {
                      const tplCol =
                        NOTE_COLORS.find((c) => c.id === tpl.color) ||
                        NOTE_COLORS[0];
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleCreateNoteFromTemplate(tpl)}
                          className="group flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50/60 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-all hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-amber-400/60 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${tplCol.dot}`}
                          />
                          <span>{tpl.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800/80" />

                {/* Bottom Row: Search, Color Dots Filter, Client Select, Sort */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="flex flex-1 min-w-[220px] max-w-md items-center gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/60 px-3.5 py-2 focus-within:border-amber-400 focus-within:bg-white dark:border-slate-700/90 dark:bg-slate-800/50 dark:focus-within:bg-slate-900 transition-colors">
                    <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      placeholder="Pesquisar por título, conteúdo ou #etiqueta..."
                      className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                    />
                    {noteSearch && (
                      <button
                        type="button"
                        onClick={() => setNoteSearch('')}
                        className="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Limpar pesquisa"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Compact Color Filter + Client Filter + Sort */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Color Swatches Bar */}
                    <div
                      className="flex items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-50/60 px-2 py-1.5 dark:border-slate-700/90 dark:bg-slate-800/50"
                      title="Filtrar por cor"
                    >
                      <button
                        type="button"
                        onClick={() => setNoteColorFilter('all')}
                        className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold transition-all ${
                          noteColorFilter === 'all'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        Todas
                      </button>
                      {NOTE_COLORS.map((col) => {
                        const active = noteColorFilter === col.id;
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() =>
                              setNoteColorFilter((prev) =>
                                prev === col.id ? 'all' : col.id
                              )
                            }
                            title={`Cor: ${col.label}`}
                            className={`flex h-5 w-5 items-center justify-center rounded-full transition-transform ${
                              active
                                ? 'scale-110 ring-2 ring-slate-900 dark:ring-white'
                                : 'opacity-80 hover:scale-110 hover:opacity-100'
                            }`}
                          >
                            <span
                              className={`h-3.5 w-3.5 rounded-full border border-black/15 ${col.dot}`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Client Selector */}
                    <select
                      value={noteClientFilter}
                      onChange={(e) => setNoteClientFilter(e.target.value)}
                      className="rounded-xl border border-slate-200/90 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-amber-400 focus:outline-none dark:border-slate-700/90 dark:bg-slate-800/50 dark:text-slate-200"
                    >
                      <option value="all">Todos os clientes</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    {/* Sort Order */}
                    <button
                      type="button"
                      onClick={() =>
                        setNoteSortOrder((prev) =>
                          prev === 'updated' ? 'title' : 'updated'
                        )
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700/90 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 transition-colors"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                      <span>
                        {noteSortOrder === 'updated' ? 'Recentes' : 'A-Z'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tag Filter Bar (Only shown if tags exist) */}
                {allNoteTags.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1 shrink-0">
                      <Tag className="h-3 w-3" />
                      Etiquetas:
                    </span>
                    <button
                      type="button"
                      onClick={() => setNoteTagFilter('all')}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors shrink-0 ${
                        noteTagFilter === 'all'
                          ? 'bg-slate-900 text-[#FACC15] dark:bg-[#FACC15] dark:text-slate-950'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      Todas
                    </button>
                    {allNoteTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setNoteTagFilter((prev) =>
                            prev === tag ? 'all' : tag
                          )
                        }
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors shrink-0 ${
                          noteTagFilter === tag
                            ? 'bg-slate-900 text-[#FACC15] dark:bg-[#FACC15] dark:text-slate-950'
                            : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Notes Display: Mural (Grid) or Lista Compacta (List) */}
              {[
                {
                  title: 'Fixadas no topo',
                  list: pinnedNotes,
                  isPinnedGroup: true,
                },
                {
                  title: pinnedNotes.length > 0 ? 'Outras notas' : '',
                  list: unpinnedNotes,
                  isPinnedGroup: false,
                },
              ]
                .filter((group) => group.list.length > 0)
                .map((group) => (
                  <div
                    key={group.isPinnedGroup ? 'pinned' : 'unpinned'}
                    className="space-y-3.5"
                  >
                    {group.title && (
                      <div className="flex items-center gap-2 px-1">
                        {group.isPinnedGroup && (
                          <Pin className="h-3.5 w-3.5 text-amber-500 rotate-45" />
                        )}
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {group.title}
                        </h2>
                        <span className="font-mono-tabular text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          ({group.list.length})
                        </span>
                      </div>
                    )}

                    {/* ==========================================
                        MODE A: MURAL (POST-IT CARDS GRID)
                       ========================================== */}
                    {noteViewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.list.map((note) => {
                          const colObj =
                            NOTE_COLORS.find((c) => c.id === note.color) ||
                            NOTE_COLORS[0];
                          const clientObj = clients.find(
                            (c) => c.id === note.clientId
                          );
                          const completedChecks = note.checklist.filter(
                            (c) => c.completed
                          ).length;
                          const checkProgress =
                            note.checklist.length > 0
                              ? Math.round(
                                  (completedChecks / note.checklist.length) *
                                    100
                                )
                              : 0;
                          const firstImageAtt = note.attachments.find((a) =>
                            a.type.startsWith('image/')
                          );
                          const isMenuOpen = openNoteMenuId === note.id;

                          return (
                            <div
                              key={note.id}
                              onClick={() => setActiveNoteId(note.id)}
                              className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${colObj.bgCard} ${colObj.borderLight}`}
                            >
                              <div className="space-y-3">
                                {/* Card Top Header: Badges, Title & Discreet Quick Actions */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1 space-y-1.5">
                                    {(clientObj ||
                                      note.floating ||
                                      note.pinned) && (
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {note.pinned && (
                                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/15 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 dark:bg-white/20 dark:text-white">
                                            <Pin className="h-2.5 w-2.5 rotate-45" />
                                            Fixada
                                          </span>
                                        )}
                                        {clientObj && (
                                          <span className="inline-flex items-center gap-1.5 rounded-md bg-black/10 px-2 py-0.5 text-[10px] font-bold text-slate-900 dark:bg-white/15 dark:text-slate-100">
                                            <span
                                              className="h-1.5 w-1.5 rounded-full"
                                              style={{
                                                backgroundColor:
                                                  clientObj.color,
                                              }}
                                            />
                                            {clientObj.name}
                                          </span>
                                        )}
                                        {note.floating && (
                                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/85 px-1.5 py-0.5 text-[10px] font-semibold text-[#FACC15] dark:bg-[#FACC15] dark:text-slate-950">
                                            <MonitorUp className="h-2.5 w-2.5" />
                                            Na tela
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    <h3 className="font-display text-base font-bold leading-snug tracking-tight text-slate-950 dark:text-white line-clamp-2">
                                      {note.title || 'Nota sem título'}
                                    </h3>
                                  </div>

                                  {/* Discreet Quick Actions: Editar, Fixar, Menu da nota */}
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="relative flex items-center gap-0.5 rounded-xl bg-white/50 p-0.5 backdrop-blur-xs transition-opacity duration-150 dark:bg-slate-950/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 shrink-0"
                                  >
                                    <button
                                      type="button"
                                      title="Editar nota"
                                      onClick={() => setActiveNoteId(note.id)}
                                      className="rounded-lg p-1.5 text-slate-700 hover:bg-black/10 dark:text-slate-200 dark:hover:bg-white/10 transition-colors"
                                    >
                                      <PenLine className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      title={
                                        note.pinned
                                          ? 'Desafixar do topo'
                                          : 'Fixar no topo'
                                      }
                                      onClick={() =>
                                        handleUpdateNote({
                                          ...note,
                                          pinned: !note.pinned,
                                        })
                                      }
                                      className={`rounded-lg p-1.5 transition-colors ${
                                        note.pinned
                                          ? 'bg-slate-900 text-[#FACC15] dark:bg-[#FACC15] dark:text-slate-950'
                                          : 'text-slate-700 hover:bg-black/10 dark:text-slate-200 dark:hover:bg-white/10'
                                      }`}
                                    >
                                      <Pin className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      title="Abrir menu da nota"
                                      onClick={() =>
                                        setOpenNoteMenuId(
                                          isMenuOpen ? null : note.id
                                        )
                                      }
                                      className={`rounded-lg p-1.5 transition-colors ${
                                        isMenuOpen
                                          ? 'bg-black/15 text-slate-950 dark:bg-white/20 dark:text-white'
                                          : 'text-slate-700 hover:bg-black/10 dark:text-slate-200 dark:hover:bg-white/10'
                                      }`}
                                    >
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                    </button>

                                    {/* Quick Context Dropdown Menu */}
                                    {isMenuOpen && (
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-0 top-9 z-30 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                                      >
                                        {/* Inline Color Picker */}
                                        <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
                                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                            Cor do cartão
                                          </span>
                                          <div className="flex items-center gap-1.5">
                                            {NOTE_COLORS.map((c) => (
                                              <button
                                                key={c.id}
                                                type="button"
                                                title={c.label}
                                                onClick={() => {
                                                  handleUpdateNote({
                                                    ...note,
                                                    color: c.id,
                                                  });
                                                  setOpenNoteMenuId(null);
                                                }}
                                                className={`h-4 w-4 rounded-full border border-black/15 ${
                                                  c.dot
                                                } ${
                                                  note.color === c.id
                                                    ? 'ring-2 ring-slate-900 dark:ring-white scale-110'
                                                    : 'opacity-80 hover:opacity-100'
                                                }`}
                                              />
                                            ))}
                                          </div>
                                        </div>

                                        <div className="py-1 space-y-0.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const nextFloating =
                                                !note.floating;
                                              handleUpdateNote({
                                                ...note,
                                                floating: nextFloating,
                                              });
                                              setOpenNoteMenuId(null);
                                              showToast(
                                                nextFloating
                                                  ? 'Fixada como Post-it flutuante!'
                                                  : 'Post-it recolhido da tela.'
                                              );
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                          >
                                            <MonitorUp className="h-3.5 w-3.5 text-amber-500" />
                                            <span>
                                              {note.floating
                                                ? 'Recolher Post-it'
                                                : 'Destacar como Post-it'}
                                            </span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              const full = `${
                                                note.title
                                                  ? note.title + '\n\n'
                                                  : ''
                                              }${note.content}`;
                                              navigator.clipboard.writeText(
                                                full
                                              );
                                              setOpenNoteMenuId(null);
                                              showToast('Nota copiada!');
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                          >
                                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                                            <span>Copiar conteúdo</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenNoteMenuId(null);
                                              handleDuplicateNote(note);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                          >
                                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                                            <span>Duplicar nota</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenNoteMenuId(null);
                                              handleConvertNoteToTask(note);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                          >
                                            <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
                                            <span>Transformar em tarefa</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenNoteMenuId(null);
                                              handleConvertNoteToPublication(
                                                note
                                              );
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                          >
                                            <Kanban className="h-3.5 w-3.5 text-slate-400" />
                                            <span>Enviar para Publicação</span>
                                          </button>
                                        </div>

                                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenNoteMenuId(null);
                                              handleArchiveToggleNote(note);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                          >
                                            <Archive className="h-3.5 w-3.5 text-slate-400" />
                                            <span>Arquivar nota</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenNoteMenuId(null);
                                              handleDeleteNoteToTrash(note);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span>Mover para lixeira</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Organized Content Preview */}
                                {note.content && (
                                  <p className="whitespace-pre-line line-clamp-4 text-xs leading-relaxed text-slate-800/95 dark:text-slate-100/95">
                                    {note.content}
                                  </p>
                                )}

                                {/* First Image Attachment Preview */}
                                {firstImageAtt && (
                                  <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                                    <img
                                      src={firstImageAtt.dataUrl}
                                      alt={firstImageAtt.name}
                                      className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    />
                                  </div>
                                )}

                                {/* Modernized Checklist & Progress Indicator */}
                                {note.checklist.length > 0 && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="space-y-2 rounded-xl border border-black/5 bg-white/55 p-3 backdrop-blur-xs dark:border-white/10 dark:bg-slate-950/35"
                                  >
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                      <span className="inline-flex items-center gap-1.5">
                                        <CheckSquare className="h-3.5 w-3.5 text-slate-700 dark:text-amber-400" />
                                        Checklist
                                      </span>
                                      <span className="font-mono-tabular text-[10px]">
                                        {completedChecks}/
                                        {note.checklist.length} ({checkProgress}
                                        %)
                                      </span>
                                    </div>

                                    {/* Visual Progress Bar */}
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                                      <div
                                        className="h-full rounded-full bg-slate-900 transition-all duration-300 dark:bg-[#FACC15]"
                                        style={{ width: `${checkProgress}%` }}
                                      />
                                    </div>

                                    <div className="space-y-1.5 pt-0.5">
                                      {note.checklist
                                        .slice(0, 4)
                                        .map((item) => (
                                          <label
                                            key={item.id}
                                            className="flex cursor-pointer items-center gap-2 text-xs group/chk"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={item.completed}
                                              onChange={() => {
                                                const updatedChecklist =
                                                  note.checklist.map((c) =>
                                                    c.id === item.id
                                                      ? {
                                                          ...c,
                                                          completed:
                                                            !c.completed,
                                                        }
                                                      : c
                                                  );
                                                handleUpdateNote({
                                                  ...note,
                                                  checklist: updatedChecklist,
                                                });
                                              }}
                                              className="h-3.5 w-3.5 rounded border-slate-400 text-slate-900 focus:ring-0"
                                            />
                                            <span
                                              className={`truncate transition-colors ${
                                                item.completed
                                                  ? 'line-through text-slate-500 dark:text-slate-400'
                                                  : 'text-slate-900 dark:text-slate-100'
                                              }`}
                                            >
                                              {item.text}
                                            </span>
                                          </label>
                                        ))}
                                      {note.checklist.length > 4 && (
                                        <div className="pl-5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                          + {note.checklist.length - 4} item(ns)
                                          restantes...
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* AI Summary Preview Callout */}
                                {note.aiSummary && (
                                  <div className="rounded-xl border border-black/5 bg-white/50 p-2.5 text-[11px] leading-relaxed text-slate-900 dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-100">
                                    <span className="inline-flex items-center gap-1 font-bold mr-1 text-amber-800 dark:text-amber-300">
                                      <Sparkles className="h-3 w-3" />
                                      Resumo IA:
                                    </span>
                                    <span className="line-clamp-2">
                                      {note.aiSummary}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Card Footer: Tags, Metadata & Timestamp */}
                              <div className="mt-4 space-y-2.5 pt-3 border-t border-black/10 dark:border-white/10">
                                {note.tags.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1">
                                    {note.tags.map((t) => (
                                      <button
                                        key={t}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setNoteTagFilter((prev) =>
                                            prev === t ? 'all' : t
                                          );
                                        }}
                                        className="rounded-md bg-black/10 px-2 py-0.5 text-[10px] font-semibold text-slate-900 hover:bg-black/20 dark:bg-white/15 dark:text-slate-100 dark:hover:bg-white/25 transition-colors"
                                      >
                                        #{t}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300 font-mono-tabular">
                                  <div className="flex items-center gap-2.5">
                                    {note.attachments.length > 0 && (
                                      <span
                                        className="inline-flex items-center gap-1"
                                        title="Anexos"
                                      >
                                        <Paperclip className="h-3 w-3" />
                                        {note.attachments.length}
                                      </span>
                                    )}
                                    {note.links.length > 0 && (
                                      <span
                                        className="inline-flex items-center gap-1"
                                        title="Links úteis"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        {note.links.length}
                                      </span>
                                    )}
                                    <span>
                                      {note.content.trim()
                                        ? `${
                                            note.content.trim().split(/\s+/)
                                              .length
                                          } pal.`
                                        : '0 pal.'}
                                    </span>
                                  </div>
                                  <span>
                                    {formatRelativeTime(note.updatedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* ==========================================
                         MODE B: LISTA COMPACTA (COMPACT LIST VIEW)
                         ========================================== */
                      <div className="space-y-2">
                        {group.list.map((note) => {
                          const colObj =
                            NOTE_COLORS.find((c) => c.id === note.color) ||
                            NOTE_COLORS[0];
                          const clientObj = clients.find(
                            (c) => c.id === note.clientId
                          );
                          const completedChecks = note.checklist.filter(
                            (c) => c.completed
                          ).length;
                          const checkProgress =
                            note.checklist.length > 0
                              ? Math.round(
                                  (completedChecks / note.checklist.length) *
                                    100
                                )
                              : 0;
                          const isMenuOpen = openNoteMenuId === note.id;

                          return (
                            <div
                              key={note.id}
                              onClick={() => setActiveNoteId(note.id)}
                              className={`group relative flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${colObj.bgCard} ${colObj.borderLight}`}
                            >
                              {/* Left: Color Indicator Bar + Main Content */}
                              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                                <span
                                  className={`h-9 w-1.5 shrink-0 rounded-full ${colObj.dot}`}
                                />

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="truncate font-display text-sm font-bold text-slate-950 dark:text-white">
                                      {note.title || 'Nota sem título'}
                                    </h3>

                                    {note.pinned && (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/15 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 dark:bg-white/20 dark:text-white">
                                        <Pin className="h-2.5 w-2.5 rotate-45" />
                                        Fixada
                                      </span>
                                    )}

                                    {clientObj && (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-black/10 px-2 py-0.5 text-[10px] font-bold text-slate-900 dark:bg-white/15 dark:text-slate-100">
                                        <span
                                          className="h-1.5 w-1.5 rounded-full"
                                          style={{
                                            backgroundColor: clientObj.color,
                                          }}
                                        />
                                        {clientObj.name}
                                      </span>
                                    )}

                                    {note.floating && (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/85 px-1.5 py-0.5 text-[10px] font-semibold text-[#FACC15] dark:bg-[#FACC15] dark:text-slate-950">
                                        <MonitorUp className="h-2.5 w-2.5" />
                                        Post-it
                                      </span>
                                    )}

                                    {note.aiSummary && (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-white/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-slate-900/50 dark:text-amber-300">
                                        <Sparkles className="h-2.5 w-2.5" />
                                        IA
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-0.5 truncate text-xs text-slate-700 dark:text-slate-200">
                                    {note.content
                                      ? note.content.replace(/\n+/g, ' · ')
                                      : note.checklist.length > 0
                                      ? note.checklist
                                          .map((c) => c.text)
                                          .join(' · ')
                                      : 'Sem conteúdo adicional'}
                                  </p>
                                </div>
                              </div>

                              {/* Right: Tags, Checklist Progress, Metadata & Quick Actions */}
                              <div className="flex shrink-0 items-center gap-3">
                                {/* Tags (up to 2) */}
                                {note.tags.length > 0 && (
                                  <div className="hidden sm:flex items-center gap-1">
                                    {note.tags.slice(0, 2).map((t) => (
                                      <button
                                        key={t}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setNoteTagFilter((prev) =>
                                            prev === t ? 'all' : t
                                          );
                                        }}
                                        className="rounded-md bg-black/10 px-2 py-0.5 text-[10px] font-semibold text-slate-900 hover:bg-black/20 dark:bg-white/15 dark:text-slate-100"
                                      >
                                        #{t}
                                      </button>
                                    ))}
                                    {note.tags.length > 2 && (
                                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                        +{note.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Compact Checklist Progress */}
                                {note.checklist.length > 0 && (
                                  <div className="hidden md:flex items-center gap-2 rounded-lg bg-white/55 px-2.5 py-1 dark:bg-slate-950/35">
                                    <CheckSquare className="h-3 w-3 text-slate-800 dark:text-amber-400" />
                                    <div className="w-12 h-1.5 rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-slate-900 dark:bg-[#FACC15]"
                                        style={{ width: `${checkProgress}%` }}
                                      />
                                    </div>
                                    <span className="font-mono-tabular text-[10px] font-bold text-slate-800 dark:text-slate-200">
                                      {completedChecks}/{note.checklist.length}
                                    </span>
                                  </div>
                                )}

                                {/* Counters & Date */}
                                <div className="hidden lg:flex items-center gap-2.5 font-mono-tabular text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                  {note.attachments.length > 0 && (
                                    <span className="inline-flex items-center gap-1">
                                      <Paperclip className="h-3 w-3" />
                                      {note.attachments.length}
                                    </span>
                                  )}
                                  {note.links.length > 0 && (
                                    <span className="inline-flex items-center gap-1">
                                      <ExternalLink className="h-3 w-3" />
                                      {note.links.length}
                                    </span>
                                  )}
                                  <span>
                                    {formatRelativeTime(note.updatedAt)}
                                  </span>
                                </div>

                                {/* Discreet Quick Actions */}
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="relative flex items-center gap-0.5 rounded-xl bg-white/55 p-0.5 backdrop-blur-xs dark:bg-slate-950/40"
                                >
                                  <button
                                    type="button"
                                    title="Editar nota"
                                    onClick={() => setActiveNoteId(note.id)}
                                    className="rounded-lg p-1.5 text-slate-700 hover:bg-black/10 dark:text-slate-200 dark:hover:bg-white/10 transition-colors"
                                  >
                                    <PenLine className="h-3.5 w-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    title={
                                      note.pinned
                                        ? 'Desafixar do topo'
                                        : 'Fixar no topo'
                                    }
                                    onClick={() =>
                                      handleUpdateNote({
                                        ...note,
                                        pinned: !note.pinned,
                                      })
                                    }
                                    className={`rounded-lg p-1.5 transition-colors ${
                                      note.pinned
                                        ? 'bg-slate-900 text-[#FACC15] dark:bg-[#FACC15] dark:text-slate-950'
                                        : 'text-slate-700 hover:bg-black/10 dark:text-slate-200 dark:hover:bg-white/10'
                                    }`}
                                  >
                                    <Pin className="h-3.5 w-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    title="Abrir menu da nota"
                                    onClick={() =>
                                      setOpenNoteMenuId(
                                        isMenuOpen ? null : note.id
                                      )
                                    }
                                    className={`rounded-lg p-1.5 transition-colors ${
                                      isMenuOpen
                                        ? 'bg-black/15 text-slate-950 dark:bg-white/20 dark:text-white'
                                        : 'text-slate-700 hover:bg-black/10 dark:text-slate-200 dark:hover:bg-white/10'
                                    }`}
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </button>

                                  {isMenuOpen && (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      className="absolute right-0 top-9 z-30 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                                    >
                                      <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                          Cor da nota
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          {NOTE_COLORS.map((c) => (
                                            <button
                                              key={c.id}
                                              type="button"
                                              title={c.label}
                                              onClick={() => {
                                                handleUpdateNote({
                                                  ...note,
                                                  color: c.id,
                                                });
                                                setOpenNoteMenuId(null);
                                              }}
                                              className={`h-4 w-4 rounded-full border border-black/15 ${
                                                c.dot
                                              } ${
                                                note.color === c.id
                                                  ? 'ring-2 ring-slate-900 dark:ring-white scale-110'
                                                  : 'opacity-80 hover:opacity-100'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>

                                      <div className="py-1 space-y-0.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextFloating = !note.floating;
                                            handleUpdateNote({
                                              ...note,
                                              floating: nextFloating,
                                            });
                                            setOpenNoteMenuId(null);
                                            showToast(
                                              nextFloating
                                                ? 'Fixada como Post-it flutuante!'
                                                : 'Post-it recolhido da tela.'
                                            );
                                          }}
                                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                        >
                                          <MonitorUp className="h-3.5 w-3.5 text-amber-500" />
                                          <span>
                                            {note.floating
                                              ? 'Recolher Post-it'
                                              : 'Destacar como Post-it'}
                                          </span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const full = `${
                                              note.title
                                                ? note.title + '\n\n'
                                                : ''
                                            }${note.content}`;
                                            navigator.clipboard.writeText(full);
                                            setOpenNoteMenuId(null);
                                            showToast('Nota copiada!');
                                          }}
                                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                        >
                                          <Copy className="h-3.5 w-3.5 text-slate-400" />
                                          <span>Copiar conteúdo</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenNoteMenuId(null);
                                            handleDuplicateNote(note);
                                          }}
                                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                        >
                                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                                          <span>Duplicar nota</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenNoteMenuId(null);
                                            handleConvertNoteToTask(note);
                                          }}
                                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                        >
                                          <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
                                          <span>Transformar em tarefa</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenNoteMenuId(null);
                                            handleConvertNoteToPublication(
                                              note
                                            );
                                          }}
                                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                        >
                                          <Kanban className="h-3.5 w-3.5 text-slate-400" />
                                          <span>Enviar para Publicação</span>
                                        </button>
                                      </div>

                                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenNoteMenuId(null);
                                            handleArchiveToggleNote(note);
                                          }}
                                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                        >
                                          <Archive className="h-3.5 w-3.5 text-slate-400" />
                                          <span>Arquivar nota</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenNoteMenuId(null);
                                            handleDeleteNoteToTrash(note);
                                          }}
                                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                          <span>Mover para lixeira</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

              {filteredNotes.length === 0 && (
                <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-12 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900/95">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="font-display text-sm font-bold text-slate-800 dark:text-slate-100">
                    Nenhuma nota encontrada
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Crie uma nova nota acima ou limpe os filtros ativos.
                  </p>
                  {(noteColorFilter !== 'all' ||
                    noteClientFilter !== 'all' ||
                    noteTagFilter !== 'all' ||
                    noteSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setNoteColorFilter('all');
                        setNoteClientFilter('all');
                        setNoteTagFilter('all');
                        setNoteSearch('');
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-[#FACC15] hover:bg-slate-800 dark:bg-[#FACC15] dark:text-slate-950"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW 3: TAREFAS (TASKS & POMODORO FOCUS)
             ========================================================= */}
          {activeNav === 'tasks' && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                    Tarefas
                  </h1>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {greetingInfo.capitalizedDate}
                  </p>
                </div>

                <select
                  value={taskProjectFilter}
                  onChange={(e) => setTaskProjectFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">Todos os projetos</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons: Fixar na área de trabalho & Timer Pomodoro */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !settings.floatingTodayTasks;
                    setSettings((s) => ({ ...s, floatingTodayTasks: nextVal }));
                    showToast(
                      nextVal
                        ? 'Cartão de tarefas de hoje fixado na tela!'
                        : 'Cartão flutuante de tarefas recolhido.'
                    );
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    settings.floatingTodayTasks
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-slate-950'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                  }`}
                >
                  <MonitorUp className="h-4 w-4" />
                  <span>Fixar na área de trabalho</span>
                </button>

                {/* Pomodoro Focus Bar */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2">
                    <Timer
                      className={`h-4 w-4 ${
                        pomodoroRunning ? 'text-amber-500' : 'text-slate-400'
                      }`}
                    />
                    <span className="font-mono-tabular text-xs font-bold text-slate-900 dark:text-white">
                      {String(Math.floor(pomodoroSeconds / 60)).padStart(2, '0')}:
                      {String(pomodoroSeconds % 60).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pomodoroMode === 'work' ? 'Foco' : 'Pausa'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPomodoroRunning((r) => !r);
                        setShowPomodoroWidget(true);
                      }}
                      className="rounded-lg bg-[#FEF08A] px-2.5 py-1 text-[11px] font-semibold text-slate-900 hover:bg-[#FACC15]"
                    >
                      {pomodoroRunning ? 'Pausar' : 'Iniciar Foco'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPomodoroRunning(false);
                        setPomodoroSeconds(
                          pomodoroMode === 'work' ? 25 * 60 : 5 * 60
                        );
                      }}
                      className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Reiniciar"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs: Hoje | Amanhã | Pendentes | Concluídas */}
              <div className="flex flex-wrap items-center gap-6 border-b border-slate-200 dark:border-slate-800">
                {(
                  [
                    {
                      id: 'today',
                      label: 'Hoje',
                      count: pendingTodayTasks.length,
                      icon: Sun,
                    },
                    {
                      id: 'tomorrow',
                      label: 'Amanhã',
                      count: activeTasks.filter(
                        (t) => !t.completed && t.list === 'tomorrow'
                      ).length,
                      icon: CalendarIcon,
                    },
                    {
                      id: 'pending',
                      label: 'Pendentes',
                      count: activeTasks.filter(
                        (t) => !t.completed && t.list === 'pending'
                      ).length,
                      icon: Archive,
                    },
                    {
                      id: 'completed',
                      label: 'Concluídas',
                      count: activeTasks.filter((t) => t.completed).length,
                      icon: CheckCircle2,
                    },
                  ] as const
                ).map((tb) => {
                  const Icon = tb.icon;
                  const active = taskTab === tb.id;
                  return (
                    <button
                      key={tb.id}
                      type="button"
                      onClick={() => setTaskTab(tb.id)}
                      className={`relative flex items-center gap-2 pb-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'text-slate-950 font-semibold dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tb.label}</span>
                      <span className="font-mono-tabular text-slate-400">
                        {tb.count}
                      </span>
                      {active && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#FACC15]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono-tabular">
                  <span>
                    {completedTodayTasks.length} de {todayTasks.length} concluídas
                    hoje
                  </span>
                  <span>{todayCompletionPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${todayCompletionPercent}%` }}
                  />
                </div>
              </div>

              {/* Smart Task Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTaskInput.trim()) return;
                  handleAddQuickTask(
                    newTaskInput,
                    taskTab === 'completed' ? 'today' : taskTab
                  );
                  setNewTaskInput('');
                }}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
              >
                <Plus className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Adicionar tarefa. Ex.: Ligar para o cliente amanhã 15h !alta"
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                />
              </form>

              {/* Tasks List */}
              <div className="space-y-2">
                {filteredTasksByTab.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-8 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                    Nenhuma tarefa nesta aba.
                  </div>
                ) : (
                  filteredTasksByTab.map((task) => {
                    const clientObj = clients.find((c) => c.id === task.clientId);
                    return (
                      <div
                        key={task.id}
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-2xs transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTaskCompletion(task.id)}
                            className="text-slate-300 hover:text-emerald-600 dark:text-slate-600 shrink-0"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTaskId(task.id)}
                            className="min-w-0 text-left"
                          >
                            <div
                              className={`text-sm font-medium ${
                                task.completed
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </div>
                            {(clientObj || task.dueTime || task.description) && (
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                {clientObj && (
                                  <span className="flex items-center gap-1.5">
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{ backgroundColor: clientObj.color }}
                                    />
                                    <span>{clientObj.name}</span>
                                  </span>
                                )}
                                {task.dueTime && (
                                  <span className="font-mono-tabular">
                                    {task.dueTime}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            title="Iniciar Pomodoro nesta tarefa"
                            onClick={() => {
                              setActivePomodoroTaskId(task.id);
                              setPomodoroMode('work');
                              setPomodoroSeconds(25 * 60);
                              setPomodoroRunning(true);
                              setShowPomodoroWidget(true);
                              showToast(`Foco Pomodoro iniciado: ${task.title}`);
                            }}
                            className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-opacity dark:hover:bg-slate-800"
                          >
                            <Timer className="h-4 w-4" />
                          </button>
                          <Flag
                            className={`h-4 w-4 ${
                              task.priority === 'high'
                                ? 'text-red-500'
                                : task.priority === 'medium'
                                ? 'text-amber-500'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Concluídas hoje collapsible (matches screenshot 05) */}
              {taskTab === 'today' && completedTodayTasks.length > 0 && (
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60">
                  <button
                    type="button"
                    onClick={() => setShowCompletedToday((v) => !v)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    <span>
                      {showCompletedToday ? '▼' : '▶'} Concluídas hoje (
                      {completedTodayTasks.length})
                    </span>
                  </button>
                  {showCompletedToday && (
                    <div className="divide-y divide-slate-100 border-t border-slate-100 px-4 py-2 dark:divide-slate-800 dark:border-slate-800">
                      {completedTodayTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between py-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleTaskCompletion(t.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTaskId(t.id)}
                              className="text-xs line-through text-slate-400 text-left"
                            >
                              {t.title}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW 4: AGENDA (IMPROVED FULL MONTHLY CALENDAR + DAY PANEL)
             ========================================================= */}
          {activeNav === 'agenda' && (
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Full Monthly Calendar (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white capitalize">
                      {agendaMonthDate.toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h1>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAgendaMonthDate(
                            new Date(
                              agendaMonthDate.getFullYear(),
                              agendaMonthDate.getMonth() - 1,
                              1
                            )
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAgendaMonthDate(new Date());
                          setSelectedAgendaDate(getTodayISO());
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        Hoje
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAgendaMonthDate(
                            new Date(
                              agendaMonthDate.getFullYear(),
                              agendaMonthDate.getMonth() + 1,
                              1
                            )
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid Container */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900/95">
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 py-2.5 text-center text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                      <div>dom</div>
                      <div>seg</div>
                      <div>ter</div>
                      <div>qua</div>
                      <div>qui</div>
                      <div>sex</div>
                      <div>sáb</div>
                    </div>

                    <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800">
                      {calendarDays.map((cell) => {
                        const isSelected = cell.dateISO === selectedAgendaDate;
                        const isToday = cell.dateISO === todayISO;
                        const dayTasks = activeTasks.filter(
                          (t) => t.dueDate === cell.dateISO
                        );
                        const dayPubs = activePublications.filter(
                          (p) => p.date === cell.dateISO
                        );

                        return (
                          <button
                            key={cell.dateISO}
                            type="button"
                            onClick={() => setSelectedAgendaDate(cell.dateISO)}
                            className={`flex min-h-[82px] flex-col items-start justify-between p-2.5 text-left transition-colors ${
                              !cell.isCurrentMonth
                                ? 'bg-slate-50/50 text-slate-400 dark:bg-slate-900/40 dark:text-slate-600'
                                : 'bg-white text-slate-900 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full font-mono-tabular text-xs font-semibold ${
                                isSelected
                                  ? 'bg-[#FACC15] text-slate-950 font-bold'
                                  : isToday
                                  ? 'border border-amber-400 text-amber-600 dark:text-amber-400'
                                  : ''
                              }`}
                            >
                              {cell.dayNumber}
                            </span>

                            {/* Dots for tasks and publications */}
                            {(dayTasks.length > 0 || dayPubs.length > 0) && (
                              <div className="flex flex-wrap items-center gap-1 pt-1">
                                {dayTasks.map((t) => (
                                  <span
                                    key={t.id}
                                    className={`h-2 w-2 rounded-full ${
                                      t.completed
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-400 dark:bg-slate-500'
                                    }`}
                                    title={t.title}
                                  />
                                ))}
                                {dayPubs.map((p) => {
                                  const netObj = SOCIAL_NETWORKS.find(
                                    (n) => n.id === p.network
                                  );
                                  return (
                                    <span
                                      key={p.id}
                                      className="h-2 w-2 rounded-full"
                                      style={{
                                        backgroundColor:
                                          netObj?.dotColor || '#E11D48',
                                      }}
                                      title={`${p.network}: ${p.title}`}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Selected Day Details Panel (5 cols) */}
                <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xs p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900/95 space-y-6">
                  <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="text-xs font-medium text-slate-400">
                      {selectedAgendaDate === todayISO
                        ? 'Hoje'
                        : 'Dia selecionado'}
                    </div>
                    <h2 className="mt-0.5 font-display text-xl font-bold text-slate-900 dark:text-white capitalize">
                      {(() => {
                        const [y, m, d] = selectedAgendaDate
                          .split('-')
                          .map(Number);
                        const dt = new Date(y, (m || 1) - 1, d || 1);
                        return dt.toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        });
                      })()}
                    </h2>
                  </div>

                  {/* Tasks on this day */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Tarefas
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!agendaTaskInput.trim()) return;
                        handleAddQuickTask(
                          agendaTaskInput,
                          selectedAgendaDate === todayISO ? 'today' : 'pending',
                          selectedAgendaDate
                        );
                        setAgendaTaskInput('');
                      }}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/50"
                    >
                      <Plus className="h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={agendaTaskInput}
                        onChange={(e) => setAgendaTaskInput(e.target.value)}
                        placeholder="Adicionar tarefa neste dia"
                        className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                      />
                    </form>

                    <div className="space-y-2">
                      {activeTasks
                        .filter((t) => t.dueDate === selectedAgendaDate)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start justify-between gap-2.5 rounded-xl px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleTaskCompletion(task.id)}
                                className="mt-0.5 shrink-0"
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <Circle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTaskId(task.id)}
                                className={`text-left text-xs leading-relaxed ${
                                  task.completed
                                    ? 'line-through text-slate-400'
                                    : 'font-medium text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {task.title}
                              </button>
                            </div>
                            {task.priority === 'high' && (
                              <Flag className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Publications on this day */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Publicações
                    </h3>

                    <div className="space-y-2.5">
                      {activePublications
                        .filter((p) => p.date === selectedAgendaDate)
                        .map((pub) => {
                          const netObj = SOCIAL_NETWORKS.find(
                            (n) => n.id === pub.network
                          );
                          const clientObj = clients.find(
                            (c) => c.id === pub.clientId
                          );
                          return (
                            <button
                              key={pub.id}
                              type="button"
                              onClick={() => {
                                setEditingPublication(pub);
                                setIsPublicationModalOpen(true);
                              }}
                              className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-left hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/40"
                            >
                              <div className="min-w-0">
                                <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                                  {pub.title}
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                  <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{
                                      backgroundColor:
                                        netObj?.dotColor || '#16A34A',
                                    }}
                                  />
                                  <span>{pub.network}</span>
                                  {clientObj && (
                                    <>
                                      <span>·</span>
                                      <span className="truncate">
                                        {clientObj.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                                {stageLabelMap[pub.stage]}
                              </span>
                            </button>
                          );
                        })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingPublication(null);
                        setNewPublicationDefaults({
                          stage: 'idea',
                          date: selectedAgendaDate,
                        });
                        setIsPublicationModalOpen(true);
                      }}
                      className="flex items-center gap-2 pt-1 text-xs font-medium text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    >
                      <CalendarPlus className="h-4 w-4" />
                      <span>Planejar publicação neste dia</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 5: PLANEJAMENTO (FULL 4-COLUMN KANBAN BOARD)
             ========================================================= */}
          {activeNav === 'planning' && (
            <div className="mx-auto max-w-7xl space-y-6">
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                  Planejamento
                </h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Arraste os cartões entre as colunas para mudar a etapa.
                </p>
              </div>

              {/* Filter & Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={planningClientFilter}
                    onChange={(e) => {
                      setPlanningClientFilter(e.target.value);
                      setSelectedClientFilter(e.target.value);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="all">Todos os clientes</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={planningNetworkFilter}
                    onChange={(e) => setPlanningNetworkFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 shadow-2xs focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="all">Todas as redes</option>
                    {SOCIAL_NETWORKS.map((net) => (
                      <option key={net.id} value={net.id}>
                        {net.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAiIdeasModal(true)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Ideias com IA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPublication(null);
                      setNewPublicationDefaults({
                        stage: 'idea',
                        clientId:
                          planningClientFilter !== 'all'
                            ? planningClientFilter
                            : clients[0]?.id || '',
                      });
                      setIsPublicationModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-[#FACC15] px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-2xs hover:bg-[#EAB308] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    <span>Nova publicação</span>
                  </button>
                </div>
              </div>

              {/* 4-Column Responsive Kanban Grid (No horizontal clipping!) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                {(
                  [
                    { id: 'idea', title: 'Ideias' },
                    { id: 'creating', title: 'Em criação' },
                    { id: 'ready', title: 'Pronto para publicar' },
                    { id: 'published', title: 'Publicado' },
                  ] as Array<{ id: PublicationStage; title: string }>
                ).map((col) => {
                  const colPubs = filteredPublications.filter(
                    (p) => p.stage === col.id
                  );

                  return (
                    <div
                      key={col.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedPubId) {
                          handleMovePublicationStage(draggedPubId, col.id);
                          setDraggedPubId(null);
                        }
                      }}
                      className="flex min-h-[420px] flex-col rounded-2xl border border-slate-200/80 bg-slate-200/45 p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between px-1 pb-3">
                        <div className="flex items-center gap-2">
                          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                            {col.title}
                          </h2>
                          <span className="font-mono-tabular text-xs text-slate-400">
                            {colPubs.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPublication(null);
                            setNewPublicationDefaults({
                              stage: col.id,
                              clientId:
                                planningClientFilter !== 'all'
                                  ? planningClientFilter
                                  : clients[0]?.id || '',
                            });
                            setIsPublicationModalOpen(true);
                          }}
                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                          title={`Adicionar em ${col.title}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Column Cards */}
                      <div className="flex-1 space-y-3">
                        {colPubs.length === 0 ? (
                          <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-300/80 px-4 text-center text-xs text-slate-400 dark:border-slate-700/80">
                            Arraste um cartão para cá
                          </div>
                        ) : (
                          colPubs.map((pub) => {
                            const clientObj = clients.find(
                              (c) => c.id === pub.clientId
                            );
                            const netObj = SOCIAL_NETWORKS.find(
                              (n) => n.id === pub.network
                            );
                            const dt = formatShortDayMonth(pub.date);

                            return (
                              <div
                                key={pub.id}
                                draggable
                                onDragStart={() => setDraggedPubId(pub.id)}
                                onClick={() => {
                                  setEditingPublication(pub);
                                  setIsPublicationModalOpen(true);
                                }}
                                className="group cursor-pointer rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/90"
                              >
                                {clientObj && (
                                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                                    <span
                                      className="h-2 w-2 rounded-full shrink-0"
                                      style={{
                                        backgroundColor: clientObj.color,
                                      }}
                                    />
                                    <span className="truncate">
                                      {clientObj.name}
                                    </span>
                                  </div>
                                )}

                                <h3 className="font-display text-sm font-bold leading-snug text-slate-900 dark:text-white">
                                  {pub.title}
                                </h3>

                                {(pub.notes || pub.caption) && (
                                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                    {pub.notes || pub.caption}
                                  </p>
                                )}

                                <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="h-2 w-2 rounded-full shrink-0"
                                      style={{
                                        backgroundColor:
                                          netObj?.dotColor || '#E11D48',
                                      }}
                                    />
                                    <span>{pub.network}</span>
                                  </div>
                                  <span className="font-mono-tabular">
                                    {dt.inline}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 5.5: ESTÚDIO & UTILITÁRIOS (MARKETING STUDIO)
             ========================================================= */}
          {activeNav === 'studio' && (
            <MarketingStudioView
              clients={clients}
              snippets={snippets}
              onAddSnippet={(snip) => {
                setSnippets((prev) => [
                  { ...snip, id: `snip-${Date.now()}` },
                  ...prev,
                ]);
              }}
              onDeleteSnippet={(id) => {
                setSnippets((prev) => prev.filter((s) => s.id !== id));
                showToast('Item removido do cofre.');
              }}
              onCreateNoteFromContent={(title, content, tags) => {
                const now = new Date().toISOString();
                const newNote: Note = {
                  id: `note-studio-${Date.now()}`,
                  title,
                  content,
                  color: 'yellow',
                  pinned: false,
                  floating: false,
                  checklist: [],
                  links: [],
                  tags,
                  attachments: [],
                  clientId: clients[0]?.id || '',
                  archived: false,
                  deletedAt: null,
                  updatedAt: now,
                  createdAt: now,
                };
                setNotes((prev) => [newNote, ...prev]);
                showToast('Salvo em Notas com sucesso!');
              }}
              onCreatePublicationFromCopy={(pub) => {
                setPublications((prev) => [pub, ...prev]);
                showToast('Enviado para o Kanban de Planejamento!');
              }}
              onNotify={showToast}
            />
          )}

          {/* =========================================================
              VIEW 6: ARQUIVO E LIXEIRA (ARCHIVE & TRASH)
             ========================================================= */}
          {activeNav === 'archive' && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                  Arquivo e lixeira
                </h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Notas arquivadas ficam guardadas sem ocupar o mural. A lixeira é
                  esvaziada sozinha depois de 30 dias.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setArchiveTab('archived')}
                    className={`relative pb-3 text-xs font-medium transition-colors ${
                      archiveTab === 'archived'
                        ? 'text-slate-950 font-semibold dark:text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Notas arquivadas{' '}
                    <span className="ml-1 font-mono-tabular text-slate-400">
                      {archivedNotes.length}
                    </span>
                    {archiveTab === 'archived' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#FACC15]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setArchiveTab('trash')}
                    className={`relative pb-3 text-xs font-medium transition-colors ${
                      archiveTab === 'trash'
                        ? 'text-slate-950 font-semibold dark:text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Lixeira{' '}
                    <span className="ml-1 font-mono-tabular text-slate-400">
                      {trashedItemsCount}
                    </span>
                    {archiveTab === 'trash' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#FACC15]" />
                    )}
                  </button>
                </div>

                {archiveTab === 'trash' && trashedItemsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setNotes((prev) => prev.filter((n) => !n.deletedAt));
                      setTasks((prev) => prev.filter((t) => !t.deletedAt));
                      setPublications((prev) => prev.filter((p) => !p.deletedAt));
                      showToast('Lixeira esvaziada permanentemente.');
                    }}
                    className="mb-2 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Esvaziar lixeira</span>
                  </button>
                )}
              </div>

              {/* Tab Content: Archived Notes */}
              {archiveTab === 'archived' && (
                <>
                  {archivedNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200/60 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <Archive className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 font-display text-sm font-bold text-slate-900 dark:text-white">
                        Nenhuma nota arquivada
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Use Arquivar no menu de uma nota para guardá-la aqui.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {archivedNotes.map((n) => (
                        <div
                          key={n.id}
                          className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div>
                            <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                              {n.title || 'Sem título'}
                            </h4>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                              {n.content}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleArchiveToggleNote(n)}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 shrink-0"
                          >
                            Desarquivar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Tab Content: Trash */}
              {archiveTab === 'trash' && (
                <>
                  {trashedItemsCount === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200/60 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <Trash2 className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 font-display text-sm font-bold text-slate-900 dark:text-white">
                        A lixeira está vazia
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Notas, tarefas e publicações excluídas ficam aqui por 30
                        dias.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {notes
                        .filter((n) => !!n.deletedAt)
                        .map((n) => (
                          <div
                            key={n.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div>
                              <span className="text-[11px] font-medium text-slate-400">
                                Nota
                              </span>
                              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {n.title || 'Nota sem título'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateNote({ ...n, deletedAt: null });
                                  showToast('Nota restaurada!');
                                }}
                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                              >
                                Restaurar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setNotes((prev) =>
                                    prev.filter((item) => item.id !== n.id)
                                  )
                                }
                                className="rounded-xl px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}

                      {tasks
                        .filter((t) => !!t.deletedAt)
                        .map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div>
                              <span className="text-[11px] font-medium text-slate-400">
                                Tarefa
                              </span>
                              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {t.title}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateTask({ ...t, deletedAt: null });
                                  showToast('Tarefa restaurada!');
                                }}
                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                              >
                                Restaurar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setTasks((prev) =>
                                    prev.filter((item) => item.id !== t.id)
                                  )
                                }
                                className="rounded-xl px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}

                      {publications
                        .filter((p) => !!p.deletedAt)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div>
                              <span className="text-[11px] font-medium text-slate-400">
                                Publicação · {p.network}
                              </span>
                              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {p.title}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setPublications((prev) =>
                                    prev.map((item) =>
                                      item.id === p.id
                                        ? { ...item, deletedAt: null }
                                        : item
                                    )
                                  );
                                  showToast('Publicação restaurada!');
                                }}
                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                              >
                                Restaurar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setPublications((prev) =>
                                    prev.filter((item) => item.id !== p.id)
                                  )
                                }
                                className="rounded-xl px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* FLOATING LAYER: Draggable Post-its, Today's Tasks Widget, and Pomodoro Timer */}
      <DesktopFloatingLayer
        floatingNotes={floatingNotes}
        hideFloatingNotes={settings.hideFloatingNotes}
        showFloatingTasks={settings.floatingTodayTasks}
        todayTasks={todayTasks}
        pomodoroSeconds={pomodoroSeconds}
        pomodoroRunning={pomodoroRunning}
        pomodoroMode={pomodoroMode}
        activePomodoroTaskId={activePomodoroTaskId}
        showPomodoroWidget={showPomodoroWidget}
        onUpdateNote={handleUpdateNote}
        onOpenNoteModal={(n) => setActiveNoteId(n.id)}
        onToggleTask={handleToggleTaskCompletion}
        onCloseFloatingTasks={() =>
          setSettings((s) => ({ ...s, floatingTodayTasks: false }))
        }
        onTogglePomodoro={() => setPomodoroRunning((r) => !r)}
        onResetPomodoro={() => {
          setPomodoroRunning(false);
          setPomodoroSeconds(pomodoroMode === 'work' ? 25 * 60 : 5 * 60);
        }}
        onSwitchPomodoroMode={(mode) => {
          setPomodoroRunning(false);
          setPomodoroMode(mode);
          setPomodoroSeconds(mode === 'work' ? 25 * 60 : 5 * 60);
        }}
        onClosePomodoroWidget={() => {
          setPomodoroRunning(false);
          setShowPomodoroWidget(false);
        }}
      />

      {/* MODAL: Open Note Editor */}
      {activeNoteModalObj && (
        <NoteModal
          note={activeNoteModalObj}
          clients={clients}
          onClose={() => setActiveNoteId(null)}
          onUpdate={handleUpdateNote}
          onConvertToTask={handleConvertNoteToTask}
          onConvertToPublication={handleConvertNoteToPublication}
          onDuplicate={handleDuplicateNote}
          onArchiveToggle={handleArchiveToggleNote}
          onDelete={handleDeleteNoteToTrash}
          onCreateTasksFromAI={handleCreateTasksFromAI}
          onNotify={showToast}
        />
      )}

      {/* DRAWER: Task Details */}
      {activeTaskDrawerObj && (
        <TaskDetailsDrawer
          task={activeTaskDrawerObj}
          clients={clients}
          onClose={() => setActiveTaskId(null)}
          onUpdate={handleUpdateTask}
          onConvertToNote={handleConvertTaskToNote}
          onDelete={handleDeleteTaskToTrash}
          onStartPomodoroForTask={(t) => {
            setActivePomodoroTaskId(t.id);
            setPomodoroMode('work');
            setPomodoroSeconds(25 * 60);
            setPomodoroRunning(true);
            setShowPomodoroWidget(true);
            showToast(`Foco Pomodoro iniciado para: ${t.title}`);
          }}
        />
      )}

      {/* MODAL: Publication Create / Edit */}
      {isPublicationModalOpen && (
        <PublicationModal
          publication={editingPublication}
          initialStage={newPublicationDefaults.stage}
          initialDate={newPublicationDefaults.date}
          initialClientId={newPublicationDefaults.clientId}
          clients={clients}
          onClose={() => {
            setIsPublicationModalOpen(false);
            setEditingPublication(null);
          }}
          onSave={handleSavePublication}
          onDelete={
            editingPublication ? handleDeletePublicationToTrash : undefined
          }
          onNotify={showToast}
        />
      )}

      {/* MODAL: AI Publication Ideas */}
      {showAiIdeasModal && (
        <AiIdeasModal
          clients={clients}
          initialClientId={planningClientFilter}
          onClose={() => setShowAiIdeasModal(false)}
          onAddPublication={handleSavePublication}
          onNotify={showToast}
        />
      )}

      {/* MODAL: Settings */}
      {showSettingsModal && (
        <SettingsModal
          initialTab={settingsInitialTab}
          settings={settings}
          clients={clients}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          onInstallPwa={install}
          onUpdateSettings={(partial) =>
            setSettings((prev) => ({ ...prev, ...partial }))
          }
          onAddClient={handleAddClient}
          onDeleteClient={handleDeleteClient}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onTestNotification={handleTestNotification}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* MODAL: Command Palette (Ctrl+K) */}
      {showCommandPalette && (
        <CommandPaletteModal
          notes={notes}
          tasks={tasks}
          publications={publications}
          onClose={() => setShowCommandPalette(false)}
          onNavigate={(sec) => {
            setSelectedClientFilter('all');
            setActiveNav(sec);
          }}
          onNewNote={(title, floating) =>
            handleCreateNewNote(title || '', !!floating)
          }
          onNewTask={(raw) => {
            if (raw) {
              handleAddQuickTask(raw, 'today');
            } else {
              setActiveNav('tasks');
            }
          }}
          onNewPublication={() => {
            setEditingPublication(null);
            setNewPublicationDefaults({ stage: 'idea' });
            setIsPublicationModalOpen(true);
          }}
          onOpenAiIdeas={() => {
            setActiveNav('planning');
            setShowAiIdeasModal(true);
          }}
          onToggleFloatingTodayTasks={() => {
            const nextVal = !settings.floatingTodayTasks;
            setSettings((s) => ({ ...s, floatingTodayTasks: nextVal }));
            showToast(
              nextVal
                ? 'Tarefas de hoje fixadas na área de trabalho!'
                : 'Widget de tarefas recolhido.'
            );
          }}
          onOpenNote={(n) => {
            setActiveNav('notes');
            setActiveNoteId(n.id);
          }}
          onOpenTask={(t) => {
            setActiveNav('tasks');
            setActiveTaskId(t.id);
          }}
          onOpenPublication={(p) => {
            setActiveNav('planning');
            setEditingPublication(p);
            setIsPublicationModalOpen(true);
          }}
        />
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-lg">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Modo Offline — Seus dados estão salvos localmente.</span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-xl dark:bg-white dark:text-slate-950">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
