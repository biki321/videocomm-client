import { useEffect, useRef } from "react";
import { MicIcon } from "./IconComps";

interface IProps {
  stream: MediaStream | null;
  //   videoMuted: boolean;
  //   micMuted: boolean;
}

export default function PeerVideo({ stream }: IProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  console.log("peervideo track", stream?.getVideoTracks()[0]);

  useEffect(() => {
    console.log("effect peervideo", stream?.getVideoTracks()[0]);
    videoRef.current!.srcObject = stream;
  }, [stream]);

  const videoMuted =
    stream &&
    stream.getVideoTracks().length > 0 &&
    !stream.getVideoTracks()[0].enabled;

  const micMuted =
    stream &&
    stream.getAudioTracks().length > 0 &&
    !stream.getAudioTracks()[0].enabled;

  return (
    <>
      <div className="relative">
        {videoMuted ? (
          <div
            className="bg-gray-700 w-full h-full rounded-md absolute
      right-0 bottom-0 flex justify-center items-center"
          >
            <h1 className="font-bold text-xl text-white">Biki Deka</h1>
          </div>
        ) : null}
        <h3 className="font-medium text-white absolute left-2 bottom-1">
          Biki Deka
        </h3>
        <video className="rounded-md" ref={videoRef} autoPlay></video>
        {micMuted ? (
          <div className="absolute right-2 bottom-1">
            <MicIcon muted={true} />
          </div>
        ) : null}
      </div>
      <div className="h-8 text-white">
        {stream?.getVideoTracks()[0].muted.toString()}
      </div>{" "}
    </>
  );
}
