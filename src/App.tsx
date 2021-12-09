import { SocketContextProvider } from "./contexts/socket-context";
import Meeting from "./pages/Meeting";
import { VideoConfContextProvider } from "./contexts/video-conf/video-conf-context";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";

export default function App() {
  return (
    <BrowserRouter>
      <SocketContextProvider>
        <Routes>
          <Route
            path="/"
            element={
              // <VideoConfContextProvider>
              //   <Meeting />
              // </VideoConfContextProvider>
              <Landing />
            }
          />
          <Route
            path="/:roomName"
            element={
              <VideoConfContextProvider>
                <Meeting />
              </VideoConfContextProvider>
            }
          />
        </Routes>
      </SocketContextProvider>
    </BrowserRouter>
  );
}
