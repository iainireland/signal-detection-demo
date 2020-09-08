const canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');

var nextTrialNum = 1;
class Trial {
    constructor() {
	this.number = nextTrialNum++;
	this.results = [];
	this.remaining = 40;
    }
    setExpected(value) {
	this.expected = value;
    }
    setResult(value) {
	let result = {expected: this.expected, result: value};
	this.results.push(result);
	this.expected = undefined;
	this.remaining--;
    }
    done() {
	return !this.remaining;
    }
}

let currentTrial = undefined;

function resizeCanvas() {
    const mainSection = document.getElementById("main-section");
    const canvasBox = document.getElementById("canvas-box");
    const width = mainSection.clientWidth * 0.9;
    const height = window.innerHeight * 3/4;
    const size = Math.min(width, height);


    canvas.clientWidth = size;
    canvas.clientHeight = size;
    canvas.width = size;
    canvas.height = size;

    clearCanvas();
}

function getMargin() {
    var size = canvas.height;
    return Math.floor(Math.max(0, canvas.width - size) / 2);
}

function getDuration() {
    return document.querySelector("#duration").value;
}

function clearCanvas() {
    var size = canvas.height;

    ctx.beginPath();
    ctx.save();
    ctx.translate(getMargin(), 0);

    // Fill background.
    ctx.fillStyle = document.querySelector("#background-colour").value;
    ctx.fillRect(0, 0, size, size);
}

function init() {
    // Display duration value
    const stimulusDuration = document.querySelector('#duration');
    const durationOutput = document.querySelector('.duration-output');
    durationOutput.textContent = stimulusDuration.value;
    stimulusDuration.addEventListener('input', function() {
	durationOutput.textContent = stimulusDuration.value;
    });

    // Display stimulus size value
    const stimulusSize = document.querySelector('#size');
    const sizeOutput = document.querySelector('.size-output');
    sizeOutput.textContent = stimulusSize.value;
    stimulusSize.addEventListener('input', function() {
	sizeOutput.textContent = stimulusSize.value;
    });

    const backgroundColour = document.querySelector('#background-colour');
    backgroundColour.addEventListener('input', function() {
	clearCanvas();
    });

    const testButton = document.querySelector('#test');
    testButton.addEventListener('click', fixationCross);

    const startButton = document.querySelector('#start');
    startButton.addEventListener('click', startTrial);

    const cancelButton = document.querySelector('#cancel');
    cancelButton.disabled = true;
    cancelButton.addEventListener('click', endTrial);

    const yesButton = document.querySelector('#response-yes');
    yesButton.addEventListener('click', () => registerResponse(true));

    const noButton = document.querySelector('#response-no');
    noButton.addEventListener('click', () => registerResponse(false));

    window.onresize = resizeCanvas;

    resizeCanvas();
    clearCanvas();

    setEnabled(".response-buttons > button", false);
}

function startTrial() {
    currentTrial = new Trial();
    setEnabled(".control-button", false);
    setEnabled("#cancel", true);
    setEnabled(".sidebar > input", false);
    window.setTimeout(fixationCross, 1000);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function fixationCross() {
    clearCanvas();
    var mid = Math.floor(canvas.height / 2) + 0.5;
    var margin = getMargin();
    var radius = Math.floor(mid / 10);

    var showSignal = currentTrial === undefined ||
	Math.random() > 0.5;

    ctx.save();
    ctx.moveTo(margin + mid, mid - radius);
    ctx.lineTo(margin + mid, mid + radius);
    ctx.moveTo(margin + mid - radius, mid);
    ctx.lineTo(margin + mid + radius, mid);
    ctx.stroke();
    ctx.restore();

    window.setTimeout(() => { interTrial(showSignal); }, 250);
}
function interTrial(showSignal) {
    clearCanvas();
    if (currentTrial) {
	currentTrial.setExpected(showSignal);
    }

    const DURATION = 500;
    if (showSignal) {
	var interTrial = 100 + getRandomInt(300);
	var postTrial = DURATION - interTrial - getDuration();
	window.setTimeout(() => {
	    drawSignal(postTrial);
	}, interTrial);
    } else {
	window.setTimeout(() => {
	    clearCanvas();
	    finishSignal(false);
	}, DURATION);
    }
}

function drawSignal(postTrial) {
    const stimulusSize = Number(document.querySelector('#size').value);
    const stimulusColour = document.querySelector("#stimulus-colour").value;
    const stimulusDuration = getDuration();
    var range = canvas.height - stimulusSize;

    var signalX = getRandomInt(range);
    var signalY = getRandomInt(range);
    clearCanvas();

    ctx.save();
    ctx.translate(getMargin(), 0);
    ctx.fillStyle = stimulusColour;
    ctx.arc(signalX + stimulusSize, signalY + stimulusSize,
	    stimulusSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    window.setTimeout(() => { clearCanvas(); finishSignal(true); },
		      stimulusDuration);
}

function finishSignal() {
    if (currentTrial) {
	setEnabled(".response-buttons > button", true);
    }
}

function registerResponse(response) {
    setEnabled(".response-buttons > button", false);
    currentTrial.setResult(response);
    if (currentTrial.done()) {
	console.log(currentTrial);
	endTrial();
    } else {
	window.setTimeout(fixationCross, 500);
    }
}

function endTrial() {
    setEnabled(".control-button", true);
    setEnabled("#cancel", false);
    setEnabled(".sidebar > input", true);
    setEnabled(".response-buttons > button", false);
    currentTrial = undefined;
}

function setEnabled(query, enabled) {
    for (button of document.querySelectorAll(query)) {
	button.disabled = !enabled;
    }
}

init();
