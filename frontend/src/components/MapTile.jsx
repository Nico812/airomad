import React, { useState } from 'react';
import { TILE_DIMENSION } from "../constants/constants";

export default function MapTile({ type, showcase, xPos, yPos, castle, onNewPlayerClick, onAttack }) {
  const [showcasing, setShowcasing] = useState(false);

  const handlePlayerClick = () => {
    if (onNewPlayerClick) {
      onNewPlayerClick();
    }
    if (castle && onAttack) {
      onAttack();
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        width: `${TILE_DIMENSION}px`,
        height: `${TILE_DIMENSION}px`,
        left: `${xPos * TILE_DIMENSION}px`,
        top: `${yPos * TILE_DIMENSION}px`,
        backgroundImage: `url(/mapTiles/${type}.gif)`,
        imageRendering: 'pixelated',
        backgroundSize: "cover",
        cursor: onNewPlayerClick || type === 'castle' ? 'pointer' : 'default'
      }}
      onClick={handlePlayerClick}
      onMouseEnter={() => setShowcasing(true)}
      onMouseLeave={() => setShowcasing(false)}
    >
      {showcasing && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '4px',
          borderRadius: '4px'
        }}>
          {type === 'castle' && castle ? castle.name : showcase}
        </div>
      )}
    </div>
  );
}
