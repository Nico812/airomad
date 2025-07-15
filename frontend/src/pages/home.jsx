import React, { useState } from 'react';
import { useSocket } from "../SocketContext";
import NavBar from '../components/NavBar';
import Info from '../components/Info';
import Map from '../components/Map';
import Train from '../components/Train';
import Upgrade from '../components/Upgrade';
import Attack from '../components/Attack';
import GameConsole from '../components/GameConsole';

export default function Home() {

  const socket = useSocket();

  const handleAddConsoleMessage = (message) => {
    setConsoleMessages((prevMessages) => [...prevMessages, message]);
  };

  const sendMessageToConsole = (message) => {
    handleAddConsoleMessage(message);
  };

  const [currentPage, setCurrentPage] = useState('map');
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [attackTarget, setAttackTarget] = useState({ x: 0, y: 0 });

  const handlePageChange = (page, target = { x: 0, y: 0 }) => {
    setCurrentPage(page);
    setAttackTarget(target);
  };

  return (
    <div style={{
      backgroundColor: "#9370DB",
      margin: 0,
      overflow: "hidden",
      height: "100vh",
    }}>
      <button onClick={() => handleAddConsoleMessage('Hello, world!')}>Add Message</button>
      <Info sendMessageToConsole={sendMessageToConsole}/>
      <GameConsole messages={consoleMessages} />
      {currentPage === 'map' && <Map newLogin={false} sendMessageToConsole={sendMessageToConsole} onPageChange={handlePageChange} />}
      {currentPage === 'train' && <Train sendMessageToConsole={sendMessageToConsole} />}
      {currentPage === 'upgrade' && <Upgrade sendMessageToConsole={sendMessageToConsole} />}
      {currentPage === 'attack' && <Attack sendMessageToConsole={sendMessageToConsole} targetXCoord={attackTarget.x} targetYCoord={attackTarget.y} />} {/* Passa le coordinate di attacco alla Attack */}
      <NavBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>
  );
}
