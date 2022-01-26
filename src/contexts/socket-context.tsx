import { createContext, useContext } from "react";
import { io } from "socket.io-client";

interface IProps {
  children: JSX.Element;
}

const socket = io(process.env.REACT_APP_MEDIA_SERVER_URL!, {
  withCredentials: false,
});
const SocketContext = createContext(socket);

console.log("inside socket context");

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketContextProvider({ children }: IProps) {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
