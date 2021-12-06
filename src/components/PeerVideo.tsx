import { useEffect, useRef } from "react";
import { MicIcon } from "./IconComps";

export default function PeerVideo({ stream }: { stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  console.log("at peervideo ", stream);
  useEffect(() => {
    videoRef.current!.srcObject = stream;
  }, [stream]);

  const videoActive =
    stream &&
    stream.getVideoTracks().length > 0 &&
    stream.getVideoTracks()[0].enabled;

  const micActive =
    stream &&
    stream.getAudioTracks().length > 0 &&
    stream.getAudioTracks()[0].enabled;

  return (
    <div className="relative">
      {!videoActive && (
        <div
          className="bg-gray-700 w-full h-full rounded-md absolute 
      right-0 bottom-0 flex justify-center items-center"
        >
          <h1 className="font-bold text-xl text-white">Biki Deka</h1>
        </div>
      )}
      <h3 className="font-medium text-white absolute left-2 bottom-1">
        Biki Deka
      </h3>
      {!micActive && (
        <div className="absolute right-2 bottom-1">
          <MicIcon muted={true} />
        </div>
      )}
      <video className="rounded-md" ref={videoRef} autoPlay></video>
    </div>
  );
}
