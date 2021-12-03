import Video from "../components/Video";
import { useVideoConfContext } from "../contexts/video-conf-context";

export default function Home() {
  const { localVideo, consumers, mute, toggleMicAndVideo } =
    useVideoConfContext();
  return (
    <div className="Home">
      <div>video conf</div>
      <div>
        <video ref={localVideo} autoPlay></video>
        {consumers?.map((peerMedia) => (
          <Video key={peerMedia.stream.id} stream={peerMedia.stream} />
        ))}
      </div>
      <div>
        <button type="button" onClick={() => toggleMicAndVideo!(true)}>
          {mute?.mutedMic ? "unmute mic" : "mute mic"}
        </button>
        <button type="button" onClick={() => toggleMicAndVideo!(false)}>
          {mute?.mutedVideo ? "unmute video" : "mute video"}
        </button>
      </div>
    </div>
  );
}
