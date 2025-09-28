import { useState, useEffect } from 'react'

function useCompass() {
  const [heading, setHeading] = useState(0) // 0-359 degrees
  const [compassDirection, setCompassDirection] = useState('north')
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState('unknown')
  const [isInitialized, setIsInitialized] = useState(false)
  const [needsUserActivation, setNeedsUserActivation] = useState(false)
  const [debugInfo, setDebugInfo] = useState([])
  
  // Add debug message
  const addDebug = (message) => {
    console.log(message)
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    let watchId = null
    let timeoutId = null
    let orientationHandler = null

    const initializeCompass = async () => {
      addDebug(`🔍 User agent: ${navigator.userAgent}`)
      addDebug(`🔍 DeviceOrientationEvent: ${!!window.DeviceOrientationEvent}`)
      
      // Check if DeviceOrientationEvent is supported
      if (!window.DeviceOrientationEvent) {
        addDebug('❌ DeviceOrientationEvent not supported')
        setIsSupported(false)
        setPermission('not-supported')
        setIsInitialized(true)
        return
      }

      // Check if we're on a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isDesktop = !isMobile && !/Mobi|Android/i.test(navigator.userAgent)
      
      addDebug(`📱 Is mobile: ${isMobile}`)
      addDebug(`💻 Is desktop: ${isDesktop}`)
      
      // Only block on desktop - allow all mobile devices to try
      if (isDesktop) {
        addDebug('💻 Desktop device detected - compass not available')
        setIsSupported(false)
        setPermission('not-available')
        setIsInitialized(true)
        return
      }

      // For mobile devices, always show activation button
      addDebug('📱 Mobile device detected - showing activation button')
      setNeedsUserActivation(true)
      setPermission('needs-activation')
      setIsInitialized(true)
      return
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
  
  // Manual activation function for mobile devices
  const activateCompass = async () => {
    if (!needsUserActivation) return
    
    addDebug('🧭 Activating compass manually...')
    addDebug(`📱 Device info: DeviceOrientationEvent=${!!window.DeviceOrientationEvent}, requestPermission=${typeof DeviceOrientationEvent?.requestPermission === 'function'}`)
    
    setNeedsUserActivation(false)
    setPermission('activating')
    setIsInitialized(false)
    
    // Start the initialization process with user activation
    let timeoutId = setTimeout(() => {
      console.log('⏰ Compass activation timeout - no data received')
      setIsSupported(false)
      setPermission('timeout')
      setIsInitialized(true)
    }, 8000) // Longer timeout for mobile
    
    try {
      // Try to request permission if needed (iOS)
      if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
        console.log('📱 Requesting iOS permission...')
        const response = await DeviceOrientationEvent.requestPermission()
        console.log('📱 iOS permission response:', response)
        
        if (response !== 'granted') {
          console.log('❌ Permission denied')
          setIsSupported(false)
          setPermission('denied')
          setIsInitialized(true)
          clearTimeout(timeoutId)
          return
        }
      } else {
        console.log('📱 No permission request needed (Android/other)')
      }
      
      console.log('✅ Setting up orientation listeners...')
      setIsSupported(true)
      setPermission('granted')
      
      // Set up orientation listener
      const orientationHandler = (event) => {
        console.log('📍 Orientation event received:', {
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma,
          webkitCompassHeading: event.webkitCompassHeading,
          absolute: event.absolute
        })
        
        clearTimeout(timeoutId)
        
        if (!isInitialized) {
          console.log('🎉 Compass initialized successfully!')
          setIsInitialized(true)
        }
        
        if (event.webkitCompassHeading !== undefined) {
          // iOS - webkitCompassHeading gives magnetic north
          const compassHeading = event.webkitCompassHeading
          console.log('🧭 iOS compass heading:', compassHeading)
          setHeading(compassHeading)
          setCompassDirection(getDirectionFromHeading(compassHeading))
        } else if (event.alpha !== null && event.alpha !== undefined) {
          // Android - alpha is degrees from north (0-360)
          const alpha = event.alpha
          const adjustedHeading = (360 - alpha) % 360
          console.log('🧭 Android compass heading:', adjustedHeading, '(raw alpha:', alpha, ')')
          setHeading(adjustedHeading)
          setCompassDirection(getDirectionFromHeading(adjustedHeading))
        } else {
          console.log('⚠️ No usable compass data in event')
        }
      }
      
      // Add both event types for broader compatibility
      window.addEventListener('deviceorientationabsolute', orientationHandler, true)
      window.addEventListener('deviceorientation', orientationHandler, true)
      
      console.log('🔄 Waiting for orientation data...')
      
    } catch (error) {
      console.error('❌ Compass activation failed:', error)
      setIsSupported(false)
      setPermission('error')
      setIsInitialized(true)
      clearTimeout(timeoutId)
    }
  }

  return {
    heading,
    compassDirection,
    gameDirection: getGameDirection(),
    isSupported,
    permission,
    isInitialized,
    needsUserActivation,
    activateCompass,
    debugInfo
  }
}

export default useCompass