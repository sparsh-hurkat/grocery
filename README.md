# 3D Pac-Man Game

A 3D Pac-Man style game built with React and Three.js. Navigate through a 3D maze collecting pellets while avoiding walls.

## Features

- 3D rendered maze using Three.js
- Smooth Pac-Man character with animation
- **Dual control modes:**
  - Arrow key controls (↑ ↓ ← →)
  - **Real compass/gyroscope control** - Pac-Man faces your actual direction!
- Pellet collection system (10 points each)
- **Power pellets** - Red glowing pellets worth 100 points
- Collision detection with walls
- Real-time score tracking (top-right display)
- Win condition when all pellets AND power pellets collected

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Controls

**Manual Controls:**
- **Arrow Keys**: Move Pac-Man in four directions
- **Mouse**: Orbit around the 3D scene (camera controls)

**Compass Controls (Mobile/Tablet):**
- **Real Compass**: Pac-Man automatically faces your actual direction (North, South, East, West)
- **Forward Button**: Move forward in the direction you're facing
- **Permission Required**: Allow device orientation access when prompted

> ⚠️ **Note**: Compass features require HTTPS and a mobile device with magnetometer/gyroscope

### Building for Production

```bash
npm run build
```

## Technologies Used

- React 18
- Three.js
- @react-three/fiber
- @react-three/drei
- Vite (build tool)

## Game Mechanics

- Use arrow keys to move Pac-Man through the maze
- Collect all yellow pellets to win the game
- Collision detection prevents moving through walls
- Score increases by 10 points for each pellet collected
- Game completion is triggered when all pellets are collected

## Development

The project structure is organized as follows:

```
src/
├── components/
│   ├── Game.jsx          # Main game logic and state
│   ├── GameBoard.jsx     # 3D maze layout and rendering
│   ├── PacMan.jsx        # Pac-Man character component
│   └── Pellets.jsx       # Pellet generation and rendering
├── hooks/
│   └── useKeyboard.jsx   # Keyboard input handling
└── utils/
    └── gameUtils.js      # Game utility functions
```