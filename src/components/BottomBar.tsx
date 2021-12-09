import { useVideoConfContext } from "../contexts/video-conf/video-conf-context";
import { ScreenSharedSts } from "../enums/screenSharedSts";
import {
  CallDropIcon,
  CameraIcon,
  MicIcon,
  ScreenShareIcon,
  StopScreenShareIcon,
} from "./IconComps";

export function BottomBar() {
  const {
    localMute,
    toggleMicAndVideoDuringMeeting,
    shareScreen,
    stopScreenShare,
    screenSharedSts,
    callDrop,
  } = useVideoConfContext();

  return (
    <div>
      {localMute &&
        toggleMicAndVideoDuringMeeting &&
        shareScreen &&
        stopScreenShare &&
        callDrop && (
          <div className="flex justify-center space-x-7">
            <div
              onClick={() => toggleMicAndVideoDuringMeeting(true)}
              className=""
            >
              {localMute.mutedMic ? (
                <MicIcon muted={true} />
              ) : (
                <MicIcon muted={false} />
              )}
            </div>
            <div onClick={() => toggleMicAndVideoDuringMeeting(false)}>
              {localMute.mutedVideo ? (
                <CameraIcon muted={true} />
              ) : (
                <CameraIcon muted={false} />
              )}
            </div>
            {screenSharedSts === ScreenSharedSts.LOCAL ? (
              <div onClick={stopScreenShare}>
                <StopScreenShareIcon />
              </div>
            ) : screenSharedSts === ScreenSharedSts.REMOTE ? null : (
              <div onClick={shareScreen}>
                <ScreenShareIcon />
              </div>
            )}
            <div onClick={callDrop}>
              <CallDropIcon />
            </div>
          </div>
        )}
    </div>
  );
}
