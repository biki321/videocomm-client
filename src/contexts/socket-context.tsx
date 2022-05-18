import { createContext, useContext, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAuthContext } from "../contexts/auth/auth-context";

interface IProps {
  children: JSX.Element;
}
// console.log("token socket", window.localStorage.getItem("token"));

interface IContext {
  socket: Socket;
}

// const socket = io(process.env.REACT_APP_MEDIA_SERVER_URL!, socketOptions);
const SocketContext = createContext<Partial<IContext>>({});

console.log("inside socket context");

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketContextProvider({ children }: IProps) {
  const { user } = useAuthContext();
  const socket = useRef<Socket | null>(null);
  const [getin, setGetin] = useState(false);

  useEffect(() => {
    console.log("at socket usereff 1");
    (async () => {
      const token = await user!.getIdToken();
      console.log("email verified at skt", user?.emailVerified);
      console.log(
        "tkn at useeffet 1 socket",
        token.substring(token.length / 3)
      );
      let socketOptions = {
        withCredentials: true,
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `token ${token}`, //'Bearer h93t4293t49jt34j9rferek...'
            },
          },
        },
      };
      const newSocket = io(
        process.env.REACT_APP_MEDIA_SERVER_URL!,
        socketOptions
      );
      console.log("new skt id", newSocket.id);
      // setSocket({ socket: newSocket });
      socket.current = newSocket;

      socket.current!.on("connect", () => {
        setGetin(true);
      });
    })();

    return () => {
      socket.current!.off("connect");
      socket.current!.disconnect();
    };
  }, [user]);

  // useEffect(() => {
  //   console.log("at socket usereff 2");
  //   if (socket.current?.connected) {
  //     console.log("socket usereff 2 socket connectd");
  //     setGetin(true);
  //   } else console.log("socekt not connect at useff 2");
  //   return () => {
  //     socket.current?.disconnect();
  //   };
  // }, [socket.current?.connected]);

  // On the client side you add the authorization header like this:
  return (
    <SocketContext.Provider value={{ socket: socket.current! }}>
      {getin ? children : "wait"}
    </SocketContext.Provider>
  );
}
