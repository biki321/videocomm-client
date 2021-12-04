import { types } from "mediasoup-client";

export interface IStreams {
  webCamStream: MediaStream | null; //this contains cam track and mic track
  screenShareStream: MediaStream | null;
}

export interface IPeerMedia extends IStreams {
  producerSendTransPortId: string;
  producerId: string[];
  consumers: types.Consumer[];
}
