import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/constants";

export default function ChatListPage() {
  const [chats, setChats] = useState<any[]>([]);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    axios
      .get(BASE_URL+ "/chats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setChats(res.data));
  }, []);

  const addChat = async () => {
    const phone = prompt("Enter phone number");
    if (!phone) return;

    const res = await axios.get(
      `${BASE_URL}/users/lookup?phone=${phone}`,
       { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chats</h2>
      <button onClick={addChat}>+ Add Chat</button>

      <ul>
        {chats.map((c) => (
          <li key={c.id} onClick={() => {}}>
            Chat {c.id.slice(0, 6)}
          </li>
        ))}
      </ul>
    </div>
  );
}