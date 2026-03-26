import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { SupabaseConnectModal, useSupabaseConnection } from './SupabaseConnectModal';

export function Header() {
  const chat = useStore(chatStore);
  const [supabaseOpen, setSupabaseOpen] = useState(false);
  const supabaseConnection = useSupabaseConnection();

  return (
    <header
      className={classNames('flex items-center px-4 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="i-ph:sidebar-simple-duotone text-xl" />
        <a href="/" className="text-2xl font-semibold text-accent flex items-center">
          <img src="/regrim-logo.svg" alt="Regrim" className="h-[60px] inline-block" />
        </a>
      </div>

      {chat.started && (
        <>
          <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="flex items-center gap-2">
                {/* Connect Database button */}
                <button
                  onClick={() => setSupabaseOpen(true)}
                  className={classNames(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                    supabaseConnection
                      ? 'text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/20'
                      : 'text-bolt-elements-textSecondary border-bolt-elements-borderColor hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/10',
                  )}
                >
                  <div
                    className={classNames(
                      'i-simple-icons:supabase text-sm',
                      supabaseConnection ? 'text-green-400' : '',
                    )}
                  />
                  {supabaseConnection ? 'Database connected' : 'Connect database'}
                </button>

                <HeaderActionButtons chatStarted={chat.started} />
              </div>
            )}
          </ClientOnly>
        </>
      )}

      <SupabaseConnectModal isOpen={supabaseOpen} onClose={() => setSupabaseOpen(false)} />
    </header>
  );
}
