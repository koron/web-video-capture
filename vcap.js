console.log('start vcap.js');

const VCaptureOptions = {
  video: {width: 900, height: 750},
  audio: false,
};

class VCapture {

  constructor(targetElem) {
    this.targetElem = targetElem;
    this.chunkNum = 0;
    this.chunks = [];
  }

  start() {
    console.log('VCapture.start');
    navigator.mediaDevices.getDisplayMedia(VCaptureOptions).
      then(stream => {
        if (this.targetElem) {
          this.targetElem.srcObject = stream;
        }
        let m = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=h264"
        });
        m.ondataavailable = e => this._ondata(e);
        m.onstop = e => this._onstop(e);
        this.mediaRecorder = m;
      }).
      catch(err => {
        console.error("Error: " + err);
      });
  }

  recordStart() {
    if (!this.mediaRecorder) {
      console.warn("no recorder");
      return;
    }
    console.log('VCapture.recordStart');
    this.chunkNum = 0;
    this.chunks = [];
    this.mediaRecorder.start(1000);
  }

  _ondata(e) {
    this.chunks.push(e.data);
    console.log("ondataavailable: ", this.chunks.length);
  }

  recordStop() {
    if (!this.mediaRecorder) {
      console.warn("no recorder");
      return;
    }
    console.log('VCapture.recordStop');
    this.mediaRecorder.stop();
    this.mediaRecorder = null;
  }

  _onstop() {
    if (this.chunks.length == 0) {
      console.warn("no chunks");
    }
    let blob = new Blob(this.chunks, { 'type': 'video/webm; codecs=h264' });
    this.chunks = [];
    let url = URL.createObjectURL(blob);

    let anchor = document.createElement("a");
    anchor.download = new Date().toISOString() + ".webm";
    anchor.href = URL.createObjectURL(blob);
    anchor.click();
  }

}
