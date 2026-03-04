import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, RotateCcw, Calculator as CalcIcon } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface AIModeProps {
  onSwitchToNormal: () => void;
}

const AIMode: React.FC<AIModeProps> = ({ onSwitchToNormal }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Bonjour ! Je suis votre assistant de calcul. Quel est le premier nombre ?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0); // 0: first num, 1: op, 2: second num, 3: result/restart
  const [data, setData] = useState({ num1: 0, op: '', num2: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    addMessage(userText, 'user');
    setInput('');

    setTimeout(() => {
      processStep(userText);
    }, 600);
  };

  const processStep = (text: string) => {
    if (step === 0) {
      const val = parseFloat(text);
      if (isNaN(val)) {
        addMessage("Désolé, ce n'est pas un nombre valide. Quel est le premier nombre ?", 'bot');
      } else {
        setData(prev => ({ ...prev, num1: val }));
        setStep(1);
        addMessage("Parfait. Quelle opération voulez-vous faire ? (+, -, *, /)", 'bot');
      }
    } else if (step === 1) {
      const validOps = ['+', '-', '*', '/', 'x', '÷'];
      const op = text.toLowerCase();
      if (!validOps.includes(op)) {
        addMessage("Opération non reconnue. Choisissez entre +, -, *, /", 'bot');
      } else {
        const normalizedOp = op === 'x' ? '*' : op === '÷' ? '/' : op;
        setData(prev => ({ ...prev, op: normalizedOp }));
        setStep(2);
        addMessage("Entendu. Quel est le deuxième nombre ?", 'bot');
      }
    } else if (step === 2) {
      const val = parseFloat(text);
      if (isNaN(val)) {
        addMessage("Désolé, ce n'est pas un nombre valide. Quel est le deuxième nombre ?", 'bot');
      } else {
        const num2 = val;
        const { num1, op } = data;
        let result: number | string = 0;
        
        switch (op) {
          case '+': result = num1 + num2; break;
          case '-': result = num1 - num2; break;
          case '*': result = num1 * num2; break;
          case '/': 
            if (num2 === 0) result = "Erreur (division par zéro)";
            else result = num1 / num2;
            break;
        }

        const opSymbol = op === '*' ? '×' : op === '/' ? '÷' : op;
        addMessage(`Le résultat de ${num1} ${opSymbol} ${num2} est ${result}`, 'bot');
        setStep(3);
        setTimeout(() => {
          addMessage("Voulez-vous faire un autre calcul ? (Oui pour recommencer)", 'bot');
        }, 800);
      }
    } else if (step === 3) {
      if (text.toLowerCase().includes('oui')) {
        setStep(0);
        setData({ num1: 0, op: '', num2: 0 });
        addMessage("C'est reparti ! Quel est le premier nombre ?", 'bot');
      } else {
        addMessage("D'accord. Je reste à votre disposition si besoin.", 'bot');
      }
    }
  };

  return (
    <div className="w-full max-w-md h-[550px] bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Assistant IA</h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">En ligne</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onSwitchToNormal}
          className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 transition-colors"
          title="Mode Standard"
        >
          <CalcIcon size={18} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-700"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] p-3 rounded-2xl text-sm
                ${msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5'}
              `}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Écrivez ici..."
          className="w-full bg-zinc-800/50 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
        <button
          onClick={handleSend}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors active:scale-90"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default AIMode;
