import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState
} from "react";

import "./Realtime.css";

const askPermission = function(video, setHeight) {
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
          setHeight(video.videoWidth, video.videoHeight);
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
  const video = useMemo(()=>document.createElement('video'), []);
  const canvas = useRef();
  const shadowElement = useRef();
  function setHeight(vw, vh) {
    if (!canvas.current) {
      return;
    }

    const w = canvas.current.width;
    const h = (vh / vw) * w;
    canvas.current.height = h;
    shadowElement.current.height = h;
  }

  useEffect(() => {
    askPermission(video, setHeight);
  }, [video]);
  let runing = true;
  function draw() {
    if (!canvas.current || !video) {
      return;
    }

    const shadowCtx = shadowElement.current.getContext("2d");
    const ctx = canvas.current.getContext("2d");
    const w = canvas.current.width;
    const h = canvas.current.height;
    //   Print video on canvas to make it saveable
    shadowCtx.drawImage(
      video,
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

  const width = Math.min(600, document.body.clientWidth - 50);
  useEffect(draw, []);
  return (
    <>
      <div className="realtime">
        <div className="row">
          <div className="col">
            <h3>Real</h3>
            <canvas width={width} height={400} ref={shadowElement} />
          </div>
          <div className="col">
            <h3>Color Blind</h3>
            <canvas width={width} height={400} ref={canvas} />
          </div>
        </div>
      </div>
    </>
  );
}
