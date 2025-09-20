import { useState, useEffect } from 'react'

function useKeyboard() {
  const [keys, setKeys] = useState({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  })

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (keys.hasOwnProperty(event.code)) {
        event.preventDefault()
        setKeys((prevKeys) => ({
          ...prevKeys,
          [event.code]: true,
        }))
      }
    }

    const handleKeyUp = (event) => {
      if (keys.hasOwnProperty(event.code)) {
        event.preventDefault()
        setKeys((prevKeys) => ({
          ...prevKeys,
          [event.code]: false,
        }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [keys])

  return keys
}

export default useKeyboard