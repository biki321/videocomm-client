import { createContext, useContext } from "react";
import { io } from "socket.io-client";
import { useAuthContext } from "../contexts/auth/auth-context";

interface IProps {
  children: JSX.Element;
}

let socketOptions = {
  withCredentials: true,
  transportOptions: {
    polling: {
      extraHeaders: {
        Authorization: `token ${window.localStorage.getItem("token")}`, //'Bearer h93t4293t49jt34j9rferek...'
      },
    },
  },
};

const socket = io(process.env.REACT_APP_MEDIA_SERVER_URL!, socketOptions);
const SocketContext = createContext(socket);

console.log("inside socket context");

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketContextProvider({ children }: IProps) {
  // On the client side you add the authorization header like this:

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
