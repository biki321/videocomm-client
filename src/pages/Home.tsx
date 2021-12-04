import Video from "../components/Video";
import { useVideoConfContext } from "../contexts/video-conf/video-conf-context";
import { IPeerMedia } from "../interfaces/peermedia.interface";

function showScreenShare(consumers: IPeerMedia[] | undefined) {
  const stream = consumers?.find(
    (consumer) => consumer.screenShareStream
  )?.screenShareStream;
  if (stream) return <Video key={stream.id} stream={stream} />;
  else return null;
}

export default function Home() {
  const {
    localVideo,
    localScreen,
    consumers,
    mute,
    toggleMicAndVideo,
    shareScreen,
  } = useVideoConfContext();
  return (
    <div className="Home">
      <div>video conf</div>
      <div>
        <video ref={localVideo} autoPlay></video>
        {consumers?.map((peerMedia, index) => (
          <Video
            key={peerMedia.webCamStream ? peerMedia.webCamStream.id : index}
            stream={peerMedia.webCamStream}
          />
        ))}
      </div>
      <video ref={localScreen} autoPlay></video>
      {showScreenShare(consumers)}
      <div>
        {mute && (
          <>
            <button
              type="button"
              onClick={() => toggleMicAndVideo && toggleMicAndVideo(true)}
            >
              {mute?.mutedMic ? "unmute mic" : "mute mic"}
            </button>
            <button
              type="button"
              onClick={() => toggleMicAndVideo && toggleMicAndVideo(false)}
            >
              {mute?.mutedVideo ? "unmute video" : "mute video"}
            </button>
          </>
        )}
        <button type="button" onClick={shareScreen}>
          share screen
        </button>
      </div>
    </div>
  );
}
