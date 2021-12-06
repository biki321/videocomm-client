/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext,
  useEffect,
  useContext,
  useRef,
  useState,
  useCallback,
  useReducer,
} from "react";
import { IPeerMedia } from "../../interfaces/peermedia.interface";
import { useSocketContext } from "../socket-context";
import { Device, types } from "mediasoup-client";
import { consumersReducer } from "./consumers-reducer";
import { ExactTrackKind } from "../../enums/exactTrackKind";
import { ScreenSharedSts } from "../../enums/screenSharedSts";

interface IProps {
  children: JSX.Element;
}

interface IMute {
  mutedMic: boolean;
  mutedVideo: boolean;
}

interface IContextValue {
  localCamStream: MediaStream | null;
  localScreenStream: MediaStream | null;
  consumers: IPeerMedia[];
  mute: IMute;
  toggleMicAndVideo: (isMic: boolean) => void;
  shareScreen: () => void;
  stopScreenShare: () => void;
  screenSharedSts: ScreenSharedSts | null;
}

const VideoConfContext = createContext<Partial<IContextValue>>({});

console.log("inside video conf context");

// https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerOptions
// https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
let paramsForVideo: types.ProducerOptions = {
  // mediasoup params
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
  appData: {
    exactTrackKind: ExactTrackKind.CAM,
  },
};

let paramsForAudio: types.ProducerOptions = {
  appData: {
    exactTrackKind: ExactTrackKind.MIC,
  },
};

let paramsForScreenShare: types.ProducerOptions = {
  // mediasoup params
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
  appData: {
    exactTrackKind: ExactTrackKind.SCREEEN,
  },
};

export function useVideoConfContext() {
  return useContext(VideoConfContext);
}

const getLocalStream = () => {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: {
        min: 640,
        max: 1920,
      },
      height: {
        min: 400,
        max: 1080,
      },
    },
  });
};

const displayMediaOptions = {
  video: true,
  audio: false,
};

const startScreenCapture = () => {
  return navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  // .catch((error) => {
  //   console.log("error at startCapture", error);
  //   return null;
  // });
};

const setProducerEvents = (producer: types.Producer) => {
  producer.on("trackended", () => {
    console.log("track ended");
    // close track
  });

  producer.on("transportclose", () => {
    console.log("transport ended");
    // close track
  });
};

