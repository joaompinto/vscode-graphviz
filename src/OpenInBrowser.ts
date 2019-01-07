import { Uri } from "vscode";
import { SvgExporter } from "./SvgExporter";
import * as tmp from 'tmp';

import opn = require('opn');
import fs = require('fs');

export class OpenInBrowser extends SvgExporter {
    constructor() {
        super();
    }

    async open(documentUri: Uri): Promise<void> {

        var svgString = await this.renderSvgString(documentUri);

        var svgFilePath = OpenInBrowser.toTempFile("graph", ".svg", svgString);

        // open the file in the default browser
        opn("file://" + svgFilePath);
    }

    static toTempFile(prefix: string, suffix: string, text: string): string {
        var tempFile = tmp.fileSync({ mode: 0o644, prefix: prefix + '-', postfix: suffix });
        fs.writeSync(tempFile.fd, text, 0, 'utf8');
        return tempFile.name;
    }
}
