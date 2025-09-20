import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MAZE_LAYOUT } from './GameBoard'

function PowerPellet({ position, collected, id }) {
  const meshRef = useRef()

  // Glowing animation
  useFrame((state) => {
    if (meshRef.current && !collected) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7
      meshRef.current.material.emissiveIntensity = pulse
      meshRef.current.rotation.y += 0.02
    }
  })

  if (collected) return null

  return (
    <mesh ref={meshRef} position={[position[0], position[1] + 0.2, position[2]]}>
      <sphereGeometry args={[0.2, 12, 12]} />
      <meshLambertMaterial 
        color="#ff0000" 
        emissive="#ff0000" 
        emissiveIntensity={0.7}
      />
    </mesh>
  )
}

function PowerPellets({ collectedPowerPellets }) {
  const boardSize = MAZE_LAYOUT.length
  const offset = (boardSize - 1) / 2

  // Define specific locations for power pellets near walls
  const powerPelletLocations = [
    { id: 'power-1', gridX: 1, gridZ: 1 },   // Top-left corner
    { id: 'power-2', gridX: 5, gridZ: 1 },  // Top-right corner
    { id: 'power-3', gridX: 1, gridZ: 11 },  // Bottom-left corner
    { id: 'power-4', gridX: 11, gridZ: 11 }, // Bottom-right corner
    { id: 'power-5', gridX: 6, gridZ: 6 },   // Center area
  ]

  // Filter to only include valid locations (next to walls but not on walls)
  const validPowerPellets = powerPelletLocations.filter(({ gridX, gridZ }) => {
    // Check if the position is an open path
    if (MAZE_LAYOUT[gridZ] && MAZE_LAYOUT[gridZ][gridX] === 0) {
      // Check if there's at least one adjacent wall
      const adjacentPositions = [
        [gridX - 1, gridZ], [gridX + 1, gridZ],
        [gridX, gridZ - 1], [gridX, gridZ + 1]
      ]
      
      return adjacentPositions.some(([x, z]) => {
        if (x >= 0 && x < MAZE_LAYOUT[0].length && z >= 0 && z < MAZE_LAYOUT.length) {
          return MAZE_LAYOUT[z][x] === 1 // Is a wall
        }
        return false
      })
    }
    return false
  })

  return (
    <group>
      {validPowerPellets.map(({ id, gridX, gridZ }) => {
        const worldPosition = [gridX - offset, 0, gridZ - offset]
        return (
          <PowerPellet
            key={id}
            id={id}
            position={worldPosition}
            collected={collectedPowerPellets.has(id)}
          />
        )
      })}
    </group>
  )
}

// Export the power pellet locations for game logic
export const getPowerPelletPositions = () => {
  const boardSize = MAZE_LAYOUT.length
  const offset = (boardSize - 1) / 2
  const powerPelletLocations = [
    { id: 'power-1', gridX: 1, gridZ: 1 },
    { id: 'power-2', gridX: 5, gridZ: 1 },
    { id: 'power-3', gridX: 1, gridZ: 11 },
    { id: 'power-4', gridX: 11, gridZ: 11 },
    { id: 'power-5', gridX: 6, gridZ: 6 },
  ]

  const powerPellets = new Map()
  
  powerPelletLocations.forEach(({ id, gridX, gridZ }) => {
    if (MAZE_LAYOUT[gridZ] && MAZE_LAYOUT[gridZ][gridX] === 0) {
      const worldPosition = [gridX - offset, 0, gridZ - offset]
      powerPellets.set(id, worldPosition)
    }
  })
  
  return powerPellets
}

export default PowerPellets