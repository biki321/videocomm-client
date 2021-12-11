// import { types } from "mediasoup-client";
// import { useState } from "react";
import { BottomBar } from "../components/BottomBar";
// import { CameraIcon, MicIcon } from "../components/IconComps";
import PeerVideo from "../components/PeerVideo";
import { useVideoConfContext } from "../contexts/video-conf/video-conf-context";
// import { ExactTrackKind } from "../enums/exactTrackKind";
import { IPeerMedia } from "../interfaces/peermedia.interface";

function showScreenShare(consumers: IPeerMedia[] | undefined) {
  const peerMedia = consumers?.find((consumer) => consumer.screenShareStream);
  if (peerMedia?.screenShareStream) {
    return (
      <VideoWrapper maxW="max-w-6xl">
        <PeerVideo
          local={false}
          key={peerMedia.screenShareStream.id}
          stream={peerMedia.screenShareStream}
        />
      </VideoWrapper>
    );
  } else return null;
}

function VideoWrapper({
  children,
  maxW,
}: {
  children: JSX.Element;
  maxW?: string;
}) {
  // const className = maxW ?? "max-w-md w-full h-80";
  // const className = maxW ?? "w-96 aspect-w-4 aspect-h-3";
  return <div className="">{children}</div>;
}

export default function Meeting() {
  const {
    localCamStream,
    localScreenStream,
    consumers,
    // triggerSetup,
    // toggleMicAndVideo,
    // toggleMicAndVideoDuringMeeting,
    // localMute,
  } = useVideoConfContext();
  // const [ready, setReady] = useState(false);

  //this is either local screen share or remote share, but only one
  const screenMediaEle = localScreenStream ? (
    <VideoWrapper maxW="max-w-6xl w-full">
      <PeerVideo stream={localScreenStream} local={true} />
    </VideoWrapper>
  ) : (
    showScreenShare(consumers)
  );

  // const joinHandle = () => {
  //   if (triggerSetup) {
  //     triggerSetup();
  //     setReady(true);
  //   }
  // };

  // return !ready ? <AskComp /> : <Final />;
  return (
    <div className="h-screen w-screen flex flex-col">
      <div
        className={`p-3 flex-1 overflow-y-auto ${
          screenMediaEle ? "xl:flex xl:overflow-y-hidden" : ""
        }`}
      >
        <div className={`my-2 ${screenMediaEle ? "xl:flex-1" : ""}`}>
          {screenMediaEle}
        </div>
        <div
          className={`space-y-2 flex flex-col items-center ${
            screenMediaEle
              ? "xl:overflow-y-auto block"
              : "xl:flex-row justify-center items-center space-x-2 flex-wrap"
          }`}
        >
          {localCamStream !== undefined ? (
            <VideoWrapper
              maxW={screenMediaEle ? "max-w-md xl:max-w-xs w-full" : undefined}
              key={localCamStream?.id}
            >
              <PeerVideo stream={localCamStream} local={true} />
            </VideoWrapper>
          ) : null}

          {consumers?.map((peerMedia, index) => {
            return (
              <VideoWrapper
                maxW={
                  screenMediaEle ? "max-w-md xl:max-w-xs w-full" : undefined
                }
                key={peerMedia.webCamStream ? peerMedia.webCamStream.id : index}
              >
                <PeerVideo local={false} stream={peerMedia.webCamStream} />
              </VideoWrapper>
            );
          })}
        </div>
      </div>

      <div className="py-3">
        <BottomBar />
      </div>
    </div>
  );
}

// const AskComp = () =>
// localCamStream ? (
//   <div className="h-screen w-screen flex flex-col xl:flex-row justify-center items-center">
//     <div className="relative max-w-md">
//       <VideoWrapper
//         maxW={screenMediaEle ? "max-w-md xl:max-w-xs" : undefined}
//       >
//         <PeerVideo
//           stream={localCamStream}
//           // videoMuted={localMute ? localMute.mutedVideo : false}
//           // micMuted={localMute ? localMute.mutedMic : false}
//         />
//       </VideoWrapper>
//       <div className="absolute space-x-1 bottom-1 left-0 right-0 flex justify-center">
//         <div onClick={() => toggleMicAndVideo!(true)} className="">
//           {localMute!.mutedMic ? (
//             <MicIcon muted={true} />
//           ) : (
//             <MicIcon muted={false} />
//           )}
//         </div>
//         <div onClick={() => toggleMicAndVideo!(false)}>
//           {localMute!.mutedVideo ? (
//             <CameraIcon muted={true} />
//           ) : (
//             <CameraIcon muted={false} />
//           )}
//         </div>
//       </div>
//     </div>
//     <button
//       className="outline-none px-4 py-2 rounded border-2 text-white font-bold m-6"
//       onClick={joinHandle}
//     >
//       Enter
//     </button>
//   </div>
// ) : (
//   <div></div>
// );

// const Final = () => (
//   <div className="h-screen w-screen flex flex-col">
//     <div
//       className={`p-3 flex-1 overflow-y-auto ${
//         screenMediaEle ? "xl:flex xl:overflow-y-hidden" : ""
//       }`}
//     >
//       <div className={`my-2 ${screenMediaEle ? "xl:flex-1" : ""}`}>
//         {screenMediaEle}
//       </div>
//       <div
//         className={`space-y-2 flex flex-col items-center ${
//           screenMediaEle
//             ? "xl:overflow-y-auto block"
//             : "xl:flex-row justify-center items-center space-x-2 flex-wrap"
//         }`}
//       >
//         {localCamStream ? (
//           <VideoWrapper
//             maxW={screenMediaEle ? "max-w-md xl:max-w-xs" : undefined}
//           >
//             <PeerVideo
//               stream={localCamStream}
//               // videoMuted={localMute ? localMute.mutedVideo : false}
//               // micMuted={localMute ? localMute.mutedMic : false}
//             />
//           </VideoWrapper>
//         ) : null}

//         {consumers?.map((peerMedia, index) => {
//           if (peerMedia.webCamStream) {
//             // const { videoMuted, micMuted } = getMuteStatus(
//             //   peerMedia.consumers
//             // );
//             return (
//               <VideoWrapper
//                 maxW={screenMediaEle ? "max-w-md xl:max-w-xs" : undefined}
//                 key={peerMedia.webCamStream.id}
//               >
//                 <PeerVideo
//                   stream={peerMedia.webCamStream}
//                   // videoMuted={videoMuted}
//                   // micMuted={micMuted}
//                 />
//               </VideoWrapper>
//             );
//           } else return null;
//         })}
//       </div>
//     </div>

//     <div className="py-3">
//       <BottomBar />
//     </div>
//   </div>
// );
