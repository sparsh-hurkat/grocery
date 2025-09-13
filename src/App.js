import React, { useState, useEffect } from 'react';
import './App.css';
import { MAZE_LAYOUT, GRID_SIZE } from './utils/maze';
import { calculateDistance, calculateBearing } from './utils/gps';
import GameGrid from './components/GameGrid';
import Controls from './components/Controls';

const App = () => {
  const [pacmanPosition, setPacmanPosition] = useState({ x: 10, y: 15 });
  const [direction, setDirection] = useState('right');
  const [pellets, setPellets] = useState(new Set());
  const [score, setScore] = useState(0);

  // --- GPS state ---
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsPosition, setGpsPosition] = useState(null);
  const [lastGpsPosition, setLastGpsPosition] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [movementThreshold, setMovementThreshold] = useState(0.01);

  // --- Mock GPS state ---
  const [useMockGPS, setUseMockGPS] = useState(false);
  const [mockPosition, setMockPosition] = useState({
    latitude: 40.4400,
    longitude: -79.9959
  });

  // Initialize pellets
  useEffect(() => {
    const initialPellets = new Set();
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (MAZE_LAYOUT[y][x] === 0 && !(x === 10 && y === 15)) {
          initialPellets.add(`${x},${y}`);
        }
      }
    }
    setPellets(initialPellets);
  }, []);

  // Position validity check
  const isValidPosition = (x, y) => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    return MAZE_LAYOUT[y][x] === 0;
  };

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

  // GPS-based movement
  const movePacmanFromGPS = (newLat, newLon) => {
    if (!lastGpsPosition) return;

    const distance = calculateDistance(
      lastGpsPosition.latitude,
      lastGpsPosition.longitude,
      newLat,
      newLon
    );

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

      if (bearing >= 315 || bearing < 45) {
        newDirection = 'up';
        newY--;
      } else if (bearing >= 45 && bearing < 135) {
        newDirection = 'right';
        newX++;
      } else if (bearing >= 135 && bearing < 225) {
        newDirection = 'down';
        newY++;
      } else {
        newDirection = 'left';
        newX--;
      }

      if (isValidPosition(newX, newY)) {
        setPacmanPosition({ x: newX, y: newY });
        setDirection(newDirection);
        consumePellet(newX, newY);
      }

      setLastGpsPosition({ latitude: newLat, longitude: newLon });
    }
  };

  // Enable GPS (real or mock)
  const enableGPS = () => {
    if (useMockGPS) {
      setGpsEnabled(true);
      setGpsPosition(mockPosition);
      setLastGpsPosition(mockPosition);
      return;
    }

    if (!navigator.geolocation) {
      alert('GPS is not supported by this browser.');
      return;
    }

    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 };

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
      alert(`GPS Error: ${err.message}`);
      setGpsEnabled(false);
    };

    navigator.geolocation.watchPosition(success, error, options);
    setGpsEnabled(true);
  };

  const disableGPS = () => {
    setGpsEnabled(false);
    setGpsPosition(null);
    setLastGpsPosition(null);
    setGpsAccuracy(null);
  };

  // Handle mock GPS updates
  useEffect(() => {
    if (useMockGPS && gpsEnabled && mockPosition) {
      setGpsPosition(mockPosition);
      if (!lastGpsPosition) {
        setLastGpsPosition(mockPosition);
      } else {
        movePacmanFromGPS(mockPosition.latitude, mockPosition.longitude);
      }
    }
  }, [mockPosition, useMockGPS, gpsEnabled]);

  return (
    <div className="App">
      <div className="game-container">
        <h1>Pac-Man Game</h1>
        <button onClick={() => setUseMockGPS(!useMockGPS)}>
          {useMockGPS ? "Switch to Real GPS" : "Switch to Mock GPS"}
        </button>
        <Controls 
          gpsEnabled={gpsEnabled}
          toggleGPS={gpsEnabled ? disableGPS : enableGPS}
          movementThreshold={movementThreshold}
          setMovementThreshold={setMovementThreshold}
          score={score}
          pelletsLeft={pellets.size}
        />
        
        {gpsEnabled && gpsPosition && (
          <div className="gps-info">
            <div className="gps-coords">
              GPS: {gpsPosition.latitude.toFixed(6)}, {gpsPosition.longitude.toFixed(6)}
            </div>
            <div className="gps-accuracy">
              Accuracy: {gpsAccuracy ? `${gpsAccuracy.toFixed(1)}m` : (useMockGPS ? "Mock" : "Unknown")}
            </div>
          </div>
        )}

        {useMockGPS && gpsEnabled && (
          <div className="mock-gps-panel">
            <h3>Mock GPS Controls</h3>
            <label>
              Latitude: 
              <input
                type="number"
                value={mockPosition.latitude}
                step="0.0001"
                onChange={(e) =>
                  setMockPosition((prev) => ({
                    ...prev,
                    latitude: parseFloat(e.target.value)
                  }))
                }
              />
            </label>
            <label>
              Longitude: 
              <input
                type="number"
                value={mockPosition.longitude}
                step="0.0001"
                onChange={(e) =>
                  setMockPosition((prev) => ({
                    ...prev,
                    longitude: parseFloat(e.target.value)
                  }))
                }
              />
            </label>
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
