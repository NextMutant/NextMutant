import React, { useState, useRef, useEffect } from 'react';

import profileImage from '../assets/image.png';
import pkThumb from '../assets/pk.png';
import snThumb from '../assets/sn.png';
import ddThumb from '../assets/dd1.png';

// --- Sub-components for different sections ---

const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const columns = Math.floor(width / 20);
    const drops: number[] = new Array(columns).fill(0);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>[]{}/\\|!@#$%^&*()_+-=      ";

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Slightly faster trail fade
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#8e9cc3"; // Brighter version of terminal-muted
      ctx.font = "15px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        
        // Occasionally use accent color for a "glimmer" effect
        if (Math.random() > 0.98) ctx.fillStyle = "#ffb86c";
        else ctx.fillStyle = "#6272a4";

        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" />;
};

const SectionLoader: React.FC<{ section: string }> = ({ section }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-terminal-bg flex flex-col items-center justify-center font-mono">
      <div className="w-64 space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-terminal-accent font-bold text-xs animate-pulse uppercase tracking-widest">
            Accessing_Node: /{section.toUpperCase()}
          </span>
          <span className="text-terminal-muted text-[10px]">{Math.min(100, Math.floor(progress))}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/[0.03] border border-terminal-muted/20 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-terminal-accent transition-all duration-150 ease-out"
            style={{ width: `${progress}%`, boxShadow: '0 0 15px rgba(255,184,108,0.3)' }}
          />
        </div>
        <div className="space-y-1">
          <p className="text-[8px] text-terminal-muted/40 uppercase tracking-tighter">Handshaking with remote protocol...</p>
          <p className="text-[8px] text-terminal-muted/40 uppercase tracking-tighter">Decrypting payload modules...</p>
        </div>
      </div>
    </div>
  );
};

interface DinoGameProps {
  spawnRate?: number;
  scale?: number;
}

const DinoGame: React.FC<DinoGameProps> = ({ spawnRate = 70, scale = 1 }) => {
  const [dinoY, setDinoY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<{ x: number, id: number }[]>([]);
  const nextId = useRef(0);
  const gameFrame = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      gameFrame.current++;

      // Move obstacles
      setObstacles(prev => prev.map(o => ({ ...o, x: o.x - 2.0 })).filter(o => o.x > -10));

      // Spawn obstacles frequently
      if (gameFrame.current % spawnRate === 0) {
        setObstacles(prev => [...prev, { 
          x: 100, 
          id: nextId.current++
        }]);
      }

      // Simple AI to jump - adjusted detection range for scale
      const detectionStart = 15;
      const detectionEnd = 45;
      const nearest = obstacles.find(o => o.x > detectionStart && o.x < detectionEnd);
      
      if (nearest && !isJumping) {
        setIsJumping(true);
        let jumpHeight = 0;
        let up = true;
        const maxJump = 65 * scale;
        const jumpStep = 7 * scale;
        
        const jumpInterval = setInterval(() => {
          if (up) {
            jumpHeight += jumpStep;
            if (jumpHeight >= maxJump) up = false;
          } else {
            jumpHeight -= jumpStep;
            if (jumpHeight <= 0) {
              jumpHeight = 0;
              setIsJumping(false);
              clearInterval(jumpInterval);
            }
          }
          setDinoY(jumpHeight);
        }, 30);
      }

    }, 30);

    return () => clearInterval(interval);
  }, [isJumping, obstacles, spawnRate, scale]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 select-none flex justify-center">
      {/* Container shifted more upwards, made larger, and limited to 90% width */}
      <div className="absolute w-[90%] h-32 bottom-24">
        {/* Ground Line */}
        <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-terminal-muted/50" />
        
        {/* Dino (Scalable) */}
        <div 
          className="absolute bottom-0 left-10 transition-transform duration-75"
          style={{ transform: `translateY(-${dinoY}px)` }}
        >
          <svg width={32 * scale} height={32 * scale} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2H18V4H20V10H18V12H16V14H18V16H16V18H14V20H12V22H8V20H6V18H4V12H2V10H4V8H6V6H8V4H10V2Z" fill="#ffb86c"/>
            <rect x="12" y="5" width="2" height="2" fill="#282a36"/>
          </svg>
        </div>

        {/* Obstacles (Pine Trees - Scalable) */}
        {obstacles.map(o => (
          <div 
            key={o.id}
            className="absolute bottom-0"
            style={{ left: `${o.x}%` }}
          >
            <svg width={20 * scale} height={32 * scale} viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L20 12H4L12 0Z" fill="#6272a4"/>
              <path d="M12 8L24 24H0L12 8Z" fill="#6272a4"/>
              <rect x="10" y="24" width="4" height="8" fill="#44475a"/>
            </svg>
          </div>
        ))}
      </div>

      <div className="absolute top-2 right-4 text-[8px] text-terminal-muted font-bold tracking-widest opacity-50 uppercase">
        SYS_BACKGROUND_SIM: RUNNING
      </div>
    </div>
  );
};

interface SectionProps {
  onNavigate: (section: any) => void;
}

