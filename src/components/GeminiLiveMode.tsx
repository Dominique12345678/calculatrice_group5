import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, VolumeX, Calculator as CalcIcon, MessageSquare } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

interface GeminiLiveModeProps {
  onClose: () => void;
  onSwitchToChat: () => void;
}

const GeminiLiveMode: React.FC<GeminiLiveModeProps> = ({ onClose, onSwitchToChat }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  const startSession = async () => {
    try {
      setStatus('connecting');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "Tu es un assistant de calcul vocal. Aide l'utilisateur avec ses calculs de manière concise et amicale. Tu réponds uniquement par la voix.",
        },
        callbacks: {
          onopen: () => {
            setStatus('active');
            setIsActive(true);
            startMic();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64Data = message.serverContent.modelTurn.parts[0].inlineData.data;
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcmData = new Int16Array(bytes.buffer);
              audioQueue.current.push(pcmData);
              if (!isPlaying.current) {
                playNextInQueue();
              }
            }
            
            if (message.serverContent?.interrupted) {
              audioQueue.current = [];
              isPlaying.current = false;
            }

            if (message.serverContent?.modelTurn?.parts[0]?.text) {
                // Handle text if any (though we requested only audio)
            }
          },
          onclose: () => {
            stopSession();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setStatus('error');
          }
        }
      });
      
      sessionRef.current = session;
    } catch (err) {
      console.error("Failed to start session:", err);
      setStatus('error');
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted || !sessionRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({
          media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (err) {
      console.error("Mic access error:", err);
      setStatus('error');
    }
  };

  const playNextInQueue = () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) {
      isPlaying.current = false;
      return;
    }

    isPlaying.current = true;
    const pcmData = audioQueue.current.shift()!;
    const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 0x7FFF;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => playNextInQueue();
    source.start();
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('idle');
    
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    audioQueue.current = [];
    isPlaying.current = false;
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
      <div className="w-full flex justify-between items-center mb-8">
        <button 
          onClick={onSwitchToChat}
          className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 transition-colors"
        >
          <MessageSquare size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Gemini Live</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 transition-colors"
        >
          <CalcIcon size={20} />
        </button>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
        {/* Visualizer */}
        <div className="flex items-center justify-center gap-1 h-32 mb-8">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={status === 'active' ? {
                height: [20, Math.random() * 80 + 20, 20],
              } : { height: 4 }}
              transition={{
                repeat: Infinity,
                duration: 0.5 + Math.random() * 0.5,
                ease: "easeInOut"
              }}
              className={`w-1.5 rounded-full ${status === 'active' ? 'bg-indigo-500' : 'bg-zinc-800'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-white text-xl font-semibold">Prêt à parler ?</h3>
              <p className="text-zinc-500 text-sm max-w-[200px] mx-auto">
                Appuyez sur le bouton pour démarrer une session vocale avec l'IA.
              </p>
            </motion.div>
          )}

          {status === 'connecting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-zinc-400 text-sm">Connexion en cours...</p>
            </motion.div>
          )}

          {status === 'active' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <p className="text-indigo-400 font-medium">L'IA vous écoute...</p>
              <p className="text-zinc-500 text-xs italic">"Combien font 125 fois 8 ?"</p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-red-400 text-sm">Une erreur est survenue lors de la connexion.</p>
              <button 
                onClick={startSession}
                className="text-indigo-400 text-xs underline"
              >
                Réessayer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center gap-6">
        <button
          onClick={() => setIsMuted(!isMuted)}
          disabled={status !== 'active'}
          className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'} disabled:opacity-30`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button
          onClick={status === 'active' ? stopSession : startSession}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90
            ${status === 'active' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-500'}
          `}
        >
          {status === 'active' ? <X size={32} /> : <Mic size={32} />}
        </button>

        <button
          onClick={() => {}}
          className="p-4 bg-zinc-800 text-zinc-400 rounded-2xl hover:bg-zinc-700 transition-all opacity-30 cursor-not-allowed"
        >
          <Volume2 size={24} />
        </button>
      </div>
    </div>
  );
};

export default GeminiLiveMode;
