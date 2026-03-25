import { useStore } from '@nanostores/react';
import { motion, AnimatePresence } from 'framer-motion';
import { deploySuccessUrl } from '~/lib/stores/deploySuccess';

export function DeploySuccessModal() {
  const url = useStore(deploySuccessUrl);

  if (!url) {
    return null;
  }

  const handleClose = () => deploySuccessUrl.set(null);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#111] shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600" />

          <div className="p-8 flex flex-col items-center gap-5 text-center">
            {/* Icon */}
            <motion.div
              className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-3xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            >
              🌍
            </motion.div>

            {/* Heading */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your website is live!</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                It's published and accessible to anyone on the internet.
              </p>
            </div>

            {/* QR Code */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}&color=1d4ed8&bgcolor=ffffff&margin=10&qzone=1`}
                alt="QR code to your website"
                className="w-40 h-40 rounded-xl border border-gray-200 dark:border-white/10"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">Scan to open on your phone</p>
            </motion.div>

            {/* URL pill */}
            <div className="w-full flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3">
              <div className="i-ph:globe w-4 h-4 text-gray-400 shrink-0" />
              <span className="flex-1 text-sm font-mono text-gray-700 dark:text-gray-300 truncate text-left">
                {url.replace(/^https?:\/\//, '')}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(url);
                }}
                className="shrink-0 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                title="Copy link"
              >
                <div className="i-ph:copy w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <div className="i-ph:arrow-square-out w-4 h-4" />
                Visit Site
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
