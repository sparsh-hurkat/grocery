import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

function PacMan({ position, direction, isMoving, compassHeading, useCompass = false }) {
  const groupRef = useRef()
  const [mouthOpen, setMouthOpen] = useState(0)

  // Eating animation - oscillate mouth open/close when moving
  useFrame((state, delta) => {
    if (isMoving) {
      // Fast eating animation
      setMouthOpen(Math.sin(state.clock.elapsedTime * 25) * 0.5 + 0.5)
    } else {
      // Slowly close mouth when not moving
      setMouthOpen(prev => Math.max(0, prev - delta * 2))
    }
  })

  // Calculate rotation based on real compass or game direction
  const getRotation = () => {
    if (useCompass && compassHeading !== undefined) {
      // Use real compass heading (0° = North, 90° = East, 180° = South, 270° = West)
      // Convert compass heading to Y rotation for Three.js
      // In Three.js: 0° Y-rotation = facing positive X (East)
      // So we need to adjust: compassHeading 0° (North) should be -90° Y-rotation
      const compassRadians = (compassHeading * Math.PI) / 180
      // Adjust so 0° compass (North) = -π/2 Y-rotation (negative Z direction)
      return [0, -compassRadians + Math.PI / 2, 0]
    } else {
      // Use game direction (keyboard controls)
      switch (direction) {
        case 'right': // East - mouth points toward positive X
          return [0, Math.PI, 0]
        case 'left': // West - mouth points toward negative X  
          return [0, 0, 0]
        case 'up': // North - mouth points toward negative Z (up on screen)
          return [0, -Math.PI / 2, 0]
        case 'down': // South - mouth points toward positive Z (down on screen)
          return [0, Math.PI / 2, 0]
        default:
          return [0, 0, 0]
      }
    }
  }

  // Calculate mouth opening based on animation
  // When fully closed: mouthAngle = 0, when fully open: mouthAngle = Math.PI/2 (90 degrees)
  const mouthAngle = Math.PI * 0.5 * mouthOpen // 0 to 90 degrees
  
  // Start from -mouthAngle/2 and draw the rest of the circle minus the mouth opening
  const phiStart = mouthAngle / 2 // Start after the mouth opening
  const phiLength = Math.PI * 2 - mouthAngle // Draw everything except the mouth

  return (
    <group ref={groupRef} position={position} rotation={getRotation()}>
      {/* Pac-Man body with animated mouth */}
      <mesh>
        <sphereGeometry args={[
          0.3, // radius
          16, // widthSegments
          8, // heightSegments
          phiStart, // phiStart (where to start drawing the sphere)
          phiLength, // phiLength (how much of the circle to draw)
          0, // thetaStart (vertical angle start)
          Math.PI // thetaLength (vertical span - full hemisphere)
        ]} />
        <meshLambertMaterial color="#ffff00" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[0.2, 0.1, 0.1]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[0.2, 0.1, -0.1]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
    </group>
  )
}

export default PacMan