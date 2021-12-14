import { useState } from "react";
import { BottomBar } from "../components/BottomBar";
import PeerVideo from "../components/PeerVideo";
import Permission from "../components/Permission";
import ScreenSharing from "../components/ScreenSharing";
import { useVideoConfContext } from "../contexts/video-conf/video-conf-context";
import { IPeerMedia } from "../interfaces/peermedia.interface";

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

export default function Meeting() {
  const { localCamStream, localScreenStream, consumers } =
    useVideoConfContext();
  const [ready, setReady] = useState(false);

  //this is either local screen share or remote share, but only one
  const screenMediaEle = localScreenStream ? (
    <VideoWrapper maxW="max-w-6xl w-full">
      <ScreenSharing stream={localScreenStream} local={true} />
    </VideoWrapper>
  ) : (
    showScreenShare(consumers)
  );

  return ready ? (
    <div className="h-screen w-screen flex flex-col">
      <div
        className={`p-3 flex-1 overflow-y-auto ${
          screenMediaEle ? "xl:flex xl:overflow-y-hidden" : ""
        }`}
      >
        <div className={`my-2 ${screenMediaEle ? "xl:flex-1" : ""}`}>
          {screenMediaEle}
        </div>
        <div
          className={`space-y-2 flex flex-col items-center ${
            screenMediaEle
              ? "xl:overflow-y-auto block flex-1"
              : "xl:flex-row justify-center items-center space-x-2 flex-wrap"
          }`}
        >
          {localCamStream !== undefined ? (
            <VideoWrapper
              maxW={screenMediaEle ? "max-w-md xl:max-w-xs w-full" : undefined}
              key={localCamStream?.id}
            >
              <PeerVideo stream={localCamStream} local={true} />
            </VideoWrapper>
          ) : null}

          {consumers?.map((peerMedia, index) => {
            return (
              <VideoWrapper
                maxW={
                  screenMediaEle ? "max-w-md xl:max-w-xs w-full" : undefined
                }
                key={peerMedia.webCamStream ? peerMedia.webCamStream.id : index}
              >
                <PeerVideo local={false} stream={peerMedia.webCamStream} />
              </VideoWrapper>
            );
          })}
        </div>
      </div>

      <div className="py-3">
        <BottomBar />
      </div>
    </div>
  ) : (
    <Permission setReady={setReady} />
  );
}

// a note
// 'return ready ? <Final /> : <Permission />' causes video element's glitch
// whenever meeting is rerenderd but not with current setup
// don't exactly know why yet.
