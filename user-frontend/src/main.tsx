import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './providers/i18n.provider'
import App from './App.tsx'

import { GoogleOAuthProvider } from '@react-oauth/google';

import { Buffer } from 'buffer';

// Fix "global is not defined" and "call of undefined" errors in production
const win = window as any;
if (typeof win.global === 'undefined') win.global = win;
if (typeof win.process === 'undefined') win.process = { env: {} };
if (typeof win.process.nextTick === 'undefined') {
  win.process.nextTick = (cb: any, ...args: any[]) => setTimeout(() => cb(...args), 0);
}
if (typeof win.Buffer === 'undefined') win.Buffer = Buffer;

// Also set on globalThis for deeper compatibility
(globalThis as any).Buffer = Buffer;
(globalThis as any).process = win.process;
(globalThis as any).global = globalThis;

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '579879352608-0vppj3d4iu8eamtstiej8tkc0keauird.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
