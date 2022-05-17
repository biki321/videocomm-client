import { SocketContextProvider } from "./contexts/socket-context";
import Meeting from "./pages/Meeting";
import { VideoConfContextProvider } from "./contexts/video-conf/video-conf-context";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import MeetingLeft from "./pages/MeetingLeft";
import { AuthContextProvider } from "./contexts/auth/auth-context";

export default function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <SocketContextProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/left" element={<MeetingLeft />} />
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
      </AuthContextProvider>
    </BrowserRouter>
  );
}
