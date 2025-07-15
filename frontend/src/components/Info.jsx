import React, { useState, useEffect } from 'react';
import { useSocket } from "../SocketContext";

export default function Info({ sendMessageToConsole }) {
  
  const [castleInfo, setCastleInfo] = useState({
    name: '',
    alive: false,
    coord: { x: -1, y: -1 },
    deposit: { wood: 0, stones: 0 },
    units: { peasants: 0, knights: 0, mages: 0 }
  });

  const socket = useSocket();

  useEffect(() => {

    const handleCastleInfoUpdate = (castle) => {
      setCastleInfo(castle);
    };
    socket.on('castle info update', handleCastleInfoUpdate);
    
  }, [socket]);

  const { name, alive, coord, deposit, units } = castleInfo;

  return (
    <div className="info-quad">
      <div>
        <h2>{name}</h2>
        <p>Alive: {alive ? 'Yes' : 'No'}</p>
        <p>Coordinates: ({coord.x}, {coord.y})</p>
        <p>Wood: {deposit.wood}</p>
        <p>Stones: {deposit.stones}</p>
        <p>Peasants: {units.peasants}</p>
        <p>Knights: {units.knights}</p>
        <p>Mages: {units.mages}</p>
      </div>
    </div>
  );
}
