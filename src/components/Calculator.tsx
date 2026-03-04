import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Delete, RotateCcw } from 'lucide-react';

interface CalculatorProps {
  onSwitchToAI: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onSwitchToAI }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const handleNumber = (num: string) => {
    if (isFinished) {
      setDisplay(num);
      setIsFinished(false);
    } else {
      setDisplay(prev => (prev === '0' ? num : prev + num));
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
    setIsFinished(false);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setIsFinished(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      const tokens = fullEquation.split(' ');
      if (tokens.length < 3) return;

      const a = parseFloat(tokens[0]);
      const op = tokens[1];
      const b = parseFloat(tokens[2]);

      let result = 0;
      switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '×': result = a * b; break;
        case '÷': 
          if (b === 0) {
            setDisplay('Erreur');
            setEquation('');
            setIsFinished(true);
            return;
          }
          result = a / b; 
          break;
      }

      setDisplay(result.toString());
      setEquation('');
      setIsFinished(true);
    } catch (e) {
      setDisplay('Erreur');
      setEquation('');
      setIsFinished(true);
    }
  };

  interface CalcButton {
    label: string;
    action: () => void;
    color: string;
    icon?: React.ReactNode;
    colSpan?: number;
    rowSpan?: number;
  }

  const buttons: CalcButton[] = [
    { label: 'C', action: handleClear, color: 'bg-red-500/20 text-red-400 hover:bg-red-500/30' },
    { label: '←', action: handleBackspace, color: 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700', icon: <Delete size={20} /> },
    { label: '÷', action: () => handleOperator('÷'), color: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' },
    { label: '×', action: () => handleOperator('×'), color: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' },
    { label: '7', action: () => handleNumber('7'), color: 'bg-zinc-800 text-white hover:bg-zinc-700' },
    { label: '8', action: () => handleNumber('8'), color: 'bg-zinc-800 text-white hover:bg-zinc-700' },
    { label: '9', action: () => handleNumber('9'), color: 'bg-zinc-800 text-white hover:bg-zinc-700' },
    { label: '-', action: () => handleOperator('-'), color: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' },
    { label: '4', action: () => handleNumber('4'), color: 'bg-zinc-800 text-white hover:bg-zinc-700' },
    { label: '5', action: () => handleNumber('5'), color: 'bg-zinc-800 text-white hover:bg-zinc-700' },
    { label: '6', action: () => handleNumber('6'), color: 'bg-zinc-800 text-white hover:bg-zinc-700' },
    { label: '+', action: () => handleOperator('+'), color: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' },
    { label: '1', action: () => handleNumber('1'), color: 'bg-zinc-800 text-white hover:bg-zinc-700' },
    { label: '2', action: () => handleNumber('2'), color: 'bg-zinc-800 text-white hover:bg-zinc-700' },
    { label: '3', action: () => handleNumber('3'), color: 'bg-zinc-800 text-white hover:bg-zinc-700' },
    { label: '=', action: calculate, color: 'bg-indigo-600 text-white hover:bg-indigo-500', rowSpan: 2 },
    { label: '0', action: () => handleNumber('0'), color: 'bg-zinc-800 text-white hover:bg-zinc-700', colSpan: 2 },
    { label: '.', action: () => handleNumber('.'), color: 'bg-zinc-800 text-white hover:bg-zinc-700' },
  ];

  return (
    <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-zinc-400 font-medium text-sm uppercase tracking-widest">Calculatrice</h2>
        <button 
          onClick={onSwitchToAI}
          className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-semibold rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
        >
          Mode IA
        </button>
      </div>

      <div className="mb-6 h-24 flex flex-col justify-end items-end px-4 py-2 bg-black/20 rounded-2xl overflow-hidden">
        <div className="text-zinc-500 text-sm h-6 font-mono">{equation}</div>
        <div className="text-white text-4xl font-bold tracking-tight truncate w-full text-right">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.action}
            className={`
              ${btn.color} 
              ${btn.colSpan ? `col-span-${btn.colSpan}` : ''}
              ${btn.rowSpan ? `row-span-${btn.rowSpan}` : ''}
              h-14 rounded-2xl font-semibold text-lg transition-all active:scale-95 flex items-center justify-center
            `}
          >
            {btn.icon || btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
