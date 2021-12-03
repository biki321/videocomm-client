import { useEffect, useRef } from "react";

export default function Video({ stream }: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    videoRef.current!.srcObject = stream;
  }, [stream]);

  return <video ref={videoRef} autoPlay></video>;
}
