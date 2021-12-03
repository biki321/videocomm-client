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

interface IProps {
  children: JSX.Element;
}

interface IMute {
  mutedMic: boolean;
  mutedVideo: boolean;
}

interface IContextValue {
  localVideo: React.MutableRefObject<HTMLVideoElement | null>;
  consumers: IPeerMedia[];
  mute: IMute;
  toggleMicAndVideo: (isMic: boolean) => void;
}

const VideoConfContext = createContext<Partial<IContextValue>>({});

console.log("inside video conf context");

export function useVideoConfContext() {
  return useContext(VideoConfContext);
}

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
  const localVideo = useRef<HTMLVideoElement | null>(null);
  const [mute, setMute] = useState({ mutedMic: false, mutedVideo: false });
  const roomName = "room";

  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerOptions
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
  const paramsForVideo = useRef<types.ProducerOptions>({
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
  });

  const paramsForAudio = useRef<types.ProducerOptions>({});

  const toggleMicAndVideo = (isMic: boolean) => {
    const producer = isMic
      ? producerForAudio.current
      : producerForVideo.current;

    if (producer?.paused) {
      producer?.resume();
      socket?.emit("producer-media-resume", {
        producerId: producer?.id,
      });
      isMic
        ? setMute((prevState) => ({ ...prevState, mutedMic: false }))
        : setMute((prevState) => ({ ...prevState, mutedVideo: false }));
    } else {
      producer?.pause();
      socket?.emit("producer-media-paused", {
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
          });

          // add the new consumer to state
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
    async (remoteProducerId: string) => {
      connectRecvTransport(
        consumerTransport.current!,
        remoteProducerId,
        // params.id
        serverConsuTransId.current!
      );
    },
    [connectRecvTransport]
  );

  const getProducers = useCallback(() => {
    socket?.emit("getProducers", (producerIds: string[]) => {
      console.log(producerIds);
      // for each of the producer create a consumer
      // producerIds.forEach(id => signalNewConsumerTransport(id))
      producerIds.forEach(signalNewConsumerTransport);
    });
  }, [signalNewConsumerTransport, socket]);

  const connectSendTransport = useCallback(async () => {
    // we now call produce() to instruct the producer transport
    // to send media to the Router
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
    // this action will trigger the 'connect' and 'produce' events above
    producerForVideo.current = await producerTransport.current!.produce(
      paramsForVideo.current
    );
    producerForVideo.current!.on("trackended", () => {
      console.log("track ended");

      // close video track
    });

    producerForVideo.current!.on("transportclose", () => {
      console.log("transport ended");

      // close video track
    });

    producerForAudio.current = await producerTransport.current!.produce(
      paramsForAudio.current
    );
    producerForAudio.current!.on("trackended", () => {
      console.log("track ended");

      // close video track
    });

    producerForAudio.current!.on("transportclose", () => {
      console.log("transport ended");

      // close video track
    });

    getProducers();
  }, [getProducers]);

  const createSendTransport = useCallback(() => {
    // see server's socket.on('createWebRtcTransport', sender?, ...)
    // this is a call from Producer, so consumer = false
    socket?.emit("createWebRtcTransport", { consumer: false }, (data: any) => {
      // The server sends back params needed
      // to create Send Transport on the client side
      if (data.params.error) {
        console.log(data.params.error);
        return;
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
              ({
                id,
                producersExist,
              }: {
                id: string;
                producersExist: boolean;
              }) => {
                console.log("at transport-produce", id);
                // Tell the transport that parameters were transmitted and provide it with the
                // server side producer's id.
                callback({ id });
                //create recv transport
                // createRecvTransport();
              }
            );
          } catch (error) {
            errback(error);
          }
        }
      );

      connectSendTransport();
    });
  }, [connectSendTransport, socket]);

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

        //set serverConsuTransId
        serverConsuTransId.current = params.id;

        // let consumerTransport;
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
        // if producers exist, then join room
        // getProducers();
        // connectRecvTransport(consumerTransport, remoteProducerId, params.id);
      }
    );
  }, [socket]);

  // A device is an endpoint connecting to a Router on the
  // server side to send/recive media
  const createDevice = useCallback(async () => {
    try {
      device.current = new Device();

      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
      // Loads the device with RTP capabilities of the Router (server side)
      await device.current.load({
        routerRtpCapabilities: rtpCapabilities.current!,
      });

      console.log("Device RTP Capabilities", device.current.rtpCapabilities);

      // once the device loads, create transport
      createRecvTransport();
      createSendTransport();
    } catch (error: any) {
      console.log(error);
      if (error.name === "UnsupportedError")
        console.warn("browser not supported");
    }
  }, [createRecvTransport, createSendTransport]);

  const joinRoom = useCallback(() => {
    socket?.emit(
      "joinRoom",
      { roomName },
      (data: { rtpCapabilities: types.RtpCapabilities }) => {
        console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`);
        // we assign to mutable obj and will be used when
        // loading the client Device (see createDevice above)
        rtpCapabilities.current = data.rtpCapabilities;

        // once we have rtpCapabilities from the Router, create Device
        createDevice();
      }
    );
  }, [createDevice, socket]);

  const streamSuccess = useCallback(
    (stream: MediaStream) => {
      localVideo.current!.srcObject = stream;
      const trackAudio = stream.getAudioTracks()[0];
      const trackVideo = stream.getVideoTracks()[0];

      paramsForVideo.current! = {
        track: trackVideo,
        ...paramsForVideo.current!,
      };
      paramsForAudio.current! = {
        track: trackAudio,
        ...paramsForAudio.current!,
      };

      joinRoom();
    },
    [joinRoom]
  );

  const getLocalStream = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({
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
      })
      .then(streamSuccess)
      .catch((error) => {
        console.log(error.message);
      });
  }, [streamSuccess]);

  useEffect(() => {
    console.log("inside useeffect video conf contxt");
    socket?.on("connection-success", ({ socketId }) => {
      console.log(socketId);
      getLocalStream();
    });

    // server informs the client of a new producer just joined
    socket?.on("new-producer", ({ producerId }) => {
      console.log("new producer", producerId);
      signalNewConsumerTransport(producerId);
    });

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

    socket?.on("consumer-pause", ({ id, producerSendTransPortId }) => {
      consumersDispatch({
        type: "CONSUMER-PAUSE",
        payload: {
          id,
          producerSendTransPortId,
        },
      });
    });

    socket?.on("consumer-resume", ({ id, producerSendTransPortId }) => {
      consumersDispatch({
        type: "CONSUMER-RESUME",
        payload: {
          id,
          producerSendTransPortId,
        },
      });
    });

    return () => {
      socket?.off("connection-success");
      socket?.off("new-producer");
      socket?.off("producer-closed");
      socket?.off("consumer-pause");
      socket?.off("consumer-resume");
    };
  }, [getLocalStream, signalNewConsumerTransport, socket]);

  return (
    <VideoConfContext.Provider
      value={{ localVideo, consumers, mute, toggleMicAndVideo }}
    >
      {children}
    </VideoConfContext.Provider>
  );
}
