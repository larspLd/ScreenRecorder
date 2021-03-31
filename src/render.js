const videoElement = document.querySelector("video");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const videoSelectBtn = document.getElementById("videoSelectBtn");
videoSelectBtn.onclick = getVideoSources;

const { desktopCapturer, remote } = require("electron");
const { dialog, Menu }= remote;

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ["window", "screen"]
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            }
        })
    );

    videoOptionsMenu.popup();
}

let mediaRecorder;
const recordedChunks = [];

async function selectSource(source) {
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: source.id
            }
        }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream; 
    videoElement.play();

    const options = { mimeType: "video/webm; codecs=vp9"};
    mediaRecorder = new MediaRecoreder(stream, options);

    mediaRecorder.ondataavaivable = handleDataavaivable;
    mediaRecorder.onstop = handleStop;

    function handleDataavaivable(e) {
        console.log("video data avaivable");
        recorderChunks.push(e.data);
    }
}
const { writeFile } = require("fs");

async function handleStop(e) {
    const blob = new Blob (recordedChunks, {
        type: "video/webm; codecs=vp9"
    });
    const buffer = buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: "Save video",
        defaultPath: `vid-${Date.now()}.webm`
    })
    console.log(filePath);

    writeFile(filePath, buffer, () => console.log("Video saved successfully!"));
}
