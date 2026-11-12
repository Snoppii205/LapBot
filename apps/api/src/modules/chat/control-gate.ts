import type { ChatWidget } from '@lapbot/contracts';

export type ActiveTurn = {
  sessionId: string;
  turnId: string;
  version: number;
  deadline: number;
  controller: AbortController;
  text: string;
  widgets: ChatWidget[];
  stagedWidgets: ChatWidget[];
  pending: string;
  send: (event: string, data: Record<string, unknown>) => void;
  timer: ReturnType<typeof setTimeout> | null;
};

const gates = new Map<string, ActiveTurn>();

export function activeCount() {
  return gates.size;
}

export function gateFor(sessionId: string) {
  return gates.get(sessionId);
}

export function beginGate(
  turn: Omit<ActiveTurn, 'text' | 'widgets' | 'stagedWidgets' | 'pending' | 'timer'>
): ActiveTurn {
  const state: ActiveTurn = {
    ...turn,
    text: '',
    widgets: [],
    stagedWidgets: [],
    pending: '',
    timer: null
  };
  gates.set(turn.sessionId, state);
  return state;
}

export function gateAccepts(state: ActiveTurn): boolean {
  return (
    gates.get(state.sessionId) === state &&
    !state.controller.signal.aborted &&
    Date.now() < state.deadline
  );
}

export function emitStatus(state: ActiveTurn, stage: 'thinking' | 'searching') {
  if (!gateAccepts(state)) return;
  state.send('status', { turn_id: state.turnId, stage });
}

export function acceptText(state: ActiveTurn, text: string) {
  if (!gateAccepts(state) || !text) return;
  state.text += text;
  state.pending += text;
  if (!state.timer) state.timer = setTimeout(() => flushText(state), 50);
}

export function flushText(state: ActiveTurn) {
  if (state.timer) clearTimeout(state.timer);
  state.timer = null;
  if (!gateAccepts(state) || !state.pending) return;
  const text = state.pending;
  state.pending = '';
  state.send('text_delta', { turn_id: state.turnId, text });
}

export function stageWidget(state: ActiveTurn, widget: ChatWidget) {
  if (!gateAccepts(state)) return;
  if (!state.stagedWidgets.some(w => w.widget_id === widget.widget_id)) {
    state.stagedWidgets.push(widget);
  }
}

export function flushWidgets(state: ActiveTurn) {
  if (!gateAccepts(state) || !state.stagedWidgets.length) return;
  flushText(state);
  const batch = state.stagedWidgets.splice(0, state.stagedWidgets.length);
  for (const widget of batch) {
    if (!gateAccepts(state)) break;
    state.widgets.push(widget);
    state.send('widget', { turn_id: state.turnId, ...widget });
  }
}

export function acceptWidget(state: ActiveTurn, widget: ChatWidget) {
  stageWidget(state, widget);
  flushWidgets(state);
}

export function closeGate(
  sessionId: string
): { text: string; widgets: ChatWidget[]; turnId: string; version: number } | null {
  const state = gates.get(sessionId);
  if (!state) return null;
  if (state.timer) clearTimeout(state.timer);
  state.timer = null;
  state.stagedWidgets.length = 0;
  gates.delete(sessionId);
  state.controller.abort();
  return { text: state.text, widgets: state.widgets, turnId: state.turnId, version: state.version };
}
