import React from 'react';

const GridCell = ({ x, y, isPacman, isWall, isPellet, direction }) => {
  return (
    <div
      className={`grid-cell ${isPacman ? 'pacman' : ''} ${isWall ? 'wall' : ''}`}
      style={{
        left: x * 20,
        top: y * 20,
      }}
    >
      {isPacman && <div className={`pacman-character ${direction}`}>🟡</div>}
      {isWall && <div className="wall-block">█</div>}
      {isPellet && !isPacman && <div className="pellet">•</div>}
    </div>
  );
};

export default GridCell;
