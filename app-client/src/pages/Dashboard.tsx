import { useSocket } from "../hooks/useSocket";

export default function Dashboard() {
  const token = localStorage.getItem("accessToken");
  const { connected, events } = useSocket(token);

  return (
    <div style={{ padding: 40 }}>
      <h2>Realtime Dashboard</h2>

      <p>
        Socket Status:{" "}
        <strong style={{ color: connected ? "green" : "red" }}>
          {connected ? "Connected" : "Disconnected"}
        </strong>
      </p>

      <h3>Events:</h3>
      <ul>
        {events.map((e, index) => (
          <li key={index}>
            {e.type} {e.data ? JSON.stringify(e.data) : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}