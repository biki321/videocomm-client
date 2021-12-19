import {
  BsFillMicFill,
  BsFillMicMuteFill,
  BsFillCameraVideoFill,
  BsFillCameraVideoOffFill,
  BsFillPencilFill,
  BsFillStopCircleFill,
} from "react-icons/bs";

import { MdScreenShare, MdCallEnd, MdStopScreenShare } from "react-icons/md";
import { IconContext } from "react-icons";

const iconstyle = { color: "white", size: "1.5rem" };

function IconWrapper({
  children,
  muted,
}: {
  children: JSX.Element;
  muted?: boolean;
}) {
  return <div className="cursor-pointer	">{children}</div>;
}

function MicIcon({ muted }: { muted: boolean }) {
  return (
    <IconWrapper muted={muted}>
      <IconContext.Provider
        value={muted ? { ...iconstyle, color: "red" } : iconstyle}
      >
        {muted ? <BsFillMicMuteFill /> : <BsFillMicFill />}
      </IconContext.Provider>
    </IconWrapper>
  );
}

function CameraIcon({ muted }: { muted: boolean }) {
  return (
    <IconWrapper muted={muted}>
      <IconContext.Provider
        value={muted ? { ...iconstyle, color: "red" } : iconstyle}
      >
        {muted ? <BsFillCameraVideoOffFill /> : <BsFillCameraVideoFill />}
      </IconContext.Provider>
    </IconWrapper>
  );
}

function ScreenShareIcon() {
  return (
    <IconWrapper>
      <IconContext.Provider value={iconstyle}>
        <MdScreenShare />
      </IconContext.Provider>
    </IconWrapper>
  );
}

function StopScreenShareIcon() {
  return (
    <IconWrapper>
      <IconContext.Provider value={{ ...iconstyle, color: "red" }}>
        <MdStopScreenShare />
      </IconContext.Provider>
    </IconWrapper>
  );
}
function CanvasOpenIcon() {
  return (
    <IconWrapper>
      <IconContext.Provider value={iconstyle}>
        <BsFillPencilFill />
      </IconContext.Provider>
    </IconWrapper>
  );
}

function StopCanvasIcon() {
  return (
    <IconWrapper>
      <IconContext.Provider value={{ ...iconstyle, color: "red" }}>
        <BsFillStopCircleFill />
      </IconContext.Provider>
    </IconWrapper>
  );
}

function CallDropIcon() {
  return (
    <IconWrapper>
      <IconContext.Provider value={{ ...iconstyle, color: "red" }}>
        <MdCallEnd />
      </IconContext.Provider>
    </IconWrapper>
  );
}

export {
  MicIcon,
  CameraIcon,
  ScreenShareIcon,
  StopScreenShareIcon,
  CallDropIcon,
  CanvasOpenIcon,
  StopCanvasIcon,
};
