export type NoteColor =
  | 'yellow'
  | 'blue'
  | 'green'
  | 'lavender'
  | 'coral'
  | 'graphite'
  | 'white';

export type PriorityLevel = 'low' | 'medium' | 'high';

export type TaskListType = 'today' | 'tomorrow' | 'pending';

export type SocialNetwork =
  | 'Instagram'
  | 'Facebook'
  | 'WhatsApp'
  | 'TikTok'
  | 'Outra';

export type PublicationStage = 'idea' | 'creating' | 'ready' | 'published';

export type NavSection =
  | 'home'
  | 'notes'
  | 'tasks'
  | 'agenda'
  | 'planning'
  | 'studio'
  | 'archive'
  | 'client';

export type BackgroundStyleType =
  | 'solid'
  | 'dots'
  | 'grid'
  | 'warm_gradient'
  | 'cool_gradient'
  | 'custom_image';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AttachmentItem {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  floating: boolean;
  floatingPos?: { x: number; y: number };
  checklist: ChecklistItem[];
  links: string[];
  tags: string[];
  attachments: AttachmentItem[];
  aiSummary?: string;
  clientId?: string;
  archived: boolean;
  deletedAt?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  list: TaskListType;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm or ''
  reminder: string; // 'none' | 'on_time' | '15m' | '1h' | '1d'
  repeat: string; // 'none' | 'daily' | 'weekly' | 'monthly'
  priority: PriorityLevel;
  clientId: string; // '' or client id
  completed: boolean;
  completedAt?: string | null;
  pomodorosCompleted?: number;
  deletedAt?: string | null;
  createdAt: string;
}

export interface Publication {
  id: string;
  title: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm or ''
  network: SocialNetwork;
  stage: PublicationStage;
  caption: string;
  hashtags: string;
  notes: string;
  attachments: AttachmentItem[];
  referenceLinks: string[];
  deletedAt?: string | null;
  createdAt: string;
}

export interface ClientProject {
  id: string;
  name: string;
  color: string;
}

export interface MarketingSnippet {
  id: string;
  title: string;
  category: 'hashtags' | 'cta' | 'whatsapp' | 'links';
  content: string;
  clientId?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  launchWithWindows: boolean;
  closeToTray: boolean;
  floatingTodayTasks: boolean;
  globalShortcuts: boolean;
  taskReminders: boolean;
  dailySummary: boolean;
  hideFloatingNotes: boolean;
  backgroundStyle: BackgroundStyleType;
  customWallpaperUrl: string;
  wallpaperOverlayOpacity: number; // 10 to 90
  wallpaperBlur: boolean;
  brandLogoUrl?: string;
}

export interface AppDataBackup {
  version: string;
  exportedAt: string;
  notes: Note[];
  tasks: Task[];
  publications: Publication[];
  clients: ClientProject[];
  settings: AppSettings;
}
