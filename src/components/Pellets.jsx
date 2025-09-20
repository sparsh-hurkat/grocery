import React from 'react'
import { MAZE_LAYOUT } from './GameBoard'

function Pellet({ position, collected }) {
  if (collected) return null

  return (
    <mesh position={[position[0], position[1] + 0.1, position[2]]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshLambertMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} />
    </mesh>
  )
}

function Pellets({ collectedPellets, onPelletCollected }) {
  const boardSize = MAZE_LAYOUT.length
  const offset = (boardSize - 1) / 2
  const pellets = []

  // Generate pellets for all open spaces (0) in the maze
  MAZE_LAYOUT.forEach((row, z) => {
    row.forEach((cell, x) => {
      if (cell === 0) { // Open path
        const pelletId = `${x}-${z}`
        const position = [x - offset, 0, z - offset]
        
        pellets.push(
          <Pellet
            key={pelletId}
            position={position}
            collected={collectedPellets.has(pelletId)}
          />
        )
      }
    })
  })

  return <group>{pellets}</group>
}

export default Pellets