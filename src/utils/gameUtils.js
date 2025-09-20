import { MAZE_LAYOUT } from '../components/GameBoard'

// Check if a position is valid (not a wall)
export function isValidPosition(x, z) {
  const boardSize = MAZE_LAYOUT.length
  const offset = (boardSize - 1) / 2
  
  // Convert world coordinates to array indices
  const arrayX = Math.round(x + offset)
  const arrayZ = Math.round(z + offset)
  
  // Check boundaries
  if (arrayX < 0 || arrayX >= MAZE_LAYOUT[0].length || arrayZ < 0 || arrayZ >= MAZE_LAYOUT.length) {
    return false
  }
  
  // Check if it's not a wall (0 = open path, 1 = wall)
  return MAZE_LAYOUT[arrayZ][arrayX] === 0
}

// Get the next position based on current position and direction
export function getNextPosition(currentPos, direction, speed = 1) {
  const [x, y, z] = currentPos
  
  switch (direction) {
    case 'up':
      return [x, y, z - speed]
    case 'down':
      return [x, y, z + speed]
    case 'left':
      return [x - speed, y, z]
    case 'right':
      return [x + speed, y, z]
    default:
      return currentPos
  }
}

// Check if Pac-Man is close enough to collect a pellet
export function checkPelletCollision(pacmanPos, pelletPos, threshold = 0.3) {
  const [px, py, pz] = pacmanPos
  const [pelx, pely, pelz] = pelletPos
  
  const distance = Math.sqrt(
    Math.pow(px - pelx, 2) + Math.pow(pz - pelz, 2)
  )
  
  return distance < threshold
}

// Get all pellet positions from the maze layout
export function getAllPelletPositions() {
  const boardSize = MAZE_LAYOUT.length
  const offset = (boardSize - 1) / 2
  const pellets = new Map()
  
  MAZE_LAYOUT.forEach((row, z) => {
    row.forEach((cell, x) => {
      if (cell === 0) { // Open path
        const pelletId = `${x}-${z}`
        const position = [x - offset, 0, z - offset]
        pellets.set(pelletId, position)
      }
    })
  })
  
  return pellets
}

// Find a valid starting position for Pac-Man
export function getStartingPosition() {
  const boardSize = MAZE_LAYOUT.length
  const offset = (boardSize - 1) / 2
  
  // Look for the first open space (typically top-left area)
  for (let z = 1; z < boardSize - 1; z++) {
    for (let x = 1; x < MAZE_LAYOUT[z].length - 1; x++) {
      if (MAZE_LAYOUT[z][x] === 0) {
        return [x - offset, 0, z - offset]
      }
    }
  }
  
  // Fallback to center if no valid position found
  return [0, 0, 0]
}