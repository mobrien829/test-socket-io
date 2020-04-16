import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import useSocket from "use-socket.io-client";
import { useImmer } from "use-immer";

import "./App.css";

const Online = (props) =>
  props.data.map((message) => <li id={message[0]}>{message[1]}</li>);

const Messages = (props) =>
  props.data.map((message) =>
    message[0] !== "" ? (
      <li>
        <strong>{message[0]}</strong> :{" "}
        <div className="innermsg">{message[1]}</div>
      </li>
    ) : (
      <li className="update">{message[1]}</li>
    )
  );

function App() {
  const [id, setId] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [room, setRoom] = useState("");
  const [input, setInput] = useState("");
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

  const handleSend = (event) => {
    event.preventDefault();
    if (input !== "") {
      socket.emit("chat message", input, room);
      setInput("");
    }
  };

  useEffect(() => {
    socket.on("update", (message) =>
      setMessages((draft) => {
        draft.push(["", message]);
      })
    );
    socket.on("message que", (user, message) =>
      setMessages((draft) => {
        draft.push([user, message]);
      })
    );
    socket.on("people-list", (people) => {
      let newState = [];
      for (let person in people) {
        newState.push([people[person].id, people[person].user]);
      }
      setOnline((draft) => {
        draft.push(...newState);
      });
      console.log(online);
    });
    socket.on("add-person", (user, id) => {
      setOnline((draft) => {
        draft.push([id, user]);
      });
    });

    socket.on("remove-person", (id) => {
      setOnline((draft) => draft.filter((user) => user[0] !== id));
    });

    socket.on("chat message", (user, message) => {
      setMessages((draft) => {
        draft.push([user, message]);
      });
    });
  }, []);

  return id ? (
    <section style={{ display: "flex", flexDirection: "row" }}>
      <ul id="messages">
        <Messages data={messages} />
      </ul>
      <ul id="online">
        {" "}
        &#x1f310; : <Online data={online} />{" "}
      </ul>
      <div id="sendform">
        <form onSubmit={(e) => handleSend(e)} style={{ display: "flex" }}>
          <input id="m" onChange={(e) => setInput(e.target.value.trim())} />
          <button style={{ width: "75px" }} type="submit">
            Send
          </button>
        </form>
      </div>
    </section>
  ) : (
    <div style={{ textAlign: "center", margin: "30vh auto", width: "70%" }}>
      <form onSubmit={(event) => handleSubmit(event)}>
        <input
          id="name"
          onChange={(e) => setNameInput(e.target.value.trim())}
          required
          placeholder="What is your name .."
        />
        <br />
        <input
          id="room"
          onChange={(e) => setRoom(e.target.value.trim())}
          placeholder="What is your room .."
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
