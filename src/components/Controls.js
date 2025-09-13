import React from 'react';

const Controls = ({ gpsEnabled, toggleGPS, movementThreshold, setMovementThreshold, score, pelletsLeft }) => {
  return (
    <div className="game-info">
      <p>Use arrow keys or GPS to move Pac-Man around the grid!</p>
      <div className="controls">
        <button 
          onClick={toggleGPS}
          className={`gps-button ${gpsEnabled ? 'enabled' : 'disabled'}`}
        >
          {gpsEnabled ? 'Disable GPS' : 'Enable GPS'}
        </button>
        <div className="movement-threshold">
          <label>Movement Threshold (meters):</label>
          <input
            type="range"
            min="1"
            max="20"
            value={movementThreshold}
            onChange={(e) => setMovementThreshold(parseInt(e.target.value))}
            disabled={!gpsEnabled}
          />
          <span>{movementThreshold}m</span>
        </div>
      </div>
      <div className="score">Score: {score}</div>
      <div className="pellets-left">Pellets Left: {pelletsLeft}</div>
    </div>
  );
};

export default Controls;
