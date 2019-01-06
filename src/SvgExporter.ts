import fs = require('fs');
import { Uri, window, workspace } from 'vscode';
let Viz = require("viz.js");
const { Module, render } = require('viz.js/full.render.js');

export class SvgExporter {
    constructor() {

    }

    async export(documentUri: Uri): Promise<void> {
        let svgDefaultUri = documentUri.with({path: documentUri.path + '.svg'});

        let uri = await window.showSaveDialog({defaultUri: svgDefaultUri, saveLabel: "Save as SVG...",
        filters: {
            "SVG": ["svg"]
        }});

        if (!uri) return;

        let doc = await workspace.openTextDocument(documentUri);
        let text = doc.getText();
        let svg = await new Viz({Module, render}).renderString(text);

        fs.writeFile(uri.fsPath, svg, 'utf8', err => {
            if (err) {
                window.showErrorMessage("Cannot export to file " + uri.fsPath);
                console.log(err);
            }
        });
    }
}