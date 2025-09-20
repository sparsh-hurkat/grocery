import React from 'react'
import { Html } from '@react-three/drei'

function CompassControls({ 
  onForwardMove, 
  isCompassSupported, 
  compassPermission, 
  compassDirection, 
  heading,
  isInitialized,
  needsUserActivation,
  onActivateCompass,
  onRequestPermission 
}) {
  return (
    <Html
      position={[0, -4, 0]}
      center
      distanceFactor={10}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        
        {/* Compass Status */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '10px',
          textAlign: 'center',
          minWidth: '200px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
            🧭 Real Compass Control
          </div>
          
          {!isInitialized ? (
            <div style={{ color: '#ffd43b' }}>
              Initializing compass...
            </div>
          ) : !isCompassSupported ? (
            <div style={{ color: '#ff6b6b' }}>
              {compassPermission === 'not-available' ? 
                'Desktop device - compass not available' :
                compassPermission === 'timeout' ?
                'Compass timeout - likely not supported' :
                'Compass not supported on this device'
              }
            </div>
          ) : compassPermission === 'needs-activation' ? (
            <div>
              <div style={{ color: '#ffd43b', marginBottom: '10px' }}>
                Android Chrome detected - needs user activation
              </div>
              <button 
                onClick={onActivateCompass}
                style={{
                  backgroundColor: '#4ecdc4',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                🧭 Enable Compass
              </button>
            </div>
          ) : compassPermission === 'denied' ? (
            <div>
              <div style={{ color: '#ff6b6b', marginBottom: '10px' }}>
                Compass permission denied
              </div>
              <button 
                onClick={onRequestPermission}
                style={{
                  backgroundColor: '#4ecdc4',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Request Permission
              </button>
            </div>
          ) : compassPermission === 'granted' ? (
            <div>
              <div style={{ color: '#51cf66', marginBottom: '5px' }}>
                Compass Active ✓
              </div>
              <div style={{ fontSize: '14px' }}>
                Direction: <strong>{compassDirection.toUpperCase()}</strong>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {heading.toFixed(0)}°
              </div>
            </div>
          ) : (
            <div style={{ color: '#ffd43b' }}>
              Checking compass support...
            </div>
          )}
        </div>

        {/* Forward Movement Button */}
        <button
          onMouseDown={onForwardMove}
          onTouchStart={onForwardMove}
          style={{
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            outline: 'none'
          }}
          disabled={!isCompassSupported || compassPermission !== 'granted'}
        >
          ⬆️
        </button>
        
        <div style={{
          fontSize: '14px',
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: '10px',
          borderRadius: '5px'
        }}>
          {isCompassSupported && compassPermission === 'granted' ? 
            `Move forward in ${compassDirection.toUpperCase()} direction` :
            'Arrow keys still work for manual control'
          }
        </div>
      </div>
    </Html>
  )
}

export default CompassControls