// SOCKET
let socket = new WebSocket("ws://127.0.0.1:8000")

socket.onopen = function (e) {
  console.log("[open] Connection established")
}

socket.onmessage = function (m) {
  console.log("RECEVIED")
}

socket.onclose = function (event) {
  if (event.wasClean) {
    console.log(
      `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
    )
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log("[close] Connection died")
  }
}

/**
 * @fileoverview Demonstrates a minimal use case for MediaPipe face tracking.
 */
const controls = window
const drawingUtils = window
const mpFaceDetection = window
// Our input frames will come from here.
const videoElement = document.getElementsByClassName("input_video")[0]
const canvasElement = document.getElementsByClassName("output_canvas")[0]
const controlsElement = document.getElementsByClassName("control-panel")[0]
const canvasCtx = canvasElement.getContext("2d")
// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS()
// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector(".loading")

spinner.ontransitionend = () => {
  spinner.style.display = "none"
}
function onResults(results) {
  // Hide the spinner.
  document.body.classList.add("loaded")
  // Update the frame rate.
  fpsControl.tick()
  // Draw the overlays.
  canvasCtx.save()
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  )
  if (results.detections.length > 0) {
    drawingUtils.drawRectangle(canvasCtx, results.detections[0].boundingBox, {
      color: "blue",
      lineWidth: 4,
      fillColor: "#00000000",
    })
    drawingUtils.drawLandmarks(canvasCtx, results.detections[0].landmarks[0], {
      color: "red",
      radius: 5,
    })
    socket.send(JSON.stringify(results.detections[0].boundingBox))
  }
  canvasCtx.restore()
}
const faceDetection = new mpFaceDetection.FaceDetection({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`
  },
})
faceDetection.onResults(onResults)
// Present a control panel through which the user can manipulate the solution
// options.
new controls.ControlPanel(controlsElement, {
  selfieMode: true,
  model: "short",
  minDetectionConfidence: 0.5,
})
  .add([
    new controls.StaticText({ title: "MediaPipe Face Detection" }),
    fpsControl,
    new controls.Toggle({ title: "Selfie Mode", field: "selfieMode" }),
    new controls.SourcePicker({
      onSourceChanged: () => {
        faceDetection.reset()
      },
      onFrame: async (input, size) => {
        const aspect = size.height / size.width
        let width, height
        if (window.innerWidth > window.innerHeight) {
          height = window.innerHeight
          width = height / aspect
        } else {
          width = window.innerWidth
          height = width * aspect
        }
        canvasElement.width = width
        canvasElement.height = height
        await faceDetection.send({ image: input })
      },
      examples: {
        images: [],
        videos: [],
      },
    }),
    new controls.Slider({
      title: "Model Selection",
      field: "model",
      discrete: { short: "Short-Range", full: "Full-Range" },
    }),
    new controls.Slider({
      title: "Min Detection Confidence",
      field: "minDetectionConfidence",
      range: [0, 1],
      step: 0.01,
    }),
  ])
  .on((x) => {
    const options = x
    videoElement.classList.toggle("selfie", options.selfieMode)
    faceDetection.setOptions(options)
  })
