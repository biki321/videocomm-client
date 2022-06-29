import { useEffect, useState } from "react";
import CanvasBoard from "../components/CanvasBoard";
import { BottomBar } from "../components/BottomBar";
import PeerVideo from "../components/PeerVideo";
import Permission from "../components/Permission";
import ScreenSharing from "../components/ScreenSharing";
import { useSocketContext } from "../contexts/socket-context";
import { useVideoConfContext } from "../contexts/video-conf/video-conf-context";
import { CanvasSharedSts } from "../enums/canvasSharedSts";
import { IPeerMedia } from "../interfaces/peermedia.interface";
import { useParams } from "react-router-dom";
import ChatBox from "../components/ChatBox";
import { useAuthContext } from "../contexts/auth/auth-context";

function showScreenShare(consumers: IPeerMedia[] | undefined) {
  const peerMedia = consumers?.find((consumer) => consumer.screenShareStream);
  if (peerMedia?.screenShareStream) {
    return (
      <VideoWrapper maxW="max-w-6xl">
        <ScreenSharing
          local={false}
          key={peerMedia.screenShareStream.id}
          stream={peerMedia.screenShareStream}
        />
      </VideoWrapper>
    );
  } else return null;
}

export function VideoWrapper({
  children,
  maxW,
}: {
  children: JSX.Element;
  maxW?: string;
}) {
  const className = maxW ?? "w-96";
  return <div className={className}>{children}</div>;
}

enum screenOrCanvasEnum {
  SCREEN = "screen",
  CANVAS = "canvas",
}

export default function Meeting() {
  const { socket } = useSocketContext();
  const { user } = useAuthContext();
  const {
    localCamStream,
    localScreenStream,
    consumers,
    canvasSharedSts,
    setCanvasSharedSts,
  } = useVideoConfContext();
  const [ready, setReady] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { roomName } = useParams();

  useEffect(() => {
    if (canvasSharedSts === undefined || !setCanvasSharedSts) return;

    // during meeting if somebody share a canvas
    socket!.on("sharedCanvas", () => {
      console.log("effect meeting sharedCanvas");
      setCanvasSharedSts(CanvasSharedSts.REMOTE);
    });
    socket!.on("closeSharedCanvas", () => {
      setCanvasSharedSts(null);
    });

    return () => {
      socket!.off("sharedCanvas");
      socket!.off("closeSharedCanvas");
    };
  }, [canvasSharedSts, setCanvasSharedSts, socket]);

  let screenMediaEle: JSX.Element | null = null;
  let screenOrCanvas: "screen" | "canvas" | null = null;

  if (!canvasSharedSts) {
    //this is either local screen share or remote share, but only one
    if (localScreenStream) {
      screenMediaEle = (
        <VideoWrapper maxW="w-full">
          <ScreenSharing stream={localScreenStream} local={true} />
        </VideoWrapper>
      );
    } else screenMediaEle = showScreenShare(consumers);

    screenOrCanvas = screenMediaEle ? screenOrCanvasEnum.SCREEN : null;
  } else screenOrCanvas = screenOrCanvasEnum.CANVAS;

  console.log("chat", chatOpen);
  const toggleChat = () => {
    setChatOpen((pv) => !pv);
  };
  return ready ? (
    <div className="bg-gray-900 h-screen w-screen overflow-x-hidden relative">
      {/* <div className=" h-92/100 flex justify-between"> */}
      <div
        className={`p-3 h-92/100 ${
          screenOrCanvas ? "xl:flex xl:justify-between" : ""
        }`}
      >
        {screenOrCanvas === screenOrCanvasEnum.SCREEN ? (
          <div className="flex justify-center flex-4 h-2/5 xl:h-full">
            {screenMediaEle}
          </div>
        ) : screenOrCanvas === screenOrCanvasEnum.CANVAS ? (
          <div className="flex justify-center flex-4 h-2/5 xl:h-full">
            {<CanvasBoard />}
          </div>
        ) : // <div className="w-full h-2/5 xl:h-full">{<CanvasBoard />}</div>
        null}
        <div
          className={`space-y-2 flex flex-col items-center overflow-y-auto overflow-x-hidden ml-2 ${
            screenOrCanvas
              ? "xl:flex-1 h-3/5 xl:h-full"
              : "space-x-2 xl:flex-row xl:justify-center xl:flex-wrap h-full"
          }`}
        >
          {localCamStream !== undefined ? (
            <VideoWrapper
              maxW={screenOrCanvas ? "max-w-md xl:max-w-xs w-full" : undefined}
              key={localCamStream?.id}
            >
              <PeerVideo
                stream={localCamStream}
                local={true}
                email={user!.email}
              />
            </VideoWrapper>
          ) : null}
          {consumers?.map((peerMedia, index) => {
            return (
              <VideoWrapper
                maxW={
                  screenOrCanvas ? "max-w-md xl:max-w-xs w-full" : undefined
                }
                key={peerMedia.webCamStream ? peerMedia.webCamStream.id : index}
              >
                <PeerVideo
                  local={false}
                  stream={peerMedia.webCamStream}
                  email={peerMedia.consumers[0].appData.email}
                />
              </VideoWrapper>
            );
          })}
        </div>
      </div>

      <div
        className={`absolute top-0 w-72
          ${!chatOpen ? "right-0" : "-right-72"}
          ease-in-out duration-100 `}
      >
        <ChatBox />
      </div>
      {/* </div> */}

      <div className="py-2 z-10">
        <BottomBar toggleChat={toggleChat} />
      </div>
    </div>
  ) : (
    <Permission setReady={setReady} roomName={roomName!} />
  );
}

// {[1, 2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((ele) =>
//   localCamStream !== undefined ? (
//     <VideoWrapper
//       maxW={
//         screenOrCanvas ? "max-w-md xl:max-w-xs w-full" : undefined
//       }
//       key={ele}
//     >
//       <PeerVideo stream={localCamStream} local={true} />
//     </VideoWrapper>
//   ) : null
// )}
