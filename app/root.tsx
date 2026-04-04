import { useStore } from '@nanostores/react';
import type { LinksFunction } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import { themeStore } from './lib/stores/theme';
import { stripIndents } from './utils/stripIndent';
import { createHead } from 'remix-island';
import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ClientOnly } from 'remix-utils/client-only';
import { cssTransition, ToastContainer } from 'react-toastify';

import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './styles/index.scss?url';
import xtermStyles from '@xterm/xterm/css/xterm.css?url';

import 'virtual:uno.css';

const toastAnimation = cssTransition({
  enter: 'animated fadeInRight',
  exit: 'animated fadeOutRight',
});

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: xtermStyles },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('bolt_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export const Head = createHead(() => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Meta />
    <Links />
    <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
  </>
));

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useStore(themeStore);

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <ClientOnly>{() => <DndProvider backend={HTML5Backend}>{children}</DndProvider>}</ClientOnly>
      <ToastContainer
        closeButton={({ closeToast }) => {
          return (
            <button className="Toastify__close-button" onClick={closeToast}>
              <div className="i-ph:x text-lg" />
            </button>
          );
        }}
        icon={({ type }) => {
          switch (type) {
            case 'success': {
              return <div className="i-ph:check-bold text-bolt-elements-icon-success text-2xl" />;
            }
            case 'error': {
              return <div className="i-ph:warning-circle-bold text-bolt-elements-icon-error text-2xl" />;
            }
          }

          return undefined;
        }}
        position="bottom-right"
        pauseOnFocusLoss
        transition={toastAnimation}
        autoClose={3000}
      />
      <ScrollRestoration />
      <Scripts />
    </>
  );
}

import { logStore } from './lib/stores/logs';
import { initializeNetlifyConnection } from './lib/stores/netlify';
import { DeploySuccessModal } from './components/deploy/DeploySuccessModal';

const SUPABASE_URL = 'https://ltqzknbiymcgqshiyazg.supabase.co';

const REGRIM_HOME = 'https://regrim.com';

async function exchangeAuthToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-builder-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      console.warn('[Auth] Token verification failed:', response.status);
      return false;
    }

    const data = (await response.json()) as { user?: { id: string; email: string; metadata?: unknown } };
    const { user } = data;

    if (user) {
      localStorage.setItem('regrim_user', JSON.stringify(user));
      console.log('[Auth] User authenticated:', user.email);

      return true;
    }

    return false;
  } catch (error) {
    console.warn('[Auth] Token exchange error:', error);
    return false;
  } finally {
    // Always remove token from URL regardless of outcome
    const url = new URL(window.location.href);
    url.searchParams.delete('auth_token');
    window.history.replaceState({}, '', url.toString());
  }
}

function redirectToHome() {
  window.location.href = REGRIM_HOME;
}

export default function App() {
  const theme = useStore(themeStore);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get('auth_token');

    if (authToken) {
      // Incoming from regrim.com — exchange token first
      exchangeAuthToken(authToken).then((success) => {
        if (!success) {
          redirectToHome();
        }
      });
    } else {
      // No token in URL — check if already authenticated
      const user = localStorage.getItem('regrim_user');

      if (!user) {
        redirectToHome();
        return;
      }

      // Redirect to most recent chat if on home page
      if (window.location.pathname === '/') {
        import('~/lib/persistence/db').then(async ({ openDatabase, getAll }) => {
          const database = await openDatabase();

          if (!database) {
            return;
          }

          const chats = await getAll(database);

          if (chats.length > 0) {
            // Sort by timestamp descending, pick most recent
            const latest = chats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            window.location.href = `/chat/${latest.urlId || latest.id}`;
          }
        });
      }
    }

    initializeNetlifyConnection();

    logStore.logSystem('Application initialized', {
      theme,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    // Initialize debug logging with improved error handling
    import('./utils/debugLogger')
      .then(({ debugLogger }) => {
        /*
         * The debug logger initializes itself and starts disabled by default
         * It will only start capturing when enableDebugMode() is called
         */
        const status = debugLogger.getStatus();
        logStore.logSystem('Debug logging ready', {
          initialized: status.initialized,
          capturing: status.capturing,
          enabled: status.enabled,
        });
      })
      .catch((error) => {
        logStore.logError('Failed to initialize debug logging', error);
      });
  }, []);

  return (
    <Layout>
      <Outlet />
      <ClientOnly>{() => <DeploySuccessModal />}</ClientOnly>
    </Layout>
  );
}
