(function(g) {
  'use strict';

  console.log('start controll.js');

  const startElem = g.document.getElementById("start");
  const recordStartElem = g.document.getElementById("recordStart");
  const recordStopElem = g.document.getElementById("recordStop");
  const videoElem = g.document.getElementById("video");
  const vcap = new VCapture(videoElem);

  startElem.addEventListener("click", evt => vcap.start());
  recordStartElem.addEventListener("click", evt => {
    vcap.recordStart();
  });
  recordStopElem.addEventListener("click", evt => {
    vcap.recordStop();
  });

})(window);
