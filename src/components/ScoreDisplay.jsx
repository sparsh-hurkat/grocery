import React from 'react'
import { Html } from '@react-three/drei'

function ScoreDisplay({ score }) {
  return (
    <Html
      position={[5, 4, 0]}
      center
      distanceFactor={10}
    >
      <div style={{
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '10px 20px',
        borderRadius: '5px',
        textAlign: 'center',
        minWidth: '120px'
      }}>
        SCORE: {score}
      </div>
    </Html>
  )
}

export default ScoreDisplay