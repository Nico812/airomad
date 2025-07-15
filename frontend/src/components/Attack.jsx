import React, { useState, useEffect } from 'react';
import { useSocket } from "../SocketContext";

export default function Attack({ targetXCoord = 0, targetYCoord = 0, sendMessageToConsole }) {
  const [ownedPeasants, setOwnedPeasants] = useState(0);
  const [ownedKnights, setOwnedKnights] = useState(0);
  const [ownedMages, setOwnedMages] = useState(0);
  const [deployedPeasants, setDeployedPeasants] = useState(0);
  const [deployedKnights, setDeployedKnights] = useState(0);
  const [deployedMages, setDeployedMages] = useState(0);

  const [pendingUnitsID, setPendingUnitsID] = useState("");
  
  const [targetX, setTargetX] = useState(targetXCoord);
  const [targetY, setTargetY] = useState(targetYCoord);

  const [pendingUnitsX, setPendingUnitsX] = useState(0);
  const [pendingUnitsY, setPendingUnitsY] = useState(0);

  const socket = useSocket();

  useEffect(() => {
    socket.on('castle info update', (castle) => {
      setOwnedPeasants(castle.units.peasants);
      setOwnedKnights(castle.units.knights);
      setOwnedMages(castle.units.mages);
    });
  }, [socket]);

  const handlePeasantsChange = (event) => {
    const numPeasants = parseInt(event.target.value);
    if (numPeasants <= ownedPeasants) {
      setDeployedPeasants(numPeasants);
    } else {
      sendMessageToConsole("Non hai abbastanza contadini.");
    }
  };

  const handleKnightsChange = (event) => {
    const numKnights = parseInt(event.target.value);
    if (numKnights <= ownedKnights) {
      setDeployedKnights(numKnights);
    } else {
      sendMessageToConsole("Non hai abbastanza cavalieri.");
    }
  };

  const handleMagesChange = (event) => {
    const numMages = parseInt(event.target.value);
    if (numMages <= ownedMages) {
      setDeployedMages(numMages);
    } else {
      sendMessageToConsole("Non hai abbastanza maghi.");
    }
  };

  const handleTargetXChange = (event) => {
    setTargetX(parseInt(event.target.value));
  };

  const handleTargetYChange = (event) => {
    setTargetY(parseInt(event.target.value));
  };

  const handlePendingUnitsXChange = (event) => {
    setPendingUnitsX(parseInt(event.target.value));
  };

  const handlePendingUnitsYChange = (event) => {
    setPendingUnitsY(parseInt(event.target.value));
  };

  const handlePendingUnitsIDChange = (event) => {
    setPendingUnitsID(event.target.value);
  };

  const handleAttack = () => {
    socket.emit('new attack', { peasants: deployedPeasants, knights: deployedKnights, mages: deployedMages }, { x: targetX, y: targetY } );
  };

  const handlePendingAttack = () => {
    socket.emit('new pending unit action', pendingUnitsID, { x: pendingUnitsX, y: pendingUnitsY }, { x: targetX, y: targetY } );
  };

  return (
    <div className="central-quad">
      <h2>Attacco</h2>
      <div>
        <label htmlFor="peasants">Contadini:</label>
        <input type="number" id="peasants" value={deployedPeasants} min={0} max={ownedPeasants} onChange={handlePeasantsChange} />
      </div>
      <div>
        <label htmlFor="knights">Cavalieri:</label>
        <input type="number" id="knights" value={deployedKnights} min={0} max={ownedKnights} onChange={handleKnightsChange} />
      </div>
      <div>
        <label htmlFor="mages">Maghi:</label>
        <input type="number" id="mages" value={deployedMages} min={0} max={ownedMages} onChange={handleMagesChange} />
      </div>
      <div>
        <label htmlFor="targetX">Coord X del target:</label>
        <input type="number" id="targetX" value={targetX} onChange={handleTargetXChange} />
      </div>
      <div>
        <label htmlFor="targetY">Coord Y del target:</label>
        <input type="number" id="targetY" value={targetY} onChange={handleTargetYChange} />
      </div>
      <div>
        <label htmlFor="pendingUnitsX">Coord X del pendingUnits:</label>
        <input type="number" id="pendingUnitsX" value={pendingUnitsX} onChange={handlePendingUnitsXChange} />
      </div>
      <div>
        <label htmlFor="pendingUnitsY">Coord Y del pendingUnits:</label>
        <input type="number" id="pendingUnitsY" value={pendingUnitsY} onChange={handlePendingUnitsYChange} />
      </div>
      <div>
        <label htmlFor="pendingUnitsID">pendingUnitsID:</label>
        <input type="text" id="pendingUnitsID" value={pendingUnitsID} onChange={handlePendingUnitsIDChange} />
      </div>
      <button onClick={handleAttack}>Avvia attacco</button>
      <button onClick={handlePendingAttack}>Avvia PendingUnits attack</button>
    </div>
  );
}
