import React, { useRef, useEffect, useState } from 'react';
import { LEVEL_MAP, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, STEP_FORCE, MOVE_DECAY } from '../constants';
import { SensorData, TileType, Ghost } from '../types';

interface GameCanvasProps {
  sensorData: SensorData;
  shoppingList: string[];
  onScoreUpdate: (score: number) => void;
  onGameOver: (won: boolean) => void;
  onItemCollected: (item: string) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  sensorData, 
  shoppingList,
  onScoreUpdate, 
  onGameOver,
  onItemCollected
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Game State Refs
  const pacmanRef = useRef({ 
    x: TILE_SIZE * 1.5, 
    y: TILE_SIZE * 1.5, 
    radius: TILE_SIZE * 0.4, 
    mouthOpen: 0, 
    mouthSpeed: 0.2,
    velocityX: 0,
    velocityY: 0
  });
  
  const mapRef = useRef<number[][]>([]);
  const ghostsRef = useRef<Ghost[]>([
    { x: 0, y: 0, radius: TILE_SIZE * 0.4, speed: 1.5, direction: 0, color: '#ef4444' }, // Red
    { x: 0, y: 0, radius: TILE_SIZE * 0.4, speed: 1.2, direction: 0, color: '#3b82f6' }  // Blue
  ]);
  
  // Map coordinate "x,y" to Item Name
  const itemLocationsRef = useRef<Record<string, string>>({});

  const lastStepCount = useRef(sensorData.steps);
  const animationFrameId = useRef<number>(0);

  // Initialize Map with Shopping Items
  useEffect(() => {
    if (isInitialized) return;

    // 1. Deep copy the map
    const newMap = JSON.parse(JSON.stringify(LEVEL_MAP));
    const newItemsMap: Record<string, string> = {};
    const validPelletLocations: {x: number, y: number}[] = [];

    // 2. Find all valid spots and set initial entities
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const type = newMap[y][x];
        
        if (type === TileType.PACMAN_START) {
          pacmanRef.current.x = x * TILE_SIZE + TILE_SIZE / 2;
          pacmanRef.current.y = y * TILE_SIZE + TILE_SIZE / 2;
        } else if (type === TileType.GHOST_START) {
           // Set all ghosts to start here for now
           ghostsRef.current.forEach(g => {
             g.x = x * TILE_SIZE + TILE_SIZE / 2;
             g.y = y * TILE_SIZE + TILE_SIZE / 2;
           });
        } else if (type === TileType.PELLET) {
          validPelletLocations.push({x, y});
        }
      }
    }

    // 3. Scatter Shopping List Items
    // Shuffle locations
    for (let i = validPelletLocations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [validPelletLocations[i], validPelletLocations[j]] = [validPelletLocations[j], validPelletLocations[i]];
    }

    // Place items
    shoppingList.forEach((itemName, index) => {
      if (index < validPelletLocations.length) {
        const loc = validPelletLocations[index];
        newMap[loc.y][loc.x] = TileType.POWER_PELLET; // Mark as special item
        newItemsMap[`${loc.x},${loc.y}`] = itemName;
      }
    });

