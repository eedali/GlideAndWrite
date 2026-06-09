import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Menu, Delete, RotateCcw, Keyboard, Volume2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Copy, Trash2, Plus } from 'lucide-react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface WordConfig {
  id: string;
  title: string;
  description: string;
  dictionary: Record<string, string>;
}

interface PunctuationButtonProps {
  symbol: string;
  onAdd: (sym: string, withSpace: boolean) => void;
}

const PunctuationButton: React.FC<PunctuationButtonProps> = ({ symbol, onAdd }) => {
  const [isActive, setIsActive] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); 
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsActive(true);
    setIsLongPressing(false);
    timerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 400);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (!isActive) return;
    setIsActive(false);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (isLongPressing) {
      onAdd(symbol, true);
    } else {
      onAdd(symbol, false);
    }
    setIsLongPressing(false);
  };

  const handlePointerLeave = () => {
    if (isActive) {
      setIsActive(false);
      setIsLongPressing(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className={`
        flex-1 min-w-[24px] sm:min-w-[28px] h-8 sm:h-10 flex items-center justify-center rounded-[6px] border transition-all duration-150 select-none touch-none font-medium text-text text-[14px] sm:text-[16px]
        ${isActive 
          ? isLongPressing 
            ? 'bg-border border-[#D5D5D5] scale-[0.92]' 
            : 'bg-surface border-border scale-[0.96]' 
          : 'bg-surface border-border shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5'
        }
      `}
    >
      {symbol}
    </button>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'main' | 'configs' | 'settings'>('main');
  const [currentTheme, setCurrentTheme] = useState('theme-bone');
  const [mode, setMode] = useState<'talk' | 'entry'>('talk');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [configs, setConfigs] = useState<WordConfig[]>([
    {
      id: 'default-1',
      title: 'Default Config',
      description: 'Basic daily conversational words',
      dictionary: {
        'UP': 'Merhaba',
        'DOWN': 'Nasılsın',
        'RIGHT': 'Evet',
        'LEFT': 'Hayır',
        'UP,UP': 'Teşekkürler'
      }
    }
  ]);
  const [activeConfigId, setActiveConfigId] = useState<string>('default-1');

  const activeConfig = configs.find(c => c.id === activeConfigId) || configs[0];

  useEffect(() => {
    document.body.className = currentTheme;
  }, [currentTheme]);
  const dictionary = activeConfig.dictionary;

  const [currentSequence, setCurrentSequence] = useState<Direction[]>([]);
  const [confirmedText, setConfirmedText] = useState<string[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [newWord, setNewWord] = useState('');
  
  const [fontSizeLevel, setFontSizeLevel] = useState(1);
  const textAreaRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  const currentSequenceKey = currentSequence.join(',');
  const previewWord = dictionary[currentSequenceKey] || 
    (mode === 'talk' && currentSequence.length > 0 ? dictionary[currentSequence[currentSequence.length - 1]] : '') || '';

  const getHint = (dir: Direction) => {
    const nextSeq = [...currentSequence, dir].join(',');
    if (dictionary[nextSeq]) return dictionary[nextSeq];
    if (dictionary[dir]) return dictionary[dir];
    return dir === 'UP' ? 'Up' : dir === 'DOWN' ? 'Down' : dir === 'LEFT' ? 'Left' : 'Right';
  };

  const startPos = useRef<{ x: number, y: number } | null>(null);
  const trailRef = useRef<SVGPolylineElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    startPos.current = { x: e.clientX, y: e.clientY };
    
    if (trailRef.current) {
      trailRef.current.setAttribute('points', `${x},${y}`);
      trailRef.current.style.opacity = '1';
      trailRef.current.style.transition = 'none';
    }
    
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!startPos.current || !e.isPrimary) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (trailRef.current) {
      const pts = trailRef.current.getAttribute('points') || '';
      trailRef.current.setAttribute('points', pts + ` ${x},${y}`);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!startPos.current || !e.isPrimary) return;
    
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    if (absDx > 30 || absDy > 30) {
      let dir: Direction;
      if (absDx > absDy) {
        dir = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        dir = dy > 0 ? 'DOWN' : 'UP';
      }
      setCurrentSequence(prev => [...prev, dir]);
    } else if (absDx < 10 && absDy < 10) {
      handleStop();
    }
    
    if (trailRef.current) {
      trailRef.current.style.transition = 'opacity 0.3s ease';
      trailRef.current.style.opacity = '0';
      setTimeout(() => {
        if (trailRef.current && trailRef.current.style.opacity === '0') {
          trailRef.current.setAttribute('points', '');
        }
      }, 300);
    }
    
    startPos.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const appendWord = (word: string) => {
    setConfirmedText(prev => {
      if (word.startsWith('-') && prev.length > 0) {
        const lastWord = prev[prev.length - 1];
        const suffix = word.slice(1);
        return [...prev.slice(0, -1), lastWord + suffix];
      }
      return [...prev, word];
    });
  };

  const addSymbol = (symbol: string, withSpace: boolean) => {
    setConfirmedText(prev => {
      if (withSpace || prev.length === 0) {
        return [...prev, symbol];
      }
      const newArr = [...prev];
      newArr[newArr.length - 1] = newArr[newArr.length - 1] + symbol;
      return newArr;
    });
  };

  const handleStop = () => {
    if (mode === 'talk') {
      if (previewWord) {
        appendWord(previewWord);
      }
      setCurrentSequence([]);
    } else {
      if (currentSequence.length > 0) {
        setIsSaving(true);
      }
    }
  };

  const handleSaveWord = () => {
    const finalWord = newWord.trim();
    if (finalWord) {
      if (isSaving) {
        setConfigs(prev => prev.map(c => 
          c.id === activeConfigId 
            ? { ...c, dictionary: { ...c.dictionary, [currentSequenceKey]: finalWord } }
            : c
        ));
        setCurrentSequence([]);
      } else if (isManualInput) {
        appendWord(finalWord);
      }
    }
    setNewWord('');
    setIsSaving(false);
    setIsManualInput(false);
  };

  const speakText = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Cihazınızda metin okuma özelliği desteklenmiyor.");
    }
  };

  // Add a fade in effect on mount
  useEffect(() => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  }, []);

  useLayoutEffect(() => {
    if (confirmedText.length < prevLengthRef.current) {
      setFontSizeLevel(1); // Reset on delete
    }
    prevLengthRef.current = confirmedText.length;
  }, [confirmedText.length]);

  useLayoutEffect(() => {
    if (!textAreaRef.current) return;
    const container = textAreaRef.current;
    const hasOverflow = container.scrollHeight > container.clientHeight + 2;
    
    if (hasOverflow && fontSizeLevel < 4) {
      setFontSizeLevel(prev => prev + 1);
    } else if (fontSizeLevel === 4) {
      container.scrollTop = container.scrollHeight;
    }
  }, [confirmedText, previewWord, fontSizeLevel]);

  const getFontSizeClass = () => {
    switch(fontSizeLevel) {
      case 1: return 'text-4xl sm:text-6xl';
      case 2: return 'text-3xl sm:text-5xl';
      case 3: return 'text-2xl sm:text-4xl';
      case 4: return 'text-xl sm:text-3xl';
      default: return 'text-4xl sm:text-6xl';
    }
  };
  const fontClass = getFontSizeClass();
  const handleAddConfig = () => {
    const newId = `config-${Date.now()}`;
    setConfigs(prev => [...prev, {
      id: newId,
      title: 'New Configuration',
      description: 'Custom word set',
      dictionary: {}
    }]);
  };

  const handleDeleteConfig = (id: string) => {
    if (configs.length <= 1) return; // Prevent deleting the last config
    setConfigs(prev => prev.filter(c => c.id !== id));
    if (activeConfigId === id) {
      const remaining = configs.filter(c => c.id !== id);
      setActiveConfigId(remaining[0].id);
    }
  };

  const handleDuplicateConfig = (config: WordConfig) => {
    const newId = `config-${Date.now()}`;
    setConfigs(prev => [...prev, {
      ...config,
      id: newId,
      title: `${config.title} (Copy)`
    }]);
  };

  const handleUpdateConfig = (id: string, updates: Partial<WordConfig>) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <div className={`flex flex-col h-[100dvh] font-sans text-text overflow-hidden select-none transition-colors duration-500 ${currentTheme} ${mode === 'entry' ? 'bg-entry' : 'bg-canvas'}`}>
      
      {/* Sidebar Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-text/10 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="relative w-64 h-full bg-surface border-r border-border shadow-[4px_0_24px_rgba(0,0,0,0.04)] flex flex-col p-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center gap-3 mb-10">
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded border border-border bg-surface flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.95] transition-transform"
              >
                <Menu className="w-5 h-5 text-[#2F3437]" strokeWidth={2.5} />
              </button>
              <h2 className="text-xl font-sans tracking-tight pt-0.5 text-text font-semibold">Menu</h2>
            </div>
            
            <nav className="flex flex-col gap-2">
              <button onClick={() => { setCurrentView('main'); setIsMenuOpen(false); }} className={`text-left px-4 py-3 font-medium rounded-md transition-colors tracking-wide ${currentView === 'main' ? 'bg-border/50 text-text' : 'text-muted hover:bg-border/30 hover:text-text'}`}>Talk / Entry</button>
              <button onClick={() => { setCurrentView('configs'); setIsMenuOpen(false); }} className={`text-left px-4 py-3 font-medium rounded-md transition-colors tracking-wide ${currentView === 'configs' ? 'bg-border/50 text-text' : 'text-muted hover:bg-border/30 hover:text-text'}`}>Configurations</button>
              <button onClick={() => { setCurrentView('settings'); setIsMenuOpen(false); }} className={`text-left px-4 py-3 font-medium rounded-md transition-colors tracking-wide ${currentView === 'settings' ? 'bg-border/50 text-text' : 'text-muted hover:bg-border/30 hover:text-text'}`}>Settings</button>
              <button className="text-left px-4 py-3 text-muted font-medium hover:bg-border/30 hover:text-text rounded-md transition-colors tracking-wide">About</button>
            </nav>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-none items-center justify-between px-6 py-5 bg-transparent z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            className="w-8 h-8 rounded border border-border bg-surface flex items-center justify-center active:scale-[0.95] transition-transform shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            onClick={() => setIsMenuOpen(true)}
          >
             <Menu className="w-5 h-5 text-[#2F3437]" strokeWidth={2.5} />
          </button>
          <h1 className="text-xl font-sans tracking-tight pt-0.5 text-text font-semibold">Glide & Write</h1>
        </div>
        {currentView === 'main' && (
          <div className="flex items-center gap-3">
            <button
              className={`px-5 py-2.5 rounded-md text-sm font-semibold tracking-wide transition-all border shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.98] ${
                mode === 'talk' 
                  ? 'bg-[#EDF3EC] text-[#346538] border-[#EDF3EC] hover:bg-[#E1EDE0]' 
                  : 'bg-[#FDEBEC] text-[#9F2F2D] border-[#FDEBEC] hover:bg-[#FAD4D6]'
              }`}
              onClick={() => {
                setMode(mode === 'talk' ? 'entry' : 'talk');
                setCurrentSequence([]); 
              }}
            >
              {mode === 'talk' ? 'Talk On' : 'Entry On'}
            </button>
          </div>
        )}
      </header>

      {currentView === 'settings' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col gap-8 hide-scrollbar pb-24">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold tracking-tight text-text">Appearance (Themes)</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { id: 'theme-bone', name: 'Bone', desc: 'Warm Light', color: '#F7F6F3', border: '#EAEAEA' },
                { id: 'theme-oatmeal', name: 'Oatmeal', desc: 'Cozy Editorial', color: '#F9F8F6', border: '#E8E4D9' },
                { id: 'theme-slate', name: 'Slate', desc: 'Cool Gray', color: '#E2E8F0', border: '#CBD5E1' },
                { id: 'theme-sage', name: 'Sage', desc: 'Botanic Light', color: '#E3E8E3', border: '#C8D4C8' },
                { id: 'theme-charcoal', name: 'Charcoal', desc: 'Soft Dark', color: '#111111', border: '#333333' },
                { id: 'theme-midnight', name: 'Midnight', desc: 'Deep Navy', color: '#0F172A', border: '#334155' },
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setCurrentTheme(theme.id)}
                  className={`flex flex-col items-start text-left p-4 rounded-xl border transition-all duration-200 active:scale-[0.98] relative overflow-hidden ${
                    currentTheme === theme.id 
                      ? 'border-text bg-surface shadow-sm' 
                      : 'border-border bg-surface/50 hover:bg-surface hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full shadow-inner" 
                      style={{ backgroundColor: theme.color, border: `1px solid ${theme.border}` }}
                    />
                    <span className={`text-sm font-semibold ${currentTheme === theme.id ? 'text-text' : 'text-muted'}`}>{theme.name}</span>
                  </div>
                  <span className="text-[11px] font-medium text-muted opacity-80">{theme.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : currentView === 'configs' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col gap-5 hide-scrollbar pb-24">
           {configs.map(config => (
             <div key={config.id} className="bg-surface rounded-xl border border-border p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                     <input 
                       className="text-lg font-semibold text-text bg-transparent outline-none w-full placeholder:text-muted/40"
                       value={config.title}
                       onChange={e => handleUpdateConfig(config.id, { title: e.target.value })}
                       placeholder="Configuration Title"
                     />
                     <input 
                       className="text-sm text-muted bg-transparent outline-none w-full placeholder:text-muted/40"
                       value={config.description}
                       onChange={e => handleUpdateConfig(config.id, { description: e.target.value })}
                       placeholder="Description..."
                     />
                  </div>
                  <button 
                    onClick={() => setActiveConfigId(config.id)}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${activeConfigId === config.id ? 'bg-text' : 'bg-border'}`}
                  >
                    <div className={`w-5 h-5 bg-surface rounded-full shadow-sm absolute transition-transform duration-300 ${activeConfigId === config.id ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#F5F5F5]">
                  <button 
                    onClick={() => handleDuplicateConfig(config)}
                    className="p-2 text-muted hover:text-text hover:bg-surface rounded-md transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {configs.length > 1 && (
                    <button 
                      onClick={() => handleDeleteConfig(config.id)}
                      className="p-2 text-muted hover:text-[#9F2F2D] hover:bg-[#FDEBEC] rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
             </div>
           ))}
           <button 
             onClick={handleAddConfig}
             className="w-full py-5 mt-2 border-2 border-dashed border-[#D5D5D5] rounded-xl flex items-center justify-center gap-2 text-muted font-medium hover:bg-surface hover:border-border hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:text-text transition-all active:scale-[0.98]"
           >
             <Plus className="w-5 h-5" />
             Create New Configuration
           </button>
        </div>
      ) : (
        <>
          {/* Text Area */}
      <div 
        className="w-full max-w-4xl mx-auto h-[25vh] min-h-[140px] sm:h-[240px] shrink-0 relative"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 100%)', maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 100%)' }}
      >
        <div 
          ref={textAreaRef}
          className="w-full h-full overflow-y-auto hide-scrollbar scroll-smooth"
        >
          <div className="flex flex-wrap justify-center content-center min-h-full gap-x-4 gap-y-3 p-4 sm:p-8 pb-12 sm:pb-16 text-center">
            {confirmedText.map((word, i) => (
              <span key={i} className={`text-text ${fontClass} font-serif tracking-tight leading-[1.1] transition-all`}>
                {word}
              </span>
            ))}
            {mode === 'talk' && previewWord && (
              <span className={`text-muted ${fontClass} font-serif tracking-tight leading-[1.1] opacity-60 transition-all`}>
                {previewWord}
              </span>
            )}
            {confirmedText.length === 0 && (!previewWord || mode === 'entry') && (
              <span className={`text-muted ${fontClass} font-serif tracking-tight leading-[1.1] opacity-30 pointer-events-none transition-all`}>
                Drafting...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Area (Swipe Area + Stop Area) */}
      <div className="flex-1 flex flex-col relative w-full items-center justify-center max-w-lg mx-auto min-h-0">
        
        {/* Swipe Area */}
        <div className="flex-1 min-h-0 w-full relative p-2 sm:p-8 flex items-center justify-center">
          <div className="relative w-full h-full max-w-[320px] max-h-[320px] flex items-center justify-center">
            {/* Sequence Status Indicator */}
            {currentSequence.length > 0 && (
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none z-20">
                {/* Preview Badge */}
                {mode === 'entry' && previewWord && (
                  <div className="text-[#9F2F2D] font-medium bg-[#FDEBEC] border border-[#FDEBEC] px-4 py-2 rounded-md text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] whitespace-nowrap">
                    Existing: "{previewWord}"
                  </div>
                )}
                
                {/* Arrows Container */}
                <div className="flex gap-1.5 p-1.5 bg-surface rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-border">
                  {currentSequence.map((dir, i) => {
                    const Icon = dir === 'UP' ? ArrowUp : dir === 'DOWN' ? ArrowDown : dir === 'LEFT' ? ArrowLeft : ArrowRight;
                    return (
                      <span key={i} className={`p-1.5 rounded-sm ${mode === 'entry' ? 'bg-[#FDEBEC] text-[#9F2F2D]' : 'bg-[#EDF3EC] text-[#346538]'}`}>
                        <Icon size={16} strokeWidth={2.5} />
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Swipe Box */}
            <div 
              className={`aspect-square h-full max-w-full relative bg-surface border rounded-[16px] touch-none flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ${
                mode === 'entry'
                  ? 'border-[#FDEBEC] shadow-[0_4px_32px_rgba(159,47,45,0.08)] bg-[#FDFBFB]'
                  : 'border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_32px_rgba(0,0,0,0.04)]'
              }`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
            {/* Entry Mode Recording Indicator */}
            {mode === 'entry' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center gap-2 bg-[#FDEBEC]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#FDEBEC] pointer-events-none transition-opacity duration-300 animate-in fade-in shadow-[0_4px_12px_rgba(159,47,45,0.12)]">
                <div className="w-2 h-2 rounded-full bg-[#9F2F2D] animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-[#9F2F2D] uppercase">Mapping</span>
              </div>
            )}
            {/* Background Hint Graphics */}
            <div className="absolute inset-0 pointer-events-none text-muted/40">
              <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[11px] font-medium tracking-wide">{getHint('UP')}</span>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-medium tracking-wide">{getHint('DOWN')}</span>
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[11px] font-medium tracking-wide">{getHint('LEFT')}</span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[11px] font-medium tracking-wide">{getHint('RIGHT')}</span>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <ArrowUp strokeWidth={2.5} className="absolute top-0 w-5 h-5 text-muted" />
                  <ArrowDown strokeWidth={2.5} className="absolute bottom-0 w-5 h-5 text-muted" />
                  <ArrowLeft strokeWidth={2.5} className="absolute left-0 w-5 h-5 text-muted" />
                  <ArrowRight strokeWidth={2.5} className="absolute right-0 w-5 h-5 text-muted" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#787774]" />
                </div>
              </div>
            </div>

            {/* Live Swipe Trail */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <polyline 
                ref={trailRef}
                points="" 
                fill="none" 
                stroke={mode === 'entry' ? "#9F2F2D" : "#346538"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
              />
            </svg>
          </div>
        </div>
      </div>
        {/* Punctuation Grid */}
        <div className="w-[calc(100%-2rem)] sm:w-[calc(100%-5rem)] mx-auto shrink-0 flex flex-col gap-1.5 mt-1 mb-1 sm:mb-2">
          <div className="flex w-full gap-1.5 justify-between">
            {['.', ',', '!', '?', "'", ':', ';'].map(sym => (
              <PunctuationButton key={sym} symbol={sym} onAdd={addSymbol} />
            ))}
          </div>
          <div className="flex w-full gap-1.5 justify-between px-[3%]">
            {['+', '-', '=', '(', ')', '%'].map(sym => (
              <PunctuationButton key={sym} symbol={sym} onAdd={addSymbol} />
            ))}
          </div>
        </div>
      </div>
      </>
      )}

      {/* Bottom Bar */}
      {currentView === 'main' && (
        <div className="shrink-0 max-w-4xl mx-auto w-full grid grid-cols-4 px-4 sm:px-6 py-4 sm:py-6 border-t border-border bg-transparent relative z-20 pb-safe gap-2 sm:gap-4">
          <button onClick={() => setConfirmedText([])} className="flex flex-col items-center justify-center p-3 sm:p-4 text-muted hover:text-text hover:bg-surface border border-transparent hover:border-border transition-all rounded-lg active:scale-[0.95]">
            <Delete className="w-5 h-5 mb-2" strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase">Clear</span>
          </button>
          <button onClick={() => setConfirmedText(prev => prev.slice(0, -1))} className="flex flex-col items-center justify-center p-4 text-muted hover:text-text hover:bg-surface border border-transparent hover:border-border transition-all rounded-lg active:scale-[0.95]">
            <RotateCcw className="w-5 h-5 mb-2" strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase">Undo</span>
          </button>
          <button onClick={() => setIsManualInput(true)} className="flex flex-col items-center justify-center p-4 text-muted hover:text-text hover:bg-surface border border-transparent hover:border-border transition-all rounded-lg active:scale-[0.95]">
            <Keyboard className="w-5 h-5 mb-2" strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase">Type</span>
          </button>
          <button onClick={() => speakText(confirmedText.join(' '))} className="flex flex-col items-center justify-center p-4 text-text bg-surface border border-border shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all rounded-lg active:scale-[0.95]">
            <Volume2 className="w-5 h-5 mb-2" strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase">Speak</span>
          </button>
        </div>
      )}

      {/* Save Word / Keyboard Modal Overlay */}
      {(isSaving || isManualInput) && (
        <div 
          className="fixed inset-0 z-[200] bg-text/10 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => {
            setIsSaving(false);
            setIsManualInput(false);
            setNewWord('');
          }}
        >
          <div className="bg-surface border border-border rounded-xl p-8 w-full max-w-[360px] shadow-[0_8px_40px_rgba(0,0,0,0.06)] transform transition-transform animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-sans font-medium tracking-tight mb-6 text-text">
              {isSaving ? 'Map Action' : 'Enter Word'}
            </h3>
            
            {isSaving && currentSequence.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 items-center border-b border-border pb-6">
                {currentSequence.map((dir, i) => {
                  const Icon = dir === 'UP' ? ArrowUp : dir === 'DOWN' ? ArrowDown : dir === 'LEFT' ? ArrowLeft : ArrowRight;
                  return (
                    <span key={i} className="p-2 bg-[#FDEBEC] rounded-md text-[#9F2F2D] border border-[#FDEBEC]/50">
                      <Icon size={16} strokeWidth={2.5} />
                    </span>
                  );
                })}
              </div>
            )}
            
            <input 
              type="text" 
              autoFocus
              className="w-full bg-canvas border border-border rounded-md outline-none py-3 px-4 mb-8 text-base font-medium text-text placeholder:text-muted focus:border-text focus:bg-surface transition-colors"
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              placeholder="Type your word..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveWord();
              }}
            />
            
            <div className="flex justify-end gap-3">
              <button 
                className="px-5 py-2.5 text-muted text-sm font-medium hover:text-text transition-colors"
                onClick={() => {
                  setIsSaving(false);
                  setIsManualInput(false);
                  setNewWord('');
                  setCurrentSequence([]);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2.5 bg-text text-surface hover:bg-[#2F3437] rounded-md text-sm font-medium transition-all active:scale-[0.98]"
                onClick={handleSaveWord}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
