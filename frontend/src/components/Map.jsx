import React, { useState, useEffect } from 'react';
import { useSocket } from "../SocketContext";
import MapTile from "./MapTile";

// Component
const Map = ({ newLogin, sendMessageToConsole, onPageChange }) => {

  const socket = useSocket();

  const [mapTiles, setMapTiles] = useState([]);

  useEffect(() => {
    const handleMapUpdate = map => {
      const updatedTiles = getRenderableMapTiles(map);
      setMapTiles(updatedTiles);
    };

    socket.on('map update', handleMapUpdate);

    return () => {
      socket.off('map update', handleMapUpdate);
    };
  }, [socket]);

  const handleNewPlayerClick = (x, y, collision) => {
    if (!collision) {
      socket.emit('new player coord', { x, y });
    } else {
      sendMessageToConsole("Cannot place castle on an existing castle or on water.");
    }
  };

  const onAttack = (x, y, castle) => {
    onPageChange( 'attack', {x: x, y: y} );
  };

  const getRenderableMapTiles = map => {
    return map.map((row, i) => {
      return row.map((cell, j) => {
        const { tile, castle, units } = cell;
        let showcase = null;
        const type = castle !== null ? "castle" : units.length > 0 ? "units" : tile.name;
        if(type == "units") {showcase = cell.units[0];} else {showcase = type;};
        const collision = tile.collision;
        const newPlayerClickable = newLogin && !castle && !collision;
        const attackable = castle ?? false;
        return (
          <MapTile
            key={`${i}-${j}`}
            type={type}
            showcase = {showcase}
            xPos={j}
            yPos={i}
            castle={castle}
            onNewPlayerClick={newPlayerClickable ? () => handleNewPlayerClick(j, i, collision) : null}
            onAttack={attackable ? () => onAttack(j, i, castle) : null}
          />
        );
      });
    });
  };

  return (
    <div className="central-quad">
      {mapTiles}
    </div>
  );
};

export default Map;
