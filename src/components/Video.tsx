import { useEffect, useRef } from "react";

export default function Video({ stream }: { stream: MediaStream }) {
  console.log("video comp");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    console.log("stream at video comp", stream);
    videoRef.current!.srcObject = stream;
  }, [stream]);

  return <video ref={videoRef} autoPlay></video>;
}
