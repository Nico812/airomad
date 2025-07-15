import React, { useState, useEffect } from 'react';
import {useRouter} from 'next/router';
import { useSocket } from "../SocketContext";
import Map from '../components/Map';
import GameConsole from '../components/GameConsole';

export default function NewUser() {
  
  const socket = useSocket();
  const router = useRouter();

  const [consoleMessages, setConsoleMessages] = useState([]);

  useEffect(() => {
    const handleNewPlayerCoordDeclined = (errorMessage) => {
      setConsoleMessages(prevMessages => [...prevMessages, errorMessage]);
    };

    const handleNewPlayerCoordAccepted = () => {
      router.push('/home');
    };

    socket.on('new player coord declined', handleNewPlayerCoordDeclined);
    socket.on('new player coord accepted', handleNewPlayerCoordAccepted);

    return () => {
      socket.off('new player coord declined', handleNewPlayerCoordDeclined);
      socket.off('new player coord accepted', handleNewPlayerCoordAccepted);
    };

  }, [socket]);

  const handleAddConsoleMessage = (message) => {
    setConsoleMessages(prevMessages => [...prevMessages, message]);
  };

  return (
    <div style={{
      backgroundColor: "#9370DB",
      margin: 0,
      overflow: "hidden",
      height: "100vh",
    }}>
      <Map socket={socket} newLogin={true}/>
      <GameConsole messages={consoleMessages} />
    </div>
  );
}
