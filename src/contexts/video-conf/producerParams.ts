import { ExactTrackKind } from "../../enums/exactTrackKind";
import { types } from "mediasoup-client";

const producerParams: {
  forVideo: types.ProducerOptions;
  forAudio: types.ProducerOptions;
  forScreenShare: types.ProducerOptions;
} = {
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerOptions
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
  forVideo: {
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
      paused: false,
    },
    zeroRtpOnPause: true,
  },

  forAudio: {
    appData: {
      exactTrackKind: ExactTrackKind.MIC,
      paused: false,
    },
    zeroRtpOnPause: true,
  },

  forScreenShare: {
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
      paused: false,
    },
    zeroRtpOnPause: true,
  },
};

export default producerParams;
