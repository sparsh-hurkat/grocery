import { useState, useEffect, useRef, useCallback } from 'react';
import { SensorData } from '../types';

interface UseSensorsReturn {
  sensorData: SensorData;
  requestPermission: () => Promise<void>;
  simulateStep: () => void;
  setSimulatedHeading: (heading: number) => void;
  stepSensitivity: number;
  setStepSensitivity: (val: number) => void;
}

export const useSensors = (): UseSensorsReturn => {
  const [sensorData, setSensorData] = useState<SensorData>({
    heading: 0,
    steps: 0,
    isSupported: typeof window !== 'undefined' && !!window.DeviceOrientationEvent,
    permissionGranted: false,
    lastStepTime: 0,
  });

  const [stepSensitivity, setStepSensitivity] = useState(1.2); // Threshold G-force

  // Refs for motion processing to avoid re-renders
  const lastAcc = useRef({ x: 0, y: 0, z: 0 });
  const lastMag = useRef(0);
  const lastStepTimeRef = useRef(0);

  // Debounce helper
  const STEP_DELAY_MS = 350;

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading = 0;
    
    // WebkitCompassHeading is for iOS
    // @ts-ignore - non-standard property exists on iOS
    if (event.webkitCompassHeading) {
      // @ts-ignore
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android / Standard
      // Invert alpha because standard rotation is counter-clockwise for Z-axis
      heading = 360 - event.alpha;
    }

    setSensorData(prev => ({
      ...prev,
      heading: heading || 0
    }));
  }, []);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    if (!event.accelerationIncludingGravity) return;

    const { x, y, z } = event.accelerationIncludingGravity;
    
    // Simple null checks
    const accX = x || 0;
    const accY = y || 0;
    const accZ = z || 0;

    // Calculate magnitude vector
    const magnitude = Math.sqrt(accX * accX + accY * accY + accZ * accZ);

    // Simple Peak Detection Algorithm
    // Gravity is ~9.8. We look for spikes above threshold + gravity
    // But since orientation changes, we just look for relative changes in magnitude
    
    // Delta from last frame
    const delta = Math.abs(magnitude - lastMag.current);
    
    // Check threshold and debounce
    const now = Date.now();
    if (delta > stepSensitivity && (now - lastStepTimeRef.current > STEP_DELAY_MS)) {
      setSensorData(prev => ({
        ...prev,
        steps: prev.steps + 1,
        lastStepTime: now
      }));
      lastStepTimeRef.current = now;
    }

    lastAcc.current = { x: accX, y: accY, z: accZ };
    lastMag.current = magnitude;
  }, [stepSensitivity]);

  const requestPermission = async () => {
    // @ts-ignore - iOS 13+ specific permission request
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          setSensorData(prev => ({ ...prev, permissionGranted: true }));
          window.addEventListener('deviceorientation', handleOrientation);
          window.addEventListener('devicemotion', handleMotion);
        } else {
          alert('Permission denied. The game needs sensors to work.');
        }
      } catch (error) {
        console.error(error);
        // Fallback for non-iOS or if request fails (sometimes works without request on Android)
        setSensorData(prev => ({ ...prev, permissionGranted: true }));
        window.addEventListener('deviceorientation', handleOrientation);
        window.addEventListener('devicemotion', handleMotion);
      }
    } else {
      // Non-iOS devices usually don't need explicit permission, just https
      setSensorData(prev => ({ ...prev, permissionGranted: true }));
      window.addEventListener('deviceorientation', handleOrientation);
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleOrientation, handleMotion]);

  const simulateStep = useCallback(() => {
     setSensorData(prev => ({ ...prev, steps: prev.steps + 1, lastStepTime: Date.now() }));
  }, []);

  const setSimulatedHeading = useCallback((heading: number) => {
    setSensorData(prev => ({ ...prev, heading }));
  }, []);

  return {
    sensorData,
    requestPermission,
    simulateStep,
    setSimulatedHeading,
    stepSensitivity,
    setStepSensitivity
  };
};
