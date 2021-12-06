import { useVideoConfContext } from "../contexts/video-conf/video-conf-context";
import { ScreenSharedSts } from "../enums/screenSharedSts";
import { CameraIcon, MicIcon, ScreenShareIcon } from "./IconComps";

export function BottomBar() {
  const {
    mute,
    toggleMicAndVideo,
    shareScreen,
    stopScreenShare,
    screenSharedSts,
  } = useVideoConfContext();

  return (
    <div>
      {mute && toggleMicAndVideo && shareScreen && stopScreenShare && (
        <div className="flex justify-center space-x-7">
          <div
            onClick={() => toggleMicAndVideo && toggleMicAndVideo(true)}
            className=""
          >
            {mute.mutedMic ? (
              <MicIcon muted={true} />
            ) : (
              <MicIcon muted={false} />
            )}
          </div>
          <div onClick={() => toggleMicAndVideo && toggleMicAndVideo(false)}>
            {mute.mutedVideo ? (
              <CameraIcon muted={true} />
            ) : (
              <CameraIcon muted={false} />
            )}
          </div>
          {screenSharedSts === ScreenSharedSts.LOCAL ? (
            <div onClick={stopScreenShare}>stop screen</div>
          ) : screenSharedSts === ScreenSharedSts.REMOTE ? null : (
            <div onClick={shareScreen}>
              <ScreenShareIcon />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
