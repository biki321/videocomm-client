import { types } from "mediasoup-client";

export interface IPeerMedia {
  producerSendTransPortId: string;
  producerId: string[];
  consumers: types.Consumer[];
  stream: MediaStream;
}