    mapRef.current = newMap;
    itemLocationsRef.current = newItemsMap;
    setIsInitialized(true);
  }, [isInitialized, shoppingList]);

  // Wall Collision Logic
  const checkCollision = (x: number, y: number, radius: number) => {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    const tilesToCheck = [
      { r: 0, c: 0 }, { r: -1, c: 0 }, { r: 1, c: 0 }, 
      { r: 0, c: -1 }, { r: 0, c: 1 }, { r: -1, c: -1 }, 
      { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 }
    ];

    for (const offset of tilesToCheck) {
      const checkR = tileY + offset.r;
      const checkC = tileX + offset.c;

      if (checkR >= 0 && checkR < MAP_HEIGHT && checkC >= 0 && checkC < MAP_WIDTH) {
        if (mapRef.current[checkR][checkC] === TileType.WALL) {
          const wallLeft = checkC * TILE_SIZE;
          const wallRight = (checkC + 1) * TILE_SIZE;
          const wallTop = checkR * TILE_SIZE;
          const wallBottom = (checkR + 1) * TILE_SIZE;

          const closestX = Math.max(wallLeft, Math.min(x, wallRight));
          const closestY = Math.max(wallTop, Math.min(y, wallBottom));
          const distanceX = x - closestX;
          const distanceY = y - closestY;

          if ((distanceX * distanceX) + (distanceY * distanceY) < (radius * radius)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Interaction Logic
  const checkInteractions = (x: number, y: number) => {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    if (tileY >= 0 && tileY < MAP_HEIGHT && tileX >= 0 && tileX < MAP_WIDTH) {
      const tile = mapRef.current[tileY][tileX];
      
      if (tile === TileType.PELLET) {
        mapRef.current[tileY][tileX] = TileType.EMPTY;
        onScoreUpdate(10);
      } else if (tile === TileType.POWER_PELLET) {
        // Found a shopping list item!
        mapRef.current[tileY][tileX] = TileType.EMPTY;
        onScoreUpdate(100);
        
        const key = `${tileX},${tileY}`;
        if (itemLocationsRef.current[key]) {
          onItemCollected(itemLocationsRef.current[key]);
        }
        
        // Check win condition (All Power Pellets Eaten)
        let itemsLeft = false;
        for(let r=0; r<MAP_HEIGHT; r++) {
          for(let c=0; c<MAP_WIDTH; c++) {
            if(mapRef.current[r][c] === TileType.POWER_PELLET) itemsLeft = true;
          }
        }
        if(!itemsLeft) onGameOver(true);
      }
    }
  };

  // Main Game Loop
  useEffect(() => {
    if (!canvasRef.current || !isInitialized) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // 1. Process Input
      if (sensorData.steps > lastStepCount.current) {
        const angleRad = (sensorData.heading - 90) * (Math.PI / 180);
        pacmanRef.current.velocityX += Math.cos(angleRad) * STEP_FORCE;
        pacmanRef.current.velocityY += Math.sin(angleRad) * STEP_FORCE;
        lastStepCount.current = sensorData.steps;
      }

      // 2. Update Pacman Physics
      const pm = pacmanRef.current;
      pm.velocityX *= MOVE_DECAY;
      pm.velocityY *= MOVE_DECAY;

      const nextX = pm.x + pm.velocityX * 0.16;
      const nextY = pm.y + pm.velocityY * 0.16;

      if (!checkCollision(nextX, pm.y, pm.radius)) pm.x = nextX;
      else pm.velocityX = -pm.velocityX * 0.3;

      if (!checkCollision(pm.x, nextY, pm.radius)) pm.y = nextY;
      else pm.velocityY = -pm.velocityY * 0.3;

      if (pm.x < 0) pm.x = MAP_WIDTH * TILE_SIZE;
      if (pm.x > MAP_WIDTH * TILE_SIZE) pm.x = 0;

      checkInteractions(pm.x, pm.y);

      // Mouth Animation
      pm.mouthOpen += pm.mouthSpeed;
      if (pm.mouthOpen > 0.25 * Math.PI || pm.mouthOpen < 0) pm.mouthSpeed = -pm.mouthSpeed;

      // 3. Update Ghosts
      ghostsRef.current.forEach((ghost, i) => {
        // Simple AI: Move roughly towards player but with some randomness
        const dx = pm.x - ghost.x;
        const dy = pm.y - ghost.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 1) {
            // Add some "noise" to ghost movement so they don't stack
            const noiseX = Math.sin(Date.now() / 500 + i) * 20; 
            const noiseY = Math.cos(Date.now() / 500 + i) * 20;
            
            const targetX = pm.x + noiseX;
            const targetY = pm.y + noiseY;
            
            const angle = Math.atan2(targetY - ghost.y, targetX - ghost.x);
            const moveX = Math.cos(angle) * ghost.speed;
            const moveY = Math.sin(angle) * ghost.speed;
            
            if (!checkCollision(ghost.x + moveX, ghost.y, ghost.radius)) ghost.x += moveX;
            if (!checkCollision(ghost.x, ghost.y + moveY, ghost.radius)) ghost.y += moveY;
        }

        if (dist < pm.radius + ghost.radius) {
           onGameOver(false);
        }
      });

      // 4. Render
      // Floor (Aisle feel)
      ctx.fillStyle = '#111827'; 
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw Map
      for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          const tile = mapRef.current[y][x];
          const px = x * TILE_SIZE;
          const py = y * TILE_SIZE;

          if (tile === TileType.WALL) {
            // Shelf look
            ctx.fillStyle = '#1e3a8a'; 
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            // Shelf detail
            ctx.fillStyle = '#3b82f6'; 
            ctx.fillRect(px + 2, py + 5, TILE_SIZE - 4, 2);
            ctx.fillRect(px + 2, py + 15, TILE_SIZE - 4, 2);
            ctx.fillRect(px + 2, py + 25, TILE_SIZE - 4, 2);
          } else if (tile === TileType.PELLET) {
            ctx.fillStyle = '#4b5563'; // Gray dust/generic
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === TileType.POWER_PELLET) {
            // Shopping Item
            const pulsingSize = 6 + Math.sin(Date.now() / 200) * 2;
            ctx.fillStyle = '#10b981'; // Emerald Green
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, pulsingSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Question mark or icon hint
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', px + TILE_SIZE/2, py + TILE_SIZE/2);
          }
        }
      }

      // Draw Pacman (Shopper)
      const headingRad = (sensorData.heading - 90) * (Math.PI / 180); 
      ctx.save();
      ctx.translate(pm.x, pm.y);
      ctx.rotate(headingRad);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, pm.radius, pm.mouthOpen, Math.PI * 2 - pm.mouthOpen);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.restore();

      // Draw Ghosts (Other Shoppers)
      ghostsRef.current.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, ghost.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [sensorData, isInitialized, onScoreUpdate, onGameOver, onItemCollected]);

  return (
    <canvas 
      ref={canvasRef} 
      width={MAP_WIDTH * TILE_SIZE} 
      height={MAP_HEIGHT * TILE_SIZE}
      className="max-w-full h-auto border-4 border-gray-700 rounded-lg shadow-2xl bg-gray-900"
    />
  );
};

export default GameCanvas;