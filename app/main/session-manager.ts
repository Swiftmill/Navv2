import { sessionStore, SessionState } from './storage';

export async function restoreSession(): Promise<SessionState['lastSession']> {
  const state = await sessionStore.read();
  return state.lastSession;
}

export async function saveSession(lastSession: SessionState['lastSession']): Promise<void> {
  await sessionStore.write({ lastSession });
}
