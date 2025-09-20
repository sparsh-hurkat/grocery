import React from 'react'

// Simple maze layout (1 = wall, 0 = open path)
const MAZE_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,0,0,1,0,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,0,1,0,0,1,0,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,1,0,0,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
]

function Wall({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial color="#0066ff" />
    </mesh>
  )
}

function Floor({ position }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshLambertMaterial color="#001122" />
    </mesh>
  )
}

function GameBoard() {
  const boardSize = MAZE_LAYOUT.length
  const offset = (boardSize - 1) / 2

  return (
    <group>
      {MAZE_LAYOUT.map((row, z) =>
        row.map((cell, x) => (
          <React.Fragment key={`${x}-${z}`}>
            {/* Always render floor */}
            <Floor position={[x - offset, -0.5, z - offset]} />
            {/* Render wall if cell is 1 */}
            {cell === 1 && (
              <Wall position={[x - offset, 0, z - offset]} />
            )}
          </React.Fragment>
        ))
      )}
    </group>
  )
}

export { MAZE_LAYOUT }
export default GameBoard