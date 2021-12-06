import {
  BsFillMicFill,
  BsFillMicMuteFill,
  BsFillCameraVideoFill,
  BsFillCameraVideoOffFill,
} from "react-icons/bs";

import { MdScreenShare } from "react-icons/md";
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

export { MicIcon, CameraIcon, ScreenShareIcon };
