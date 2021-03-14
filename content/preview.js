document.body.onload = () => initializeScale(1, false, false);

document.getElementById("scalePercent").onchange = () => setScale(this.value / 100.0);

document.getElementById("scaleUp").onclick = larger;
document.getElementById("scaleDown").onclick = smaller;
document.getElementById("scaleOrig").onclick = original;

const fitToWidthButton = document.getElementById("fitToWidth");
fitToWidthButton.onclick = fitToWidth;
fitToWidthButton.ondblclick = () => setFitToWidthMode(!fitToWidthToggledOn);

const fitToHeightButton = document.getElementById("fitToHeight");
fitToHeightButton.onclick = fitToHeight;
fitToHeightButton.ondblclick = () => setFitToHeightMode(!fitToHeightToggledOn);

document.getElementById("download").onclick = exportSvg;
document.getElementById("openInBrowser").onclick = openInBrowser;