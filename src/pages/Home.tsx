import { BottomBar } from "../components/BottomBar";
import PeerVideo from "../components/PeerVideo";
import { useVideoConfContext } from "../contexts/video-conf/video-conf-context";
import { IPeerMedia } from "../interfaces/peermedia.interface";

function showScreenShare(consumers: IPeerMedia[] | undefined) {
  const stream = consumers?.find(
    (consumer) => consumer.screenShareStream
  )?.screenShareStream;
  if (stream)
    return (
      <VideoWrapper maxW="max-w-6xl">
        <PeerVideo key={stream.id} stream={stream} />
      </VideoWrapper>
    );
  else return null;
}

function VideoWrapper({
  children,
  maxW,
}: {
  children: JSX.Element;
  maxW?: string;
}) {
  const className = maxW ?? "max-w-md";
  return <div className={className}>{children}</div>;
}

export default function Home() {
  const { localCamStream, localScreenStream, consumers } =
    useVideoConfContext();

  //this is either local screen share or remote share, but only one
  const screenMediaEle = localScreenStream ? (
    <VideoWrapper maxW="max-w-6xl">
      <PeerVideo stream={localScreenStream} />
    </VideoWrapper>
  ) : (
    showScreenShare(consumers)
  );

  return (
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
              ? "xl:overflow-y-auto block"
              : "xl:flex-row justify-center items-center"
          }`}
        >
          {localCamStream ? (
            <VideoWrapper
              maxW={screenMediaEle ? "max-w-md xl:max-w-xs" : undefined}
            >
              <PeerVideo stream={localCamStream} />
            </VideoWrapper>
          ) : null}
          {/* {localCamStream ? (
            <VideoWrapper
              maxW={screenMediaEle ? "max-w-md xl:max-w-xs" : undefined}
            >
              <PeerVideo stream={localCamStream} />
            </VideoWrapper>
          ) : null}
          {localCamStream ? (
            <VideoWrapper
              maxW={screenMediaEle ? "max-w-md xl:max-w-xs" : undefined}
            >
              <PeerVideo stream={localCamStream} />
            </VideoWrapper>
          ) : null}
          {localCamStream ? (
            <VideoWrapper
              maxW={screenMediaEle ? "max-w-md xl:max-w-xs" : undefined}
            >
              <PeerVideo stream={localCamStream} />
            </VideoWrapper>
          ) : null} */}

          {consumers?.map((peerMedia, index) => (
            <VideoWrapper
              maxW={screenMediaEle ? "max-w-md xl:max-w-xs" : undefined}
              key={peerMedia.webCamStream ? peerMedia.webCamStream.id : index}
            >
              <PeerVideo stream={peerMedia.webCamStream} />
            </VideoWrapper>
          ))}
        </div>
      </div>

      <div className="py-3">
        <BottomBar />
      </div>
    </div>
  );
}
