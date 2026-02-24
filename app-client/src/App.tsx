import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import ChatList from "./pages/ChatList";
import ChatPage from "./pages/ChatPage";

function App() {
  const { token } = useAuthContext();

  return (
    <Routes>
      {!token ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/chats" element={<ChatList />} />
          <Route path="/chats/:chatId" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/chats" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;