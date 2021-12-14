import { CameraIcon, MicIcon } from "../components/IconComps";
import PeerVideo from "../components/PeerVideo";
import { useVideoConfContext } from "../contexts/video-conf/video-conf-context";
import { VideoWrapper } from "../pages/Meeting";

interface IProps {
  setReady: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Permission({ setReady }: IProps) {
  const { localCamStream, triggerSetup, toggleMicAndVideo, localMute } =
    useVideoConfContext();

  const joinHandle = () => {
    if (triggerSetup) {
      triggerSetup();
      setReady(true);
    }
  };

  return localCamStream ? (
    <div className="h-screen w-screen flex flex-col xl:flex-row justify-center items-center">
      <div className="relative max-w-md">
        {localCamStream !== undefined ? (
          <VideoWrapper>
            <PeerVideo stream={localCamStream} local={true} />
          </VideoWrapper>
        ) : null}
        <div className="absolute space-x-1 bottom-1 left-0 right-0 flex justify-center z-10">
          <div onClick={() => toggleMicAndVideo!(true)} className="">
            {localMute!.mutedMic ? (
              <MicIcon muted={true} />
            ) : (
              <MicIcon muted={false} />
            )}
          </div>
          <div onClick={() => toggleMicAndVideo!(false)}>
            {localMute!.mutedVideo ? (
              <CameraIcon muted={true} />
            ) : (
              <CameraIcon muted={false} />
            )}
          </div>
        </div>
      </div>
      <button
        className="outline-none px-4 py-2 rounded border-2 text-white font-bold m-6"
        onClick={joinHandle}
      >
        Enter
      </button>
    </div>
  ) : (
    <div></div>
  );
}
