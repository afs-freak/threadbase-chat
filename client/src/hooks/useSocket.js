
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext.jsx";

export function useSocket(roomId) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !roomId) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

    const s = io(socketUrl, {
      auth: { token },
    });

    setSocket(s);

    // Join the thread's chat room
    s.emit("room:join", roomId);

    // Receive live messages
    const onMessage = (message) => {
      setMessages((previousMessages) => [
        ...previousMessages,
        message,
      ]);
    };

    s.on("chat:message", onMessage);

    // Clean up when the token or room changes,
    // or when the component unmounts
    return () => {
      s.off("chat:message", onMessage);
      s.disconnect();
    };
  }, [token, roomId]);

  const sendMessage = useCallback(
    (text) => {
      if (!text?.trim()) return;

      socket?.emit("chat:message", {
        roomId,
        text: text.trim(),
      });
    },
    [socket, roomId]
  );

  return { messages, sendMessage };
}
