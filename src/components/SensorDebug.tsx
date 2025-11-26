import React from 'react';
import { SensorData } from '../types';
import { Settings, Footprints, Compass } from 'lucide-react';

interface SensorDebugProps {
  data: SensorData;
  onSimulateStep: () => void;
  onHeadingChange: (val: number) => void;
  sensitivity: number;
  onSensitivityChange: (val: number) => void;
}

const SensorDebug: React.FC<SensorDebugProps> = ({ 
  data, 
  onSimulateStep, 
  onHeadingChange,
  sensitivity,
  onSensitivityChange 
}) => {
  return (
    <div className="bg-gray-900/90 text-white p-4 rounded-xl border border-gray-700 w-full max-w-md">
      <div className="flex items-center gap-2 mb-4 text-blue-400">
        <Settings size={20} />
        <h3 className="font-bold text-lg">Sensor Control</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded-lg flex flex-col items-center">
          <Footprints className="text-green-400 mb-1" />
          <span className="text-2xl font-mono font-bold">{data.steps}</span>
          <span className="text-xs text-gray-400">Steps</span>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg flex flex-col items-center transform transition-transform" >
           <Compass className="text-yellow-400 mb-1" style={{ transform: `rotate(${data.heading}deg)` }}/>
          <span className="text-2xl font-mono font-bold">{Math.round(data.heading)}°</span>
          <span className="text-xs text-gray-400">Heading</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
           <label className="text-xs text-gray-400 flex justify-between mb-1">
             <span>Step Sensitivity (G-Force)</span>
             <span>{sensitivity.toFixed(1)}G</span>
           </label>
           <input 
             type="range" 
             min="0.2" 
             max="3.0" 
             step="0.1"
             value={sensitivity}
             onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
             className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
           />
        </div>

        {/* Manual Controls for Desktop/Debug */}
        <div className="pt-2 border-t border-gray-700">
           <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider text-center">Manual Override</p>
           <button 
             onClick={onSimulateStep}
             className="w-full bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg touch-manipulation mb-3"
           >
             TAP TO STEP
           </button>
           
           <div className="flex items-center gap-2">
             <span className="text-xs">Rotate:</span>
             <input 
               type="range" 
               min="0" 
               max="360" 
               value={data.heading}
               onChange={(e) => onHeadingChange(parseInt(e.target.value))}
               className="flex-1"
             />
           </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDebug;
