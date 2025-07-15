import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from "../SocketContext";

export default function Login() {

  const socket = useSocket();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Inserisci un nome utente e una password validi.');
      return;
    }

    socket.emit('login request', username);
  };

  useEffect(() => {
    const handleExistingLogin = () => {
      router.push('/home');
    };

    const handleNewLogin = () => {
      router.push('/new_user');
    };

    socket.on('existing user', handleExistingLogin);
    socket.on('new user', handleNewLogin);

    return () => {
      socket.off('existing user', handleExistingLogin);
      socket.off('new user', handleNewLogin);
    };
  }, [socket, router]);

  return (
    <div style={{ backgroundColor: 'blue', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '3rem', color: 'white', marginBottom: '1rem' }}>Airomad</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      {errorMessage && <p style={{ color: 'red', marginBottom: '1rem' }}>{errorMessage}</p>}
      <button onClick={handleLogin} style={buttonStyle}>Login</button>
    </div>
  );
}

const inputStyle = {
  marginBottom: '1rem',
  padding: '0.5rem',
  width: '100%',
  maxWidth: '300px',
  borderRadius: '5px',
  border: 'none',
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  backgroundColor: 'white',
  color: 'blue',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};