export function VideoConfContextProvider({ children }: IProps) {
  const socket = useSocketContext();
  const device = useRef<types.Device | null>(null);
  const rtpCapabilities = useRef<types.RtpCapabilities | null>(null);
  const producerTransport = useRef<types.Transport | null>(null);
  const consumerTransport = useRef<types.Transport | null>(null);
  const serverConsuTransId = useRef<string | null>(null);
  const [consumers, consumersDispatch] = useReducer(consumersReducer, []);
  const producerForVideo = useRef<types.Producer | null>(null);
  const producerForAudio = useRef<types.Producer | null>(null);
  const producerForScreenShare = useRef<types.Producer | null>(null);
  const [localCamStream, setLocalCamStream] = useState<MediaStream | null>(
    null
  );
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null);
  const [mute, setMute] = useState({ mutedMic: false, mutedVideo: false });
  const [screenSharedSts, setScreenSharedSts] =
    useState<ScreenSharedSts | null>(null);
  const roomName = "room";

  const toggleMicAndVideo = (isMic: boolean) => {
    const producer = isMic
      ? producerForAudio.current
      : producerForVideo.current;
    if (!producer) return;
    if (producer.paused) {
      producer.resume();
      socket?.emit("producer-media-resume", {
        producerId: producer?.id,
      });
      isMic
        ? setMute((prevState) => ({ ...prevState, mutedMic: false }))
        : setMute((prevState) => ({ ...prevState, mutedVideo: false }));
    } else {
      producer.pause();
      socket.emit("producer-media-pause", {
        producerId: producer?.id,
      });
      isMic
        ? setMute((prevState) => ({ ...prevState, mutedMic: true }))
        : setMute((prevState) => ({ ...prevState, mutedVideo: true }));
    }
  };

  const connectRecvTransport = useCallback(
    async (
      consumerTransport: types.Transport,
      remoteProducerId: string,
      serverConsumerTransportId: string
    ) => {
      // for consumer, we need to tell the server first
      // to create a consumer based on the rtpCapabilities and consume
      // if the router can consume, it will send back a set of params as below
      socket?.emit(
        "consume",
        {
          rtpCapabilities: device.current!.rtpCapabilities,
          remoteProducerId,
          serverConsumerTransportId,
        },
        async ({ params }: { params: any }) => {
          if (params.error) {
            console.log("Cannot Consume");
            return;
          }

          console.log(`Consumer Params ${params}`);
          // then consume with the local consumer transport
          // which creates a consumer
          const consumer = await consumerTransport.consume({
            id: params.id,
            producerId: params.producerId,
            kind: params.kind,
            rtpParameters: params.rtpParameters,
            appData: params.appData,
          });
          // add the new consumer to state
          console.log("at connectRecVTransport", consumer.appData);
          consumersDispatch({
            type: "CONSUMER-ADD",
            payload: {
              consumer: consumer,
              producerId: params.producerId,
              producerSendTransPortId: params.producerSendTransPortId,
            },
          });

          // the server consumer started with media paused
          // so we need to inform the server to resume
          socket?.emit("consumer-resume", {
            serverConsumerId: params.serverConsumerId,
          });
        }
      );
    },
    [socket]
  );

  const signalNewConsumerTransport = useCallback(
    async (remoteProducer: {
      producerId: string;
      exactTrackKind: ExactTrackKind;
    }) => {
      connectRecvTransport(
        consumerTransport.current!,
        remoteProducer.producerId,
        serverConsuTransId.current!
      );
    },
    [connectRecvTransport]
  );

  const getProducers = useCallback(() => {
    socket?.emit(
      "getProducers",
      (producers: { producerId: string; exactTrackKind: ExactTrackKind }[]) => {
        console.log(producers);
        // for each of the producer create a consumer
        producers.forEach(signalNewConsumerTransport);
      }
    );
  }, [signalNewConsumerTransport, socket]);

  const connectSendTransport = useCallback(async () => {
    // we now call produce() to instruct the producer transport
    // to send media to the Router
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
    // this action will trigger the 'connect' and 'produce' events above
    producerForVideo.current = await producerTransport.current!.produce(
      paramsForVideo
    );
    setProducerEvents(producerForVideo.current!);

    producerForAudio.current = await producerTransport.current!.produce(
      paramsForAudio
    );
    setProducerEvents(producerForAudio.current!);
  }, []);

  const connectScreenShareSendTransport = useCallback(async () => {
    producerForScreenShare.current = await producerTransport.current!.produce(
      paramsForScreenShare
    );
    setProducerEvents(producerForScreenShare.current!);
  }, []);

  const createSendTransport = useCallback(() => {
    // see server's socket.on('createWebRtcTransport', sender?, ...)
    // this is a call from Producer, so consumer = false
    return new Promise<void>((resolve, reject) => {
      return socket?.emit(
        "createWebRtcTransport",
        { consumer: false },
        (data: any) => {
          // The server sends back params needed
          // to create Send Transport on the client side
          if (data.params.error) {
            console.log(data.params.error);
            return reject(data.params.error);
          }

          console.log(data.params);

          // creates a new WebRTC Transport to send media
          // based on the server's producer transport params
          // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
          producerTransport.current = device.current!.createSendTransport(
            data.params
          );

          // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
          // this event is raised when a first call to transport.produce() is made
          // see connectSendTransport() below
          producerTransport.current.on(
            "connect",
            async ({ dtlsParameters }, callback, errback) => {
              try {
                // Signal local DTLS parameters to the server side transport
                // see server's socket.on('transport-connect', ...)
                socket.emit("transport-connect", {
                  dtlsParameters,
                });

                // Tell the transport that parameters were transmitted.
                callback();
              } catch (error) {
                errback(error);
              }
            }
          );

          producerTransport.current.on(
            "produce",
            async (parameters, callback, errback) => {
              console.log(parameters);

              try {
                // tell the server to create a Producer
                // with the following parameters and produce
                // and expect back a server side producer id
                // see server's socket.on('transport-produce', ...)
                socket.emit(
                  "transport-produce",
                  {
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters,
                    appData: parameters.appData,
                  },
                  ({ id, error }: { id: string; error?: string }) => {
                    if (error) {
                      //taken action
                      console.log("error at transport-produce", error);
                      throw new Error(error);
                    }
                    console.log("at transport-produce", id);
                    // Tell the transport that parameters were transmitted and provide it with the
                    // server side producer's id.
                    callback({ id });
                  }
                );
              } catch (error) {
                errback(error);
              }
            }
          );
          return resolve();
        }
      );
    });
  }, [socket]);

  const createRecvTransport = useCallback(async () => {
    socket?.emit(
      "createWebRtcTransport",
      { consumer: true },
      ({ params }: { params: any }) => {
        // The server sends back params needed
        // to create Send Transport on the client side
        if (params.error) {
          console.log(params.error);
          return;
        }
        console.log(`PARAMS... ${params}`);
        serverConsuTransId.current = params.id;
        try {
          consumerTransport.current =
            device.current!.createRecvTransport(params);
        } catch (error) {
          // exceptions:
          // {InvalidStateError} if not loaded
          // {TypeError} if wrong arguments.
          console.log(error);
          return;
        }

        consumerTransport.current.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              // Signal local DTLS parameters to the server side transport
              // see server's socket.on('transport-recv-connect', ...)
              socket.emit("transport-recv-connect", {
                dtlsParameters,
                serverConsumerTransportId: params.id,
              });

              // Tell the transport that parameters were transmitted.
              callback();
            } catch (error) {
              // Tell the transport that something was wrong
              errback(error);
            }
          }
        );
      }
    );
  }, [socket]);

  // A device is an endpoint connecting to a Router on the
  // server side to send/recive media
  const createDevice = useCallback(async () => {
    const device = new Device();
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
    // Loads the device with RTP capabilities of the Router (server side)
    await device.load({
      routerRtpCapabilities: rtpCapabilities.current!,
    });
    console.log("Device RTP Capabilities", device.rtpCapabilities);
    return device;
  }, []);

  const joinRoom = useCallback<() => Promise<types.RtpCapabilities>>(() => {
    return new Promise((resolve, reject) => {
      return socket.emit(
        "joinRoom",
        { roomName },
        (data: { rtpCapabilities: types.RtpCapabilities; error?: string }) => {
          if (data.error) return reject("error");
          return resolve(data.rtpCapabilities);
        }
      );
    });
  }, [socket]);

  const streamSuccess = useCallback((stream: MediaStream) => {
    setLocalCamStream(stream);
    const trackAudio = stream.getAudioTracks()[0];
    const trackVideo = stream.getVideoTracks()[0];

    paramsForVideo = {
      track: trackVideo,
      ...paramsForVideo,
    };
    paramsForAudio = {
      track: trackAudio,
      ...paramsForAudio,
    };
  }, []);

  const shareScreen = async () => {
    const screenStream = await startScreenCapture();
    paramsForScreenShare = {
      ...paramsForScreenShare,
      track: screenStream.getVideoTracks()[0],
    };
    setLocalScreenStream(screenStream);
    //this will create producer on server & client
    await connectScreenShareSendTransport();
    setScreenSharedSts(ScreenSharedSts.LOCAL);
  };

  const stopScreenShare = () => {
    if (producerForScreenShare.current) {
      const producerId = producerForScreenShare.current.id;
      producerForScreenShare.current.close();
      paramsForScreenShare = {
        ...paramsForScreenShare,
        track: undefined,
      };
      setLocalScreenStream(null);
      socket?.emit("producer-media-close", {
        producerId: producerId,
      });
      setScreenSharedSts(null);
    }
  };

  useEffect(() => {
    console.log("inside useeffect video conf contxt");
    socket?.on("connection-success", async ({ socketId }) => {
      console.log(socketId);
      try {
        const stream = await getLocalStream();
        streamSuccess(stream);
        const rtpCapabilitiesData = await joinRoom();
        console.log(`Server Router RTP Capabilities... ${rtpCapabilitiesData}`);
        // we assign to mutable obj and will be used when
        // loading the client Device (see createDevice above)
        rtpCapabilities.current = rtpCapabilitiesData;
        // once we have rtpCapabilities from the Router, create Device
        device.current = await createDevice();

        // once the device loads, create transport
        await createRecvTransport();
        await createSendTransport();
        await connectSendTransport();
        getProducers();
      } catch (error) {
        console.log("error at ", error);
        return;
      }
    });

    // server informs the client of a new producer just joined
    socket?.on(
      "new-producer",
      (data: { producerId: string; exactTrackKind: ExactTrackKind }) => {
        if (data.exactTrackKind === ExactTrackKind.SCREEEN)
          setScreenSharedSts(ScreenSharedSts.REMOTE);
        signalNewConsumerTransport(data);
      }
    );

    socket?.on(
      "consumer-pause",
      (data: { id: string; producerSendTransPortId: string }) => {
        consumersDispatch({
          type: "CONSUMER-PAUSE",
          payload: data,
        });
      }
    );

    socket?.on(
      "consumer-resume",
      (data: { id: string; producerSendTransPortId: string }) => {
        consumersDispatch({
          type: "CONSUMER-RESUME",
          payload: data,
        });
      }
    );

    socket?.on(
      "consumer-close",
      (data: {
        id: string;
        producerSendTransPortId: string;
        exactTrackKind: ExactTrackKind;
      }) => {
        if (data.exactTrackKind === ExactTrackKind.SCREEEN)
          setScreenSharedSts(null);

        consumersDispatch({
          type: "CONSUMER-CLOSE",
          payload: data,
        });
      }
    );

    return () => {
      socket?.off("connection-success");
      socket?.off("new-producer");
      socket?.off("producer-closed");
      socket?.off("consumer-pause");
      socket?.off("consumer-resume");
      socket?.off("consumer-close");
    };
  }, [
    createDevice,
    joinRoom,
    signalNewConsumerTransport,
    socket,
    streamSuccess,
  ]);

  return (
    <VideoConfContext.Provider
      value={{
        localCamStream,
        localScreenStream,
        consumers,
        mute,
        toggleMicAndVideo,
        shareScreen,
        stopScreenShare,
        screenSharedSts,
      }}
    >
      {children}
    </VideoConfContext.Provider>
  );
}

// socket?.on(
//   "producer-closed",
//   ({ remoteProducerId, producerSendTransPortId }) => {
//     // server notification is received when a producer is closed
//     // we need to close the client-side consumer and associated transport
//     // also remove the consumer transport from the list

//     setConsumers((prevState) => {
//       const index = prevState.findIndex(
//         (ele) => ele.producerSendTransPortId === producerSendTransPortId
//       );

//       if (index !== -1) {
//         const consumer = prevState[index].consumers.find(
//           (ele) => remoteProducerId === ele.producerId
//         );
//         if (consumer) {
//           const oneELe = {
//             ...prevState[index],
//             producerId: prevState[index].producerId.filter(
//               (ele) => ele !== remoteProducerId
//             ),
//             consumers: prevState[index].consumers.filter(
//               (ele) => ele.producerId !== remoteProducerId
//             ),
//           };
//           oneELe["stream"] = new MediaStream(
//             oneELe.consumers.map((ele) => ele.track)
//           );
//           return [
//             ...prevState.filter(
//               (ele) =>
//                 ele.producerSendTransPortId !== producerSendTransPortId
//             ),
//             oneELe,
//           ];
//         }
//       }
//       return prevState;
//     });
//   }
// );
