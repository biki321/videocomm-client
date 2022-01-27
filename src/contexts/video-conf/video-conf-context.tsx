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
import { useParams } from "react-router";
import producerParams from "./producerParams";
import { CanvasSharedSts } from "../../enums/canvasSharedSts";

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
  localMute: IMute;
  toggleMicAndVideoDuringMeeting: (isMic: boolean) => void;
  toggleMicAndVideo: (isMic: boolean) => void;
  shareScreen: () => void;
  stopScreenShare: () => void;
  callDrop: () => void;
  triggerSetup: () => void;
  screenSharedSts: ScreenSharedSts | null;
  canvasSharedSts: CanvasSharedSts | null;
  setCanvasSharedSts: React.Dispatch<
    React.SetStateAction<CanvasSharedSts | null>
  >;
}

const VideoConfContext = createContext<Partial<IContextValue>>({});

console.log("inside video conf context");

export function useVideoConfContext() {
  return useContext(VideoConfContext);
}

const getLocalStream = () => {
  console.log("getlocalstream", navigator.mediaDevices);
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
  const [localMute, setLocalMute] = useState({
    mutedMic: false,
    mutedVideo: false,
  });
  const [screenSharedSts, setScreenSharedSts] =
    useState<ScreenSharedSts | null>(null);
  const [canvasSharedSts, setCanvasSharedSts] =
    useState<CanvasSharedSts | null>(null);
  const { roomName } = useParams();
  console.log("room name ", roomName);

  // to toggle video, isMic = false
  const toggleMicAndVideo = (isMic: boolean) => {
    if (!localCamStream) return;
    if (isMic) {
      const enabled = localCamStream.getAudioTracks()[0].enabled;
      localCamStream.getAudioTracks()[0].enabled = !enabled;
      setLocalMute((prevState) => ({ ...prevState, mutedMic: enabled }));
    } else {
      const enabled = localCamStream.getVideoTracks()[0].enabled;
      localCamStream.getVideoTracks()[0].enabled = !enabled;
      setLocalMute((prevState) => ({ ...prevState, mutedVideo: enabled }));
    }
  };

  // to toggle video, isMic = false
  const toggleMicAndVideoDuringMeeting = (isMic: boolean) => {
    console.log("at toggleMicAndVideoDuringMeeting", isMic);
    const producer = isMic
      ? producerForAudio.current
      : producerForVideo.current;
    if (!producer) return;
    if (producer.paused) {
      producer.resume();
      producer.appData.paused = producer.paused;
      socket.emit("producer-media-resume", {
        producerId: producer?.id,
      });
      if (isMic)
        setLocalMute((prevState) => ({ ...prevState, mutedMic: false }));
      else setLocalMute((prevState) => ({ ...prevState, mutedVideo: false }));
    } else {
      producer.pause();
      producer.appData.paused = producer.paused;
      socket.emit("producer-media-pause", {
        producerId: producer?.id,
      });
      if (isMic)
        setLocalMute((prevState) => ({ ...prevState, mutedMic: true }));
      else setLocalMute((prevState) => ({ ...prevState, mutedVideo: true }));
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

          if (consumer.appData.paused) consumer.pause();
          // add the new consumer to state
          console.log(
            `at connectRecVTransport paused ${consumer.track.kind} ,
            ${consumer.paused}`
          );
          console.log(
            `at connectRecVTransport enabled ${consumer.track.kind} ,
            ${consumer.track.enabled}`
          );
          console.log(
            `at connectRecVTransport muted ${consumer.track.kind} ,
            ${consumer.track.muted}`
          );

          consumer.on("transportclose", () => {
            console.log("consumer transport closed");
            consumer.close();
          });

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
          if (consumer.appData.paused) return;
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
      (
        producers: {
          producerId: string;
          exactTrackKind: ExactTrackKind;
        }[]
      ) => {
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
    producerParams.forVideo.appData.paused =
      !producerParams.forVideo.track?.enabled;
    producerForVideo.current = await producerTransport.current!.produce(
      producerParams.forVideo
    );

    setProducerEvents(producerForVideo.current!);

    producerParams.forAudio.appData.paused =
      !producerParams.forAudio.track?.enabled;
    producerForAudio.current = await producerTransport.current!.produce(
      producerParams.forAudio
    );
    setProducerEvents(producerForAudio.current!);
  }, []);

  const connectScreenShareSendTransport = useCallback(async () => {
    producerParams.forScreenShare.appData.paused =
      !producerParams.forScreenShare.track?.enabled;
    producerForScreenShare.current = await producerTransport.current!.produce(
      producerParams.forScreenShare
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

    producerParams.forVideo = {
      track: trackVideo,
      ...producerParams.forVideo,
    };
    producerParams.forAudio = {
      track: trackAudio,
      ...producerParams.forAudio,
    };
  }, []);

  const shareScreen = async () => {
    const screenStream = await startScreenCapture();
    producerParams.forScreenShare = {
      ...producerParams.forScreenShare,
      track: screenStream.getVideoTracks()[0],
    };
    setLocalScreenStream(screenStream);
    setScreenSharedSts(ScreenSharedSts.LOCAL);
    //this will create producer on server & client
    await connectScreenShareSendTransport();
  };

  const stopScreenShare = () => {
    if (producerForScreenShare.current) {
      const producerId = producerForScreenShare.current.id;
      producerForScreenShare.current.close();
      producerForScreenShare.current = null;
      producerParams.forScreenShare = {
        ...producerParams.forScreenShare,
        track: undefined,
      };
      setLocalScreenStream(null);
      socket?.emit("producer-media-close", {
        producerId: producerId,
      });
      setScreenSharedSts(null);
    }
  };

  const setProducerEvents = (producer: types.Producer) => {
    producer.on("trackended", () => {
      console.log("track ended");
      if (producer.appData.exactTrackKind === ExactTrackKind.SCREEEN) {
        stopScreenShare();
      }
      // close track
    });

    producer.on("transportclose", () => {
      console.log("transport ended");
      // close track
      producer.close();
    });
  };

  const callDrop = () => {
    producerTransport.current?.close();
    consumerTransport.current?.close();

    socket?.emit("calldrop");
    consumersDispatch({
      type: "CONSUMERS_CLEAN",
    });
    setLocalCamStream(null);
    setLocalScreenStream(null);
    // socket.disconnect();
  };

  //this effect only for socket event listeners
  useEffect(() => {
    console.log("inside useeffect video conf contxt");
    socket?.on("trigger", async ({ socketId }) => {
      console.log(socketId);
      try {
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

        //this is asking if somebody is sharing the canvas
        socket.emit("isCanvasShared", ({ isShared }: { isShared: boolean }) => {
          console.log("isCanvasShared", isShared);
          if (isShared) setCanvasSharedSts(CanvasSharedSts.REMOTE);
        });
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
        console.log("at consumer resume socket ");
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

  useEffect(() => {
    (async () => {
      const stream = await getLocalStream();
      console.log("2 efect stream", stream);
      console.log("2 efect stream", stream.getTracks());

      streamSuccess(stream);
      // triggerSetup();
    })();
  }, []);

  const triggerSetup = () => {
    if (socket.connected) socket?.emit("trigger");
    else alert("socket not connected");
  };

  return (
    <VideoConfContext.Provider
      value={{
        localCamStream,
        localScreenStream,
        consumers,
        localMute,
        toggleMicAndVideoDuringMeeting,
        toggleMicAndVideo,
        shareScreen,
        stopScreenShare,
        callDrop,
        screenSharedSts,
        triggerSetup,
        canvasSharedSts,
        setCanvasSharedSts,
      }}
    >
      {children}
    </VideoConfContext.Provider>
  );
}

//if meeting is ended by clicking end button then server will need a restart.
// that is a bug
