import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Menu, Delete, RotateCcw, Keyboard, Volume2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Copy, Trash2, Plus, Globe, Layers } from 'lucide-react';
import { useTranslation } from './i18n';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface WordConfig {
  id: string;
  title: string;
  description: string;
  language: string;
  dictionary: Record<string, string>;
  dictionaryLayer2?: Record<string, string>;
  dictionaryLayer3?: Record<string, string>;
  dictionaryLayer4?: Record<string, string>;
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
        flex-1 min-w-[24px] sm:min-w-[28px] h-8 sm:h-10 flex items-center justify-center rounded-[6px] border transition-all duration-150 select-none touch-none font-medium text-text
        ${isActive 
          ? isLongPressing 
            ? 'bg-border border-[#D5D5D5] scale-[0.92]' 
            : 'bg-surface border-border scale-[0.96]' 
          : 'bg-surface border-border shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5'
        }
      `}
    >
      <span className={`w-full truncate px-0.5 text-center ${symbol.length > 2 ? 'text-[10px] sm:text-[11px]' : symbol.length > 1 ? 'text-[12px] sm:text-[14px]' : 'text-[14px] sm:text-[16px]'}`}>{symbol}</span>
    </button>
  );
};

const DEFAULT_QUICK_SYMBOLS = ['.', ',', '!', '?', "'", ':', ';', '+', '-', '=', '(', ')', '%', '/'];

const DEFAULT_CONFIGS: WordConfig[] = [
  {
    id: 'default-1',
    title: 'English (Default)',
    description: 'Comprehensive daily conversational words',
    language: 'en-US',
    dictionary: {
      'UP': 'Yes', 'DOWN': 'No', 'LEFT': 'Hello', 'RIGHT': 'Thanks',
      'UP,UP': 'I', 'UP,DOWN': 'You', 'UP,LEFT': 'He', 'UP,RIGHT': 'She',
      'DOWN,UP': 'It', 'DOWN,DOWN': 'We', 'DOWN,LEFT': 'They', 'DOWN,RIGHT': 'What',
      'LEFT,UP': 'Where', 'LEFT,DOWN': 'When', 'LEFT,LEFT': 'Who', 'LEFT,RIGHT': 'Why',
      'RIGHT,UP': 'How', 'RIGHT,DOWN': 'Please', 'RIGHT,LEFT': 'Sorry', 'RIGHT,RIGHT': 'Help',
      'UP,UP,UP': 'want', 'UP,UP,DOWN': 'need', 'UP,UP,LEFT': 'like', 'UP,UP,RIGHT': 'love',
      'UP,DOWN,UP': 'go', 'UP,DOWN,DOWN': 'stop', 'UP,DOWN,LEFT': 'come', 'UP,DOWN,RIGHT': 'leave',
      'UP,LEFT,UP': 'good', 'UP,LEFT,DOWN': 'bad', 'UP,LEFT,LEFT': 'happy', 'UP,LEFT,RIGHT': 'sad',
      'UP,RIGHT,UP': 'big', 'UP,RIGHT,DOWN': 'small', 'UP,RIGHT,LEFT': 'hot', 'UP,RIGHT,RIGHT': 'cold',
      'DOWN,UP,UP': 'more', 'DOWN,UP,DOWN': 'less', 'DOWN,UP,LEFT': 'up', 'DOWN,UP,RIGHT': 'down',
      'DOWN,DOWN,UP': 'in', 'DOWN,DOWN,DOWN': 'out', 'DOWN,DOWN,LEFT': 'on', 'DOWN,DOWN,RIGHT': 'off',
      'DOWN,LEFT,UP': 'here', 'DOWN,LEFT,DOWN': 'there', 'DOWN,LEFT,LEFT': 'now', 'DOWN,LEFT,RIGHT': 'later',
      'DOWN,RIGHT,UP': 'today', 'DOWN,RIGHT,DOWN': 'tomorrow', 'DOWN,RIGHT,LEFT': 'yesterday', 'DOWN,RIGHT,RIGHT': 'time',
      'LEFT,UP,UP': 'food', 'LEFT,UP,DOWN': 'water', 'LEFT,UP,LEFT': 'eat', 'LEFT,UP,RIGHT': 'drink',
      'LEFT,DOWN,UP': 'toilet', 'LEFT,DOWN,DOWN': 'sleep', 'LEFT,DOWN,LEFT': 'tired', 'LEFT,DOWN,RIGHT': 'hurt',
      'LEFT,LEFT,UP': 'play', 'LEFT,LEFT,DOWN': 'work', 'LEFT,LEFT,LEFT': 'home', 'LEFT,LEFT,RIGHT': 'school',
      'LEFT,RIGHT,UP': 'mother', 'LEFT,RIGHT,DOWN': 'father', 'LEFT,RIGHT,LEFT': 'sister', 'LEFT,RIGHT,RIGHT': 'brother',
      'RIGHT,UP,UP': 'friend', 'RIGHT,UP,DOWN': 'family', 'RIGHT,UP,LEFT': 'doctor', 'RIGHT,UP,RIGHT': 'nurse',
      'RIGHT,DOWN,UP': 'yes please', 'RIGHT,DOWN,DOWN': 'no thanks', 'RIGHT,DOWN,LEFT': 'maybe', 'RIGHT,DOWN,RIGHT': "I don't know",
      'RIGHT,LEFT,UP': 'excuse me', 'RIGHT,LEFT,DOWN': 'look', 'RIGHT,LEFT,LEFT': 'listen', 'RIGHT,LEFT,RIGHT': 'wait',
      'RIGHT,RIGHT,UP': 'fast', 'RIGHT,RIGHT,DOWN': 'slow', 'RIGHT,RIGHT,LEFT': 'quiet', 'RIGHT,RIGHT,RIGHT': 'loud'
    }
  },
  {
    id: 'default-2',
    title: 'Türkçe',
    description: 'Temel günlük kelimeler',
    language: 'tr-TR',
    dictionary: {
      'UP': 'Merhaba',
      'DOWN': 'Nasılsın',
      'RIGHT': 'Evet',
      'LEFT': 'Hayır',
      'UP,UP': 'Teşekkürler'
    }
  }
];

export default function App() {
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  
  const [currentView, setCurrentView] = useState<'main' | 'configs' | 'settings'>(() => {
    return (localStorage.getItem('gw_currentView') as any) || 'main';
  });
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('gw_currentTheme') || 'theme-bone';
  });
  const [mode, setMode] = useState<'talk' | 'entry'>(() => {
    return (localStorage.getItem('gw_mode') as any) || 'talk';
  });
  const [inputStyle, setInputStyle] = useState<'step' | 'glide'>(() => {
    return (localStorage.getItem('gw_inputStyle') as any) || 'step';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<number>(1);
  const [editingLayer, setEditingLayer] = useState<number>(1);
  const [layerCount, setLayerCount] = useState<number>(() => {
    const saved = localStorage.getItem('gw_layerCount');
    return saved ? Math.max(2, parseInt(saved, 10)) : 2;
  });
  const [layerToggleEnabled, setLayerToggleEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('gw_layerToggleEnabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [layerTogglePosition, setLayerTogglePosition] = useState<'left' | 'right'>(() => {
    return (localStorage.getItem('gw_layerTogglePosition') as any) || 'right';
  });

  useEffect(() => {
    localStorage.setItem('gw_layerCount', layerCount.toString());
  }, [layerCount]);
  useEffect(() => {
    localStorage.setItem('gw_layerToggleEnabled', layerToggleEnabled.toString());
  }, [layerToggleEnabled]);
  useEffect(() => {
    localStorage.setItem('gw_layerTogglePosition', layerTogglePosition);
  }, [layerTogglePosition]);
  
  const [configs, setConfigs] = useState<WordConfig[]>(() => {
    const saved = localStorage.getItem('gw_configs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse configs', e);
      }
    }
    return DEFAULT_CONFIGS;
  });
  const [activeConfigId, setActiveConfigId] = useState<string>(() => {
    return localStorage.getItem('gw_activeConfigId') || 'default-1';
  });

  const activeConfig = configs.find(c => c.id === activeConfigId) || configs[0];

  useEffect(() => {
    document.body.className = currentTheme;
  }, [currentTheme]);
  const dictionary = activeLayer === 1 ? activeConfig.dictionary :
                     activeLayer === 2 ? (activeConfig.dictionaryLayer2 || {}) :
                     activeLayer === 3 ? (activeConfig.dictionaryLayer3 || {}) :
                     (activeConfig.dictionaryLayer4 || {});

  const [currentSequenceState, setCurrentSequenceState] = useState<Direction[]>([]);
  const currentSequenceRef = useRef<Direction[]>([]);
  const setCurrentSequence = (updater: React.SetStateAction<Direction[]>) => {
    const next = typeof updater === 'function' ? (updater as any)(currentSequenceRef.current) : updater;
    currentSequenceRef.current = next;
    setCurrentSequenceState(next);
  };
  const currentSequence = currentSequenceState;
  const [isEditingSymbols, setIsEditingSymbols] = useState(false);
  const [quickSymbols, setQuickSymbols] = useState<string[]>(() => {
    const saved = localStorage.getItem('gw_quickSymbols');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 13) {
          return [...parsed, '/'];
        }
        return parsed;
      } catch (e) { console.error('Failed to parse quick symbols', e); }
    }
    return DEFAULT_QUICK_SYMBOLS;
  });

  const [confirmedText, setConfirmedText] = useState<string[]>(() => {
    const saved = localStorage.getItem('gw_confirmedText');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse confirmedText', e);
      }
    }
    return [];
  });
  
  useEffect(() => { localStorage.setItem('gw_currentView', currentView); }, [currentView]);
  useEffect(() => { localStorage.setItem('gw_currentTheme', currentTheme); }, [currentTheme]);
  useEffect(() => { localStorage.setItem('gw_mode', mode); }, [mode]);
  useEffect(() => { localStorage.setItem('gw_inputStyle', inputStyle); }, [inputStyle]);
  useEffect(() => { localStorage.setItem('gw_configs', JSON.stringify(configs)); }, [configs]);
  useEffect(() => { localStorage.setItem('gw_activeConfigId', activeConfigId); }, [activeConfigId]);
  useEffect(() => { localStorage.setItem('gw_confirmedText', JSON.stringify(confirmedText)); }, [confirmedText]);
  useEffect(() => { localStorage.setItem('gw_quickSymbols', JSON.stringify(quickSymbols)); }, [quickSymbols]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isModalReady, setIsModalReady] = useState(false);
  const [newWord, setNewWord] = useState('');
  
  const [containerHeight, setContainerHeight] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isTyping) {
      setContainerHeight(`${window.innerHeight}px`);
    } else {
      const timer = setTimeout(() => setContainerHeight(undefined), 100);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);
  
  const [fontSizeLevel, setFontSizeLevel] = useState(1);
  const textAreaRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null);

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
  const lastWaypoint = useRef<{ x: number, y: number } | null>(null);
  const lastDirection = useRef<Direction | null>(null);
  const pointerTimeoutRef = useRef<number | null>(null);
  const currentPosRef = useRef<{ x: number, y: number } | null>(null);
  const isGlidePausedRef = useRef(false);
  const trailRef = useRef<SVGPolylineElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!e.isPrimary) {
      if (inputStyle === 'glide' && startPos.current) {
        isGlidePausedRef.current = true;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([30, 50, 30]);
        }
      }
      return;
    }
    
    if (pointerTimeoutRef.current) clearTimeout(pointerTimeoutRef.current);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    startPos.current = { x: e.clientX, y: e.clientY };
    lastWaypoint.current = { x: e.clientX, y: e.clientY };
    lastDirection.current = null;
    currentPosRef.current = { x: e.clientX, y: e.clientY };
    
    let isResuming = false;
    if (inputStyle === 'glide') {
      if (isGlidePausedRef.current) {
        isResuming = true;
        isGlidePausedRef.current = false;
      } else {
        setCurrentSequence([]);
      }
    }
    
    if (trailRef.current) {
      if (isResuming) {
        const pts = trailRef.current.getAttribute('points') || '';
        trailRef.current.setAttribute('points', pts + ` ${x},${y}`);
      } else {
        trailRef.current.setAttribute('points', `${x},${y}`);
      }
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
    
    currentPosRef.current = { x: e.clientX, y: e.clientY };
    
    if (trailRef.current) {
      const pts = trailRef.current.getAttribute('points') || '';
      trailRef.current.setAttribute('points', pts + ` ${x},${y}`);
    }

    if (inputStyle === 'glide') {
      if (pointerTimeoutRef.current) clearTimeout(pointerTimeoutRef.current);
      pointerTimeoutRef.current = window.setTimeout(() => {
        lastDirection.current = null;
        if (currentPosRef.current) {
          lastWaypoint.current = currentPosRef.current;
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(20);
        }
      }, 400);

      if (lastWaypoint.current) {
        const dx = e.clientX - lastWaypoint.current.x;
        const dy = e.clientY - lastWaypoint.current.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        
        if (absDx > 35 || absDy > 35) {
          let dir: Direction;
          if (absDx > absDy) {
            dir = dx > 0 ? 'RIGHT' : 'LEFT';
          } else {
            dir = dy > 0 ? 'DOWN' : 'UP';
          }
          
          if (dir !== lastDirection.current) {
            setCurrentSequence(prev => [...prev, dir]);
            lastDirection.current = dir;
            lastWaypoint.current = { x: e.clientX, y: e.clientY };
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(30);
            }
          }
        }
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    if (!startPos.current) return;
    
    if (pointerTimeoutRef.current) clearTimeout(pointerTimeoutRef.current);
    
    if (inputStyle === 'step') {
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
        handleStop(currentSequenceRef.current);
      }
    } else {
      if (!isGlidePausedRef.current) {
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          handleStop(currentSequenceRef.current);
        }
      }
    }
    
    if (!isGlidePausedRef.current && trailRef.current) {
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
      let arr = [...prev];
      if (arr.length > 0 && arr[arr.length - 1] === '') arr.pop();
      if (word.startsWith('-') && word.length > 1 && arr.length > 0) {
        const lastWord = arr[arr.length - 1];
        const suffix = word.slice(1);
        return [...arr.slice(0, -1), lastWord + suffix];
      }
      return [...arr, word];
    });
  };

  const addSymbol = (symbol: string, withSpace: boolean) => {
    setConfirmedText(prev => {
      let arr = [...prev];
      if (symbol.startsWith('-') && symbol.length > 1) {
        if (arr.length > 0 && arr[arr.length - 1] === '') arr.pop();
        if (arr.length > 0) {
          const lastWord = arr[arr.length - 1];
          const suffix = symbol.slice(1);
          return [...arr.slice(0, -1), lastWord + suffix];
        }
        return [symbol.slice(1)];
      }

      const isAttachedPunctuation = /^[.,!?:;%)]$/.test(symbol);
      
      if (!withSpace && isAttachedPunctuation) {
        if (arr.length > 0 && arr[arr.length - 1] === '') arr.pop();
        if (arr.length === 0) return [symbol];
        arr[arr.length - 1] = arr[arr.length - 1] + symbol;
        return arr;
      }

      if (arr.length > 0 && arr[arr.length - 1] === '') arr.pop();
      return [...arr, symbol];
    });
  };

  const handleStop = (sequenceToUse = currentSequenceRef.current) => {
    if (mode === 'talk') {
      const seqKey = sequenceToUse.join(',');
      const word = dictionary[seqKey] || 
        (sequenceToUse.length > 0 ? dictionary[sequenceToUse[sequenceToUse.length - 1]] : '');
      if (word) {
        appendWord(word);
      }
      setCurrentSequence([]);
    } else {
      if (sequenceToUse.length > 0) {
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
            ? { 
                ...c, 
                ...(activeLayer === 1 
                  ? { dictionary: { ...c.dictionary, [currentSequenceKey]: finalWord } }
                  : activeLayer === 2
                  ? { dictionaryLayer2: { ...(c.dictionaryLayer2 || {}), [currentSequenceKey]: finalWord } }
                  : activeLayer === 3
                  ? { dictionaryLayer3: { ...(c.dictionaryLayer3 || {}), [currentSequenceKey]: finalWord } }
                  : { dictionaryLayer4: { ...(c.dictionaryLayer4 || {}), [currentSequenceKey]: finalWord } }
                )
              }
            : c
        ));
        setCurrentSequence([]);
      }
    }
    setNewWord('');
    setIsSaving(false);
  };

  const speakText = (text: string) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = activeConfig.language || 'en-US';
      utterance.lang = targetLang;
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const exactMatch = voices.find(v => v.lang === targetLang || v.lang.replace('_', '-') === targetLang);
        const partialMatch = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
        if (exactMatch) {
          utterance.voice = exactMatch;
        } else if (partialMatch) {
          utterance.voice = partialMatch;
        }
      }

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

  useEffect(() => {
    if (isSaving) {
      setIsModalReady(false);
      const timer = setTimeout(() => setIsModalReady(true), 400);
      return () => clearTimeout(timer);
    } else {
      setIsModalReady(false);
    }
  }, [isSaving]);

  useLayoutEffect(() => {
    if (confirmedText.length < prevLengthRef.current) {
      setFontSizeLevel(1); // Reset on delete
    }
    prevLengthRef.current = confirmedText.length;
  }, [confirmedText.length]);

  useLayoutEffect(() => {
    if (isSaving && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSaving]);

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
      language: 'en-US',
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

  const handleUpdateDictionaryWord = (configId: string, layer: number, sequence: string, newWord: string) => {
    setConfigs(prev => prev.map(c => {
      if (c.id === configId) {
        if (layer === 1) {
          return { ...c, dictionary: { ...c.dictionary, [sequence]: newWord } };
        } else if (layer === 2) {
          return { ...c, dictionaryLayer2: { ...(c.dictionaryLayer2 || {}), [sequence]: newWord } };
        } else if (layer === 3) {
          return { ...c, dictionaryLayer3: { ...(c.dictionaryLayer3 || {}), [sequence]: newWord } };
        } else {
          return { ...c, dictionaryLayer4: { ...(c.dictionaryLayer4 || {}), [sequence]: newWord } };
        }
      }
      return c;
    }));
  };

  return (
    <div 
      className={`flex flex-col font-sans text-text overflow-hidden select-none transition-colors duration-500 ${currentTheme} ${mode === 'entry' ? 'bg-entry' : 'bg-canvas'}`}
      style={{ height: containerHeight || '100dvh' }}
    >
      
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
              <h2 className="text-xl font-sans tracking-tight pt-0.5 text-text font-semibold">{t('menu.title')}</h2>
            </div>
            
            <nav className="flex flex-col gap-2">
              <button onClick={() => { setCurrentView('main'); setIsMenuOpen(false); setEditingConfigId(null); }} className={`text-left px-4 py-3 font-medium rounded-md transition-colors tracking-wide ${currentView === 'main' ? 'bg-border/50 text-text' : 'text-muted hover:bg-border/30 hover:text-text'}`}>{t('menu.talkEntry')}</button>
              <button onClick={() => { setCurrentView('configs'); setIsMenuOpen(false); setEditingConfigId(null); }} className={`text-left px-4 py-3 font-medium rounded-md transition-colors tracking-wide ${currentView === 'configs' ? 'bg-border/50 text-text' : 'text-muted hover:bg-border/30 hover:text-text'}`}>{t('menu.configs')}</button>
              <button onClick={() => { setCurrentView('settings'); setIsMenuOpen(false); setEditingConfigId(null); }} className={`text-left px-4 py-3 font-medium rounded-md transition-colors tracking-wide ${currentView === 'settings' ? 'bg-border/50 text-text' : 'text-muted hover:bg-border/30 hover:text-text'}`}>{t('menu.settings')}</button>
              <button className="text-left px-4 py-3 text-muted font-medium hover:bg-border/30 hover:text-text rounded-md transition-colors tracking-wide">{t('menu.about')}</button>
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
          <h1 className="text-xl font-sans tracking-tight pt-0.5 text-text font-semibold">G&W</h1>
          
          {currentView === 'main' && (
            <div className="flex bg-surface border border-border rounded-lg p-0.5 ml-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <button
                onClick={() => { setInputStyle('step'); setCurrentSequence([]); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${inputStyle === 'step' ? 'bg-border text-text shadow-sm' : 'text-muted hover:text-text'}`}
              >
                {t('header.step')}
              </button>
              <button
                onClick={() => { setInputStyle('glide'); setCurrentSequence([]); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${inputStyle === 'glide' ? 'bg-border text-text shadow-sm' : 'text-muted hover:text-text'}`}
              >
                {t('header.glide')}
              </button>
            </div>
          )}
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
              {mode === 'talk' ? t('header.talkOn') : t('header.entryOn')}
            </button>
          </div>
        )}
      </header>

      {currentView === 'settings' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col gap-8 hide-scrollbar pb-24">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold tracking-tight text-text">{t('settings.appearance')}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { id: 'theme-bone', name: t('settings.themes.bone'), desc: t('settings.themes.boneDesc'), color: '#F7F6F3', border: '#EAEAEA' },
                { id: 'theme-oatmeal', name: t('settings.themes.oatmeal'), desc: t('settings.themes.oatmealDesc'), color: '#F9F8F6', border: '#E8E4D9' },
                { id: 'theme-slate', name: t('settings.themes.slate'), desc: t('settings.themes.slateDesc'), color: '#E2E8F0', border: '#CBD5E1' },
                { id: 'theme-sage', name: t('settings.themes.sage'), desc: t('settings.themes.sageDesc'), color: '#E3E8E3', border: '#C8D4C8' },
                { id: 'theme-charcoal', name: t('settings.themes.charcoal'), desc: t('settings.themes.charcoalDesc'), color: '#111111', border: '#333333' },
                { id: 'theme-midnight', name: t('settings.themes.midnight'), desc: t('settings.themes.midnightDesc'), color: '#0F172A', border: '#334155' },
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
            
            <div className="flex flex-col gap-4 mt-6">
              <h3 className="text-lg font-semibold tracking-tight text-text">{t('settings.uiLanguage')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableLanguages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`p-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${language === lang.code ? 'bg-surface border-text text-text shadow-sm' : 'bg-surface/50 border-border text-muted hover:border-[#D5D5D5] hover:text-text'}`}
                  >
                    <Globe className="w-4 h-4 opacity-50" />
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Layer Toggle Settings */}
            <div className="flex flex-col gap-4 mt-6">
              <h3 className="text-lg font-semibold tracking-tight text-text">Layer Toggle</h3>

              {/* Layer Count Slider */}
              <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text">Number of Layers</span>
                  <span className="text-[11px] text-muted">Up to 4 separate dictionaries</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setLayerCount(Math.max(2, layerCount - 1))}
                    disabled={layerCount <= 2}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-canvas border border-border text-text disabled:opacity-50"
                  >-</button>
                  <span className="text-sm font-bold w-4 text-center">{layerCount}</span>
                  <button 
                    onClick={() => setLayerCount(Math.min(4, layerCount + 1))}
                    disabled={layerCount >= 4}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-canvas border border-border text-text disabled:opacity-50"
                  >+</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
                <span className="text-sm font-medium text-text">Show Layer Toggle</span>
                <button
                  onClick={() => setLayerToggleEnabled(!layerToggleEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${layerToggleEnabled ? 'bg-text' : 'bg-border'}`}
                >
                  <div className={`w-5 h-5 bg-surface rounded-full shadow-sm absolute top-0.5 transition-transform duration-300 ${layerToggleEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {layerToggleEnabled && (
                <div className="flex bg-surface border border-border rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setLayerTogglePosition('left')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${layerTogglePosition === 'left' ? 'bg-border text-text shadow-sm' : 'text-muted hover:text-text'}`}
                  >
                    Left Side
                  </button>
                  <button
                    onClick={() => setLayerTogglePosition('right')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${layerTogglePosition === 'right' ? 'bg-border text-text shadow-sm' : 'text-muted hover:text-text'}`}
                  >
                    Right Side
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight text-text">{t('settings.quickSymbols')}</h3>
                <div className="flex items-center gap-2">
                  {isEditingSymbols && (
                    <button 
                      onClick={() => setQuickSymbols(DEFAULT_QUICK_SYMBOLS)}
                      className="text-xs font-medium px-3 py-1.5 rounded-md bg-canvas border border-border text-muted hover:text-text transition-colors"
                    >
                      {t('settings.reset')}
                    </button>
                  )}
                  <button 
                    onClick={() => setIsEditingSymbols(!isEditingSymbols)}
                    className="text-xs font-medium px-3 py-1.5 rounded-md bg-canvas border border-border text-text hover:bg-surface transition-colors"
                  >
                    {isEditingSymbols ? t('settings.done') : t('settings.edit')}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-7 gap-2">
                  {quickSymbols.slice(0, 7).map((sym, i) => (
                     <div key={i} className={`aspect-square flex items-center justify-center rounded-md shadow-sm overflow-hidden ${isEditingSymbols ? 'bg-surface border-2 border-border focus-within:border-text' : 'bg-surface border border-border'}`}>
                       {isEditingSymbols ? (
                         <input
                           maxLength={5}
                           value={sym}
                           onChange={(e) => {
                             const newSyms = [...quickSymbols];
                             newSyms[i] = e.target.value;
                             setQuickSymbols(newSyms);
                           }}
                           className="w-full h-full text-center bg-transparent outline-none text-text font-medium text-xs sm:text-sm"
                         />
                       ) : (
                         <span className={`text-text font-medium truncate px-1 w-full text-center ${sym.length > 2 ? 'text-[10px]' : sym.length > 1 ? 'text-xs' : 'text-sm'}`}>{sym}</span>
                       )}
                     </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {quickSymbols.slice(7, 14).map((sym, i) => (
                     <div key={i + 7} className={`aspect-square flex items-center justify-center rounded-md shadow-sm overflow-hidden ${isEditingSymbols ? 'bg-surface border-2 border-border focus-within:border-text' : 'bg-surface border border-border'}`}>
                       {isEditingSymbols ? (
                         <input
                           maxLength={5}
                           value={sym}
                           onChange={(e) => {
                             const newSyms = [...quickSymbols];
                             newSyms[i + 7] = e.target.value;
                             setQuickSymbols(newSyms);
                           }}
                           className="w-full h-full text-center bg-transparent outline-none text-text font-medium text-xs sm:text-sm"
                         />
                       ) : (
                         <span className={`text-text font-medium truncate px-1 w-full text-center ${sym.length > 2 ? 'text-[10px]' : sym.length > 1 ? 'text-xs' : 'text-sm'}`}>{sym}</span>
                       )}
                     </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : currentView === 'configs' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col gap-5 hide-scrollbar pb-24">
           {editingConfigId ? (() => {
             const config = configs.find(c => c.id === editingConfigId);
             if (!config) return null;
             return (
               <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                 <div className="flex items-center gap-3">
                   <button 
                     onClick={() => setEditingConfigId(null)}
                     className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface border border-transparent hover:border-border transition-colors text-muted hover:text-text"
                   >
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                   <div className="flex flex-col">
                     <h2 className="text-xl font-semibold text-text">{config.title}</h2>
                     <span className="text-sm text-muted">{t('configs.editMapped')}</span>
                   </div>
                 </div>
                 
                 {/* Configs Layer Toggle */}
                 {layerCount > 1 && (
                   <div className="flex bg-surface border border-border rounded-lg p-1 mx-auto w-full max-w-xs shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-4">
                     {Array.from({ length: layerCount }).map((_, i) => {
                       const layerNum = i + 1 as number;
                       return (
                         <button
                           key={layerNum}
                           onClick={() => setEditingLayer(layerNum)}
                           className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${editingLayer === layerNum ? 'bg-border text-text shadow-sm' : 'text-muted hover:text-text'}`}
                         >
                           Layer {layerNum}
                         </button>
                       );
                     })}
                   </div>
                 )}
                 
                 <div className="flex flex-col gap-3">
                   {Object.entries(
                     editingLayer === 1 ? config.dictionary :
                     editingLayer === 2 ? (config.dictionaryLayer2 || {}) :
                     editingLayer === 3 ? (config.dictionaryLayer3 || {}) :
                     (config.dictionaryLayer4 || {})
                   ).map(([sequence, word]) => {
                     const dirs = sequence.split(',');
                     return (
                       <div key={sequence} className="flex items-center gap-4 bg-surface border border-border p-3 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                         <div className="flex gap-1.5 p-1.5 bg-canvas rounded-md border border-border min-w-fit">
                           {dirs.map((dir, i) => {
                             const Icon = dir === 'UP' ? ArrowUp : dir === 'DOWN' ? ArrowDown : dir === 'LEFT' ? ArrowLeft : ArrowRight;
                             return (
                               <span key={i} className="p-1.5 rounded-sm bg-surface border border-border text-text">
                                 <Icon size={16} strokeWidth={2.5} />
                               </span>
                             );
                           })}
                         </div>
                         <input
                           type="text"
                           value={word}
                           onChange={(e) => handleUpdateDictionaryWord(config.id, editingLayer, sequence, e.target.value)}
                           className="flex-1 bg-transparent outline-none text-text font-medium placeholder:text-muted/40 px-2 text-lg"
                           placeholder={t('configs.typeWord')}
                         />
                       </div>
                     );
                   })}
                 </div>
               </div>
             );
           })() : (
             <>
               {configs.map(config => (
                 <div 
                   key={config.id} 
                   onClick={(e) => {
                     if ((e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('button')) return;
                     setEditingConfigId(config.id);
                   }}
                   className="bg-surface rounded-xl border border-border p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4 cursor-pointer hover:border-[#D5D5D5] transition-colors"
                 >
                   <div className="flex items-start justify-between gap-4">
                     <div className="flex-1 flex flex-col gap-1">
                        <input 
                          className="text-lg font-semibold text-text bg-transparent outline-none w-full placeholder:text-muted/40"
                          value={config.title}
                          onChange={e => handleUpdateConfig(config.id, { title: e.target.value })}
                          placeholder={t('configs.configTitle')}
                        />
                        <input 
                          className="text-sm text-muted bg-transparent outline-none w-full placeholder:text-muted/40 mb-1.5"
                          value={config.description}
                          onChange={e => handleUpdateConfig(config.id, { description: e.target.value })}
                          placeholder={t('configs.description')}
                        />
                        <select
                          value={config.language || 'en-US'}
                          onChange={e => handleUpdateConfig(config.id, { language: e.target.value })}
                          onClick={e => e.stopPropagation()}
                          className="bg-transparent border border-border text-xs text-muted font-medium rounded p-1 outline-none focus:border-text transition-colors w-fit"
                        >
                          <option value="en-US">English (US)</option>
                          <option value="en-GB">English (UK)</option>
                          <option value="en-AU">English (Australia)</option>
                          <option value="tr-TR">Türkçe</option>
                          <option value="es-ES">Español (España)</option>
                          <option value="es-MX">Español (México)</option>
                          <option value="fr-FR">Français (France)</option>
                          <option value="fr-CA">Français (Canada)</option>
                          <option value="de-DE">Deutsch</option>
                          <option value="it-IT">Italiano</option>
                          <option value="pt-BR">Português (Brasil)</option>
                          <option value="pt-PT">Português (Portugal)</option>
                          <option value="ru-RU">Русский</option>
                          <option value="zh-CN">中文 (简体)</option>
                          <option value="zh-TW">中文 (繁體)</option>
                          <option value="ja-JP">日本語</option>
                          <option value="ko-KR">한국어</option>
                          <option value="ar-SA">العربية</option>
                          <option value="hi-IN">हिन्दी</option>
                          <option value="nl-NL">Nederlands</option>
                          <option value="pl-PL">Polski</option>
                          <option value="sv-SE">Svenska</option>
                          <option value="da-DK">Dansk</option>
                          <option value="fi-FI">Suomi</option>
                          <option value="no-NO">Norsk</option>
                          <option value="el-GR">Ελληνικά</option>
                          <option value="hu-HU">Magyar</option>
                          <option value="cs-CZ">Čeština</option>
                          <option value="ro-RO">Română</option>
                          <option value="th-TH">ไทย</option>
                          <option value="id-ID">Bahasa Indonesia</option>
                          <option value="vi-VN">Tiếng Việt</option>
                        </select>
                     </div>
                     <button 
                       onClick={() => setActiveConfigId(config.id)}
                       className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${activeConfigId === config.id ? 'bg-text' : 'bg-border'}`}
                     >
                       <div className={`w-5 h-5 bg-surface rounded-full shadow-sm absolute transition-transform duration-300 ${activeConfigId === config.id ? 'translate-x-6' : 'translate-x-1'}`} />
                     </button>
                   </div>
                   <div className="flex justify-end gap-2 pt-3 border-t border-border">
                     <button 
                       onClick={() => handleDuplicateConfig(config)}
                       className="p-2 text-muted hover:text-text hover:bg-canvas rounded-md transition-colors"
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
                   {t('configs.createNew')}
                 </button>
               </>
             )}
         </div>
      ) : (
        <>
          {/* Text Area */}
      <div 
        className="w-full max-w-4xl mx-auto h-[25vh] min-h-[140px] sm:h-[240px] shrink-0 relative cursor-text group"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 100%)', maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 100%)' }}
        onPointerDown={(e) => {
          if (isTyping) {
            e.preventDefault();
          }
        }}
        onClick={() => {
          if (!isTyping) {
            setIsTyping(true);
            setTimeout(() => {
              const el = hiddenInputRef.current;
              if (el) {
                el.focus();
                el.setSelectionRange(el.value.length, el.value.length);
              }
            }, 10);
          }
        }}
      >
        <textarea
          ref={hiddenInputRef}
          className="absolute inset-0 opacity-0 z-10 w-full h-full resize-none pointer-events-none"
          value={confirmedText.join(' ')}
          onChange={(e) => {
            const val = e.target.value;
            setConfirmedText(val === '' ? [] : val.split(' '));
          }}
          onBlur={() => setIsTyping(false)}
          disabled={!isTyping}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <div 
          ref={textAreaRef}
          className="w-full h-full overflow-y-auto hide-scrollbar scroll-smooth relative z-0"
        >
          <div className="flex flex-wrap justify-center content-center min-h-full gap-x-4 gap-y-3 p-4 sm:p-8 pb-12 sm:pb-16 text-center">
            {confirmedText.map((word, i) => (
              <span key={i} className={`text-text ${fontClass} font-serif tracking-tight leading-[1.1] transition-all relative`}>
                {word === '' && i !== confirmedText.length - 1 ? '\u00A0' : word}
                {isTyping && i === confirmedText.length - 1 && (
                  <span className="absolute -right-[14px] top-0 bottom-0 flex items-center justify-center animate-pulse opacity-80">|</span>
                )}
              </span>
            ))}
            {isTyping && confirmedText.length === 0 && (
              <span className={`text-text ${fontClass} font-serif tracking-tight leading-[1.1] animate-pulse`}>
                |
              </span>
            )}
            {!isTyping && mode === 'talk' && previewWord && (
              <span className={`text-muted ${fontClass} font-serif tracking-tight leading-[1.1] opacity-60 transition-all`}>
                {previewWord}
              </span>
            )}
            {!isTyping && confirmedText.length === 0 && (!previewWord || mode === 'entry') && (
              <span className={`text-muted ${fontClass} font-serif tracking-tight leading-[1.1] opacity-30 pointer-events-none transition-all`}>
                {t('main.drafting')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Area (Swipe Area + Stop Area) */}
      <div className="flex-1 flex flex-col relative w-full items-center justify-center max-w-lg mx-auto min-h-0">
        
        {/* Swipe Area */}
        <div className="flex-1 min-h-0 w-full relative p-2 sm:p-8 flex items-center justify-center gap-4 sm:gap-6">
          {layerToggleEnabled && layerTogglePosition === 'left' && layerCount > 1 && (
            layerCount === 2 ? (
              <button 
                onClick={() => setActiveLayer(prev => prev === 1 ? 2 : 1)}
                className={`flex flex-col items-center justify-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-24 w-12 shrink-0 transition-all active:scale-[0.95] ${
                  activeLayer === 1 ? 'bg-text text-surface border border-transparent' : 'bg-surface text-text border-2 border-text'
                }`}
              >
                <span className="text-[12px] font-bold tracking-wider">L{activeLayer}</span>
              </button>
            ) : (
              <div className="flex flex-col items-center justify-between py-2 gap-1.5 bg-surface border border-border rounded-full p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] shrink-0 w-12 h-full max-h-[320px]">
                {Array.from({ length: layerCount }).map((_, i) => {
                  const layerNum = i + 1 as number;
                  return (
                    <button
                      key={layerNum}
                      onClick={() => setActiveLayer(layerNum)}
                      className={`w-full flex-1 flex items-center justify-center rounded-full transition-all active:scale-[0.95] ${
                        activeLayer === layerNum 
                          ? 'bg-text text-surface shadow-md' 
                          : 'bg-transparent text-muted hover:bg-canvas hover:text-text'
                      }`}
                    >
                      <span className="text-[11px] font-bold tracking-wider">L{layerNum}</span>
                    </button>
                  );
                })}
              </div>
            )
          )}
          <div className="relative w-full h-full max-w-[320px] max-h-[320px] flex items-center justify-center">
            {/* Sequence Status Indicator */}
            {currentSequence.length > 0 && (
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none z-20">
                {/* Preview Badge */}
                {mode === 'entry' && previewWord && (
                  <div className="text-[#9F2F2D] font-medium bg-[#FDEBEC] border border-[#FDEBEC] px-4 py-2 rounded-md text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] whitespace-nowrap">
                    {t('main.existing')} "{previewWord}"
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
                <span className="text-[10px] font-bold tracking-widest text-[#9F2F2D] uppercase">{t('main.mapping')}</span>
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
        {layerToggleEnabled && layerTogglePosition === 'right' && layerCount > 1 && (
          layerCount === 2 ? (
            <button 
              onClick={() => setActiveLayer(prev => prev === 1 ? 2 : 1)}
              className={`flex flex-col items-center justify-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-24 w-12 shrink-0 transition-all active:scale-[0.95] ${
                activeLayer === 1 ? 'bg-text text-surface border border-transparent' : 'bg-surface text-text border-2 border-text'
              }`}
            >
              <span className="text-[12px] font-bold tracking-wider">L{activeLayer}</span>
            </button>
          ) : (
            <div className="flex flex-col items-center justify-between py-2 gap-1.5 bg-surface border border-border rounded-full p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] shrink-0 w-12 h-full max-h-[320px]">
              {Array.from({ length: layerCount }).map((_, i) => {
                const layerNum = i + 1 as number;
                return (
                  <button
                    key={layerNum}
                    onClick={() => setActiveLayer(layerNum)}
                    className={`w-full flex-1 flex items-center justify-center rounded-full transition-all active:scale-[0.95] ${
                      activeLayer === layerNum 
                        ? 'bg-text text-surface shadow-md' 
                        : 'bg-transparent text-muted hover:bg-canvas hover:text-text'
                    }`}
                  >
                    <span className="text-[11px] font-bold tracking-wider">L{layerNum}</span>
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>
      {/* Punctuation Grid */}
      <div className="w-[calc(100%-2rem)] sm:w-[calc(100%-5rem)] mx-auto shrink-0 flex flex-col gap-1.5 mt-1 mb-1 sm:mb-2">
          <div className="flex w-full gap-1.5 justify-between">
            {quickSymbols.slice(0, 7).map(sym => (
              <PunctuationButton key={sym} symbol={sym} onAdd={addSymbol} />
            ))}
          </div>
          <div className="flex w-full gap-1.5 justify-between">
            {quickSymbols.slice(7, 14).map(sym => (
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
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase">{t('bottomBar.clear')}</span>
          </button>
          <button onClick={() => setConfirmedText(prev => prev.slice(0, -1))} className="flex flex-col items-center justify-center p-4 text-muted hover:text-text hover:bg-surface border border-transparent hover:border-border transition-all rounded-lg active:scale-[0.95]">
            <RotateCcw className="w-5 h-5 mb-2" strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase">{t('bottomBar.undo')}</span>
          </button>
          <button 
            onClick={() => {
              if (isTyping) {
                hiddenInputRef.current?.blur();
              } else {
                setIsTyping(true);
                setTimeout(() => {
                  const el = hiddenInputRef.current;
                  if (el) {
                    el.focus();
                    el.setSelectionRange(el.value.length, el.value.length);
                  }
                }, 10);
              }
            }} 
            className="flex flex-col items-center justify-center p-4 text-muted hover:text-text bg-surface border border-border shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all rounded-lg active:scale-[0.95]"
          >
            <Keyboard className="w-5 h-5 mb-2" strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase">{t('bottomBar.type')}</span>
          </button>
          <button onClick={() => speakText(confirmedText.join(' '))} className="flex flex-col items-center justify-center p-4 text-text bg-surface border border-border shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all rounded-lg active:scale-[0.95]">
            <Volume2 className="w-5 h-5 mb-2" strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-[0.05em] uppercase">{t('bottomBar.speak')}</span>
          </button>
        </div>
      )}

      {/* Save Word Modal Overlay */}
      {isSaving && (
        <div 
          className="fixed inset-0 z-[200] bg-text/10 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ pointerEvents: isModalReady ? 'auto' : 'none' }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              setIsSaving(false);
              setNewWord('');
            }
          }}
        >
          <div className="bg-surface border border-border rounded-xl p-8 w-full max-w-[360px] shadow-[0_8px_40px_rgba(0,0,0,0.06)] transform transition-transform animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-sans font-medium tracking-tight mb-6 text-text">
              {t('modal.mapAction')}
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
              ref={inputRef}
              autoCapitalize="none"
              className="w-full bg-canvas border border-border rounded-md outline-none py-3 px-4 mb-8 text-base font-medium text-text placeholder:text-muted focus:border-text focus:bg-surface transition-colors"
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              placeholder={t('modal.typeYourWord')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveWord();
              }}
            />
            
            <div className="flex justify-end gap-3">
              <button 
                className="px-5 py-2.5 text-muted text-sm font-medium hover:text-text transition-colors"
                onClick={() => {
                  setIsSaving(false);
                  setNewWord('');
                  setCurrentSequence([]);
                }}
              >
                {t('modal.cancel')}
              </button>
              <button 
                className="px-6 py-2.5 bg-text text-surface hover:bg-[#2F3437] rounded-md text-sm font-medium transition-all active:scale-[0.98]"
                onClick={handleSaveWord}
              >
                {t('modal.save')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
