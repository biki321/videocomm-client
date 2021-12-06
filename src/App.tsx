import { SocketContextProvider } from "./contexts/socket-context";
import Home from "./pages/Home";
import { VideoConfContextProvider } from "./contexts/video-conf/video-conf-context";

export default function App() {
  return (
    <SocketContextProvider>
      <VideoConfContextProvider>
        <Home />
      </VideoConfContextProvider>
    </SocketContextProvider>
  );
}
