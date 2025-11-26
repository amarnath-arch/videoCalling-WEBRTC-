import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Landing from "./pages/Landing";
import { SocketProvider } from "./context/useWebSocket";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Room from "./pages/Room";
import Protected from "./routes/Protected";
import PowderRoom from "./pages/PowderRoom";

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/room"
            element={
              <Protected>
                <Room />
              </Protected>
            }
          />
          <Route path="/join" element={<PowderRoom />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
