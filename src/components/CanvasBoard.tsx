import { useRef, useEffect, useState } from "react";
import { useSocketContext } from "../contexts/socket-context";
import { useVideoConfContext } from "../contexts/video-conf/video-conf-context";
import { CanvasSharedSts } from "../enums/canvasSharedSts";

interface drawData {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
}

const current = { color: "black", x: 0, y: 0 };

// helper that will update the current color
const onColorUpdate = (color: string) => {
  current.color = color;
};

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasParentRef = useRef<HTMLDivElement | null>(null);
  const socket = useSocketContext();
  const { canvasSharedSts } = useVideoConfContext();

  useEffect(() => {
    if (canvasSharedSts === CanvasSharedSts.LOCAL) {
      console.log("sharedCanvas ", canvasSharedSts);
      socket.emit("sharedCanvas");
    }
    // --------------- getContext() method returns a drawing context on the canvas-----
    const canvas = canvasRef.current;
    if (!canvas) return;
    const domRect = canvasParentRef.current!.getBoundingClientRect();
    canvas.width = domRect.width;
    canvas.height = domRect.height;

    contextRef.current = canvas.getContext("2d");
    if (!contextRef.current) return;
    const canvasOffSet = {
      left: canvas.offsetLeft,
      top: canvas.offsetTop,
    };

    let drawing = false;

    // ------------------------------- create the drawing ----------------------------
    const drawLine = (data: drawData, emit: boolean) => {
      contextRef.current!.beginPath();
      contextRef.current!.moveTo(data.x0, data.y0);
      contextRef.current!.lineTo(data.x1, data.y1);
      contextRef.current!.strokeStyle = data.color;
      contextRef.current!.lineWidth = 2;
      contextRef.current!.stroke();
      contextRef.current!.closePath();

      if (!emit) {
        return;
      }
      const w = canvas.width;
      const h = canvas.height;

      socket.emit("drawing", {
        x0: data.x0 / w,
        y0: data.y0 / h,
        x1: data.x1 / w,
        y1: data.y1 / h,
        color: data.color,
      });
    };

    // ---------------- mouse movement --------------------------------------
    const onMouseDown = (e: MouseEvent) => {
      drawing = true;
      current.x = e.clientX - canvasOffSet.left;
      current.y = e.clientY - canvasOffSet.top;
    };

    const onMouseMove = (e: MouseEvent) => {
      console.log("mouse move");
      if (!drawing) {
        return;
      }
      drawLine(
        {
          x0: current.x,
          y0: current.y,
          x1: e.clientX - canvasOffSet.left,
          y1: e.clientY - canvasOffSet.top,
          color: current.color,
        },
        true
      );
      current.x = e.clientX - canvasOffSet.left;
      current.y = e.clientY - canvasOffSet.top;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!drawing) {
        return;
      }
      drawing = false;
      drawLine(
        {
          x0: current.x,
          y0: current.y,
          x1: e.clientX - canvasOffSet.left,
          y1: e.clientY - canvasOffSet.top,
          color: current.color,
        },
        true
      );
    };

    // -----------------add event listeners to our canvas ----------------------
    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

    // ----------------------- socket.io connection ----------------------------
    const onDrawingEvent = (data: drawData) => {
      const w = canvas.width;
      const h = canvas.height;
      drawLine(
        {
          x0: data.x0 * w,
          y0: data.y0 * h,
          x1: data.x1 * w,
          y1: data.y1 * h,
          color: data.color,
        },
        false
      );
    };

    if (canvasSharedSts === CanvasSharedSts.REMOTE) {
      console.log("canvasboard effect receive getIntialCanvasImage");
      socket.emit("getIntialCanvasImage", (imageData: string) => {
        //draw the image on canvas
        const image = new Image();
        image.onload = () => {
          contextRef.current!.drawImage(image, 0, 0);
        };
        image.src = imageData;
      });
    }
    socket.on("drawing", onDrawingEvent);

    socket.on("getIntialCanvasImage", (callback) => {
      const base64ImageData = canvasRef.current!.toDataURL("image/png");
      callback({ imageData: base64ImageData });
    });

    const onResize = () => {
      const prevBase64ImageData = canvasRef.current!.toDataURL("image/png");

      const domRect = canvasParentRef.current!.getBoundingClientRect();
      canvasRef.current!.width = domRect.width;
      canvasRef.current!.height = domRect.height;
      canvasOffSet.left = canvas.offsetLeft;
      canvasOffSet.top = canvas.offsetTop;

      const image = new Image();
      image.onload = () => {
        contextRef.current!.drawImage(
          image,
          0,
          0,
          domRect.width,
          domRect.height
        );
      };
      image.src = prevBase64ImageData;
    };

    window.addEventListener("resize", onResize, false);

    return () => {
      socket.off("drawing", onDrawingEvent);
      socket.off("getIntialCanvasImage");
      //when comp is unmounted inform other peer to remove the canvas
      //if this peer is host of the canvas
      if (canvasSharedSts === CanvasSharedSts.LOCAL)
        socket.emit("closeSharedCanvas");

      window.removeEventListener("resize", onResize);
    };
  }, [canvasSharedSts, socket]);

  // ----------- limit the number of events per second -----------------------
  const throttle = (callback: any, delay: number) => {
    let previousCall = new Date().getTime();
    return function () {
      const time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  };

  return (
    <div
      className="w-full aspect-w-4 aspect-h-2 relative"
      ref={canvasParentRef}
    >
      <canvas ref={canvasRef} className="whiteboard bg-white" />
      <div className="flex absolute top-0 right-4 z-10 h-6">
        <div
          className={`w-6 h-6 bg-black cursor-pointer`}
          onClick={() => onColorUpdate("black")}
        ></div>
        <div
          className={`w-6 h-6 bg-red-900 cursor-pointer`}
          onClick={() => onColorUpdate("red")}
        ></div>
        <div
          className={`w-6 h-6 bg-yellow-300 cursor-pointer`}
          onClick={() => onColorUpdate("yellow")}
        ></div>
        <div
          className={`w-6 h-6 bg-blue-700 cursor-pointer`}
          onClick={() => onColorUpdate("blue")}
        ></div>
      </div>
    </div>
  );
};

export default CanvasBoard;

// pen like (apple pencil) to write is not supported yet

// Touch support for mobile devices
// canvas.addEventListener("touchstart", onMouseDown, false);
// canvas.addEventListener("touchend", onMouseUp, false);
// canvas.addEventListener("touchcancel", onMouseUp, false);
// canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);
