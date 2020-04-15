import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import useSocket from "use-socket.io-client";
import { useImmer } from "use-immer";

import "./App.css";

function App() {
  const [id, setId] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [room, setRoom] = useState("");
  const [socket] = useSocket("https://open-chat-naostsaecf.now.sh");
  const [messages, setMessages] = useImmer([]);
  const [online, setOnline] = useImmer([]);

  socket.connect();
  console.log(socket);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!nameInput) {
      return alert("Name can't be empty");
    }
    setId(nameInput);
    socket.emit("join", id, room);
  };

  useEffect(() => {
    socket.on("update", (user, message) =>
      setMessages((draft) => {
        draft.push([user, message]);
      })
    );
  });

  return id !== "" ? (
    <div>Hello</div>
  ) : (
    <div className="chatbox">
      <form onSubmit={(event) => handleSubmit(event)}>
        <input
          id="name"
          onChange={(event) => setNameInput(event.target.value.trim())}
          required
          placeholder="Name"
        />
        <input
          id="room"
          onChange={(event) => setRoom(event.target.value.trim())}
          placeholder="room"
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
