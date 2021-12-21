import { useEffect, useRef } from "react";

interface IProps {
  stream: MediaStream | null;
  local: boolean;
}

export default function ScreenSharing({ stream, local }: IProps) {
  console.log("at peervideo");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    videoRef.current!.srcObject = stream;
  });

  return (
    <>
      <div className="relative w-full ">
        <video className="rounded-md" ref={videoRef} autoPlay></video>
      </div>
    </>
  );
}
