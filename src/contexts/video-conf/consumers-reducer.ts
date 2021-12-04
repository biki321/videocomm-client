import { IPeerMedia, IStreams } from "../../interfaces/peermedia.interface";
import { types } from "mediasoup-client";
import { ExactTrackKind } from "../../enums/exactTrackKind";

const consumersInitialState: IPeerMedia[] = [];

function createMediaStreams(consumers: types.Consumer[]): IStreams {
  const res: IStreams = { webCamStream: null, screenShareStream: null };
  if (consumers.length === 0) return res;

  const webcamTracks: MediaStreamTrack[] = [];
  const screenTracks: MediaStreamTrack[] = [];

  consumers.forEach((consumer) => {
    if (
      consumer.appData.exactKind === ExactTrackKind.CAM ||
      consumer.appData.exactKind === ExactTrackKind.MIC
    )
      webcamTracks.push(consumer.track);
    else if (consumer.appData.exactKind === ExactTrackKind.SCREEEN)
      screenTracks.push(consumer.track);
  });

  if (webcamTracks.length > 0 && screenTracks.length > 0) {
    res.webCamStream = new MediaStream(webcamTracks);
    res.screenShareStream = new MediaStream(screenTracks);
  } else if (webcamTracks.length > 0)
    res.webCamStream = new MediaStream(webcamTracks);
  else if (screenTracks.length > 0)
    res.screenShareStream = new MediaStream(screenTracks);

  return res;
}

type ACTIONTYPE =
  | {
      type: "CONSUMER-ADD";
      payload: {
        consumer: types.Consumer;
        producerSendTransPortId: string;
        producerId: string;
      };
    }
  | {
      type: "CONSUMER-PAUSE";
      payload: { id: string; producerSendTransPortId: string };
    }
  | {
      type: "CONSUMER-RESUME";
      payload: { id: string; producerSendTransPortId: string };
    };

export function consumersReducer(
  state: typeof consumersInitialState,
  action: ACTIONTYPE
) {
  switch (action.type) {
    case "CONSUMER-ADD":
      const index = state.findIndex(
        (ele) =>
          ele.producerSendTransPortId === action.payload.producerSendTransPortId
      );
      if (index !== -1) {
        const oneELe = {
          ...state[index],
          producerId: [...state[index].producerId, action.payload.producerId],
          consumers: [...state[index].consumers, action.payload.consumer],
          ...createMediaStreams([
            ...state[index].consumers,
            action.payload.consumer,
          ]),
          // webCamStream: new MediaStream(
          //   [...state[index].consumers, action.payload.consumer]
          //     .filter(
          //       (ele) =>
          //         ele.appData.exactKind === ExactTrackKind.CAM ||
          //         ele.appData.exactKind === ExactTrackKind.MIC
          //     )
          //     .map((ele) => ele.track)
          // ),
          // screenShareStream: new MediaStream(
          //   [...state[index].consumers, action.payload.consumer]
          //     .filter((ele) => ele.appData.exactKind === ExactTrackKind.SCREEEN)
          //     .map((ele) => ele.track)
          // ),
        };
        return [
          ...state.filter(
            (ele) =>
              ele.producerSendTransPortId !==
              action.payload.producerSendTransPortId
          ),
          oneELe,
        ];
      } else {
        return [
          ...state,
          {
            producerSendTransPortId: action.payload.producerSendTransPortId,
            producerId: [action.payload.producerId],
            consumers: [action.payload.consumer],
            ...createMediaStreams([action.payload.consumer]),
          },
        ];
      }
    case "CONSUMER-PAUSE":
      return state.map((peerMedia) => {
        if (
          peerMedia.producerSendTransPortId ===
          action.payload.producerSendTransPortId
        ) {
          peerMedia.consumers
            .find((ele) => ele.id === action.payload.id)
            ?.pause();
          console.log("consumer is paused", action.payload.id);
          return {
            ...peerMedia,
            ...createMediaStreams(peerMedia.consumers),
          };
        } else return peerMedia;
      });
    case "CONSUMER-RESUME":
      return state.map((peerMedia) => {
        if (
          peerMedia.producerSendTransPortId ===
          action.payload.producerSendTransPortId
        ) {
          peerMedia.consumers
            .find((ele) => ele.id === action.payload.id)
            ?.resume();
          console.log("consumer is resume", action.payload.id);
          return {
            ...peerMedia,
            ...createMediaStreams(peerMedia.consumers),
          };
        } else return peerMedia;
      });
    default:
      return state;
  }
}
