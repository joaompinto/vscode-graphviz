import { ExtensionContext } from "vscode";
import * as path from "path";
var fs = require("fs");

export const CONTENT_FOLDER = "content";

export async function getPreviewTemplate(context: ExtensionContext, templateName: string): Promise<string> {
    let previewPath = context.asAbsolutePath(path.join(this.CONTENT_FOLDER, templateName));

    return new Promise<string>((resolve, reject) => {
        fs.readFile(previewPath, "utf8", function (err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}