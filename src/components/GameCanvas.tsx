import React, { useRef, useEffect, useState } from 'react';
import { LEVEL_MAP, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, STEP_FORCE, MOVE_DECAY } from '../constants';
import { SensorData, TileType, Ghost } from '../types';

interface GameCanvasProps {
  sensorData: SensorData;
  onScoreUpdate: (score: number) => void;
  onGameOver: (won: boolean) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ sensorData, onScoreUpdate, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Game State Refs (using refs for mutable game loop state to avoid re-renders)
  const pacmanRef = useRef({ 
    x: TILE_SIZE * 1.5, 
    y: TILE_SIZE * 1.5, 
    radius: TILE_SIZE * 0.4, 
    mouthOpen: 0, 
    mouthSpeed: 0.2,
    velocityX: 0,
    velocityY: 0
  });
  
  const mapRef = useRef<number[][]>(JSON.parse(JSON.stringify(LEVEL_MAP)));
  const ghostsRef = useRef<Ghost[]>([
    { x: 0, y: 0, radius: TILE_SIZE * 0.4, speed: 1.5, direction: 0, color: '#ff0000' } // Blinky
  ]);
  
  const lastStepCount = useRef(sensorData.steps);
  const animationFrameId = useRef<number>(0);

  // Initialize positions
  useEffect(() => {
    if (isInitialized) return;

    // Find start positions
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (LEVEL_MAP[y][x] === TileType.PACMAN_START) {
          pacmanRef.current.x = x * TILE_SIZE + TILE_SIZE / 2;
          pacmanRef.current.y = y * TILE_SIZE + TILE_SIZE / 2;
        }
        if (LEVEL_MAP[y][x] === TileType.GHOST_START) {
           ghostsRef.current[0].x = x * TILE_SIZE + TILE_SIZE / 2;
           ghostsRef.current[0].y = y * TILE_SIZE + TILE_SIZE / 2;
        }
      }
    }
    setIsInitialized(true);
  }, [isInitialized]);

  // Wall Collision Logic
  const checkCollision = (x: number, y: number, radius: number) => {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    // Check surrounding tiles
    const tilesToCheck = [
      { r: 0, c: 0 }, // center
      { r: -1, c: 0 }, { r: 1, c: 0 }, // top, bottom
      { r: 0, c: -1 }, { r: 0, c: 1 }, // left, right
      { r: -1, c: -1 }, { r: -1, c: 1 }, // corners
      { r: 1, c: -1 }, { r: 1, c: 1 }
    ];

    for (const offset of tilesToCheck) {
      const checkR = tileY + offset.r;
      const checkC = tileX + offset.c;

      if (checkR >= 0 && checkR < MAP_HEIGHT && checkC >= 0 && checkC < MAP_WIDTH) {
        if (mapRef.current[checkR][checkC] === TileType.WALL) {
          // AABB Collision (Axis-Aligned Bounding Box) for simplicity vs Circle
          const wallLeft = checkC * TILE_SIZE;
          const wallRight = (checkC + 1) * TILE_SIZE;
          const wallTop = checkR * TILE_SIZE;
          const wallBottom = (checkR + 1) * TILE_SIZE;

          // Closest point on wall to circle center
          const closestX = Math.max(wallLeft, Math.min(x, wallRight));
          const closestY = Math.max(wallTop, Math.min(y, wallBottom));

          const distanceX = x - closestX;
          const distanceY = y - closestY;
          const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

          if (distanceSquared < (radius * radius)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Pellet consumption
  const checkPellet = (x: number, y: number) => {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    if (tileY >= 0 && tileY < MAP_HEIGHT && tileX >= 0 && tileX < MAP_WIDTH) {
      const tile = mapRef.current[tileY][tileX];
      if (tile === TileType.PELLET) {
        mapRef.current[tileY][tileX] = TileType.EMPTY;
        onScoreUpdate(10);
        
        // Check win condition
        let pelletsLeft = false;
        for(let r=0; r<MAP_HEIGHT; r++) {
          for(let c=0; c<MAP_WIDTH; c++) {
            if(mapRef.current[r][c] === TileType.PELLET) pelletsLeft = true;
          }
        }
        if(!pelletsLeft) onGameOver(true);
      }
    }
  };

  // Main Game Loop
  useEffect(() => {
    if (!canvasRef.current || !isInitialized) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // 1. Process Input (Steps)
      if (sensorData.steps > lastStepCount.current) {
        // Step detected! Add burst of velocity in current heading direction
        const angleRad = (sensorData.heading - 90) * (Math.PI / 180); // -90 to align 0 with Up/North
        
        pacmanRef.current.velocityX += Math.cos(angleRad) * STEP_FORCE;
        pacmanRef.current.velocityY += Math.sin(angleRad) * STEP_FORCE;
        
        lastStepCount.current = sensorData.steps;
      }

      // 2. Update Physics
      const pm = pacmanRef.current;
      
      // Apply friction
      pm.velocityX *= MOVE_DECAY;
      pm.velocityY *= MOVE_DECAY;

      // Proposed new position
      const nextX = pm.x + pm.velocityX * 0.16; // Time delta approx
      const nextY = pm.y + pm.velocityY * 0.16;

      // Collision Check X
      if (!checkCollision(nextX, pm.y, pm.radius)) {
        pm.x = nextX;
      } else {
        pm.velocityX = -pm.velocityX * 0.3; // Bounce slightly
      }

      // Collision Check Y
      if (!checkCollision(pm.x, nextY, pm.radius)) {
        pm.y = nextY;
      } else {
        pm.velocityY = -pm.velocityY * 0.3;
      }

      // Screen Wrapping
      if (pm.x < 0) pm.x = MAP_WIDTH * TILE_SIZE;
      if (pm.x > MAP_WIDTH * TILE_SIZE) pm.x = 0;

      // Eat pellets
      checkPellet(pm.x, pm.y);

      // Update Mouth Animation
      pm.mouthOpen += pm.mouthSpeed;
      if (pm.mouthOpen > 0.25 * Math.PI || pm.mouthOpen < 0) pm.mouthSpeed = -pm.mouthSpeed;

      // 3. Move Ghosts (Simple AI: Move towards Pacman)
      ghostsRef.current.forEach(ghost => {
        const dx = pm.x - ghost.x;
        const dy = pm.y - ghost.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Normalize and scale speed
        if (dist > 1) {
            const moveX = (dx / dist) * ghost.speed;
            const moveY = (dy / dist) * ghost.speed;
            
            // Try Move X
            if (!checkCollision(ghost.x + moveX, ghost.y, ghost.radius)) {
                ghost.x += moveX;
            }
            // Try Move Y
            if (!checkCollision(ghost.x, ghost.y + moveY, ghost.radius)) {
                ghost.y += moveY;
            }
        }

        // Ghost Collision
        if (dist < pm.radius + ghost.radius) {
           onGameOver(false);
        }
      });

      // 4. Render
      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw Map
      for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          const tile = mapRef.current[y][x];
          const px = x * TILE_SIZE;
          const py = y * TILE_SIZE;

          if (tile === TileType.WALL) {
            ctx.fillStyle = '#1e3a8a'; // Blue-900
            ctx.strokeStyle = '#3b82f6'; // Blue-500
            ctx.lineWidth = 2;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
          } else if (tile === TileType.PELLET) {
            ctx.fillStyle = '#fbbf24'; // Amber-400
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Pacman
      // Orient mouth based on heading
      const headingRad = (sensorData.heading - 90) * (Math.PI / 180); 
      
      ctx.save();
      ctx.translate(pm.x, pm.y);
      ctx.rotate(headingRad);
      ctx.fillStyle = '#fbbf24'; // Yellow
      ctx.beginPath();
      // Draw standard pacman arc
      // 0 is right, but our heading is rotated so we draw relative to 0
      ctx.arc(0, 0, pm.radius, pm.mouthOpen, Math.PI * 2 - pm.mouthOpen);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.restore();

      // Draw Ghosts
      ghostsRef.current.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, ghost.radius, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ghost.x - 4, ghost.y - 4, 3, 0, Math.PI * 2);
        ctx.arc(ghost.x + 4, ghost.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(ghost.x - 4, ghost.y - 4, 1, 0, Math.PI * 2);
        ctx.arc(ghost.x + 4, ghost.y - 4, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [sensorData, isInitialized, onScoreUpdate, onGameOver]);

  return (
    <canvas 
      ref={canvasRef} 
      width={MAP_WIDTH * TILE_SIZE} 
      height={MAP_HEIGHT * TILE_SIZE}
      className="max-w-full h-auto border-4 border-blue-900 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)]"
    />
  );
};

export default GameCanvas;
