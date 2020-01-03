import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState
} from "react";

import "./Realtime.css";

const askPermission = function(video) {
  const constraints = { audio: false, video: true };

  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }
  // Check if the browser allows using camera:
  if (navigator.mediaDevices) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function(mediaStream) {
        video.srcObject = mediaStream;
        video.onloadedmetadata = function() {
          video.play();
        };
      })
      .catch(function(err) {
        console.error(err);
        alert("No media devices", navigator);
      });
  } else {
    alert("No media devices", navigator);
  }
};

export function RealtimeCameraView(props) {
  const video = useRef();
  const canvas = useRef();
  const shadowElement = useRef();
  useEffect(() => {
    if (video.current) {
      askPermission(video.current);
    }
  }, []);
  let runing = true;
  function draw() {
    if (!canvas.current || !video.current) {
      return;
    }

    const shadowCtx = shadowElement.current.getContext("2d");
    const ctx = canvas.current.getContext("2d");
    const boundingVideo = video.current.getBoundingClientRect();
    const w = canvas.current.width;
    const h = canvas.current.height;
    //   Print video on canvas to make it saveable
    shadowCtx.drawImage(
      video.current,
      0,
      0,
      boundingVideo.width,
      boundingVideo.height,
      0,
      0,
      w,
      h
    );
    const imageData = shadowCtx.getImageData(0, 0, w, h);
    const size = w * h;
    for (let i = 0 | 0; i < size * 4; i += 4 | 0) {
      const middle =
        (imageData.data[i] * 0.65 + imageData.data[i + 1] * 0.35) | 0;
      imageData.data[i] = middle;
      imageData.data[i + 1] = middle;
    }

    ctx.putImageData(imageData, 0, 0);
    if (runing) {
      requestAnimationFrame(draw);
    }

    return () => {
      runing = false;
    };
  }

  useEffect(draw, []);
  return (
    <div className="realtime">
      <video
        ref={video}
        style={{ position: "absolute", visibility: "hidden" }}
      />
      <div className="row">
        <div className="col">
          <h3>Real</h3>
          <canvas width={600} height={400} ref={shadowElement} />
        </div>
        <div className="col">
          <h3>Color Blind</h3>
          <canvas width={600} height={400} ref={canvas} />
        </div>
      </div>
    </div>
  );
}