const HomeSection: React.FC<SectionProps> = ({ onNavigate }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 border border-dashed border-terminal-muted/60 h-full overflow-hidden">
    {/* Left Column: Welcome & Portrait */}
    <div className="p-2 md:p-4 border-b lg:border-b-0 lg:border-r border-dashed border-terminal-muted/60 flex flex-col items-center justify-center overflow-hidden">
      <h2 className="text-lg md:text-xl mb-2 font-bold flex-shrink-0 text-terminal-text">Welcome, visitor.</h2>
      <div className="w-full flex justify-center overflow-hidden flex-shrink py-4 relative group">
        <div className="absolute inset-0 bg-terminal-muted/5 blur-3xl rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <img 
          src={profileImage} 
          alt="Profile Portrait" 
          className="w-48 h-48 md:w-64 md:h-64 object-contain opacity-75 mix-blend-screen grayscale contrast-110 brightness-110 relative z-10 transition-all duration-500 group-hover:opacity-90 group-hover:brightness-125"
          style={{ 
            filter: 'sepia(60%) hue-rotate(-10deg) saturate(150%) brightness(1.2) contrast(1.05) drop-shadow(0 0 15px rgba(255,184,108,0.15))' 
          }}
        />
      </div>
      <div className="text-center space-y-0.5 flex-shrink-0">
        <p className="text-[10px] md:text-xs">Engineer • Guwahati, India</p>
        <p className="terminal-accent text-[10px] md:text-xs hover:underline cursor-pointer">contact@uttaranbose.com</p>
      </div>
    </div>

    {/* Right Column: Capabilities & Navigation */}
    <div className="flex flex-col overflow-hidden relative">
      <div className="p-2 md:p-4 border-b border-dashed border-terminal-muted/60 flex-shrink-0 z-10">
        <h3 className="terminal-accent font-bold mb-2 tracking-widest uppercase text-[10px] md:text-xs">Capabilities</h3>
        <div className="space-y-1.5 text-[10px] md:text-xs">
          {[
            { label: 'Systems', val: 'High-Perf APIs, Real-time Arch' },
            { label: 'Finance', val: 'Quant Research, Portfolio Opt' },
            { label: 'AI/NLP', val: 'RAG Pipelines, Neural Ensembles' },
            { label: 'Lead', val: 'GDSC Lead, E-Cell Strategy' }
          ].map(cap => (
            <div key={cap.label} className="grid grid-cols-3 gap-2">
              <span className="text-terminal-muted uppercase text-[10px] md:text-xs self-center">{cap.label}</span>
              <span className="col-span-2 font-bold">{cap.val}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Container for Navigation and Game Area */}
      <div className="p-2 md:p-4 flex-1 flex flex-col justify-between overflow-hidden relative">
        <div className="z-10">
          <h3 className="terminal-accent font-bold mb-2 tracking-widest uppercase text-[10px] md:text-xs">Available Commands</h3>
          <div className="space-y-0.5 text-xs md:text-sm text-terminal-text/90">
            {['about', 'projects', 'experience', 'skills', 'social'].map((item) => (
              <div 
                key={item} 
                className="flex items-center select-none hover:text-terminal-accent transition-colors"
              >
                <span className="w-24 md:w-28 inline-block">/{item}</span>
                <span className="animate-cursor-blink inline-block w-1.5 h-3 bg-terminal-accent" />
              </div>
            ))}
          </div>
        </div>

        {/* Dino Game Area */}
        <DinoGame />

        <div className="mt-2 space-y-0.5 text-[9px] md:text-[10px] text-terminal-muted flex-shrink-0 z-10 pointer-events-none">
          <p>. . . /help for all commands</p>
          <p className="opacity-50 italic">Still there? Try /projects to see what I've built...</p>
        </div>
      </div>
    </div>
  </div>
);

const ProjectsSection: React.FC = () => {
  const projects = [
    { 
      name: 'Portfolio_Optimizer', 
      type: 'HF Optimization Engine', 
      desc: 'A convex optimization framework managing a $1M simulated book that reduces portfolio variance by 35% and enables real-time trade execution. Achieved a Simulated Sortino Ratio of 2.1 across various market regimes.', 
      tags: ['Python', 'NumPy', 'CVXPY'],
      repo: 'https://github.com/NextMutant/Static_and_Dynamic_protfolio_optimization'
    },
    { 
      name: 'Interview_Platform', 
      type: 'Full-Stack Interview System', 
      desc: 'Real-time platform featuring live video, screen sharing, and automated code evaluation supporting 500+ concurrent users with sub-200ms latency. Utilizes job queues to cut code review time by 90%.', 
      tags: ['React.js', 'Node.js', 'Socket.IO', 'Docker', 'MongoDB', 'Inngest'],
      repo: 'https://github.com/NextMutant/TalentIQ'
    },
    { 
      name: 'Financial_NLP', 
      type: 'RAG-Based Analyst', 
      desc: 'Retrieval-Augmented Generation pipeline that parses 10-K filings to cut information extraction time by 85%. FAISS indexing maintains sub-100ms latency across 50,000+ documents.', 
      tags: ['Transformers', 'FAISS', 'LangChain', 'Python'],
      repo: 'https://github.com/NextMutant/RAG-Based-Financial-NLP-Analyst'
    },
    { 
      name: 'FiMoney_Inventory', 
      type: 'MERN Inventory System', 
      desc: 'Inventory system with JWT auth and server-side pagination reducing server load by 30%. Fully containerized with Docker and maintains 100% API test coverage using Jest.', 
      tags: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Redux', 'Swagger'],
      repo: 'https://github.com/NextMutant/FiMoney'
    },
    { 
      name: 'API_Rate_Limiter', 
      type: 'Redis Middleware', 
      desc: 'Redis-backed middleware enforcing API key limits, improving response times by 40% for 10,000+ daily requests. Features automated CI/CD reducing release cycle by 60%.', 
      tags: ['Node.js', 'Redis', 'Docker', 'GitHub Actions', 'CI/CD'],
      repo: 'https://github.com/NextMutant/API-Rate_Limiter'
    },
    {
      name: 'Interactive_Coldrink',
      type: 'Responsive SPA',
      desc: 'A responsive single-page application translated from a pixel-perfect Figma design, featuring GSAP Split Text reveals, parallax layers, and scroll-synced video sections validated at 60 FPS.',
      tags: ['React.js', 'Tailwind CSS', 'GSAP', 'Vite'],
      repo: 'https://github.com/NextMutant/Splyt_Replica'
    },
    {
      name: 'GSAP_Cocktail',
      type: 'Scroll-driven SPA',
      desc: 'A scroll-driven SPA utilizing image masking and multi-section GSAP timeline sequencing, achieving a 95+ Lighthouse Performance score through hardware-accelerated smooth scrolling.',
      tags: ['React.js', 'GSAP', 'Lenis', 'Vite'],
      repo: 'https://github.com/NextMutant/CockTail_Website'
    },
    {
      name: 'Pulse_Chat',
      type: 'Messaging Platform',
      desc: 'A full-stack messaging platform supporting private and group chats with bidirectional Socket.IO delivery, typing indicators, and Web Push notifications, secured via Google OAuth and JWT.',
      tags: ['React.js', 'Node.js', 'Socket.IO', 'MongoDB', 'JWT'],
      repo: 'https://github.com/NextMutant/Pulse-Chat_App'
    },
    {
      name: 'Ocean_Hazards',
      type: 'Real-time Monitoring',
      desc: 'A real-time monitoring system that polls INCOIS GeoJSON feeds to push hazard alerts via Socket.IO, featuring server-side validation and exponential backoff retry for reliability.',
      tags: ['React.js', 'Node.js', 'Socket.IO', 'Leaflet.js'],
      repo: 'https://oceanhazardiiitn.netlify.app/'
    },
    {
      name: 'OriginText_AI',
      type: 'Text Classifier',
      desc: 'A deep learning system utilizing ANN/LSTM ensembles trained on 50k+ samples to achieve 94% test accuracy, deployed as a low-latency inference API handling 500+ requests per second.',
      tags: ['Python', 'TensorFlow', 'LSTM', 'scikit-learn'],
      repo: 'https://github.com/NextMutant/Human_v-s_AI_Text'
    },
    {
      name: 'PixelTrust_Classifier',
      type: 'Image Authenticity',
      desc: 'A computer vision project that uses CNNs trained on 100k+ images to achieve 93% accuracy in detecting image authenticity, supplemented by a diagnostic dashboard for model analysis.',
      tags: ['Python', 'CNNs', 'TensorFlow'],
      repo: 'https://github.com/NextMutant/Real_v-s_Ai_Image'
    }
  ];

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500 h-full overflow-hidden flex flex-col">
      <h2 className="text-base md:text-xl font-bold terminal-accent mb-6 flex-shrink-0 border-b border-terminal-muted/20 pb-2">[ /PROJECT_LOG ]</h2>
      <div className="space-y-6 overflow-y-auto pr-2 no-scrollbar pb-8">
        {projects.map((proj, idx) => (
          <div key={idx} className="p-4 md:p-6 border border-terminal-muted/30 bg-white/[0.02] hover:border-terminal-accent/50 transition-all duration-300 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base md:text-lg font-bold terminal-accent leading-none">
                  {proj.name.replace('_', ' ')} — {proj.type}
                </h3>
              </div>
              <a 
                href={proj.repo} 
                target="_blank" 
                rel="noreferrer" 
                className="text-terminal-muted hover:text-terminal-accent transition-colors"
                title="View on GitHub"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.484-1.304.893-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
            
            <p className="text-[11px] md:text-[13px] text-terminal-text/80 leading-relaxed max-w-3xl">
              {proj.desc}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {proj.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-terminal-muted/10 border border-terminal-muted/20 text-[9px] md:text-[10px] text-terminal-muted uppercase font-bold rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AboutSection: React.FC = () => (
  <div className="p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden flex flex-col">
    <div className="flex justify-between items-center mb-4 flex-shrink-0 border-b border-terminal-muted/20 pb-2">
      <h2 className="text-base md:text-xl font-bold terminal-accent">[ /ABOUT_ME ]</h2>
      <span className="text-[10px] md:text-xs font-bold text-terminal-accent/80 uppercase tracking-widest animate-pulse">STATUS: ACTIVE & ALIVE</span>
    </div>
    <div className="space-y-6 text-xs md:text-sm leading-relaxed overflow-y-auto pr-2 no-scrollbar pb-4 flex-1">
      <div className="space-y-4">
        <p>&gt; I'm Uttaran, a Computer Science student at IIIT Nagpur who loves building fast, interactive web systems using React and Node.js. I've spent a lot of my time leading tech and entrepreneurship communities like GDSC and E-Cell, but at my core, I just enjoy solving problems with code.</p>
        <p>&gt; Off-screen, I'm a die-hard fan of CSK and FC Barcelona. When I'm not watching a match or debugging a script, you'll probably find me playing my guitar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-2 relative">
        <div className="space-y-4 z-10">
          <h3 className="terminal-accent font-bold uppercase tracking-widest text-[10px] md:text-xs">Education</h3>
          <div className="space-y-3">
            <div className="border-l-2 border-terminal-muted/30 pl-4 py-1">
              <p className="font-bold text-terminal-text">B.Tech in Computer Science and Engineering</p>
              <p className="text-xs">Indian Institute of Information Technology (IIIT) Nagpur</p>
              <p className="text-[10px] text-terminal-muted italic">2023 — 2027</p>
            </div>
            <div className="border-l-2 border-terminal-muted/30 pl-4 py-1">
              <p className="font-bold text-terminal-text">Higher Secondary (Science)</p>
              <p className="text-xs">Kendriya Vidyalaya Dimapur</p>
              <p className="text-[10px] text-terminal-muted italic">Class of 2022</p>
            </div>
            <div className="border-l-2 border-terminal-muted/30 pl-4 py-1">
              <p className="font-bold text-terminal-text">High School</p>
              <p className="text-xs">Kendriya Vidyalaya Dimapur</p>
              <p className="text-[10px] text-terminal-muted italic">Class of 2020</p>
            </div>
          </div>
        </div>
        
        {/* Secondary Dino Game Area */}
        <div className="hidden lg:block relative h-48 overflow-hidden group mt-12">
          <DinoGame spawnRate={40} scale={1.5} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[8px] uppercase tracking-[0.2em] text-terminal-muted opacity-20 group-hover:opacity-40 transition-opacity">Background_Task_02</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ExperienceSection: React.FC = () => {
  const experiences = [
    {
      company: 'WorldQuant',
      role: 'Quantitative Research Consultant',
      period: 'August 2025 – Present',
      bullets: [
        'Alpha Signal Development: Engineered over 150 alpha signals utilizing mean-reversion and momentum strategies, maintaining an average Sharpe ratio of 1.85 across US and Asian equity markets.',
        'Big Data Processing: Leveraged the Brain simulation engine to process 2TB of historical tick data, executing 10,000+ backtests to refine signal turnover and minimize decay rates.',
        'Model Optimization: Applied ensemble learning and regularized regression techniques to boost out-of-sample Information Coefficient (IC) by 22%, enhancing signal stability.'
      ]
    },
    {
      company: 'IIIT Nagpur',
      role: 'Research Intern',
      period: 'June 2024 – October 2025',
      bullets: [
        'Full-Stack Development: Acted as the sole engineer to build and ship a React.js and Redux visualization dashboard, which accelerated research insight delivery by 40%.',
        'Performance Optimization: Profiled and restructured HTTP API patterns on Linux servers, achieving an 18% reduction in average response latency.',
        'Testing & Reliability: Implemented comprehensive unit and integration test suites, enabling same-day regression detection and eliminating recurring bug classes.'
      ]
    },
    {
      company: 'Entrepreneurship Cell (E-Cell), IIIT Nagpur',
      role: 'Chapter Lead',
      period: 'August 2024 – December 2025',
      bullets: [
        'Strategic Direction: Managed 150+ members to execute E-Summit, a flagship 3-day event that drew 500+ participants and saw a 35% increase in attendance.',
        'Financial Growth: Negotiated and secured 10+ corporate sponsorships, expanding the annual event budget by 40% while maintaining a 95%+ participant satisfaction score.'
      ]
    },
    {
      company: 'Google Developer Student Clubs (GDSC), IIIT Nagpur',
      role: 'Lead',
      period: 'September 2024 – September 2025',
      bullets: [
        'Community Scaling: Grew chapter membership by 60% through the production of eight technical events, including live coding workshops with 200+ attendees.',
        'Product Innovation: Launched a developer podcast series that reached 300+ listeners per episode, tripling member retention and ranking the club first among campus orgs.'
      ]
    }
  ];

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500 h-full overflow-hidden flex flex-col">
      <h2 className="text-base md:text-xl font-bold terminal-accent mb-6 flex-shrink-0 border-b border-terminal-muted/20 pb-2">[ /EXPERIENCE_LOG ]</h2>
      <div className="space-y-8 overflow-y-auto pr-2 no-scrollbar pb-8">
        {experiences.map((exp, i) => (
          <div key={i} className="border-l-2 border-terminal-muted/30 pl-4 space-y-2">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-1">
              <div>
                <p className="text-terminal-accent font-bold text-sm md:text-base leading-none">{exp.company}</p>
                <p className="text-xs md:text-sm text-terminal-text/90 mt-1">{exp.role}</p>
              </div>
              <p className="text-[10px] md:text-xs text-terminal-muted italic font-mono">{exp.period}</p>
            </div>
            <ul className="space-y-1.5 pt-1">
              {exp.bullets.map((bullet, idx) => (
                <li key={idx} className="text-[11px] md:text-[12px] text-terminal-text/70 leading-relaxed flex gap-2">
                  <span className="text-terminal-accent/50 flex-shrink-0">›</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const SkillsSection: React.FC = () => {
  const [hoveredSkill, setHoveredSkill] = useState<any>(null);
  
  const skillCategories = [
    {
      title: 'Languages_&_Backend',
      skills: [
        { name: 'Python', level: 95, meta: 'Quantitative Research, ML Pipelines, Automation' },
        { name: 'TypeScript', level: 90, meta: 'Type-safe Frontend/Backend Architectures' },
        { name: 'JavaScript', level: 92, meta: 'Full-stack Web Development, Real-time Systems' },
        { name: 'FastAPI', level: 88, meta: 'High-performance Python APIs, Async IO' },
        { name: 'Flask', level: 85, meta: 'Micro-web frameworks, REST API Prototyping' },
        { name: 'C++', level: 85, meta: 'Competitive Programming, High Performance Computing' }
      ]
    },
    {
      title: 'Frontend_&_Data_Apps',
      skills: [
        { name: 'React.js', level: 94, meta: 'Hooks, Context API, GSAP Integration' },
        { name: 'Three.js', level: 82, meta: '3D Web Experiences, WebGL Shaders' },
        { name: 'Streamlit', level: 88, meta: 'Interactive Data Dashboards, ML Model UI' },
        { name: 'TailwindCSS', level: 95, meta: 'Custom Themes, Hardware Acceleration' },
        { name: 'Node.js', level: 88, meta: 'Server-side Runtime, Socket.IO, NPM Ecosystem' },
        { name: 'Express.js', level: 90, meta: 'RESTful API Architecture, Middleware Design' }
      ]
    },
    {
      title: 'Intelligence_&_Logic',
      skills: [
        { name: 'scikit-learn', level: 90, meta: 'Supervised/Unsupervised Learning, Feature Engineering' },
        { name: 'TensorFlow', level: 82, meta: 'Deep Learning, CNN/LSTM Ensembles' },
        { name: 'LangChain', level: 85, meta: 'RAG Pipelines, LLM Orchestration' },
        { name: 'OpenCV', level: 84, meta: 'Computer Vision, Image Processing, Object Detection' },
        { name: 'FAISS', level: 80, meta: 'Vector Indexing, Semantic Search' },
        { name: 'PyTorch', level: 78, meta: 'Neural Network Research & Modeling' }
      ]
    },
    {
      title: 'Infrastructure_&_Tools',
      skills: [
        { name: 'MongoDB', level: 85, meta: 'NoSQL Schema Design, Aggregation Pipelines' },
        { name: 'MySQL', level: 88, meta: 'Relational Database Design, Query Optimization' },
        { name: 'Docker', level: 85, meta: 'Containerization, Microservices' },
        { name: 'Redis', level: 80, meta: 'Rate Limiting, Real-time Caching' },
        { name: 'Postman', level: 92, meta: 'API Testing, Documentation, CI Automation' },
        { name: 'Git/GitHub', level: 92, meta: 'CI/CD Pipelines, Collaborative Workflows' },
        { name: 'Linux', level: 88, meta: 'Bash Scripting, Server Administration' }
      ]
    }
  ];

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0 border-b border-terminal-muted/20 pb-2">
        <h2 className="text-base md:text-xl font-bold terminal-accent">[ /SKILL_MATRIX ]</h2>
        <span className="text-[10px] md:text-xs text-terminal-muted italic animate-pulse">Scanning System Capabilities...</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 flex-1 overflow-y-auto no-scrollbar pb-8">
        {skillCategories.map(cat => (
          <div key={cat.title} className="space-y-4">
            <h3 className="text-xs md:text-sm font-bold text-terminal-muted uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 bg-terminal-muted/30 rounded-full" />
              {cat.title}
            </h3>
            <div className="space-y-4">
              {cat.skills.map(skill => (
                <div 
                  key={skill.name} 
                  className="space-y-1 group cursor-crosshair"
                  onMouseEnter={() => setHoveredSkill(skill)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  <div className="flex justify-between text-[10px] md:text-xs">
                    <span className="group-hover:text-terminal-accent transition-colors">{skill.name}</span>
                    <span className="text-terminal-muted">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.03] border border-terminal-muted/10 relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-terminal-accent/60 group-hover:bg-terminal-accent transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${skill.level}%`,
                        boxShadow: '0 0 10px rgba(255,184,108,0.2)' 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Diagnostic Footer */}
      <div className="mt-4 p-3 bg-white/[0.02] border border-dashed border-terminal-muted/20 min-h-[60px] flex flex-col justify-center">
        {hoveredSkill ? (
          <div className="animate-in fade-in duration-200">
            <p className="text-[10px] terminal-accent font-bold uppercase tracking-tighter">&gt; DIAGNOSTIC_REPORT: {hoveredSkill.name}</p>
            <p className="text-[11px] md:text-xs text-terminal-text/80 italic mt-1">{hoveredSkill.meta}</p>
          </div>
        ) : (
          <div className="text-[10px] text-terminal-text/60 uppercase tracking-widest text-center animate-pulse">
            Hover over a skill module for technical metadata...
          </div>
        )}
      </div>
    </div>
  );
};

const SocialSection: React.FC = () => {
  const socialLinks = [
    { 
      name: 'LinkedIn', 
      url: 'https://linkedin.com/in/uttaranbose', 
      handle: 'uttaranbose',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
      )
    },
    { 
      name: 'GitHub', 
      url: 'https://github.com/NextMutant', 
      handle: 'NextMutant',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.484-1.304.893-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      )
    },
    { 
      name: 'Instagram', 
      url: 'https://www.instagram.com/_shaan_100/', 
      handle: '@_shaan_100',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.774 4.919 4.851.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.075-1.664 4.704-4.919 4.851-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.775-4.919-4.851-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.075 1.664-4.704 4.919-4.851 1.266-.058 1.645-.07 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.981-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-5.838 2.435-5.838 5.838s2.435 5.838 5.838 5.838 5.838-2.435 5.838-5.838-2.435-5.838-5.838-5.838zm0 10.162c-2.387 0-4.324-1.937-4.324-4.324s1.937-4.324 4.324-4.324 4.324 1.937 4.324 4.324-1.937 4.324-4.324 4.324zm6.406-11.845c-.864 0-1.564.701-1.564 1.564 0 .863.7 1.564 1.564 1.564.863 0 1.564-.701 1.564-1.564 0-.863-.701-1.564-1.564-1.564z"/></svg>
      )
    },
    { 
      name: 'Twitter', 
      url: 'https://x.com/sanelyShaan', 
      handle: '@sanelyShaan',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z"/></svg>
      )
    },
    { 
      name: 'Gmail', 
      url: 'mailto:boseuttaran100@gmail.com', 
      handle: 'boseuttaran100@gmail.com',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
      )
    },
    { 
      name: 'Phone', 
      url: 'tel:+91XXXXXXXXXX', 
      handle: '+91 XXX XXX XXXX',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.21 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
      )
    }
  ];

  const [status, setStatus] = useState('SYSTEM_IDLE');

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-8 flex-shrink-0 border-b border-terminal-muted/20 pb-2">
        <h2 className="text-base md:text-xl font-bold terminal-accent">[ /SOCIAL_HUB ]</h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] md:text-xs text-terminal-text/60 uppercase font-mono">Connection_Secure</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 overflow-y-auto no-scrollbar pb-8">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setStatus(`ESTABLISHING_HANDSHAKE_WITH_${link.name.toUpperCase()}...`)}
            onMouseLeave={() => setStatus('SYSTEM_IDLE')}
            className="group p-4 border border-terminal-muted/20 bg-white/[0.02] hover:border-terminal-accent/50 hover:bg-terminal-accent/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center"
          >
            <div className="text-terminal-muted group-hover:text-terminal-accent transition-colors duration-300 transform group-hover:scale-110">
              {link.icon}
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-terminal-text/80 group-hover:text-terminal-accent">{link.name}</p>
              <p className="text-[8px] md:text-[10px] text-terminal-muted group-hover:text-terminal-text/60 truncate max-w-[100px] md:max-w-none">{link.handle}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Terminal Status Feed */}
      <div className="mt-4 p-3 bg-black/40 border border-dashed border-terminal-muted/20 font-mono">
        <div className="flex gap-2 text-[10px] md:text-xs">
          <span className="text-terminal-accent font-bold">uttaran@social:~$</span>
          <span className="text-terminal-text/90 animate-in fade-in duration-100">{status}</span>
        </div>
      </div>
    </div>
  );
};

const HelpSection: React.FC = () => {
  const commands = [
    { name: '/help', desc: 'Display this help manual' },
    { name: '/home', desc: 'Return to dashboard' },
    { name: '/about', desc: 'Identity & background' },
    { name: '/projects', desc: 'Project logs & repositories' },
    { name: '/experience', desc: 'Professional journey' },
    { name: '/skills', desc: 'Technical capabilities' },
    { name: '/social', desc: 'Communication links' },
  ];

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500 h-full overflow-hidden flex flex-col font-mono">
      <h2 className="text-base md:text-xl font-bold terminal-accent mb-6 flex-shrink-0 border-b border-terminal-muted/20 pb-2">[ /SYSTEM_HELP ]</h2>
      <div className="space-y-4 overflow-y-auto pr-2 no-scrollbar pb-8">
        <p className="text-xs md:text-sm text-terminal-text/70 mb-4 tracking-tight">
          Welcome to the system help manual. Use the following commands to navigate through the interface.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {commands.map((cmd) => (
            <div key={cmd.name} className="group p-3 border border-terminal-muted/10 bg-white/[0.01] hover:border-terminal-accent/30 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-terminal-accent font-bold text-xs md:text-sm">{cmd.name}</span>
                <div className="h-[1px] flex-1 bg-terminal-muted/10" />
              </div>
              <p className="text-[10px] md:text-xs text-terminal-muted mt-1 uppercase tracking-widest">{cmd.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-terminal-muted/10">
          <p className="text-[10px] text-terminal-muted italic">
            &gt; Tip: Use Up/Down arrows to browse suggestions and Tab to autocomplete.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main Shell Component ---

type SectionType = 'home' | 'projects' | 'about' | 'skills' | 'experience' | 'social' | 'help';

const LandingPage: React.FC = () => {
  const [view, setView] = useState<'lp1' | 'lp2'>('lp1');
  const [activeSection, setActiveSection] = useState<SectionType>('home');
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetSection, setTargetSection] = useState<SectionType | null>(null);
  const [command, setCommand] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { name: '/help', desc: 'List all available commands' },
    { name: '/home', desc: 'Return to dashboard' },
    { name: '/about', desc: 'Who is Uttaran Bose?' },
    { name: '/projects', desc: 'Featured projects & case studies' },
    { name: '/experience', desc: 'My professional journey' },
    { name: '/skills', desc: 'Expertise & capabilities' },
    { name: '/social', desc: 'Connect with me' },
  ];

  const filteredSuggestions = commands.filter(c => c.name.startsWith(command.toLowerCase()));

  const handleCommandBarClick = () => inputRef.current?.focus();
  
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeSection]);

  useEffect(() => {
    if (command.startsWith('/')) {
      setShowSuggestions(true);
      setSelectedSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
    if (lastError) setLastError(null);
  }, [command]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setView('lp1');
      }
      
      // Auto-focus terminal input when typing starts
      if (
        document.activeElement !== inputRef.current &&
        !e.ctrlKey && !e.metaKey && !e.altKey &&
        e.key.length === 1
      ) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const navigateToSection = (section: SectionType) => {
    if (section === activeSection) return;
    
    setTargetSection(section);
    setIsNavigating(true);
    
    // Random delay between 800ms and 1500ms for terminal feel
    const delay = Math.random() * 700 + 800;
    
    setTimeout(() => {
      setActiveSection(section);
      setIsNavigating(false);
      setTargetSection(null);
    }, delay);
  };

  const executeCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    
    if (cleanCmd === '/home' || cleanCmd === '/dashboard') navigateToSection('home');
    else if (cleanCmd === '/about') navigateToSection('about');
    else if (cleanCmd === '/projects' || cleanCmd === '/work') navigateToSection('projects');
    else if (cleanCmd === '/experience') navigateToSection('experience');
    else if (cleanCmd === '/skills') navigateToSection('skills');
    else if (cleanCmd === '/social') navigateToSection('social');
    else if (cleanCmd === '/help') navigateToSection('help');
    else if (cleanCmd !== '') {
      setLastError(`Unknown command: ${cleanCmd}`);
      setTimeout(() => setLastError(null), 3000);
    }
    
    setCommand('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(0);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showSuggestions && filteredSuggestions.length > 0) {
      executeCommand(filteredSuggestions[selectedSuggestionIndex].name);
    } else {
      executeCommand(command);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setCommand(filteredSuggestions[selectedSuggestionIndex].name);
    }
  };

  const handleSuggestionClick = (cmdName: string) => {
    executeCommand(cmdName);
    inputRef.current?.focus();
  };

  return (
    <div className={`h-screen w-screen transition-all duration-700 ${view === 'lp1' ? 'bg-[#000000] p-2 sm:p-4 md:p-8 lg:p-12' : 'bg-terminal-bg p-0'} font-mono overflow-hidden flex flex-col items-center justify-center`}>
      
      {/* Background Effect for LP1 */}
      {view === 'lp1' && <MatrixBackground />}

      {/* Container */}
      <div className={`transition-all duration-700 flex flex-col w-full h-full relative ${view === 'lp1' ? 'max-w-6xl max-h-[92vh] bg-terminal-bg rounded-xl border border-white/5 shadow-2xl overflow-hidden' : 'max-w-full max-h-full h-screen overflow-hidden'}`}>
        
        {/* Top Bar - Darker than main background */}
        <div className={`flex justify-between items-center ${view === 'lp2' ? 'p-5 md:p-6 text-sm md:text-base' : 'p-5 text-sm md:text-base'} text-terminal-text/40 border-b border-terminal-muted/10 bg-[#050608] flex-shrink-0 z-10`}>
          <div className="flex gap-2">
            <button 
              onClick={() => navigateToSection('home')}
              className={`rounded-full bg-red-500/40 hover:bg-red-500 transition-all cursor-pointer ${view === 'lp2' ? 'w-3.5 h-3.5' : 'w-3 h-3'}`} 
              title="Return to Home"
            />
            <button onClick={() => setView('lp1')} className={`rounded-full transition-all cursor-pointer ${view === 'lp1' ? 'bg-yellow-500' : 'bg-yellow-500/40 hover:bg-yellow-500'} ${view === 'lp2' ? 'w-3.5 h-3.5' : 'w-3 h-3'}`} />
            <button onClick={() => setView('lp2')} className={`rounded-full transition-all cursor-pointer ${view === 'lp2' ? 'bg-green-500' : 'bg-green-500/40 hover:bg-green-500'} ${view === 'lp2' ? 'w-3.5 h-3.5' : 'w-3 h-3'}`} />
          </div>
          <div className={`absolute left-1/2 -translate-x-1/2 select-none uppercase tracking-[0.1em] font-bold ${view === 'lp2' ? 'text-sm md:text-base' : ''}`}>SHAAN10 ~ /{activeSection}</div>
          <div className={`hidden md:block opacity-20 select-none uppercase tracking-widest ${view === 'lp2' ? 'text-[12px] md:text-[14px]' : 'text-[10px] md:text-[12px]'}`}>v1.0.4_stable</div>
        </div>

        {/* Dynamic Content Area */}
        <div className={`flex-1 overflow-hidden bg-terminal-bg flex flex-col relative ${view === 'lp2' ? 'p-4 md:p-8' : 'p-3 md:p-5'}`}>
          
          {/* Section Loader Overlay */}
          {isNavigating && targetSection && (
            <SectionLoader section={targetSection} />
          )}

          {/* Header */}
          <header className={`${view === 'lp2' ? 'mb-6 md:mb-10' : 'mb-4 md:mb-6'} flex justify-center flex-shrink-0`}>
            <pre className={`text-terminal-accent font-bold select-none overflow-hidden chromatic-aberration text-center ${view === 'lp2' ? 'text-[3px] leading-[3.5px] sm:text-[5px] sm:leading-[5px] md:text-[6px] md:leading-[6px] lg:text-[7.5px] lg:leading-[7.5px]' : 'text-[2px] leading-[2.5px] sm:text-[4px] sm:leading-[4px] md:text-[5px] md:leading-[5px] lg:text-[6px] lg:leading-[6px]'}`}>
{`
 ██╗   ██╗████████╗████████╗ █████╗ ██████╗  █████╗ ███╗   ██╗    ██████╗  ██████╗ ███████╗███████╗
 ██║   ██║╚══██╔══╝╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗████╗  ██║    ██╔══██╗██╔═══██╗██╔════╝██╔════╝
 ██║   ██║   ██║      ██║   ███████║██████╔╝███████║██╔██╗ ██║    ██████╔╝██║   ██║███████╗█████╗  
 ██║   ██║   ██║      ██║   ██╔══██║██╔══██╗██╔══██║██║╚██╗██║    ██╔══██╗██║   ██║╚════██║██╔══╝  
 ╚██████╔╝   ██║      ██║   ██║  ██║██║  ██║██║  ██║██║ ╚████║    ██████╔╝╚██████╔╝███████║███████╗
  ╚═════╝    ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
`}
            </pre>
          </header>

          {/* Section Rendering Container */}
          <div className="flex-1 overflow-hidden">
            {activeSection === 'home' && <HomeSection onNavigate={(s) => navigateToSection(s as SectionType)} />}
            {activeSection === 'projects' && <ProjectsSection />}
            {activeSection === 'about' && <AboutSection />}
            {activeSection === 'experience' && <ExperienceSection />}
            {activeSection === 'skills' && <SkillsSection />}
            {activeSection === 'social' && <SocialSection />}
            {activeSection === 'help' && <HelpSection />}
          </div>

          {/* Footer Text for LP2 */}
          {view === 'lp2' && activeSection === 'home' && (
            <div className="mt-2 pt-2 border-t border-terminal-muted/10 flex-shrink-0">
              <p className="text-terminal-muted italic animate-pulse text-[9px] md:text-[10px]">Still there? Try /projects to see what I've built...</p>
            </div>
          )}
        </div>

        {/* Suggestions Overlay */}
        {showSuggestions && (
          <div className="absolute bottom-12 left-4 bg-[#050608] border border-terminal-muted/30 shadow-2xl z-20 p-2 min-w-[280px] animate-in slide-in-from-bottom-2 duration-200">
            <div className="space-y-1">
              {filteredSuggestions.map((cmd, idx) => (
                <div 
                  key={cmd.name} 
                  className={`flex justify-between items-center group cursor-pointer hover:bg-white/5 p-1.5 transition-colors ${idx === selectedSuggestionIndex ? 'bg-white/10' : ''}`} 
                  onClick={() => handleSuggestionClick(cmd.name)}
                >
                  <span className={`font-bold text-[10px] md:text-xs ${idx === selectedSuggestionIndex ? 'text-white' : 'terminal-accent'}`}>{cmd.name}</span>
                  <span className="text-terminal-muted text-[8px] md:text-[9px] uppercase tracking-tighter text-right pl-4">{cmd.desc}</span>
                </div>
              ))}
              {filteredSuggestions.length === 0 && (
                <div className="p-1.5 text-terminal-muted text-[10px] italic">No matching command found...</div>
              )}
            </div>
          </div>
        )}

        {/* Command Bar */}
        <form onSubmit={handleCommandSubmit} onClick={handleCommandBarClick} className={`bg-[#050608] border-t border-terminal-muted/20 flex items-center gap-2 flex-shrink-0 z-10 relative ${view === 'lp2' ? 'p-6 md:p-8 text-sm md:text-base' : 'p-5 text-sm md:text-base'}`}>
          {lastError && (
            <div className="absolute -top-8 left-0 right-0 bg-red-500/10 border-t border-red-500/30 p-1.5 text-[10px] text-red-400 font-mono animate-in slide-in-from-bottom-1">
              &gt; ERROR: {lastError}
            </div>
          )}
          <span className="text-terminal-accent font-bold">&gt;</span>
          <div className="relative flex-1 flex items-center">
            <input 
              ref={inputRef} 
              type="text" 
              value={command} 
              onChange={(e) => setCommand(e.target.value)} 
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none outline-none text-terminal-text font-mono caret-transparent" 
              spellCheck="false" 
              autoComplete="off" 
            />
            <div className="absolute pointer-events-none animate-cursor-blink bg-terminal-accent w-1.5 h-3.5" style={{ left: `${command.length}ch` }} />
            {!command && <span className="absolute left-0 text-terminal-muted opacity-30 select-none">Type a command...</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;
