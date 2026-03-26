import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COOKIE_KEY = 'supabase_connection';

export function SupabaseConnectModal({ isOpen, onClose }: SupabaseConnectModalProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const saved = Cookies.get(COOKIE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUrl(parsed.url || '');
        setAnonKey(parsed.anonKey || '');
        setConnected(true);
      } catch {}
    }
  }, [isOpen]);

  const handleConnect = () => {
    if (!url || !anonKey) {
      return;
    }

    Cookies.set(COOKIE_KEY, JSON.stringify({ url, anonKey }), { expires: 365 });
    setConnected(true);
  };

  const handleDisconnect = () => {
    Cookies.remove(COOKIE_KEY);
    setUrl('');
    setAnonKey('');
    setConnected(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3ECF8E] to-[#1a9e6a] flex items-center justify-center">
              <div className="i-simple-icons:supabase text-white text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">Connect Supabase</h2>
              <p className="text-xs text-bolt-elements-textSecondary">Link your database to your project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors p-1 rounded-lg hover:bg-bolt-elements-background-depth-3"
          >
            <div className="i-ph:x text-lg" />
          </button>
        </div>

        {connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="i-ph:check-circle-fill text-green-500 text-xl flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-400">Database connected</p>
                <p className="text-xs text-bolt-elements-textSecondary truncate max-w-[260px]">{url}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDisconnect}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-colors"
              >
                Disconnect
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bolt-elements-textSecondary mb-1.5">Project URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xxxx.supabase.co"
                className="w-full px-3 py-2.5 text-sm bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor rounded-xl text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-bolt-elements-textSecondary mb-1.5">
                Anon / Public Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2.5 text-sm bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor rounded-xl text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <p className="text-xs text-bolt-elements-textTertiary">
              Find these in your Supabase project under{' '}
              <a
                href="https://supabase.com/dashboard/project/_/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Settings → API
              </a>
            </p>

            <button
              onClick={handleConnect}
              disabled={!url || !anonKey}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Connect Database
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function useSupabaseConnection() {
  const saved = Cookies.get(COOKIE_KEY);

  if (saved) {
    try {
      return JSON.parse(saved) as { url: string; anonKey: string };
    } catch {}
  }

  return null;
}
