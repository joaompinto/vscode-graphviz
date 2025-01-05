import fs = require('fs');
import { Uri, window, workspace } from
//# #if HAVE_VSCODE
'vscode';
//# #elif HAVE_COC_NVIM
//# 'coc.nvim';
//# #endif
import { graphviz } from "@hpcc-js/wasm";

export class SvgExporter {
    constructor() {

    }

    async export(documentUri: Uri): Promise<void> {
        let svgDefaultUri = documentUri.with({path: documentUri.path + '.svg'});

        //# #if HAVE_VSCODE
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
        //# #endif
    }

    protected async renderSvgString(documentUri: Uri): Promise<string> {
        let doc = await workspace.openTextDocument(documentUri);
        //# #if HAVE_VSCODE
        let graphVizText = doc.getText();
        //# #elif HAVE_COC_NVIM
        //# let graphVizText = doc.textDocument.getText();
        //# #endif
        let svg = await graphviz.dot(graphVizText);
        return svg;
    }
}
