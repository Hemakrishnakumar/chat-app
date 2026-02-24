import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BASE_URL } from "../config/constants";

const socket = io(BASE_URL, {
  auth: { token: localStorage.getItem("accessToken") },
});

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    socket.emit("send_message", {
      targetPhone: prompt("Enter recipient phone"),
      content: input,
    });

    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Simple Chat</h2>

      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "scroll",
          marginBottom: 10,
          padding: 10,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.senderId}</b>: {m.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}