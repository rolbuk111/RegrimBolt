import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { SupabaseConnection } from '~/components/chat/SupabaseConnection';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header className="flex items-center px-5 border-b border-bolt-elements-borderColor h-[var(--header-height)] bg-white dark:bg-gray-950">
      <div className="flex items-center gap-3 z-logo">
        <div className="i-ph:sidebar-simple-duotone text-lg text-bolt-elements-textSecondary cursor-pointer hover:text-bolt-elements-textPrimary transition-colors" />
        <a href="/" className="flex items-center">
          <img src="/regrim-logo.svg" alt="Regrim" className="h-[36px] inline-block" />
        </a>
      </div>
      <a
        href="https://regrim.com/dashboard"
        className="ml-4 text-xs font-medium px-3 py-1.5 rounded-full border border-bolt-elements-borderColor text-bolt-elements-textSecondary hover:border-[#2563eb] hover:text-[#2563eb] transition-all duration-200"
      >
        Dashboard
      </a>
      {chat.started && (
        <>
          <span className="flex-1 px-4 truncate text-center text-sm text-bolt-elements-textSecondary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="flex items-center gap-2">
                <SupabaseConnection />
                <HeaderActionButtons chatStarted={chat.started} />
              </div>
            )}
          </ClientOnly>
        </>
      )}
    </header>
  );
}
