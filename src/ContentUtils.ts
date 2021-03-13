import { ExtensionContext, Uri, Webview } from "vscode";
var fs = require("fs");

export const CONTENT_FOLDER = "content";

export async function getPreviewTemplate(context: ExtensionContext, templateName: string): Promise<string> {
    let previewPath = Uri.joinPath(context.extensionUri, CONTENT_FOLDER, templateName).fsPath;

    return (await fs.promises.readFile(previewPath, { encoding: "utf-8", flag: 'r' })).toString();
}

export async function getHtml(fileName: string, context: ExtensionContext, webview: Webview) {
    let templateHtml = await getPreviewTemplate(context, fileName);

    // change resource URLs to vscode-resource:
    templateHtml = templateHtml.replace(/<script src="(.+)">/g, (scriptTag, srcPath) => {
        scriptTag;
        const localResource = Uri.joinPath(context.extensionUri, CONTENT_FOLDER, srcPath);
        const webviewResource = webview.asWebviewUri(localResource);
        return `<script src="${webviewResource}">`;
    });

    // be sure that the template has a placeholder for Content Security Policy
    const cspPlaceholderPattern = /<!--\s*CSP\s*-->/i;
    if (!templateHtml.match(cspPlaceholderPattern) || templateHtml.includes('http-equiv="Content-Security-Policy"')) {
        throw new Error(`Template does not contain CSP placeholder or contains rogue CSP.`);
    }
    const nonce = generateNonce();
    cspPlaceholderPattern.lastIndex = 0;
    templateHtml = templateHtml.replace(cspPlaceholderPattern, createContentSecurityPolicy(webview, nonce));

    return templateHtml;
}

function createContentSecurityPolicy(webview: Webview, nonce: string | undefined): string {
    const unsafeInline = "'unsafe-inline'";
    const nonceCsp = nonce ? `'nonce-${nonce}'` : '';

    return `<meta http-equiv="Content-Security-Policy"
\t\tcontent="default-src 'none'; `+
        `img-src ${webview.cspSource} https:; ` +
        `script-src ${webview.cspSource} ${unsafeInline} ${nonceCsp}; ` +
        `style-src ${webview.cspSource} ${unsafeInline};"
\t/>`;
}

function generateNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
