import { useEffect, useRef } from "react";
import { MicIcon } from "./IconComps";

interface IProps {
  stream: MediaStream | null;
  local: boolean;
}

export default function PeerVideo({ stream, local }: IProps) {
  console.log("at peervideo");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      console.log("effect at peervideo", local, stream?.getTracks());
      videoRef.current.srcObject = stream;
    }
  }, [local, stream]);

  const videoMuted =
    stream === null || (stream && stream.getVideoTracks().length === 0);
  const micMuted =
    stream === null || (stream && stream.getAudioTracks().length === 0);
  const showVideoEle = stream !== null;

  return (
    <>
      <div className="relative w-96 aspect-w-4 aspect-h-3">
        {videoMuted ? (
          <div
            className="bg-gray-700 w-full h-full rounded-md absolute
         right-0 bottom-0 flex justify-center items-center z-10"
          >
            <h1 className="font-bold text-xl text-white">Biki Deka</h1>
          </div>
        ) : null}
        {showVideoEle ? (
          <video className="rounded-md" ref={videoRef} autoPlay></video>
        ) : null}
        <div className="z-10">
          <h3 className="font-medium text-white absolute left-2 bottom-1">
            Biki Deka
          </h3>
          {micMuted ? (
            <div className="absolute right-2 bottom-1">
              <MicIcon muted={true} />
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </>
  );
}
