import type { ServerTodo } from './todoTypes';

export type QueueItem =
  | { queueId: string; type: 'create'; clientTodoId: number; title: string; ts: number }
  | { queueId: string; type: 'toggle'; todoRef: number; done: boolean; ts: number }
  | { queueId: string; type: 'delete'; todoRef: number; ts: number };

const QUEUE_KEY = 'lr12-todo-offline-queue';
const CLIENT_ID_KEY = 'lr12-todo-client-id-seq';

export function loadQueue(): QueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQueue(queue: QueueItem[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function allocateClientTodoId(): number {
  const raw = localStorage.getItem(CLIENT_ID_KEY);
  let n = raw ? Number.parseInt(raw, 10) : 0;
  if (!Number.isFinite(n) || n >= 0) {
    n = -1;
  } else {
    n -= 1;
  }
  localStorage.setItem(CLIENT_ID_KEY, String(n));
  return n;
}

export function newQueueId(): string {
  return crypto.randomUUID();
}

export function mergeTodos(serverTodos: ServerTodo[], queue: QueueItem[]): ServerTodo[] {
  const map = new Map<number, ServerTodo>();
  for (const t of serverTodos) {
    map.set(t.id, { ...t });
  }

  const ordered = [...queue].sort((a, b) => a.ts - b.ts);
  for (const op of ordered) {
    if (op.type === 'create') {
      map.set(op.clientTodoId, {
        id: op.clientTodoId,
        title: op.title,
        done: false,
        createdAt: '',
        updatedAt: '',
      });
    } else if (op.type === 'toggle') {
      const t = map.get(op.todoRef);
      if (t) {
        map.set(op.todoRef, { ...t, done: op.done });
      }
    } else if (op.type === 'delete') {
      map.delete(op.todoRef);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

export function remapTodoRefsInQueue(queue: QueueItem[], from: number, to: number): QueueItem[] {
  return queue.map((op) => {
    if (op.type === 'toggle' && op.todoRef === from) {
      return { ...op, todoRef: to };
    }
    if (op.type === 'delete' && op.todoRef === from) {
      return { ...op, todoRef: to };
    }
    return op;
  });
}
