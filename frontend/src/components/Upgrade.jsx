import React, { useState, useEffect } from 'react';
import { useSocket } from "../SocketContext";
import UpgradeStructure from "./UpgradeStructure";
import structUpgradeCost from '../constants/sharedConstants/structUpgradeCost';

export default function Upgrade({ sendMessageToConsole }) {
  const socket = useSocket();

  const [wall, setWall] = useState({});
  const [dwellings, setDwellings] = useState({});
  const [mine, setMine] = useState({});
  const [sawmill, setSawmill] = useState({});
  const [deposit, setDeposit] = useState({});
  const [barracks, setBarracks] = useState({});

  useEffect(() => {
    const castleInfoUpdateListener = (castle) => {
      if (!castle) return;
  
      const { wall, dwellings, mine, sawmill, deposit, barracks } = castle;
  
      setWall(wall);
      setDwellings(dwellings);
      setMine(mine);
      setSawmill(sawmill);
      setDeposit(deposit);
      setBarracks(barracks);
    };
  
    socket.on("castle info update", castleInfoUpdateListener);
  
    return () => {
      socket.off("castle info update", castleInfoUpdateListener);
    };
  }, [socket]);


  const handleUpgrade = (structureName, structureLevel) => {
    if (deposit.wood < structUpgradeCost[structureName][structureLevel].wood || deposit.stones < structUpgradeCost[structureName][structureLevel].stones) {
      sendMessageToConsole(`Not enough resources to upgrade ${structureName}`);
      return;
    }
    socket.emit('upgrade request', structureName);
  };

  return (
    <div className="central-quad">
      {Object.keys(wall).length > 0 && <UpgradeStructure structureName={"wall"} structureData={wall} handleUpgrade={handleUpgrade}/>}
      {Object.keys(dwellings).length > 0 && <UpgradeStructure structureName={"dwellings"} structureData={dwellings} handleUpgrade={handleUpgrade}/>}
      {Object.keys(mine).length > 0 && <UpgradeStructure structureName={"mine"} structureData={mine} handleUpgrade={handleUpgrade}/>}
      {Object.keys(sawmill).length > 0 && <UpgradeStructure structureName={"sawmill"} structureData={sawmill} handleUpgrade={handleUpgrade}/>}
      {Object.keys(deposit).length > 0 && <UpgradeStructure structureName={"deposit"} structureData={deposit} handleUpgrade={handleUpgrade}/>}
      {Object.keys(barracks).length > 0 && <UpgradeStructure structureName={"barracks"} structureData={barracks} handleUpgrade={handleUpgrade}/>}
    </div>
  );
}
