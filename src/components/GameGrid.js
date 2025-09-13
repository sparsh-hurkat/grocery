import React from 'react';
import GridCell from './GridCell';
import { MAZE_LAYOUT, GRID_SIZE } from '../utils/maze';

const GameGrid = ({ pacmanPosition, pellets, direction }) => {
  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isPacman = x === pacmanPosition.x && y === pacmanPosition.y;
        const isWall = MAZE_LAYOUT[y][x] === 1;
        const isPellet = pellets.has(`${x},${y}`);
        grid.push(
          <GridCell
            key={`${x}-${y}`}
            x={x}
            y={y}
            isPacman={isPacman}
            isWall={isWall}
            isPellet={isPellet}
            direction={direction}
          />
        );
      }
    }
    return grid;
  };

  return (
    <div
      className="game-grid"
      style={{ width: GRID_SIZE*20, height: GRID_SIZE*20 }}
    >
      {renderGrid()}
    </div>
  );
};

export default GameGrid;
