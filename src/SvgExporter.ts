import fs = require('fs');
import { Uri, window, workspace } from 'vscode';
import { graphviz } from "@hpcc-js/wasm";

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

        let svg = await this.renderSvgString(documentUri);

        fs.writeFile(uri.fsPath, svg, 'utf8', err => {
            if (err) {
                window.showErrorMessage("Cannot export to file " + uri.fsPath);
                console.log(err);
            }
        });
    }

    protected async renderSvgString(documentUri: Uri): Promise<string> {
        let doc = await workspace.openTextDocument(documentUri);
        let graphVizText = doc.getText();
        let svg = await graphviz.dot(graphVizText);
        return svg;
    }
}