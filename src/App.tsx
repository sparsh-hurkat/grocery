import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import SensorDebug from './components/SensorDebug';
import ShoppingList from './components/ShoppingList';
import { useSensors } from './hooks/useSensors';
import { Smartphone, Monitor, PlayCircle, ShieldAlert, ShoppingBag, CheckCircle } from 'lucide-react';

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
  const [gameState, setGameState] = useState<'start' | 'list' | 'playing' | 'gameover' | 'won'>('start');
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  
  // Notification for item collection
  const [notification, setNotification] = useState<string | null>(null);

  const handleStartProcess = async () => {
    await requestPermission();
    setGameState('list');
  };

  const handleStartGame = (items: string[]) => {
    setShoppingList(items);
    setCollectedItems([]);
    setScore(0);
    setGameState('playing');
  };

  const handleItemCollected = (item: string) => {
    setCollectedItems(prev => [...prev, item]);
    setNotification(`Found: ${item}!`);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleGameOver = (won: boolean) => {
    setGameState(won ? 'won' : 'gameover');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const step = 15;
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
      <header className="w-full max-w-lg flex justify-between items-end mb-6 z-10 border-b border-gray-700/50 pb-2">
        <div>
          <h1 className="text-3xl font-black text-yellow-400 tracking-tighter italic drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
            MARKET RUN
          </h1>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${sensorData.permissionGranted ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
            <p className="text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase">
              {gameState === 'playing' ? 'AISLE TRACKING ACTIVE' : 'REALITY SYSTEM'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-white font-bold leading-none">{score}</div>
          <div className="text-[10px] text-gray-500 font-bold">BUDGET SAVED</div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="relative w-full max-w-lg flex flex-col items-center z-10">
        
        {gameState === 'playing' && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs border border-gray-700 z-20 flex gap-2">
             <ShoppingBag size={12} className="text-yellow-400" />
             <span>{collectedItems.length} / {shoppingList.length} Items Found</span>
          </div>
        )}

        {/* Collection Notification Overlay */}
        {notification && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in zoom-in duration-300">
             <div className="bg-green-500 text-black font-black text-xl px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.6)] flex flex-col items-center border-4 border-white transform rotate-[-5deg]">
                <CheckCircle size={32} className="mb-2" />
                {notification}
             </div>
          </div>
        )}
        
        {/* Game Canvas or Start Screens */}
        {gameState === 'playing' ? (
           <GameCanvas 
             sensorData={sensorData} 
             shoppingList={shoppingList}
             onScoreUpdate={(pts) => setScore(p => p + pts)}
             onGameOver={handleGameOver}
             onItemCollected={handleItemCollected}
           />
        ) : gameState === 'list' ? (
           <ShoppingList onStart={handleStartGame} />
        ) : (
          <div className="w-full aspect-square bg-gray-900/80 backdrop-blur-sm border-2 border-blue-500/50 rounded-xl flex flex-col items-center justify-center text-center p-8 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
            
            {gameState === 'start' && (
              <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                  <ShoppingBag size={64} className="text-yellow-400 relative z-10 mx-auto" />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Ready to Shop?</h2>
                  <div className="bg-black/50 p-4 rounded-lg text-left text-sm text-gray-300 space-y-2 border border-gray-700">
                     <p className="flex items-center gap-2"><Move size={16} className="text-yellow-400"/> <span><strong>Walk</strong> to explore aisles</span></p>
                     <p className="flex items-center gap-2"><ShieldAlert size={16} className="text-red-400"/> <span><strong>Turn</strong> to steer cart</span></p>
                  </div>
                </div>

                <button 
                  onClick={handleStartProcess}
                  className="group relative bg-blue-600 hover:bg-blue-500 text-white font-black text-xl py-4 px-12 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    MAKE LIST <PlayCircle size={24} />
                  </span>
                </button>
                
                <div className="text-xs text-gray-600 flex justify-center gap-2 mt-4">
                  <Monitor size={14} /> Desktop? Use WASD keys
                </div>
              </div>
            )}

            {(gameState === 'gameover' || gameState === 'won') && (
              <div className="space-y-6 animate-in zoom-in duration-300">
                 <div>
                   <h2 className={`text-5xl font-black mb-2 ${gameState === 'won' ? 'text-green-400' : 'text-red-500'} drop-shadow-[0_0_10px_rgba(0,0,0,1)]`}>
                     {gameState === 'won' ? 'SHOPPING DONE!' : 'OUT OF CASH'}
                   </h2>
                   <p className="text-gray-400">FINAL BUDGET</p>
                   <p className="text-4xl text-white font-mono font-bold mt-1">{score}</p>
                 </div>
                 
                 {gameState === 'won' && (
                    <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                       <p className="text-green-200 text-sm">You collected all {collectedItems.length} items!</p>
                    </div>
                 )}

                 <button 
                  onClick={() => setGameState('start')}
                  className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95"
                >
                  NEW LIST
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
         <p className="text-[10px] text-gray-600 font-mono">GROCERY SIMULATOR v2.0</p>
      </div>
    </div>
  );
}

// Helper icon component since Move wasn't imported in App previously
function Move({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  );
}