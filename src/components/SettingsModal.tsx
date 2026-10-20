import React, { useRef, useState } from 'react';
import {
  Bell,
  Bot,
  Download,
  HardDrive,
  Keyboard,
  Monitor,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { AppSettings, ClientProject } from '../types';

export type SettingsTab =
  | 'appearance'
  | 'windows'
  | 'notifications'
  | 'ai'
  | 'clients'
  | 'backup'
  | 'shortcuts';

interface SettingsModalProps {
  initialTab?: SettingsTab;
  settings: AppSettings;
  clients: ClientProject[];
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallPwa: () => void;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onAddClient: (name: string, color: string) => void;
  onDeleteClient: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onTestNotification: () => void;
  onClose: () => void;
}

const CLIENT_PALETTE = [
  '#D97706',
  '#14B8A6',
  '#22C55E',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
  '#F59E0B',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  initialTab = 'appearance',
  settings,
  clients,
  isInstallable,
  isInstalled,
  onInstallPwa,
  onUpdateSettings,
  onAddClient,
  onDeleteClient,
  onExportBackup,
  onImportBackup,
  onTestNotification,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [newClientName, setNewClientName] = useState('');
  const [newClientColor, setNewClientColor] = useState(CLIENT_PALETTE[3]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const wallpaperInputRef = useRef<HTMLInputElement | null>(null);
  const brandLogoInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoUpload = (file: File | undefined) => {
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
          onUpdateSettings({ brandLogoUrl: dataUrl });
        } else {
          onUpdateSettings({ brandLogoUrl: reader.result as string });
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleWallpaperUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1600;
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onUpdateSettings({
            backgroundStyle: 'custom_image',
            customWallpaperUrl: compressedDataUrl,
          });
        } else {
          onUpdateSettings({
            backgroundStyle: 'custom_image',
            customWallpaperUrl: reader.result as string,
          });
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const navItems: Array<{
    id: SettingsTab;
    label: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'windows', label: 'Windows', icon: Monitor },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'ai', label: 'Assistente de IA', icon: Bot },
    { id: 'clients', label: 'Clientes e projetos', icon: Users },
    { id: 'backup', label: 'Backup e dados', icon: HardDrive },
    { id: 'shortcuts', label: 'Atalhos', icon: Keyboard },
  ];

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newClientName.trim();
    if (!trimmed) return;
    onAddClient(trimmed, newClientColor);
    setNewClientName('');
    const nextColor =
      CLIENT_PALETTE[(clients.length + 1) % CLIENT_PALETTE.length];
    setNewClientColor(nextColor);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[620px] max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Left Sidebar */}
        <div className="flex w-60 shrink-0 flex-col justify-between border-r border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4 px-2">
              Configurações
            </h2>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs font-semibold dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="px-2 text-[11px] text-slate-400 font-mono-tabular">
            Next Marketing 2.0.0
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto p-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {activeTab === 'appearance' && 'Aparência e Identidade'}
              {activeTab === 'windows' && 'Windows'}
              {activeTab === 'notifications' && 'Notificações'}
              {activeTab === 'ai' && 'Assistente de IA'}
              {activeTab === 'clients' && 'Clientes e projetos'}
              {activeTab === 'backup' && 'Backup e dados'}
              {activeTab === 'shortcuts' && 'Atalhos de teclado'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* TAB 1: APARÊNCIA */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Brand Logo / Profile Picture Upload */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-700 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                      {settings.brandLogoUrl ? (
                        <img
                          src={settings.brandLogoUrl}
                          alt="Logo Next Marketing"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#FACC15] text-xs font-extrabold text-slate-950">
                          NM
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        Logo / Foto de Perfil — Next Marketing
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Substitui o ícone do canto superior esquerdo pela logo
                        da sua empresa.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={brandLogoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => brandLogoInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-2xs hover:bg-[#EAB308]"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Enviar logo</span>
                    </button>
                    {settings.brandLogoUrl && (
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ brandLogoUrl: '' })}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Tema
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    Sistema acompanha o modo claro ou escuro do Windows.
                  </p>
                </div>
                <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  {(
                    [
                      { id: 'dark', label: 'Escuro' },
                      { id: 'light', label: 'Claro' },
                      { id: 'system', label: 'Sistema' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onUpdateSettings({ theme: opt.id })}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                        settings.theme === opt.id
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Menu lateral recolhido
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Mostra só os ícones, para sobrar mais espaço.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.sidebarCollapsed
                      ? 'bg-[#FACC15]'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block h-5 w-5 transform rounded-full transition-transform ${
                      settings.sidebarCollapsed
                        ? 'translate-x-5 bg-slate-900'
                        : 'translate-x-0.5 bg-slate-700 dark:bg-slate-300'
                    }`}
                  />
                </button>
              </div>

              {/* Estilo de Fundo e Upload de Papel de Parede */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Estilo de fundo e Papel de parede
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Personalize o fundo da área de trabalho da Next Marketing ou envie uma imagem do seu computador.
                    </p>
                  </div>

                  <input
                    ref={wallpaperInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleWallpaperUpload(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => wallpaperInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl bg-[#FEF08A] px-3.5 py-2 text-xs font-semibold text-slate-900 hover:bg-[#FACC15] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Fazer upload de fundo</span>
                  </button>
                </div>

                {/* Grid of Background Styles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      {
                        id: 'solid',
                        label: 'Padrão Limpo',
                        previewClass: 'bg-[#F4F5F7] dark:bg-[#0F172A]',
                      },
                      {
                        id: 'dots',
                        label: 'Pontilhado Criativo',
                        previewClass:
                          'bg-[#F4F5F7] dark:bg-[#0F172A] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:12px_12px]',
                      },
                      {
                        id: 'grid',
                        label: 'Grade de Estúdio',
                        previewClass:
                          'bg-[#F4F5F7] dark:bg-[#0F172A] bg-[linear-gradient(to_right,#cbd5e140_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e140_1px,transparent_1px)] [background-size:14px_14px]',
                      },
                      {
                        id: 'warm_gradient',
                        label: 'Gradiente Solar',
                        previewClass:
                          'bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50 dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900',
                      },
                      {
                        id: 'cool_gradient',
                        label: 'Gradiente Oceano',
                        previewClass:
                          'bg-gradient-to-br from-sky-50 via-indigo-50/50 to-emerald-50 dark:from-slate-900 dark:via-sky-950/30 dark:to-slate-900',
                      },
                      {
                        id: 'custom_image',
                        label: 'Papel de Parede',
                        previewClass: 'bg-slate-200 dark:bg-slate-800',
                      },
                    ] as const
                  ).map((st) => {
                    const isSelected = settings.backgroundStyle === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          if (
                            st.id === 'custom_image' &&
                            !settings.customWallpaperUrl
                          ) {
                            wallpaperInputRef.current?.click();
                            return;
                          }
                          onUpdateSettings({ backgroundStyle: st.id });
                        }}
                        className={`group flex flex-col overflow-hidden rounded-xl border p-2 text-left transition-all ${
                          isSelected
                            ? 'border-slate-900 ring-2 ring-slate-900/15 dark:border-amber-400 dark:ring-amber-400/20'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`relative h-14 w-full overflow-hidden rounded-lg border border-black/5 dark:border-white/5 ${st.previewClass}`}
                          style={
                            st.id === 'custom_image' && settings.customWallpaperUrl
                              ? {
                                  backgroundImage: `url(${settings.customWallpaperUrl})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }
                              : undefined
                          }
                        >
                          {st.id === 'custom_image' &&
                            !settings.customWallpaperUrl && (
                              <div className="flex h-full items-center justify-center text-[10px] font-medium text-slate-500">
                                Enviar imagem
                              </div>
                            )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            {st.label}
                          </span>
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-[#FACC15]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Controls when Custom Wallpaper is present */}
                {settings.customWallpaperUrl && (
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Ajustes do papel de parede
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            customWallpaperUrl: '',
                            backgroundStyle: 'solid',
                          })
                        }
                        className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remover imagem</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Camada de contraste (leitura dos cartões)</span>
                        <span className="font-mono-tabular">
                          {settings.wallpaperOverlayOpacity ?? 40}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={90}
                        step={5}
                        value={settings.wallpaperOverlayOpacity ?? 40}
                        onChange={(e) =>
                          onUpdateSettings({
                            wallpaperOverlayOpacity: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#FACC15]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Suavizar fundo com desfoque (Blur)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            wallpaperBlur: !settings.wallpaperBlur,
                          })
                        }
                        className={`relative h-5 w-9 rounded-full transition-colors ${
                          settings.wallpaperBlur
                            ? 'bg-[#FACC15]'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`block h-4 w-4 transform rounded-full transition-transform ${
                            settings.wallpaperBlur
                              ? 'translate-x-4 bg-slate-900'
                              : 'translate-x-0.5 bg-white'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WINDOWS & PWA */}
          {activeTab === 'windows' && (
            <div className="space-y-5">
              {/* Install Banner */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                      {isInstalled
                        ? 'Aplicativo instalado localmente no seu notebook'
                        : 'Instalar Next Marketing no seu notebook (PWA)'}
                    </div>
                    <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/80">
                      {isInstalled
                        ? 'O Next Marketing está rodando como aplicativo independente com suporte offline.'
                        : 'Funciona como aplicativo nativo na barra de tarefas e área de trabalho do Windows, mesmo sem internet.'}
                    </p>
                  </div>
                  {isInstallable && !isInstalled && (
                    <button
                      type="button"
                      onClick={onInstallPwa}
                      className="rounded-xl bg-[#FACC15] px-4 py-2 text-xs font-semibold text-slate-950 shadow-xs hover:bg-[#EAB308] whitespace-nowrap shrink-0"
                    >
                      Instalar agora
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Iniciar com o Windows
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Abre discretamente na bandeja, perto do relógio, ao ligar o computador.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ launchWithWindows: !settings.launchWithWindows })
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      settings.launchWithWindows
                        ? 'bg-[#FACC15]'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 transform rounded-full transition-transform ${
                        settings.launchWithWindows
                          ? 'translate-x-5 bg-slate-900'
                          : 'translate-x-0.5 bg-slate-500'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Fechar para a bandeja
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      O X esconde a janela e o app continua rodando, com lembretes e post-its.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ closeToTray: !settings.closeToTray })
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      settings.closeToTray
                        ? 'bg-[#FACC15]'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 transform rounded-full transition-transform ${
                        settings.closeToTray
                          ? 'translate-x-5 bg-slate-900'
                          : 'translate-x-0.5 bg-slate-500'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Tarefas de hoje na área de trabalho
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Um cartão fixo flutuante com as tarefas do dia, que dá para marcar de qualquer tela.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        floatingTodayTasks: !settings.floatingTodayTasks,
                      })
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      settings.floatingTodayTasks
                        ? 'bg-[#FACC15]'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 transform rounded-full transition-transform ${
                        settings.floatingTodayTasks
                          ? 'translate-x-5 bg-slate-900'
                          : 'translate-x-0.5 bg-slate-500'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Atalhos globais rápidos
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Ctrl+Alt+N cria um post-it flutuante; Ctrl+K abre a central de comandos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ globalShortcuts: !settings.globalShortcuts })
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      settings.globalShortcuts
                        ? 'bg-[#FACC15]'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 transform rounded-full transition-transform ${
                        settings.globalShortcuts
                          ? 'translate-x-5 bg-slate-900'
                          : 'translate-x-0.5 bg-slate-500'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICAÇÕES */}
          {activeTab === 'notifications' && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between py-4 first:pt-0">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Lembretes de tarefas
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Avisos do Windows na hora marcada em cada tarefa.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ taskReminders: !settings.taskReminders })
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    settings.taskReminders
                      ? 'bg-[#FACC15]'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block h-5 w-5 transform rounded-full transition-transform ${
                      settings.taskReminders
                        ? 'translate-x-5 bg-slate-900'
                        : 'translate-x-0.5 bg-slate-500'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Resumo do dia
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Pela manhã, um aviso com as tarefas de hoje e as publicações da semana.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ dailySummary: !settings.dailySummary })
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    settings.dailySummary
                      ? 'bg-[#FACC15]'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block h-5 w-5 transform rounded-full transition-transform ${
                      settings.dailySummary
                        ? 'translate-x-5 bg-slate-900'
                        : 'translate-x-0.5 bg-slate-500'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Testar
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Envia uma notificação agora para conferir se o Windows está mostrando.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onTestNotification}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Enviar teste
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ASSISTENTE DE IA */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                O assistente de IA está integrado e ativo para resumir notas, organizar
                em tópicos, revisar textos, criar checklists, encontrar tarefas na nota,
                escrever legendas, sugerir hashtags e gerar ideias de publicação.
              </p>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Assistente de IA pronto e conectado no navegador</span>
                </div>
                <p className="mt-1.5 text-xs text-emerald-800/80 dark:text-emerald-300/80">
                  Todas as funções de IA funcionam diretamente no navegador e no aplicativo
                  instalado, sem necessidade de configurar chave manualmente.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Onde usar o Assistente de IA:
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4">
                  <li>
                    <strong>Dentro de qualquer Nota:</strong> Clique em{' '}
                    <em>Assistente</em> na barra inferior para Resumir, Organizar em tópicos,
                    Corrigir texto, Criar checklist ou Encontrar tarefas.
                  </li>
                  <li>
                    <strong>No Planejamento (Kanban):</strong> Clique em{' '}
                    <em>Ideias com IA</em> para gerar pautas prontas para seus clientes.
                  </li>
                  <li>
                    <strong>Ao criar ou editar uma Publicação:</strong> Use{' '}
                    <em>Escrever com IA</em> na legenda e <em>Sugerir com IA</em> nas hashtags.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: CLIENTES E PROJETOS */}
          {activeTab === 'clients' && (
            <div className="space-y-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Usados no planejamento de publicações e para organizar tarefas e notas.
              </p>

              <form onSubmit={handleAddClientSubmit} className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  {CLIENT_PALETTE.slice(0, 5).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewClientColor(col)}
                      className={`h-5 w-5 rounded-full transition-transform ${
                        newClientColor === col ? 'scale-125 ring-2 ring-slate-800 dark:ring-white' : ''
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nome do cliente ou projeto"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-[#FEF08A] px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-[#FACC15] transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Adicionar</span>
                </button>
              </form>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: client.color }}
                      />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {client.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteClient(client.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      title="Excluir cliente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BACKUP E DADOS */}
          {activeTab === 'backup' && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between gap-4 pb-5">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Exportar backup
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Salva notas, tarefas, publicações e configurações num arquivo .json.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onExportBackup}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Exportar</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 pt-5">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Importar backup
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Substitui os dados atuais pelos do arquivo escolhido.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImportBackup(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Importar</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: ATALHOS */}
          {activeTab === 'shortcuts' && (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {[
                { key: 'Ctrl+K', desc: 'Buscar e executar comandos' },
                { key: 'Ctrl+N', desc: 'Nova nota' },
                { key: 'Ctrl+T', desc: 'Nova tarefa' },
                {
                  key: 'Ctrl+1 a Ctrl+5',
                  desc: 'Ir para Início, Notas, Tarefas, Agenda e Planejamento',
                },
                { key: 'Ctrl+,', desc: 'Configurações' },
                {
                  key: 'Ctrl+V',
                  desc: 'Colar imagem numa nota (ou no mural para criar uma nota)',
                },
                { key: 'Esc', desc: 'Fechar janelas e painéis' },
                {
                  key: 'Ctrl+Alt+N',
                  desc: 'Novo post-it flutuante na área de trabalho',
                },
              ].map((sc) => (
                <div
                  key={sc.key}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <kbd className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono-tabular font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap shrink-0">
                    {sc.key}
                  </kbd>
                  <span className="text-xs text-slate-600 dark:text-slate-300 text-right">
                    {sc.desc}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
