import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Calculator from './components/Calculator';
import AIMode from './components/AIMode';
import GeminiLiveMode from './components/GeminiLiveMode';

export default function App() {
  const [mode, setMode] = useState<'normal' | 'ai' | 'live'>('normal');

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans selection:bg-indigo-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full flex justify-center">
        <AnimatePresence mode="wait">
          {mode === 'normal' && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full flex justify-center"
            >
              <Calculator onSwitchToAI={() => setMode('ai')} />
            </motion.div>
          )}

          {mode === 'ai' && (
            <motion.div
              key="ai-mode"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full flex justify-center"
            >
              <AIMode onSwitchToNormal={() => setMode('normal')} />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => setMode('live')}
                  className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-all active:scale-90"
                  title="Mode Live Voice"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                  </motion.div>
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'live' && (
            <motion.div
              key="live-mode"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full flex justify-center"
            >
              <GeminiLiveMode 
                onClose={() => setMode('normal')} 
                onSwitchToChat={() => setMode('ai')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <div className="fixed bottom-6 left-0 right-0 text-center">
        <p className="text-zinc-600 text-xs font-medium tracking-widest uppercase">
          Modern Calc & AI Assistant
        </p>
      </div>
    </div>
  );
}
