import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BASE_URL } from "../config/constants";

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const socket = io(BASE_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setEvents((prev) => [...prev, { type: "connected" }]);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setEvents((prev) => [...prev, { type: "disconnected" }]);
    });

    socket.on("user_online", (data) => {
      setEvents((prev) => [...prev, { type: "user_online", data }]);
    });

    socket.on("user_offline", (data) => {
      setEvents((prev) => [...prev, { type: "user_offline", data }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return { connected, events };
}