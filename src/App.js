import React, { useState, useEffect } from 'react';
import './App.css';
import { MAZE_LAYOUT, GRID_SIZE } from './utils/maze';
import { calculateDistance, calculateBearing } from './utils/gps';
import GameGrid from './components/GameGrid';
import Controls from './components/Controls';

const App = () => {
  // All state and GPS logic here (same as before)
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

  // Helper function to consume a pellet (used in GPS movement)
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

  // Return JSX
  return (
    <div className="App">
      <div className="game-container">
        <h1>Pac-Man Game</h1>
        <Controls 
          gpsEnabled={gpsEnabled}
          toggleGPS={gpsEnabled ? disableGPS : enableGPS}
          movementThreshold={movementThreshold}
          setMovementThreshold={setMovementThreshold}
          score={score}
          pelletsLeft={pellets.size}
        />
        {/* <GpsControls 
          gpsEnabled={gpsEnabled}
          gpsPosition={gpsPosition}
          gpsAccuracy={gpsAccuracy}
        /> */}
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
        <GameGrid 
          pacmanPosition={pacmanPosition}
          pellets={pellets}
          direction={direction}
        />
      </div>
    </div>
  );
};

export default App;
