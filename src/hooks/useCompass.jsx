import { useState, useEffect } from 'react'

function useCompass() {
  const [heading, setHeading] = useState(0) // 0-359 degrees
  const [compassDirection, setCompassDirection] = useState('north')
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState('unknown')
  const [isInitialized, setIsInitialized] = useState(false)
  const [needsUserActivation, setNeedsUserActivation] = useState(false)

  useEffect(() => {
    let watchId = null
    let timeoutId = null
    let orientationHandler = null

    const initializeCompass = async () => {
      // Check if we're on a mobile device with compass capability
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (!isMobile) {
        console.log('Desktop device detected - compass not available')
        setIsSupported(false)
        setPermission('not-available')
        setIsInitialized(true)
        return
      }

      // Check if DeviceOrientationEvent is supported
      if (!window.DeviceOrientationEvent) {
        console.log('Device orientation not supported')
        setIsSupported(false)
        setPermission('not-supported')
        setIsInitialized(true)
        return
      }

      // Check if we need user activation (Android Chrome requirement)
      const isAndroid = /Android/i.test(navigator.userAgent)
      const isChrome = /Chrome/i.test(navigator.userAgent)
      
      if (isAndroid && isChrome) {
        // Android Chrome needs user interaction first
        setNeedsUserActivation(true)
        setPermission('needs-activation')
        setIsInitialized(true)
        return
      }

      // Set a timeout to detect if compass data never arrives
      timeoutId = setTimeout(() => {
        if (!isInitialized) {
          console.log('Compass initialization timeout - assuming not supported')
          setIsSupported(false)
          setPermission('timeout')
          setIsInitialized(true)
        }
      }, 5000) // 5 second timeout

      // Request permission for iOS 13+
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const response = await DeviceOrientationEvent.requestPermission()
          setPermission(response)
          if (response !== 'granted') {
            console.log('Device orientation permission denied')
            setIsSupported(false)
            setIsInitialized(true)
            return
          }
        } catch (error) {
          console.log('Error requesting device orientation permission:', error)
          setIsSupported(false)
          setPermission('denied')
          setIsInitialized(true)
          return
        }
      } else {
        setPermission('granted') // Assume granted on non-iOS devices
      }

      setIsSupported(true)

      // Listen for device orientation changes
      orientationHandler = (event) => {
        // Clear timeout once we get orientation data
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        
        if (!isInitialized) {
          setIsInitialized(true)
        }
        
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

      window.addEventListener('deviceorientationabsolute', orientationHandler, true)
      window.addEventListener('deviceorientation', orientationHandler, true)

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
      if (orientationHandler) {
        window.removeEventListener('deviceorientationabsolute', orientationHandler, true)
        window.removeEventListener('deviceorientation', orientationHandler, true)
      }
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
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
  
  // Manual activation function for Android Chrome
  const activateCompass = async () => {
    if (!needsUserActivation) return
    
    console.log('Activating compass manually...')
    setNeedsUserActivation(false)
    setPermission('unknown')
    setIsInitialized(false)
    
    // Start the initialization process with user activation
    let timeoutId = setTimeout(() => {
      if (!isInitialized) {
        console.log('Compass activation timeout')
        setIsSupported(false)
        setPermission('timeout')
        setIsInitialized(true)
      }
    }, 5000)
    
    // Try to request permission if needed
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission()
        if (response !== 'granted') {
          setIsSupported(false)
          setPermission('denied')
          setIsInitialized(true)
          clearTimeout(timeoutId)
          return
        }
      } catch (error) {
        console.log('Permission request failed:', error)
        setIsSupported(false)
        setPermission('denied')
        setIsInitialized(true)
        clearTimeout(timeoutId)
        return
      }
    }
    
    setIsSupported(true)
    setPermission('granted')
    
    // Set up orientation listener
    const orientationHandler = (event) => {
      clearTimeout(timeoutId)
      
      if (!isInitialized) {
        setIsInitialized(true)
      }
      
      if (event.webkitCompassHeading !== undefined) {
        const compassHeading = event.webkitCompassHeading
        setHeading(compassHeading)
        setCompassDirection(getDirectionFromHeading(compassHeading))
      } else if (event.alpha !== null) {
        const alpha = event.alpha
        const adjustedHeading = (360 - alpha) % 360
        setHeading(adjustedHeading)
        setCompassDirection(getDirectionFromHeading(adjustedHeading))
      }
    }
    
    window.addEventListener('deviceorientationabsolute', orientationHandler, true)
    window.addEventListener('deviceorientation', orientationHandler, true)
  }

  return {
    heading,
    compassDirection,
    gameDirection: getGameDirection(),
    isSupported,
    permission,
    isInitialized,
    needsUserActivation,
    activateCompass
  }
}

export default useCompass