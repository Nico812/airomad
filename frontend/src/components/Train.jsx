import React, { useState, useEffect } from 'react';
import { useSocket } from "../SocketContext";
import { TILE_DIMENSION } from "../constants/constants";
import unitCost from "../constants/sharedConstants/unitCost";
import dwellingsUnitsCap from "../constants/sharedConstants/dwellingsUnitsCap";

export default function Train({ sendMessageToConsole }) {
  const socket = useSocket();

  const [peasantCount, setPeasantCount] = useState(0);
  const [knightCount, setKnightCount] = useState(0);
  const [mageCount, setMageCount] = useState(0);
  const [totalCostWood, setTotalCostWood] = useState(0);
  const [totalCostStone, setTotalCostStone] = useState(0);
  const [remainingSpace, setRemainingSpace] = useState(0);
  const [ownedResources, setOwnedResources] = useState({ wood: 0, stone: 0 });

  useEffect(() => {
    socket.on("castle info update", (castle) => {
      if (!castle) return;

      setOwnedResources({ wood: castle.deposit.wood, stone: castle.deposit.stones });

      const capacity = dwellingsUnitsCap[castle.dwellings.level];
      let totalUnitCount = 0;
      for (const unitType in castle.units) {
        totalUnitCount += castle.units[unitType];
      }
      setRemainingSpace(Math.max(capacity - totalUnitCount, 0));
    });

    return () => {
      socket.off("castle update");
    };
  }, [socket]);

  useEffect(() => {
    const totalWood = peasantCount * unitCost.peasants.wood + knightCount * unitCost.knights.wood + mageCount * unitCost.mages.wood;
    const totalStone = peasantCount * unitCost.peasants.stones + knightCount * unitCost.knights.stones + mageCount * unitCost.mages.stones;
    setTotalCostWood(totalWood);
    setTotalCostStone(totalStone);
  }, [peasantCount, knightCount, mageCount]);

  const handleTrain = () => {
    const { wood, stone } = ownedResources;

    if (wood < totalCostWood || stone < totalCostStone) {
      sendMessageToConsole('You do not have enough resources.');
      return;
    }

    if (remainingSpace < mageCount + knightCount + peasantCount) {
      sendMessageToConsole('You do not have enough space in the dwellings.');
      return;
    }

    const units = { peasants: peasantCount, knights: knightCount, mages: mageCount };
    socket.emit('training request', units);
  };

  return (
    <div className="central-quad">
      {/* Peasants */}
      <div className="unit-container">
        <img src="/TilePNGs/peasants.png" alt="Peasant" style={{ width: `${2 * TILE_DIMENSION}px`, imageRendering: 'pixelated' }} />
        <div className="quantity-selector">
          <input
            className="quantity-input"
            type="number"
            value={peasantCount}
            onChange={(e) => setPeasantCount(parseInt(e.target.value))}
          />
          <span>Peasants</span>
        </div>
      </div>

      {/* Knights */}
      <div className="unit-container">
        <img src="/TilePNGs/knights.png" alt="Knight" style={{ width: `${2 * TILE_DIMENSION}px`, imageRendering: 'pixelated' }} />
        <div className="quantity-selector">
          <input
            className="quantity-input"
            type="number"
            value={knightCount}
            onChange={(e) => setKnightCount(parseInt(e.target.value))}
          />
          <span>Knights</span>
        </div>
      </div>

      {/* Mages */}
      <div className="unit-container">
        <img src="/TilePNGs/mages.png" alt="Mage" style={{ width: `${2 * TILE_DIMENSION}px`, imageRendering: 'pixelated' }} />
        <div className="quantity-selector">
          <input
            className="quantity-input"
            type="number"
            value={mageCount}
            onChange={(e) => setMageCount(parseInt(e.target.value))}
          />
          <span>Mages</span>
        </div>
      </div>

      {/* Cost and remaining space */}
      <div className="info-container">
        <span>Total Cost: {totalCostWood} wood, {totalCostStone} stone</span>
        <span>Remaining space: {remainingSpace}</span>
      </div>

      {/* Train button */}
      <button onClick={handleTrain}>Train</button>
    </div>
  );
}
