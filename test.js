var audioBuffer;
var sourceNode;
var analyser;
var javascriptNode;
var context = new AudioContext();
var ctx = document.getElementById('cav').getContext("2d");
var canvas = document.getElementById('cav');
var add_btn = document.getElementById('add_btn');
var file_btn = document.getElementById('file_btn');
WIDTH = canvas.width;
HEIGHT = canvas.height;
var temp = [];
// Create gradient
var grd = ctx.createLinearGradient(0, 0, 0, HEIGHT);
grd.addColorStop(0.3, "#fff");
grd.addColorStop(1, "#D8FF30");
setupAudioNodes();
add_btn.onclick = function () {
    if (sourceNode.buffer) {
        if (sourceNode.context.currentTime >= sourceNode.buffer.duration) {
            init();
            setupAudioNodes();
            var file = file_btn.files[0];
            var url = URL.createObjectURL(file);
            loadSound(url);
        }
        else {
            console.log(sourceNode);
            console.log(sourceNode.context.currentTime + '---' + sourceNode.buffer.duration);
            alert('这首歌还没结束！！！');
        }
    }
    else{
        init();
        setupAudioNodes();
        var file = file_btn.files[0];
        var url = URL.createObjectURL(file);
        loadSound(url);
    }
};
function init() {
    for (var i = 0; i < 1000; i++) {
        temp[i] = HEIGHT - 1;
    }
}
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        context.decodeAudioData(request.response, function (buffer) {
            playSound(buffer);
        }, onError);
    };
    request.send();
}
function setupAudioNodes() {
    // setup a javascript node
    javascriptNode = context.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    javascriptNode.connect(context.destination);
    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 512;
    // create a buffer source node
    sourceNode = context.createBufferSource();
    sourceNode.connect(analyser);
    analyser.connect(javascriptNode);
    sourceNode.connect(context.destination);
    console.log(sourceNode)
}
function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);
}
// log if an error occurs
function onError(e) {
    console.log(e);
}
// when the javascript node is called
// we use information from the analyzer node
// to draw the volume
javascriptNode.onaudioprocess = function () {
    // get the average for the first channel
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    // clear the current state
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // set the fill style
    drawSpectrum(array);
};
function drawSpectrum(array) {
    for (var i = 0; i < (array.length); i++) {
        var value = array[i];
        ctx.fillRect(i * 4, HEIGHT * 1.7 - value, 3, HEIGHT * 2);
        ctx.fillRect(i * 4, HEIGHT - 1, 3, 1);
        ctx.fillStyle = grd;
        if (HEIGHT * 1.7 - value <= temp[i]) {
            temp[i] = HEIGHT * 1.7 - value - 5;
            ctx.fillRect(i * 4, temp[i], 3, 1);
        }
        else {
            temp[i] = temp[i] + 1;
            ctx.fillRect(i * 4, temp[i], 3, 1);
        }
    }
}