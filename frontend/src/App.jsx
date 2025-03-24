// App.js (Frontend)
import React, { useState, useRef, useEffect } from 'react';
import Peer from 'peerjs';

function App() {
  const [myPeerId, setMyPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [file, setFile] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const peerInstance = useRef(null);

  useEffect(() => {
    // Initialize peer when component mounts
    const peer = new Peer({
      host: window.location.hostname, // Uses ngrok domain (e.g., "a842-2409...ngrok-free.app")
      port: window.location.port || (window.location.protocol === "https:" ? 443 : 80),
      path: "/myapp",
      secure: true, // Force HTTPS (ngrok uses HTTPS)
      debug: 3, // Verbose logging for debugging
    });

    peer.on('open', (id) => {
      console.log('My peer ID:', id);
      setMyPeerId(id);
      setConnectionStatus('Connected');
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setConnectionStatus('Error: ' + err.message);
    });

    // Handle incoming data connection
    peer.on('connection', (conn) => {
      setConnectionStatus('Incoming connection...');
      
      conn.on('open', () => {
        setConnectionStatus('Connected to peer');
        
        conn.on('data', (data) => {
          if (data.type === 'file') {
            handleReceivedFile(data);
          }
        });
      });
      
      conn.on('close', () => {
        setConnectionStatus('Connection closed');
      });
    });

    peerInstance.current = peer;

    return () => {
      peer.destroy();
    };
  }, []);

  const handleReceivedFile = (data) => {
    const blob = new Blob([data.content], { type: data.fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sendFile = () => {
    if (!peerInstance.current || !remotePeerId) return;

    const conn = peerInstance.current.connect(remotePeerId);
    setConnectionStatus('Connecting...');

    conn.on('open', () => {
      setConnectionStatus('Sending file...');
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const fileData = {
          type: 'file',
          fileName: file.name,
          fileType: file.type,
          content: e.target.result
        };
        conn.send(fileData);
        setConnectionStatus('File sent successfully');
      };
      
      reader.onerror = () => {
        setConnectionStatus('Error reading file');
      };
      
      reader.readAsArrayBuffer(file);
    });

    conn.on('close', () => {
      setConnectionStatus('Connection closed');
    });

    conn.on('error', (err) => {
      setConnectionStatus('Connection error: ' + err.message);
    });
  };

  return (
    <div>
      <h2>Your Peer ID: {myPeerId}</h2>
      <p>Status: {connectionStatus}</p>

      <div>
        <input
          type="text"
          value={remotePeerId}
          onChange={(e) => setRemotePeerId(e.target.value)}
          placeholder="Enter recipient's Peer ID"
        />
      </div>

      <div>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <button 
        onClick={sendFile} 
        disabled={!file || !remotePeerId || connectionStatus.includes('Error')}
      >
        Send File
      </button>
    </div>
  );
}

export default App;