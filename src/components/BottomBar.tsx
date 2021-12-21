import { useVideoConfContext } from "../contexts/video-conf/video-conf-context";
import { CanvasSharedSts } from "../enums/canvasSharedSts";
import { ScreenSharedSts } from "../enums/screenSharedSts";
import { useNavigate } from "react-router-dom";
import {
  CallDropIcon,
  CameraIcon,
  MicIcon,
  ScreenShareIcon,
  StopScreenShareIcon,
  StopCanvasIcon,
  CanvasOpenIcon,
} from "./IconComps";

export function BottomBar() {
  const {
    localMute,
    toggleMicAndVideoDuringMeeting,
    shareScreen,
    stopScreenShare,
    screenSharedSts,
    callDrop,
    canvasSharedSts,
    setCanvasSharedSts,
  } = useVideoConfContext();
  let navigate = useNavigate();

  const openLocalCanvas = () =>
    setCanvasSharedSts && setCanvasSharedSts(CanvasSharedSts.LOCAL);
  const closeLocalCanvas = () => setCanvasSharedSts && setCanvasSharedSts(null);

  const screenSharingStoppingBtn = () => {
    if (canvasSharedSts) return null;

    if (screenSharedSts === ScreenSharedSts.LOCAL)
      return (
        <div onClick={stopScreenShare}>
          <StopScreenShareIcon />
        </div>
      );
    else if (screenSharedSts === ScreenSharedSts.REMOTE) return null;
    else
      return (
        <div onClick={shareScreen}>
          <ScreenShareIcon />
        </div>
      );
  };

  const canvasSharingStoppingBtn = () => {
    if (screenSharedSts) return null;

    if (canvasSharedSts === CanvasSharedSts.LOCAL)
      return (
        <div onClick={closeLocalCanvas}>
          <StopCanvasIcon />
        </div>
      );
    else if (canvasSharedSts === CanvasSharedSts.REMOTE) return null;
    else
      return (
        <div onClick={openLocalCanvas}>
          <CanvasOpenIcon />
        </div>
      );
  };

  const callDropHandle = () => {
    if (!callDrop) return;
    callDrop();
    navigate("/left", { replace: true });
  };

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
            {screenSharingStoppingBtn()}
            {canvasSharingStoppingBtn()}
            <div onClick={callDropHandle}>
              <CallDropIcon />
            </div>
          </div>
        )}
    </div>
  );
}
