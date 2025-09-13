import React, { useState, useEffect } from 'react';
import './App.css';

const GRID_SIZE = 21;
const CELL_SIZE = 20;

// Define the maze layout - 1 represents walls, 0 represents empty space
const MAZE_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,1,1],
  [0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0],
  [1,1,1,1,0,1,0,1,1,0,0,0,1,1,0,1,0,1,1,1,1],
  [0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0],
  [1,1,1,1,0,1,0,1,1,0,0,0,1,1,0,1,0,1,1,1,1],
  [0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0],
  [1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const App = () => {
  const [pacmanPosition, setPacmanPosition] = useState({ x: 10, y: 15 });
  const [direction, setDirection] = useState('right');
  const [pellets, setPellets] = useState(new Set());
  const [score, setScore] = useState(0);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsPosition, setGpsPosition] = useState(null);
  const [lastGpsPosition, setLastGpsPosition] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [movementThreshold, setMovementThreshold] = useState(5); // meters

  // Initialize pellets on empty spaces
  useEffect(() => {
    const initialPellets = new Set();
    
    // Add pellets to all empty spaces except Pac-Man's starting position
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (MAZE_LAYOUT[y][x] === 0 && !(x === 10 && y === 15)) {
          initialPellets.add(`${x},${y}`);
        }
      }
    }
    
    setPellets(initialPellets);
  }, []);

  // Helper function to check if a position is valid (not a wall)
  const isValidPosition = (x, y) => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
      return false;
    }
    return MAZE_LAYOUT[y][x] === 0;
  };

  // Helper function to check if there's a pellet at a position
  const hasPellet = (x, y) => {
    return pellets.has(`${x},${y}`);
  };

  // Helper function to consume a pellet
  const consumePellet = (x, y) => {
    const pelletKey = `${x},${y}`;
    if (pellets.has(pelletKey)) {
      setPellets(prev => {
        const newPellets = new Set(prev);
        newPellets.delete(pelletKey);
        return newPellets;
      });
      setScore(prev => prev + 10);
      return true;
    }
    return false;
  };

  // Calculate distance between two GPS coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Calculate bearing (direction) between two GPS coordinates
  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    let bearing = Math.atan2(y, x) * 180/Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360 degrees
  };

  // Move Pac-Man based on GPS movement
  const movePacmanFromGPS = (newLat, newLon) => {
    console.log('movePacmanFromGPS', newLat, newLon);
    if (!lastGpsPosition) return;

    const distance = calculateDistance(
      lastGpsPosition.latitude,
      lastGpsPosition.longitude,
      newLat,
      newLon
    );

    // Only move if the distance is significant enough
    if (distance >= movementThreshold) {
      const bearing = calculateBearing(
        lastGpsPosition.latitude,
        lastGpsPosition.longitude,
        newLat,
        newLon
      );

      let newDirection = '';
      let newX = pacmanPosition.x;
      let newY = pacmanPosition.y;

      // Convert bearing to Pac-Man direction
      if (bearing >= 315 || bearing < 45) {
        // North (0° ± 45°)
        newDirection = 'up';
        newY = pacmanPosition.y - 1;
      } else if (bearing >= 45 && bearing < 135) {
        // East (90° ± 45°)
        newDirection = 'right';
        newX = pacmanPosition.x + 1;
      } else if (bearing >= 135 && bearing < 225) {
        // South (180° ± 45°)
        newDirection = 'down';
        newY = pacmanPosition.y + 1;
      } else {
        // West (270° ± 45°)
        newDirection = 'left';
        newX = pacmanPosition.x - 1;
      }

      // Check if the new position is valid and move Pac-Man
      if (isValidPosition(newX, newY)) {
        setPacmanPosition({ x: newX, y: newY });
        setDirection(newDirection);
        
        // Consume pellet at the new position
        setPellets(pelletPrev => {
          const pelletKey = `${newX},${newY}`;
          if (pelletPrev.has(pelletKey)) {
            setScore(scorePrev => scorePrev + 10);
            const newPellets = new Set(pelletPrev);
            newPellets.delete(pelletKey);
            return newPellets;
          }
          return pelletPrev;
        });
      }

      // Update last GPS position
      setLastGpsPosition({ latitude: newLat, longitude: newLon });
    }
  };

  // Enable GPS tracking
  const enableGPS = () => {
    if (!navigator.geolocation) {
      alert('GPS is not supported by this browser.');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    const success = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      setGpsPosition({ latitude, longitude });
      setGpsAccuracy(accuracy);
      
      if (!lastGpsPosition) {
        setLastGpsPosition({ latitude, longitude });
      } else {
        movePacmanFromGPS(latitude, longitude);
      }
    };

    const error = (err) => {
      console.error('GPS Error:', err);
      alert(`GPS Error: ${err.message}`);
      setGpsEnabled(false);
    };

    navigator.geolocation.watchPosition(success, error, options);
    setGpsEnabled(true);
  };

  // Disable GPS tracking
  const disableGPS = () => {
    setGpsEnabled(false);
    setGpsPosition(null);
    setLastGpsPosition(null);
    setGpsAccuracy(null);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      const { key } = event;
      
      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          setPacmanPosition(prev => {
            const newY = prev.y - 1;
            if (isValidPosition(prev.x, newY)) {
              setDirection('up');
              // Consume pellet at the new position
              setPellets(pelletPrev => {
                const pelletKey = `${prev.x},${newY}`;
                if (pelletPrev.has(pelletKey)) {
                  setScore(scorePrev => scorePrev + 10);
                  const newPellets = new Set(pelletPrev);
                  newPellets.delete(pelletKey);
                  return newPellets;
                }
                return pelletPrev;
              });
              return { ...prev, y: newY };
            }
            return prev;
          });
          break;
        case 'ArrowDown':
          event.preventDefault();
          setPacmanPosition(prev => {
            const newY = prev.y + 1;
            if (isValidPosition(prev.x, newY)) {
              setDirection('down');
              // Consume pellet at the new position
              setPellets(pelletPrev => {
                const pelletKey = `${prev.x},${newY}`;
                if (pelletPrev.has(pelletKey)) {
                  setScore(scorePrev => scorePrev + 10);
                  const newPellets = new Set(pelletPrev);
                  newPellets.delete(pelletKey);
                  return newPellets;
                }
                return pelletPrev;
              });
              return { ...prev, y: newY };
            }
            return prev;
          });
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setPacmanPosition(prev => {
            const newX = prev.x - 1;
            if (isValidPosition(newX, prev.y)) {
              setDirection('left');
              // Consume pellet at the new position
              setPellets(pelletPrev => {
                const pelletKey = `${newX},${prev.y}`;
                if (pelletPrev.has(pelletKey)) {
                  setScore(scorePrev => scorePrev + 10);
                  const newPellets = new Set(pelletPrev);
                  newPellets.delete(pelletKey);
                  return newPellets;
                }
                return pelletPrev;
              });
              return { ...prev, x: newX };
            }
            return prev;
          });
          break;
        case 'ArrowRight':
          event.preventDefault();
          setPacmanPosition(prev => {
            const newX = prev.x + 1;
            if (isValidPosition(newX, prev.y)) {
              setDirection('right');
              // Consume pellet at the new position
              setPellets(pelletPrev => {
                const pelletKey = `${newX},${prev.y}`;
                if (pelletPrev.has(pelletKey)) {
                  setScore(scorePrev => scorePrev + 10);
                  const newPellets = new Set(pelletPrev);
                  newPellets.delete(pelletKey);
                  return newPellets;
                }
                return pelletPrev;
              });
              return { ...prev, x: newX };
            }
            return prev;
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Create grid cells
  const renderGrid = () => {
    const grid = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isPacman = x === pacmanPosition.x && y === pacmanPosition.y;
        const isWall = MAZE_LAYOUT[y][x] === 1;
        const isPellet = hasPellet(x, y);
        
        grid.push(
          <div
            key={`${x}-${y}`}
            className={`grid-cell ${isPacman ? 'pacman' : ''} ${isWall ? 'wall' : ''}`}
            style={{
              left: x * CELL_SIZE,
              top: y * CELL_SIZE,
            }}
          >
            {isPacman && (
              <div className={`pacman-character ${direction}`}>
                🟡
              </div>
            )}
            {isWall && (
              <div className="wall-block">
                █
              </div>
            )}
            {isPellet && !isPacman && (
              <div className="pellet">
                •
              </div>
            )}
          </div>
        );
      }
    }
    
    return grid;
  };

  return (
    <div className="App">
      <div className="game-container">
        <h1>Pac-Man Game</h1>
        <div className="game-info">
          <p>Use arrow keys or GPS to move Pac-Man around the grid!</p>
          <div className="controls">
            <button 
              onClick={gpsEnabled ? disableGPS : enableGPS}
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
          <div className="pellets-left">Pellets Left: {pellets.size}</div>
          {gpsEnabled && gpsPosition && (
            <div className="gps-info">
              <div className="gps-coords">
                GPS: {gpsPosition.latitude.toFixed(6)}, {gpsPosition.longitude.toFixed(6)}
              </div>
              <div className="gps-accuracy">
                Accuracy: {gpsAccuracy ? `${gpsAccuracy.toFixed(1)}m` : 'Unknown'}
              </div>
            </div>
          )}
        </div>
        <div 
          className="game-grid"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {renderGrid()}
        </div>
      </div>
    </div>
  );
};

export default App;
