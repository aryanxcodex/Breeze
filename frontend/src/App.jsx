import React, { useState, useRef, useEffect } from "react";
import Peer from "peerjs";

function App() {
  const [myPeerId, setMyPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [file, setFile] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [progress, setProgress] = useState(0);
  const peerInstance = useRef(null);
  const receivedChunks = useRef([]);
  const receivedFileMeta = useRef({});

  // const peerHost = window.__CONFIG__?.HOST || "localhost";
  // const peerPort = window.__CONFIG__?.PORT || 3000;
  // const isSecure = window.__CONFIG__?.SECURE || false;

  useEffect(() => {
    const peer = new Peer({
      host: "breeze-vmps.onrender.com",
      secure: true,
      port: 443,
      path: "/peerjs",
    });

    peer.on("open", (id) => {
      setMyPeerId(id);
      setConnectionStatus("Connected");
    });

    peer.on("error", (err) => {
      setConnectionStatus("Error: " + err.message);
    });

    peer.on("connection", (conn) => {
      setConnectionStatus("Incoming connection...");

      conn.on("open", () => {
        setConnectionStatus("Connected to peer");

        conn.on("data", (data) => {
          handleReceivedData(data);
        });
      });

      conn.on("close", () => {
        setConnectionStatus("Connection closed");
      });
    });

    peerInstance.current = peer;

    return () => {
      peer.destroy();
    };
  }, []);

  const handleReceivedData = (data) => {
    if (data.type === "file-chunk") {
      if (!receivedFileMeta.current.name) {
        receivedFileMeta.current = {
          name: data.fileName,
          type: data.fileType,
          total: data.totalChunks,
        };
      }

      receivedChunks.current[data.currentChunk] = data.content;
      const receivedCount = receivedChunks.current.filter(Boolean).length;
      setProgress(Math.floor((receivedCount / data.totalChunks) * 100));
      setConnectionStatus(
        `Receiving chunk ${receivedCount}/${data.totalChunks}`
      );
    }

    if (data.type === "file-end") {
      const blob = new Blob(receivedChunks.current, {
        type: receivedFileMeta.current.type,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = receivedFileMeta.current.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setConnectionStatus("File received successfully");
      setProgress(0);
      receivedChunks.current = [];
      receivedFileMeta.current = {};
    }
  };

  const sendFile = () => {
    if (!peerInstance.current || !remotePeerId || !file) return;

    const conn = peerInstance.current.connect(remotePeerId);
    setConnectionStatus("Connecting...");

    conn.on("open", () => {
      setConnectionStatus("Sending file...");

      const chunkSize = 1024 * 512; // 512KB
      const totalChunks = Math.ceil(file.size / chunkSize);
      let offset = 0;

      const readChunk = () => {
        const slice = file.slice(offset, offset + chunkSize);
        const reader = new FileReader();

        reader.onload = (e) => {
          const currentChunk = offset / chunkSize;
          conn.send({
            type: "file-chunk",
            fileName: file.name,
            fileType: file.type,
            content: e.target.result,
            currentChunk,
            totalChunks,
          });

          offset += chunkSize;
          setProgress(Math.floor((currentChunk / totalChunks) * 100));
          setConnectionStatus(
            `Sending chunk ${currentChunk + 1}/${totalChunks}`
          );

          if (offset < file.size) {
            readChunk();
          } else {
            conn.send({ type: "file-end" });
            setConnectionStatus("File sent successfully");
            setProgress(100);
          }
        };

        reader.onerror = () => {
          setConnectionStatus("Error reading file chunk");
        };

        reader.readAsArrayBuffer(slice);
      };

      readChunk();
    });

    conn.on("close", () => {
      setConnectionStatus("Connection closed");
    });

    conn.on("error", (err) => {
      setConnectionStatus("Connection error: " + err.message);
    });
  };

  return (
    <div style={{ padding: "20px" }}>
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
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      </div>

      <button
        onClick={sendFile}
        disabled={!file || !remotePeerId || connectionStatus.includes("Error")}
      >
        Send File
      </button>

      {progress > 0 && (
        <div style={{ marginTop: "20px" }}>
          <label>Progress: {progress}%</label>
          <div style={{ background: "#eee", height: "10px", width: "300px" }}>
            <div
              style={{
                background: "#4caf50",
                width: `${progress}%`,
                height: "100%",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
