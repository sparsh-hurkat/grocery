import { useState, useEffect } from 'react'

function useCompass() {
  const [heading, setHeading] = useState(0) // 0-359 degrees
  const [compassDirection, setCompassDirection] = useState('north')
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState('unknown')

  useEffect(() => {
    let watchId = null

    const initializeCompass = async () => {
      // Check if DeviceOrientationEvent is supported
      if (!window.DeviceOrientationEvent) {
        console.log('Device orientation not supported')
        setIsSupported(false)
        return
      }

      // Request permission for iOS 13+
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const response = await DeviceOrientationEvent.requestPermission()
          setPermission(response)
          if (response !== 'granted') {
            console.log('Device orientation permission denied')
            setIsSupported(false)
            return
          }
        } catch (error) {
          console.log('Error requesting device orientation permission:', error)
          setIsSupported(false)
          return
        }
      }

      setIsSupported(true)

      // Listen for device orientation changes
      const handleOrientation = (event) => {
        if (event.webkitCompassHeading !== undefined) {
          // iOS - webkitCompassHeading gives magnetic north
          const compassHeading = event.webkitCompassHeading
          setHeading(compassHeading)
          setCompassDirection(getDirectionFromHeading(compassHeading))
        } else if (event.alpha !== null) {
          // Android - alpha is degrees from north (0-360)
          // Note: This might need calibration based on device
          const alpha = event.alpha
          const adjustedHeading = (360 - alpha) % 360 // Adjust for proper compass reading
          setHeading(adjustedHeading)
          setCompassDirection(getDirectionFromHeading(adjustedHeading))
        }
      }

      window.addEventListener('deviceorientationabsolute', handleOrientation, true)
      window.addEventListener('deviceorientation', handleOrientation, true)

      // Fallback: Try to use geolocation API for heading if available
      if (navigator.geolocation && navigator.geolocation.watchPosition) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            if (position.coords.heading !== null && position.coords.heading !== undefined) {
              setHeading(position.coords.heading)
              setCompassDirection(getDirectionFromHeading(position.coords.heading))
            }
          },
          (error) => console.log('Geolocation error:', error),
          { enableHighAccuracy: true }
        )
      }
    }

    initializeCompass()

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
      window.removeEventListener('deviceorientation', handleOrientation, true)
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  // Convert heading degrees to cardinal direction
  const getDirectionFromHeading = (degrees) => {
    const normalizedDegrees = (degrees + 360) % 360
    
    if (normalizedDegrees >= 315 || normalizedDegrees < 45) return 'north'
    if (normalizedDegrees >= 45 && normalizedDegrees < 135) return 'east'
    if (normalizedDegrees >= 135 && normalizedDegrees < 225) return 'south'
    if (normalizedDegrees >= 225 && normalizedDegrees < 315) return 'west'
    
    return 'north'
  }

  // Convert compass direction to game direction
  const getGameDirection = () => {
    switch (compassDirection) {
      case 'north': return 'up'
      case 'east': return 'right'
      case 'south': return 'down'
      case 'west': return 'left'
      default: return 'up'
    }
  }

  return {
    heading,
    compassDirection,
    gameDirection: getGameDirection(),
    isSupported,
    permission
  }
}

export default useCompass