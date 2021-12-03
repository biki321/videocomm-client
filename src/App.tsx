import { SocketContextProvider } from "./contexts/socket-context";
import Home from "./pages/Home";
import "./App.css";
import { VideoConfContextProvider } from "./contexts/video-conf-context";

export default function App() {
  return (
    <SocketContextProvider>
      <VideoConfContextProvider>
        <Home />
      </VideoConfContextProvider>
    </SocketContextProvider>
  );
}
