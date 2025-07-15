import React from 'react';

export default function GameConsole({ messages }) {
  return (
    <div className="game-console">
      {messages.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
    </div>
  );
};
