/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Trophy, Gamepad2, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 80;

const TRACKS = [
  {
    id: 1,
    title: "NEON_PULSE.EXE",
    artist: "CORE_SYNTH",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "var(--color-glitch-magenta)"
  },
  {
    id: 2,
    title: "CYBER_DRIFT.SYS",
    artist: "BEAT_ENGINE",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "var(--color-glitch-cyan)"
  },
  {
    id: 3,
    title: "DIGITAL_HORIZON.LOG",
    artist: "WAVE_PROCESSOR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "var(--color-glitch-magenta)"
  }
];

// --- Components ---

export default function App() {
  // Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);

  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // --- Game Logic ---

  const generateFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setIsPaused(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        const removed = newSnake.pop();
        if (removed) {
          setTrail(prev => [{ ...removed, id: Math.random() }, ...prev].slice(0, 15));
        }
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, generateFood]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setTrail([]);
    setFood(generateFood(INITIAL_SNAKE));
  };

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  // --- Music Logic ---

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((currentTrackIndex + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 space-y-8 relative">
      <div className="scanline" />
      
      {/* Header */}
      <header className="text-center space-y-4 z-10">
        <h1 
          className="text-3xl md:text-5xl font-pixel glitch-text tracking-tighter text-glitch-cyan"
          data-text="SNAKE_SYSTEM_v2.0"
        >
          SNAKE_SYSTEM_v2.0
        </h1>
        <p className="text-glitch-magenta font-mono text-[10px] tracking-[0.4em] uppercase opacity-80">
          [ STATUS: OPERATIONAL // CORE_TEMP: OPTIMAL ]
        </p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start z-10">
        {/* Left Sidebar: Data Stream */}
        <section className="lg:col-span-1 space-y-6 order-2 lg:order-1">
          <div className="crt-border p-6 space-y-6">
            <div className="flex items-center space-x-3 text-glitch-cyan">
              <Trophy className="w-5 h-5" />
              <h2 className="text-[10px] font-pixel uppercase tracking-widest">DATA_LOG</h2>
            </div>
            <div className="space-y-4 font-mono">
              <div className="flex flex-col space-y-1 p-3 border border-glitch-cyan/20 bg-glitch-cyan/5">
                <span className="text-[8px] text-glitch-cyan/60 tracking-widest uppercase">CURRENT_YIELD</span>
                <span className="text-3xl text-glitch-cyan font-bold tabular-nums">{score.toString().padStart(5, '0')}</span>
              </div>
              <div className="flex flex-col space-y-1 p-3 border border-glitch-magenta/20 bg-glitch-magenta/5">
                <span className="text-[8px] text-glitch-magenta/60 tracking-widest uppercase">PEAK_YIELD</span>
                <span className="text-3xl text-glitch-magenta font-bold tabular-nums">{highScore.toString().padStart(5, '0')}</span>
              </div>
            </div>
          </div>

          <div className="crt-border p-6 space-y-6">
            <div className="flex items-center space-x-3 text-glitch-magenta">
              <Gamepad2 className="w-5 h-5" />
              <h2 className="text-[10px] font-pixel uppercase tracking-widest">INPUT_MAP</h2>
            </div>
            <ul className="space-y-3 text-[10px] text-white/70 font-mono">
              <li className="flex justify-between items-center p-2 border border-white/5 hover:border-glitch-cyan/30 transition-colors">
                <span className="opacity-50 tracking-widest">VECTOR_SHIFT</span>
                <span className="text-glitch-cyan font-bold">ARROWS</span>
              </li>
              <li className="flex justify-between items-center p-2 border border-white/5 hover:border-glitch-magenta/30 transition-colors">
                <span className="opacity-50 tracking-widest">HALT_PROCESS</span>
                <span className="text-glitch-magenta font-bold">SPACE</span>
              </li>
              <li className="flex justify-between items-center p-2 border border-white/5 hover:border-white/30 transition-colors">
                <span className="opacity-50 tracking-widest">REBOOT_CORE</span>
                <span className="text-white font-bold">CLICK</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Center: The Void */}
        <section className="lg:col-span-1 flex flex-col items-center order-1 lg:order-2">
          <div 
            className="relative crt-border overflow-hidden cursor-crosshair"
            style={{ 
              width: 'min(90vw, 400px)', 
              height: 'min(90vw, 400px)',
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
            }}
            onClick={() => isGameOver && resetGame()}
          >
            {/* Grid Background */}
            <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 opacity-5 pointer-events-none">
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-glitch-cyan/20" />
              ))}
            </div>

            {/* Trail Afterglow */}
            {trail.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0.4, scale: 1 }}
                animate={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-glitch-cyan/30"
                style={{
                  gridColumnStart: t.x + 1,
                  gridRowStart: t.y + 1,
                  zIndex: 1
                }}
              />
            ))}

            {/* Snake Entity */}
            {snake.map((segment, i) => (
              <motion.div
                key={`${segment.x}-${segment.y}-${i}`}
                initial={false}
                animate={{ 
                  backgroundColor: i === 0 ? '#00ffff' : '#ff00ff',
                  boxShadow: i === 0 
                    ? ['0 0 5px #00ffff', '0 0 15px #00ffff', '0 0 5px #00ffff']
                    : ['0 0 2px #ff00ff', '0 0 8px #ff00ff', '0 0 2px #ff00ff']
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.5, 
                  delay: i * 0.02,
                }}
                className="border border-black"
                style={{
                  gridColumnStart: segment.x + 1,
                  gridRowStart: segment.y + 1,
                  zIndex: 10 - i
                }}
              />
            ))}

            {/* Resource Node */}
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
                rotate: [0, 90, 180, 270, 360]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="bg-glitch-magenta shadow-[0_0_15px_#ff00ff]"
              style={{
                gridColumnStart: food.x + 1,
                gridRowStart: food.y + 1,
                zIndex: 5
              }}
            />

            {/* Overlays */}
            <AnimatePresence>
              {isGameOver && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-glitch-black/90 flex flex-col items-center justify-center space-y-6 z-50 p-8 text-center"
                >
                  <h2 className="text-2xl font-pixel text-glitch-magenta glitch-text" data-text="CRITICAL_FAILURE">CRITICAL_FAILURE</h2>
                  <div className="font-mono text-[10px] text-white/60 space-y-1">
                    <p>CORE_DUMP_COMPLETE</p>
                    <p>YIELD_CAPTURED: {score}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); resetGame(); }}
                    className="pixel-btn pixel-btn-magenta"
                  >
                    REBOOT_SYSTEM
                  </button>
                </motion.div>
              )}

              {isPaused && !isGameOver && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-glitch-black/60 backdrop-blur-[4px] flex flex-col items-center justify-center z-40"
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsPaused(false); }}
                    className="pixel-btn"
                  >
                    RESUME_PROCESS
                  </button>
                  <p className="mt-4 text-glitch-cyan font-mono text-[8px] tracking-[0.5em] animate-pulse">SYSTEM_IDLE</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right Sidebar: Audio Engine */}
        <section className="lg:col-span-1 space-y-6 order-3">
          <div className="crt-border p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-glitch-cyan">
                <Music className="w-5 h-5" />
                <h2 className="text-[10px] font-pixel uppercase tracking-widest">AUDIO_ENGINE</h2>
              </div>
              <button onClick={toggleMute} className="text-white/40 hover:text-glitch-cyan transition-colors">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Track Info */}
            <div className="space-y-4">
              <div className="relative aspect-square border border-glitch-cyan/20 flex items-center justify-center overflow-hidden bg-glitch-cyan/5">
                <motion.div 
                  animate={{ 
                    rotate: isPlaying ? 360 : 0,
                    scale: isPlaying ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 20, ease: "linear" },
                    scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                  }}
                  className="w-3/4 h-3/4 border-2 border-glitch-cyan/40 flex items-center justify-center relative"
                >
                   <div className="absolute inset-0 flex items-center justify-center opacity-20">
                     <div className="w-full h-[1px] bg-glitch-cyan" />
                     <div className="h-full w-[1px] bg-glitch-cyan absolute" />
                   </div>
                   <Music className="w-12 h-12 text-glitch-cyan/60" />
                </motion.div>
              </div>
              
              <div className="space-y-1 text-center">
                <h3 className="text-[10px] font-pixel text-glitch-cyan truncate">{currentTrack.title}</h3>
                <p className="text-[8px] text-white/40 font-mono uppercase tracking-widest">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-4">
              <button onClick={prevTrack} className="text-white/40 hover:text-glitch-cyan transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={togglePlay}
                className="w-12 h-12 border-2 border-glitch-cyan flex items-center justify-center hover:bg-glitch-cyan hover:text-glitch-black transition-all group"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-1" />
                )}
              </button>
              <button onClick={nextTrack} className="text-white/40 hover:text-glitch-cyan transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <audio 
              ref={audioRef}
              src={currentTrack.url}
              muted={isMuted}
              onEnded={nextTrack}
            />
          </div>

          {/* Track List */}
          <div className="crt-border p-4">
            <h4 className="text-[8px] font-mono text-white/40 mb-3 uppercase tracking-[0.3em]">STORAGE_NODES</h4>
            <div className="space-y-1">
              {TRACKS.map((track, idx) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`w-full flex items-center justify-between p-2 text-[8px] font-mono transition-colors ${
                    currentTrackIndex === idx ? 'bg-glitch-cyan/20 text-glitch-cyan border-l-2 border-glitch-cyan' : 'hover:bg-white/5 text-white/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="opacity-30">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="tracking-widest uppercase">{track.title}</span>
                  </div>
                  {currentTrackIndex === idx && isPlaying && (
                    <div className="flex items-end space-x-0.5 h-2">
                      <motion.div animate={{ height: [2, 8, 3] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-glitch-cyan" />
                      <motion.div animate={{ height: [8, 3, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-glitch-cyan" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-white/10 font-mono text-[8px] uppercase tracking-[0.5em] mt-auto z-10">
        [ SYSTEM_REVISION: 2.0.4 // ENCRYPTION: ACTIVE ]
      </footer>
    </div>
  );
}
