import React, { useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import GameBoard from './GameBoard'
import PacMan from './PacMan'
import Pellets from './Pellets'
import PowerPellets, { getPowerPelletPositions } from './PowerPellets'
import ScoreDisplay from './ScoreDisplay'
import CompassControls from './CompassControls'
import useKeyboard from '../hooks/useKeyboard'
import useCompass from '../hooks/useCompass'
import {
  isValidPosition,
  getNextPosition,
  checkPelletCollision,
  getAllPelletPositions,
  getStartingPosition
} from '../utils/gameUtils'

function Game() {
  const keys = useKeyboard()
  const compass = useCompass()
  const [pacmanPosition, setPacmanPosition] = useState(getStartingPosition())
  const [pacmanDirection, setPacmanDirection] = useState('right')
  const [collectedPellets, setCollectedPellets] = useState(new Set())
  const [collectedPowerPellets, setCollectedPowerPellets] = useState(new Set())
  const [score, setScore] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [useCompassMode, setUseCompassMode] = useState(false)
  const moveSpeed = 0.08
  const lastMoveTime = useRef(0)
  const moveInterval = 16 // milliseconds (about 60 FPS)
  
  // Enable compass mode when compass is available and granted
  useEffect(() => {
    if (compass.isSupported && compass.permission === 'granted') {
      setUseCompassMode(true)
    }
  }, [compass.isSupported, compass.permission])
  
  // Handle forward movement in compass direction
  const handleForwardMove = () => {
    if (!compass.isSupported || compass.permission !== 'granted') return
    
    const nextPosition = getNextPosition(pacmanPosition, compass.gameDirection, moveSpeed)
    const [nextX, nextY, nextZ] = nextPosition

    // Check if the next position is valid
    if (isValidPosition(nextX, nextZ)) {
      setPacmanPosition(nextPosition)
      setPacmanDirection(compass.gameDirection)
      setIsMoving(true)

      // Check for pellet collisions (same logic as keyboard movement)
      allPellets.forEach((pelletPos, pelletId) => {
        if (!collectedPellets.has(pelletId) && 
            checkPelletCollision(nextPosition, pelletPos)) {
          setCollectedPellets(prev => new Set(prev).add(pelletId))
          setScore(prev => prev + 10)
        }
      })
      
      // Check for power pellet collisions
      allPowerPellets.forEach((powerPelletPos, powerPelletId) => {
        if (!collectedPowerPellets.has(powerPelletId) && 
            checkPelletCollision(nextPosition, powerPelletPos, 0.5)) {
          setCollectedPowerPellets(prev => new Set(prev).add(powerPelletId))
          setScore(prev => prev + 100)
        }
      })
    }
  }
  
  // Handle compass permission request
  const handleRequestPermission = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission()
        // The useCompass hook will handle the response
      } catch (error) {
        console.log('Permission request failed:', error)
      }
    }
  }

  // Get all pellet positions
  const allPellets = getAllPelletPositions()
  const allPowerPellets = getPowerPelletPositions()

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime * 1000
    
    if (currentTime - lastMoveTime.current < moveInterval) {
      return
    }

    let newDirection = pacmanDirection
    let shouldMove = false

    // Check for new direction input
    if (keys.ArrowUp) {
      newDirection = 'up'
      shouldMove = true
    } else if (keys.ArrowDown) {
      newDirection = 'down'
      shouldMove = true
    } else if (keys.ArrowLeft) {
      newDirection = 'left'
      shouldMove = true
    } else if (keys.ArrowRight) {
      newDirection = 'right'
      shouldMove = true
    }

    if (shouldMove) {
      const nextPosition = getNextPosition(pacmanPosition, newDirection, moveSpeed)
      const [nextX, nextY, nextZ] = nextPosition

      // Check if the next position is valid
      if (isValidPosition(nextX, nextZ)) {
        setPacmanPosition(nextPosition)
        setPacmanDirection(newDirection)
        setIsMoving(true)
        lastMoveTime.current = currentTime

        // Check for regular pellet collisions
        allPellets.forEach((pelletPos, pelletId) => {
          if (!collectedPellets.has(pelletId) && 
              checkPelletCollision(nextPosition, pelletPos)) {
            setCollectedPellets(prev => new Set(prev).add(pelletId))
            setScore(prev => prev + 10)
          }
        })
        
        // Check for power pellet collisions
        allPowerPellets.forEach((powerPelletPos, powerPelletId) => {
          if (!collectedPowerPellets.has(powerPelletId) && 
              checkPelletCollision(nextPosition, powerPelletPos, 0.5)) { // Larger collision radius
            setCollectedPowerPellets(prev => new Set(prev).add(powerPelletId))
            setScore(prev => prev + 100) // Power pellets worth 100 points
          }
        })
      } else {
        setIsMoving(false)
      }
    } else {
      setIsMoving(false)
    }
  })

  const totalPellets = allPellets.size
  const totalPowerPellets = allPowerPellets.size
  const remainingPellets = totalPellets - collectedPellets.size
  const remainingPowerPellets = totalPowerPellets - collectedPowerPellets.size
  const gameComplete = remainingPellets === 0 && remainingPowerPellets === 0

  return (
    <group>
      <GameBoard />
      <PacMan 
        position={pacmanPosition} 
        direction={pacmanDirection} 
        isMoving={isMoving}
        compassHeading={compass.heading}
        useCompass={useCompassMode}
      />
      <Pellets collectedPellets={collectedPellets} />
      <PowerPellets collectedPowerPellets={collectedPowerPellets} />
      <ScoreDisplay score={score} />
      
      <CompassControls
        onForwardMove={handleForwardMove}
        isCompassSupported={compass.isSupported}
        compassPermission={compass.permission}
        compassDirection={compass.compassDirection}
        heading={compass.heading}
        isInitialized={compass.isInitialized}
        onRequestPermission={handleRequestPermission}
      />
      
      {/* Game complete check */}
      {gameComplete && (
        <mesh position={[0, 2, 0]}>
          <planeGeometry args={[8, 3]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  )
}

export default Game