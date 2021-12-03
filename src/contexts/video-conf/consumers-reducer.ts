import { IPeerMedia } from "../../interfaces/peermedia.interface";
import { types } from "mediasoup-client";

const consumersInitialState: IPeerMedia[] = [];

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
          stream: new MediaStream(
            [...state[index].consumers, action.payload.consumer].map(
              (ele) => ele.track
            )
          ),
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
            stream: new MediaStream([action.payload.consumer.track]),
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
            stream: new MediaStream(
              peerMedia.consumers.map((ele) => ele.track)
            ),
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
            stream: new MediaStream(
              peerMedia.consumers.map((ele) => ele.track)
            ),
          };
        } else return peerMedia;
      });
    default:
      return state;
  }
}
