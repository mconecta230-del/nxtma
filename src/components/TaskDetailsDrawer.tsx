import React from 'react';
import {
  CheckCircle2,
  Circle,
  FileText,
  Play,
  Timer,
  Trash2,
  X,
} from 'lucide-react';
import { ClientProject, PriorityLevel, Task, TaskListType } from '../types';
import { formatRelativeTime } from '../utils/initialData';

interface TaskDetailsDrawerProps {
  task: Task;
  clients: ClientProject[];
  onClose: () => void;
  onUpdate: (updated: Task) => void;
  onConvertToNote: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStartPomodoroForTask: (task: Task) => void;
}

export const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({
  task,
  clients,
  onClose,
  onUpdate,
  onConvertToNote,
  onDelete,
  onStartPomodoroForTask,
}) => {
  const handleChange = <K extends keyof Task>(field: K, value: Task[K]) => {
    onUpdate({
      ...task,
      [field]: value,
    });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-950/20 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-6 dark:border-slate-800">
          <button
            type="button"
            onClick={() =>
              onUpdate({
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : null,
              })
            }
            className="mt-1 text-slate-400 hover:text-emerald-600 shrink-0"
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          <textarea
            value={task.title}
            onChange={(e) => handleChange('title', e.target.value)}
            rows={2}
            className="flex-1 resize-none bg-transparent font-display text-lg font-bold leading-snug text-slate-900 focus:outline-none dark:text-white"
          />

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Lista */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Lista
            </label>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {(
                [
                  { id: 'today', label: 'Hoje' },
                  { id: 'tomorrow', label: 'Amanhã' },
                  { id: 'pending', label: 'Pendentes' },
                ] as Array<{ id: TaskListType; label: string }>
              ).map((item) => {
                const active = task.list === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleChange('list', item.id)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data & Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Data
              </label>
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono-tabular text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Hora
              </label>
              <input
                type="time"
                value={task.dueTime}
                onChange={(e) => handleChange('dueTime', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono-tabular text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Lembrete & Repetir */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Lembrete
              </label>
              <select
                value={task.reminder}
                onChange={(e) => handleChange('reminder', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="none">Sem lembrete</option>
                <option value="on_time">Na hora marcada</option>
                <option value="15m">15 minutos antes</option>
                <option value="1h">1 hora antes</option>
                <option value="1d">1 dia antes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Repetir
              </label>
              <select
                value={task.repeat}
                onChange={(e) => handleChange('repeat', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="none">Não repete</option>
                <option value="daily">Todos os dias</option>
                <option value="weekly">Toda semana</option>
                <option value="monthly">Todo mês</option>
              </select>
            </div>
          </div>

          {/* Prioridade & Projeto ou cliente */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Prioridade
              </label>
              <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {(
                  [
                    { id: 'low', label: 'Baixa' },
                    { id: 'medium', label: 'Média' },
                    { id: 'high', label: 'Alta' },
                  ] as Array<{ id: PriorityLevel; label: string }>
                ).map((p) => {
                  const active = task.priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleChange('priority', p.id)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                        active
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Projeto ou cliente
              </label>
              <select
                value={task.clientId || ''}
                onChange={(e) => handleChange('clientId', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Nenhum</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Foco Pomodoro integrado */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2.5">
              <Timer className="h-4 w-4 text-amber-500" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Modo Foco Pomodoro
                </div>
                <div className="text-[11px] text-slate-500 font-mono-tabular">
                  {task.pomodorosCompleted || 0} ciclo(s) concluído(s)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onStartPomodoroForTask(task)}
              className="flex items-center gap-1.5 rounded-lg bg-[#FEF08A] px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-[#FACC15]"
            >
              <Play className="h-3 w-3" />
              <span>Focar 25m</span>
            </button>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Descrição
            </label>
            <textarea
              value={task.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              placeholder="Adicione detalhes, pautas ou observações da tarefa..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-900 focus:border-amber-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onConvertToNote(task)}
            className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            <span>Transformar em nota</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono-tabular">
              Criada {formatRelativeTime(task.createdAt)}
            </span>
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
              title="Mover para a lixeira"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
