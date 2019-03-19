import { Uri, env, ExtensionContext } from "vscode";
import { SvgExporter } from "./SvgExporter";
import { getPreviewTemplate } from "./ContentUtils";
import * as tmp from 'tmp';
import * as path from 'path';
import fs = require('fs');

export class OpenInBrowser extends SvgExporter {
    constructor(private context: ExtensionContext) {
        super();
    }

    async open(documentUri: Uri): Promise<void> {

        var svgString = await this.renderSvgString(documentUri);

        var browseTemplate = await getPreviewTemplate(this.context, "browseTemplate.html");

        var title = path.basename(documentUri.fsPath);
        var htmlString = browseTemplate
            .replace("PLACEHOLDER", svgString)
            .replace("TITLE", title);

        var htmlFilePath = OpenInBrowser.toTempFile("graph", ".html", htmlString);

        // open the file in the default browser
        env.openExternal(Uri.parse("file://" + htmlFilePath));
    }

    static toTempFile(prefix: string, suffix: string, text: string): string {
        var tempFile = tmp.fileSync({ mode: 0o644, prefix: prefix + '-', postfix: suffix });
        fs.writeSync(tempFile.fd, text, 0, 'utf8');
        return tempFile.name;
    }
}
