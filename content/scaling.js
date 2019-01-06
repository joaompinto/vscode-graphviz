var originalWidth = 100;
var originalWidthUnit = "%";

var originalHeight = 100;
var originalHeightUnit = "%";

var svg = null;

var scale = 1;
var fitToHeightToggledOn = false;
var fitToWidthToggledOn = false;

var vscode = null;
try {
    vscode = acquireVsCodeApi();
}catch(error){
    console.error(error);
    // swallow, so in the script can be tested in a browser
}

function initializeScale(initialScale, initialFitToWidthMode, initialFitToHeightMode) {
    var svgEls = document.getElementsByTagName("svg");
    if (svgEls.length < 1) {
        console.error("Cannot find any 'svg' element in the document.");
        return;
    }

    svg = svgEls[0];
    var sizePattern = /^([\d.]+)(em|px|%|cm|mm|in|pt|pc)$/g;

    var match = sizePattern.exec(svg.getAttribute("width"));
    if (match) {
        originalWidth = match[1];
        originalWidthUnit = match[2];
    }

    sizePattern.lastIndex = -1;
    var match = sizePattern.exec(svg.getAttribute("height"));
    if (match) {
        originalHeight = match[1];
        originalHeightUnit = match[2];
    }

    // apply initial values
    setScale(initialScale);
    if (initialFitToWidthMode) fitToWidth();
    setFitToWidthMode(initialFitToWidthMode);
    if (initialFitToHeightMode) fitToHeight();
    setFitToHeightMode(initialFitToHeightMode);

    // update the html, but do not send message to extension
    update(false);
}

function larger() {
    untoggleModes();
    scale*=1.5;
    update();
}

function smaller() {
    untoggleModes();
    scale/=1.5;
    update();
}

function original() {
    untoggleModes();
    scale=1;
    update();
}

/**
 * Used when the user sets the scale manually, or the page is re-initialized.
 */
function setScale(value) {
    scale = value;
    untoggleModes();
    update();
}

function fitToWidth() {
    redefineAsPx();
    setFitToHeightMode(false);
    scale=(window.innerWidth-30)/originalWidth;
    update();
}

function fitToHeight() {
    redefineAsPx();
    setFitToWidthMode(false);
    scale=(window.innerHeight-80)/originalHeight;
    update();
}

const toggledOnStyle = "background-color: black;color: white;";

function untoggleModes() {
    setFitToWidthMode(false);
    setFitToHeightMode(false);
}

function setFitToHeightMode(value) {
    if (fitToHeightToggledOn == value) return;
    fitToHeightToggledOn = value;
    var newStyle = fitToHeightToggledOn ? toggledOnStyle : "";
    document.getElementById("fitToHeight").setAttribute("style", newStyle);

    // post message to the extension, so the fit-to-height toggle is respected after the webview is updated
    postMessage({command: 'fitToHeight', value: fitToHeightToggledOn});
}

function setFitToWidthMode(value) {
    if (fitToWidthToggledOn == value) return;
    fitToWidthToggledOn = value;
    var newStyle = fitToWidthToggledOn ? toggledOnStyle : "";
    document.getElementById("fitToWidth").setAttribute("style", newStyle);

    // post message to the extension, so the fit-to-width toggle is respected after the webview is updated
    postMessage({command: 'fitToWidth', value: fitToWidthToggledOn});
}

function redefineAsPx() {
    originalWidthUnit = originalHeightUnit = "px";
}

function update(sendMessage=true) {
    if (svg) {
        svg.setAttribute("style", "width: "+(originalWidth*scale)+originalWidthUnit+
            "; height: "+(originalHeight*scale)+originalHeightUnit);
    }
    document.getElementById("scalePercent").setAttribute("value", (scale*100).toFixed(0));

    // post message to the extension, so the scale is respected after the webview is updated
    if (sendMessage) postMessage({command: 'scale', value: scale});
}

function exportSvg() {
    postMessage({command: 'export'})
}

function postMessage(message) {
    if (vscode) vscode.postMessage(message);
}