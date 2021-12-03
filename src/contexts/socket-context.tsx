import { createContext, useContext } from "react";
import { io } from "socket.io-client";

interface IProps {
  children: JSX.Element;
}

const socket = io("http://localhost:3000");
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
