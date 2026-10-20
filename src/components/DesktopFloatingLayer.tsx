import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  GripHorizontal,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Timer,
  X,
} from 'lucide-react';
import { Note, NoteColor, Task } from '../types';
import { NOTE_COLORS } from '../utils/initialData';

interface DesktopFloatingLayerProps {
  floatingNotes: Note[];
  hideFloatingNotes: boolean;
  showFloatingTasks: boolean;
  todayTasks: Task[];
  pomodoroSeconds: number;
  pomodoroRunning: boolean;
  pomodoroMode: 'work' | 'break';
  activePomodoroTaskId: string | null;
  showPomodoroWidget: boolean;
  onUpdateNote: (note: Note) => void;
  onOpenNoteModal: (note: Note) => void;
  onToggleTask: (taskId: string) => void;
  onCloseFloatingTasks: () => void;
  onTogglePomodoro: () => void;
  onResetPomodoro: () => void;
  onSwitchPomodoroMode: (mode: 'work' | 'break') => void;
  onClosePomodoroWidget: () => void;
}

export const DesktopFloatingLayer: React.FC<DesktopFloatingLayerProps> = ({
  floatingNotes,
  hideFloatingNotes,
  showFloatingTasks,
  todayTasks,
  pomodoroSeconds,
  pomodoroRunning,
  pomodoroMode,
  activePomodoroTaskId,
  showPomodoroWidget,
  onUpdateNote,
  onOpenNoteModal,
  onToggleTask,
  onCloseFloatingTasks,
  onTogglePomodoro,
  onResetPomodoro,
  onSwitchPomodoroMode,
  onClosePomodoroWidget,
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [tasksWidgetPos, setTasksWidgetPos] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 340) : 780,
    y: 90,
  });
  const [tasksMinimized, setTasksMinimized] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    const nextX = Math.max(12, Math.min(window.innerWidth - 280, e.clientX - dragOffset.x));
    const nextY = Math.max(56, Math.min(window.innerHeight - 160, e.clientY - dragOffset.y));

    if (draggingId === '__tasks_widget__') {
      setTasksWidgetPos({ x: nextX, y: nextY });
      return;
    }

    const targetNote = floatingNotes.find((n) => n.id === draggingId);
    if (targetNote) {
      onUpdateNote({
        ...targetNote,
        floatingPos: { x: nextX, y: nextY },
      });
    }
  };

  const handleMouseUp = () => {
    if (draggingId) {
      setDraggingId(null);
    }
  };

  const formatTimer = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const activeTask = todayTasks.find((t) => t.id === activePomodoroTaskId);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {/* Floating Post-it Notes */}
      {!hideFloatingNotes &&
        floatingNotes.map((note, idx) => {
          const colorObj = NOTE_COLORS.find((c) => c.id === note.color) || NOTE_COLORS[0];
          const pos = note.floatingPos || {
            x: Math.max(24, window.innerWidth - 320 - idx * 32),
            y: 120 + idx * 36,
          };

          return (
            <div
              key={note.id}
              style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
              className={`pointer-events-auto absolute top-0 left-0 flex w-72 flex-col rounded-2xl border shadow-xl transition-shadow ${colorObj.bgCard} ${colorObj.borderLight}`}
            >
              {/* Drag Handle Header */}
              <div
                onMouseDown={(e) => {
                  setDraggingId(note.id);
                  setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
                }}
                className="flex cursor-grab active:cursor-grabbing items-center justify-between border-b border-black/5 px-3 py-2 dark:border-white/10"
              >
                <div className="flex items-center gap-1.5">
                  <GripHorizontal className="h-3.5 w-3.5 text-slate-600/70 dark:text-slate-300/70" />
                  <div className="flex items-center gap-1">
                    {NOTE_COLORS.slice(0, 5).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateNote({ ...note, color: c.id as NoteColor });
                        }}
                        className={`h-3 w-3 rounded-full ${c.dot} ${
                          note.color === c.id ? 'ring-1 ring-slate-900 dark:ring-white' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Abrir nota completa"
                    onClick={() => onOpenNoteModal(note)}
                    className="rounded p-1 text-slate-700 hover:bg-black/10 dark:text-slate-200"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title="Desafixar da área de trabalho"
                    onClick={() => onUpdateNote({ ...note, floating: false })}
                    className="rounded p-1 text-slate-700 hover:bg-black/10 dark:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable Post-it Content */}
              <div className="p-3.5 space-y-1.5">
                <input
                  type="text"
                  value={note.title}
                  onChange={(e) =>
                    onUpdateNote({
                      ...note,
                      title: e.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  placeholder="Título do post-it..."
                  className="w-full bg-transparent font-display text-sm font-bold text-slate-900 placeholder:text-slate-600/60 focus:outline-none dark:text-white"
                />
                <textarea
                  value={note.content}
                  onChange={(e) =>
                    onUpdateNote({
                      ...note,
                      content: e.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  rows={4}
                  placeholder="Nota rápida na área de trabalho..."
                  className="w-full resize-none bg-transparent text-xs leading-relaxed text-slate-800 placeholder:text-slate-600/60 focus:outline-none dark:text-slate-100"
                />
              </div>
            </div>
          );
        })}

      {/* Floating Today's Tasks Widget */}
      {showFloatingTasks && (
        <div
          style={{
            transform: `translate3d(${tasksWidgetPos.x}px, ${tasksWidgetPos.y}px, 0)`,
          }}
          className="pointer-events-auto absolute top-0 left-0 w-80 rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95"
        >
          <div
            onMouseDown={(e) => {
              setDraggingId('__tasks_widget__');
              setDragOffset({
                x: e.clientX - tasksWidgetPos.x,
                y: e.clientY - tasksWidgetPos.y,
              });
            }}
            className="flex cursor-grab active:cursor-grabbing items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-slate-800"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-display text-xs font-bold text-slate-900 dark:text-white">
                Tarefas de Hoje ({todayTasks.filter((t) => t.completed).length}/
                {todayTasks.length})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTasksMinimized((v) => !v)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Minimize2 className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={onCloseFloatingTasks}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {!tasksMinimized && (
            <div className="max-h-64 overflow-y-auto p-3 space-y-1.5">
              {todayTasks.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  Nenhuma tarefa para hoje!
                </div>
              ) : (
                todayTasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onToggleTask(t.id)}
                    className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    {t.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`leading-snug ${
                        t.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 dark:text-slate-200 font-medium'
                      }`}
                    >
                      {t.title}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Pomodoro Focus Pill (bottom-right) */}
      {showPomodoroWidget && (
        <div className="pointer-events-auto fixed bottom-5 right-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Timer
              className={`h-4 w-4 ${
                pomodoroRunning ? 'text-amber-500' : 'text-slate-400'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-tabular text-base font-bold text-slate-900 dark:text-white">
                  {formatTimer(pomodoroSeconds)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onSwitchPomodoroMode(pomodoroMode === 'work' ? 'break' : 'work')
                  }
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400"
                >
                  {pomodoroMode === 'work' ? 'Foco 25m' : 'Pausa 5m'}
                </button>
              </div>
              {activeTask && (
                <div className="max-w-44 truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {activeTask.title}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-100 pl-2.5 dark:border-slate-800">
            <button
              type="button"
              onClick={onTogglePomodoro}
              className="rounded-lg bg-[#FACC15] p-1.5 text-slate-950 hover:bg-[#EAB308]"
              title={pomodoroRunning ? 'Pausar' : 'Iniciar foco'}
            >
              {pomodoroRunning ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onResetPomodoro}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Reiniciar timer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onClosePomodoroWidget}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Esconder timer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
