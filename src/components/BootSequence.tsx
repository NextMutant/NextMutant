import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

interface BootSequenceProps {
  onComplete: () => void;
}

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'critical' | 'progress' | 'header'; progress?: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const bootScript = [
    { text: "SHAAN10_OS [Version 1.0.4.2024]", type: 'header' as const },
    { text: "(C) 2024 SHAAN10. ALL RIGHTS RESERVED.", type: 'header' as const },
    { text: " ", type: 'info' as const },
    { text: "BIOS_DATE: 03/15/2024", type: 'info' as const },
    { text: "CPU_CORE: 0x8F92A (Active)", type: 'info' as const },
    { text: "MEM_TEST: 65536KB OK", type: 'info' as const },
    { text: " ", type: 'info' as const },
    { text: "Initializing boot sequence...", type: 'info' as const },
    { text: "Mounting remote_modules...", type: 'progress' as const },
    { text: "Establishing secure_handshake...", type: 'progress' as const },
    { text: "Loading neural_assets...", type: 'progress' as const },
    { text: "Checking system_integrity...", type: 'success' as const },
    { text: "Starting terminal_interface...", type: 'info' as const },
    { text: "WELCOME TO SHAAN10 // PORTFOLIO_v1.0.4", type: 'success' as const },
    { text: " ", type: 'info' as const },
    { text: "AUTHENTICATED: USER_TERMINAL_01", type: 'success' as const },
  ];

  useEffect(() => {
    let currentIdx = 0;
    
    const processNext = async () => {
      if (currentIdx >= bootScript.length) {
        setTimeout(() => {
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.05,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: onComplete
          });
        }, 1000);
        return;
      }

      const item = bootScript[currentIdx];
      
      if (item.type === 'progress') {
        // Handle progress lines with a simulated load
        let p = 0;
        const lineIdx = lines.length;
        setLines(prev => [...prev, { ...item, progress: 0 }]);
        
        const updateProgress = () => {
          if (p < 100) {
            p += Math.random() * 25;
            if (p > 100) p = 100;
            setLines(prev => {
              const newLines = [...prev];
              newLines[lineIdx] = { ...item, progress: p };
              return newLines;
            });
            setTimeout(updateProgress, Math.random() * 150 + 50);
          } else {
            currentIdx++;
            setTimeout(processNext, 100);
          }
        };
        updateProgress();
      } else {
        // Normal lines
        setLines(prev => [...prev, item]);
        currentIdx++;
        setTimeout(processNext, Math.random() * 200 + 50);
      }
    };

    processNext();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-[100] p-6 md:p-12 flex flex-col font-mono text-[10px] sm:text-xs md:text-sm overflow-hidden"
    >
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[110] bg-[length:100%_2px,3px_100%]" />
      
      <div className="flex-1 space-y-1 relative z-[105]">
        {lines.map((line, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            {line.type === 'header' ? (
              <div className="text-terminal-text font-bold tracking-widest opacity-90">{line.text}</div>
            ) : line.type === 'progress' ? (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center w-full max-w-md">
                  <span className="text-terminal-text/70">{line.text}</span>
                  <span className="text-terminal-accent">{Math.floor(line.progress || 0)}%</span>
                </div>
                <div className="h-1 w-full max-w-md bg-white/5 border border-white/10 relative overflow-hidden">
                  <div 
                    className="absolute h-full bg-terminal-accent transition-all duration-200"
                    style={{ width: `${line.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className={`
                ${line.type === 'success' ? 'text-green-500' : ''}
                ${line.type === 'warning' ? 'text-yellow-500' : ''}
                ${line.type === 'critical' ? 'text-red-500 font-bold animate-pulse' : ''}
                ${line.type === 'info' ? 'text-terminal-text/60' : ''}
              `}>
                {line.type === 'success' && '[OK] '}
                {line.type === 'critical' && '[CRITICAL_ERR] '}
                {line.text}
              </div>
            )}
          </div>
        ))}
        
        {/* Blinking Cursor at the end */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-terminal-accent">&gt;_</span>
          <span className="inline-block w-2 h-4 bg-terminal-accent animate-pulse" />
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center opacity-40 text-[9px] uppercase tracking-[0.3em]">
        <span>CORE_INIT_SEQUENCE</span>
        <span>ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
      </div>
    </div>
  );
};

export default BootSequence;
