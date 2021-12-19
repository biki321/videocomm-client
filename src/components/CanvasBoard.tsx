import React, { useRef, useEffect } from "react";
import { useSocketContext } from "../contexts/socket-context";

interface drawData {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
}

const current = { color: "black", x: 0, y: 0 };

const CanvasBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorsRef = useRef(null);
  const socket = useSocketContext();

  useEffect(() => {
    socket.emit("sharedCanvas");
  }, [socket]);

  useEffect(() => {
    // --------------- getContext() method returns a drawing context on the canvas-----

    const canvas = canvasRef.current;
    if (!canvas) return;
    const test = colorsRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;
    const canvasOffSet = {
      left: canvas.offsetLeft,
      top: canvas.offsetTop,
    };

    // ----------------------- Colors --------------------------------------------------

    const colors = document.getElementsByClassName("color");
    console.log(colors, "the colors");
    console.log(test);

    // helper that will update the current color
    const onColorUpdate = (e: any) => {
      current.color = e.target.className.split(" ")[1];
    };

    // loop through the color elements and add the click event listeners
    for (let i = 0; i < colors.length; i++) {
      colors[i].addEventListener("click", onColorUpdate, false);
    }
    let drawing = false;

    // ------------------------------- create the drawing ----------------------------

    const drawLine = (data: drawData, emit: boolean) => {
      context.beginPath();
      context.moveTo(data.x0, data.y0);
      context.lineTo(data.x1, data.y1);
      context.strokeStyle = data.color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();

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
      current.x = e.pageX - canvasOffSet.left;
      current.y = e.pageY - canvasOffSet.top;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!drawing) {
        return;
      }
      drawLine(
        {
          x0: current.x,
          y0: current.y,
          x1: e.pageX - canvasOffSet.left,
          y1: e.pageY - canvasOffSet.top,
          color: current.color,
        },
        true
      );
      current.x = e.pageX - canvasOffSet.left;
      current.y = e.pageY - canvasOffSet.top;
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
          x1: e.pageX - canvasOffSet.left,
          y1: e.pageY - canvasOffSet.top,
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

    // Touch support for mobile devices
    // canvas.addEventListener("touchstart", onMouseDown, false);
    // canvas.addEventListener("touchend", onMouseUp, false);
    // canvas.addEventListener("touchcancel", onMouseUp, false);
    // canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

    // -------------- make the canvas fill its parent component -----------------

    // const onResize = () => {
    //   canvas.width = window.innerWidth;
    //   canvas.height = window.innerHeight;
    // };

    // window.addEventListener("resize", onResize, false);
    // onResize();

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
        //it was undefined before need to check
        false
      );
    };

    socket.on("drawing", onDrawingEvent);

    return () => {
      socket.off("drawing", onDrawingEvent);
    };
  }, [socket]);

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

  // ------------- The Canvas and color elements --------------------------

  return (
    <div>
      <canvas ref={canvasRef} className="whiteboard bg-white" />

      {/* <div ref={colorsRef} className="colors">
        <div className="color black" />
        <div className="color red" />
        <div className="color green" />
        <div className="color blue" />
        <div className="color yellow" />
      </div> */}
    </div>
  );
};

export default CanvasBoard;
