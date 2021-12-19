import { useVideoConfContext } from "../contexts/video-conf/video-conf-context";
import { CanvasSharedSts } from "../enums/canvasSharedSts";
import { ScreenSharedSts } from "../enums/screenSharedSts";
import {
  CallDropIcon,
  CameraIcon,
  MicIcon,
  ScreenShareIcon,
  StopScreenShareIcon,
  StopCanvasIcon,
  CanvasOpenIcon,
} from "./IconComps";

interface IProps {
  canvasSts: CanvasSharedSts | null;
  setCanvasSts: React.Dispatch<React.SetStateAction<CanvasSharedSts | null>>;
}

export function BottomBar({ canvasSts, setCanvasSts }: IProps) {
  const {
    localMute,
    toggleMicAndVideoDuringMeeting,
    shareScreen,
    stopScreenShare,
    screenSharedSts,
    callDrop,
  } = useVideoConfContext();

  const openLocalCanvas = () => setCanvasSts(CanvasSharedSts.LOCAL);
  const closeLocalCanvas = () => setCanvasSts(null);

  const screenSharingStoppingBtn = () => {
    if (canvasSts) return null;

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

    if (canvasSts === CanvasSharedSts.LOCAL)
      return (
        <div onClick={closeLocalCanvas}>
          <StopCanvasIcon />
        </div>
      );
    else if (canvasSts === CanvasSharedSts.REMOTE) return null;
    else
      return (
        <div onClick={openLocalCanvas}>
          <CanvasOpenIcon />
        </div>
      );
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
            <div onClick={callDrop}>
              <CallDropIcon />
            </div>
          </div>
        )}
    </div>
  );
}

// {screenSharedSts === ScreenSharedSts.LOCAL ? (
//   <div onClick={stopScreenShare}>
//     <StopScreenShareIcon />
//   </div>
// ) : screenSharedSts === ScreenSharedSts.REMOTE ? null : (
//   <div onClick={shareScreen}>
//     <ScreenShareIcon />
//   </div>
// )}
