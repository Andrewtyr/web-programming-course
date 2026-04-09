import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ServerTodo } from './todoTypes';
import {
  allocateClientTodoId,
  loadQueue,
  mergeTodos,
  newQueueId,
  remapTodoRefsInQueue,
  saveQueue,
  type QueueItem,
} from './offlineQueue';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function toLocalText(value: string) {
  const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('ru-RU');
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function apiFetchTodos(): Promise<ServerTodo[]> {
  const response = await fetch(`${API_BASE_URL}/api/todos`);
  const data = await parseJson<{ items: ServerTodo[] }>(response);
  return data.items;
}

async function apiCreate(title: string): Promise<ServerTodo> {
  const response = await fetch(`${API_BASE_URL}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  return parseJson<ServerTodo>(response);
}

async function apiToggle(todoId: number, done: boolean): Promise<ServerTodo> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done }),
  });

  return parseJson<ServerTodo>(response);
}

async function apiDelete(todoId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch (error) {
    console.warn('Service Worker registration failed', error);
  }
}

type SyncState = 'idle' | 'syncing' | 'error';

function enqueueCreate(queue: QueueItem[], title: string): QueueItem[] {
  const clientTodoId = allocateClientTodoId();
  const item: QueueItem = {
    queueId: newQueueId(),
    type: 'create',
    clientTodoId,
    title,
    ts: Date.now(),
  };
  return [...queue, item];
}

function enqueueToggle(queue: QueueItem[], todoRef: number, done: boolean): QueueItem[] {
  const item: QueueItem = {
    queueId: newQueueId(),
    type: 'toggle',
    todoRef,
    done,
    ts: Date.now(),
  };
  return [...queue, item];
}

function enqueueDelete(queue: QueueItem[], todoRef: number): QueueItem[] {
  const item: QueueItem = {
    queueId: newQueueId(),
    type: 'delete',
    todoRef,
    ts: Date.now(),
  };
  return [...queue, item];
}

export default function App() {
  const [serverTodos, setServerTodos] = useState<ServerTodo[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>(() => loadQueue());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncState, setSyncState] = useState<SyncState>('idle');

  const syncingRef = useRef(false);
  const didBootSyncRef = useRef(false);

  const displayTodos = useMemo(() => mergeTodos(serverTodos, queue), [serverTodos, queue]);

  const refreshFromServer = useCallback(async () => {
    const items = await apiFetchTodos();
    setServerTodos(items);
  }, []);

  useEffect(() => {
    saveQueue(queue);
  }, [queue]);

  const runSync = useCallback(async () => {
    if (!navigator.onLine || syncingRef.current) return;
    let q = loadQueue();
    if (q.length === 0) return;

    syncingRef.current = true;
    setSyncState('syncing');
    setMessage('Синхронизация с сервером…');

    try {
      while (q.length > 0) {
        const op = q[0];

        if (op.type === 'create') {
          const created = await apiCreate(op.title);
          const tempId = op.clientTodoId;
          const realId = created.id;
          q = remapTodoRefsInQueue(q.slice(1), tempId, realId);
        } else if (op.type === 'toggle') {
          await apiToggle(op.todoRef, op.done);
          q = q.slice(1);
        } else {
          await apiDelete(op.todoRef);
          q = q.slice(1);
        }

        saveQueue(q);
        setQueue(q);
        await refreshFromServer();
      }

      setSyncState('idle');
      setMessage('Очередь синхронизирована.');
    } catch {
      setSyncState('error');
      setMessage('Не удалось синхронизировать. Проверьте сеть и нажмите «Синхронизация».');
    } finally {
      syncingRef.current = false;
    }
  }, [refreshFromServer]);

  const onCreate = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      if (!navigator.onLine) {
        setQueue((prev) => enqueueCreate(prev, trimmed));
        setMessage('Нет сети: задача добавлена в очередь.');
        return;
      }

      try {
        await apiCreate(trimmed);
        await refreshFromServer();
        setMessage('Задача добавлена.');
      } catch {
        setQueue((prev) => enqueueCreate(prev, trimmed));
        setMessage('Сеть недоступна: задача добавлена в очередь.');
      }
    },
    [refreshFromServer]
  );

  const onToggle = useCallback(
    async (todo: ServerTodo) => {
      const nextDone = !todo.done;

      if (!navigator.onLine) {
        setQueue((prev) => enqueueToggle(prev, todo.id, nextDone));
        setMessage('Нет сети: изменение добавлено в очередь.');
        return;
      }

      try {
        await apiToggle(todo.id, nextDone);
        await refreshFromServer();
        setMessage('Статус обновлен.');
      } catch {
        setQueue((prev) => enqueueToggle(prev, todo.id, nextDone));
        setMessage('Сеть недоступна: изменение добавлено в очередь.');
      }
    },
    [refreshFromServer]
  );

  const onDelete = useCallback(
    async (todo: ServerTodo) => {
      if (!navigator.onLine) {
        setQueue((prev) => enqueueDelete(prev, todo.id));
        setMessage('Нет сети: удаление добавлено в очередь.');
        return;
      }

      try {
        await apiDelete(todo.id);
        await refreshFromServer();
        setMessage('Задача удалена.');
      } catch {
        setQueue((prev) => enqueueDelete(prev, todo.id));
        setMessage('Сеть недоступна: удаление добавлено в очередь.');
      }
    },
    [refreshFromServer]
  );

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const value = inputValue;
      setInputValue('');
      await onCreate(value);
    },
    [inputValue, onCreate]
  );

  useEffect(() => {
    void registerServiceWorker();

    let cancelled = false;

    const bootstrap = async () => {
      try {
        await refreshFromServer();
      } catch {
        if (!cancelled) {
          if (navigator.onLine) {
            setMessage('Не удалось загрузить данные. Проверьте, что backend запущен.');
          } else {
            setMessage('Офлайн: показаны локальные задачи и очередь.');
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshFromServer]);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      setMessage('Сеть восстановлена. Запускаем синхронизацию…');
      void runSync();
    };

    const onOffline = () => {
      setIsOnline(false);
      setMessage('Нет сети. Изменения попадают в офлайн-очередь.');
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [runSync]);

  useEffect(() => {
    if (isLoading || didBootSyncRef.current) return;
    didBootSyncRef.current = true;
    if (!navigator.onLine) return;
    if (loadQueue().length === 0) return;
    void runSync();
  }, [isLoading, runSync]);

  const syncDisabled = syncState === 'syncing' || queue.length === 0 || !isOnline;
  const mutationsDisabled = syncState === 'syncing';

  const syncLabel =
    syncState === 'syncing' ? 'Синхронизация…' : syncState === 'error' ? 'Повторить sync' : 'Синхронизация';

  return (
    <main className="app">
      <header className="header">
        <h1>Todo-сы</h1>
        <span className={`badge ${isOnline ? 'online' : 'offline'}`}>{isOnline ? 'online' : 'offline'}</span>
      </header>

      <p className="muted">PWA: manifest, Service Worker, индикатор сети, офлайн-очередь и синхронизация после reconnect.</p>

      <form className="toolbar" onSubmit={onSubmit}>
        <input
          type="text"
          maxLength={200}
          placeholder="Новая задача"
          required
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={mutationsDisabled}
        />
        <button type="submit" disabled={mutationsDisabled}>
          Добавить
        </button>
        <button
          type="button"
          disabled={syncDisabled}
          onClick={() => {
            setSyncState('idle');
            void runSync();
          }}
        >
          {syncLabel}
        </button>
      </form>

      <section className="meta">
        <span className="badge">Офлайн-очередь: {queue.length}</span>
        <span
          className={`badge ${
            syncState === 'syncing' ? 'syncing' : syncState === 'error' ? 'error' : 'neutral'
          }`}
        >
          sync: {syncState}
        </span>
      </section>

      {message ? <div className="message">{message}</div> : null}
      {isLoading ? <p>Загрузка...</p> : null}
      {!isLoading && displayTodos.length === 0 ? <div className="empty">Пока нет задач</div> : null}

      <ul className="list">
        {displayTodos.map((todo) => (
          <li className="item" key={todo.id}>
            <button type="button" disabled={mutationsDisabled} onClick={() => void onToggle(todo)}>
              {todo.done ? '✅' : '⬜'}
            </button>
            <div>
              <div className={todo.done ? 'done' : ''}>{todo.title}</div>
              <div className="hint">
                {todo.createdAt === '' && todo.updatedAt === ''
                  ? 'Ожидает синхронизации'
                  : `Сервер · ${toLocalText(todo.updatedAt)}`}
              </div>
            </div>
            <button type="button" disabled={mutationsDisabled} onClick={() => void onDelete(todo)}>
              Удалить
            </button>
            <span className="hint">#{todo.id}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
