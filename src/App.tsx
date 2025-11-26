import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import SensorDebug from './components/SensorDebug';
import { useSensors } from './hooks/useSensors';
import { Move, Smartphone, Monitor, PlayCircle, ShieldAlert } from 'lucide-react';

export default function App() {
  const { 
    sensorData, 
    requestPermission, 
    simulateStep, 
    setSimulatedHeading,
    stepSensitivity,
    setStepSensitivity
  } = useSensors();

  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'won'>('start');

  const handleStart = async () => {
    await requestPermission();
    setScore(0);
    setGameState('playing');
  };

  const handleGameOver = (won: boolean) => {
    setGameState(won ? 'won' : 'gameover');
  };

  // Keyboard controls for desktop debugging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      const step = 15; // Degrees rotation speed
      let newHeading = sensorData.heading;

      switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          simulateStep();
          break;
        case 'a':
        case 'arrowleft':
          newHeading = (newHeading - step + 360) % 360;
          setSimulatedHeading(newHeading);
          break;
        case 'd':
        case 'arrowright':
          newHeading = (newHeading + step) % 360;
          setSimulatedHeading(newHeading);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, sensorData.heading, simulateStep, setSimulatedHeading]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden select-none relative">
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black -z-10"></div>

      {/* Header */}
      <header className="w-full max-w-lg flex justify-between items-end mb-6 z-10 border-b border-blue-900/50 pb-2">
        <div>
          <h1 className="text-4xl font-black text-yellow-400 tracking-tighter italic drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
            PAC-WALKER
          </h1>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <p className="text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase">Augmented Reality</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono text-white font-bold leading-none">{score.toString().padStart(5, '0')}</div>
          <div className="text-[10px] text-gray-500 font-bold">HIGH SCORE</div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="relative w-full max-w-lg flex flex-col items-center z-10">
        
        {/* Game Canvas or Start Screen */}
        {gameState === 'playing' ? (
           <GameCanvas 
             sensorData={sensorData} 
             onScoreUpdate={(pts) => setScore(p => p + pts)}
             onGameOver={handleGameOver}
           />
        ) : (
          <div className="w-full aspect-square bg-gray-900/80 backdrop-blur-sm border-2 border-blue-500/50 rounded-xl flex flex-col items-center justify-center text-center p-8 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
            
            {gameState === 'start' && (
              <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                  <Smartphone size={64} className="text-blue-400 relative z-10 mx-auto" />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-white tracking-tight">REALITY MODE</h2>
                  <div className="bg-black/50 p-4 rounded-lg text-left text-sm text-gray-300 space-y-2 border border-gray-700">
                     <p className="flex items-center gap-2"><Move size={16} className="text-yellow-400"/> <span><strong>Walk</strong> in real life to move</span></p>
                     <p className="flex items-center gap-2"><ShieldAlert size={16} className="text-red-400"/> <span><strong>Turn</strong> your body to steer</span></p>
                  </div>
                </div>

                <button 
                  onClick={handleStart}
                  className="group relative bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xl py-4 px-12 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(251,191,36,0.8)] active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    PLAY GAME <PlayCircle size={24} />
                  </span>
                </button>
                
                <div className="text-xs text-gray-600 flex justify-center gap-2 mt-4">
                  <Monitor size={14} /> Desktop? Use WASD to test
                </div>
              </div>
            )}

            {(gameState === 'gameover' || gameState === 'won') && (
              <div className="space-y-6 animate-in zoom-in duration-300">
                 <div>
                   <h2 className={`text-5xl font-black mb-2 ${gameState === 'won' ? 'text-green-400' : 'text-red-500'} drop-shadow-[0_0_10px_rgba(0,0,0,1)]`}>
                     {gameState === 'won' ? 'VICTORY' : 'GAME OVER'}
                   </h2>
                   <p className="text-gray-400">FINAL SCORE</p>
                   <p className="text-4xl text-white font-mono font-bold mt-1">{score}</p>
                 </div>
                 <button 
                  onClick={() => setGameState('start')}
                  className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95"
                >
                  TRY AGAIN
                </button>
              </div>
            )}
          </div>
        )}

        {/* Controls Overlay */}
        <div className="mt-6 w-full animate-in slide-in-from-bottom duration-700 delay-200">
          {gameState === 'playing' && (
            <SensorDebug 
              data={sensorData} 
              onSimulateStep={simulateStep}
              onHeadingChange={setSimulatedHeading}
              sensitivity={stepSensitivity}
              onSensitivityChange={setStepSensitivity}
            />
          )}
        </div>

      </div>

      <div className="fixed bottom-2 text-center w-full z-0 opacity-50">
         <p className="text-[10px] text-gray-600 font-mono">SENSOR FUSION ACTIVE • v1.0.0</p>
      </div>
    </div>
  );
}