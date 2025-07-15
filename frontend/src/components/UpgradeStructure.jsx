import React, { useState, useEffect } from 'react';
import { TILE_DIMENSION } from '../constants/constants';
import structUpgradeCost from '../constants/sharedConstants/structUpgradeCost';
import structUpgradeTime from '../constants/sharedConstants/structUpgradeTime';

export default function UpgradeStructure({ structureName, structureData, handleUpgrade }) {
  const { level: initialLevel, state: initialState = {} } = structureData;

  const [name, setName] = useState(structureName);
  const [level, setLevel] = useState(initialLevel);
  const [state, setState] = useState(initialState);

  const [remainingTime, setRemainingTime] = useState(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {

    setState(structureData.state);
    setLevel(structureData.level);
    setName(structureName);

    if (state.upgrading) {
      setInterval( function (){
        const currentTime = Date.now();
        const elapsedTime = currentTime - state.startTime;
        let remaining = structUpgradeTime[structureName][level] - elapsedTime;
        remaining = Math.max(remaining, 0);
        setRemainingTime(remaining);
        const progressPercent = (remaining / structUpgradeTime[structureName][level]) * 100;
        setProgress(progressPercent);
      }, 1000);
    }
  }, [structureData, structureName, level]);

  const formatRemainingTime = (milliseconds) => {
    if (milliseconds <= 0) return '00:00:00';
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    const formattedTime = `${days ? `${days}d ` : ''}${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m ` : ''}${seconds ? `${seconds}s` : ''}`;
    return formattedTime;
  };

  return (
    <div className="upgrade-structure">
      <p>{name} lv.{level}</p>
      <p>Upgrade cost: Stones: {structUpgradeCost[name][level].stones}, Wood: {structUpgradeCost[name][level].wood}</p>
      {state.upgrading && (
        <div className="progress-bar" style={{ width: `${progress}%` }}>
          <div className="remaining-time">{formatRemainingTime(remainingTime)}</div>
        </div>
      )}
      <button onClick={() => handleUpgrade(name, level)}>Upgrade {name}</button>
    </div>
  );
}
