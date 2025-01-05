import {
    ExtensionContext,
    TextDocument,
    window,
    Uri,
    workspace,
    Disposable,
//# #if HAVE_VSCODE
    WebviewPanel,
    Webview
} from "vscode";
//# #elif HAVE_COC_NVIM
//# #define Thenable Promise
//# } from "coc.nvim";
//# import { WebviewPanel, Webview } from "coc-webview";
//# import { getWebviewAPI } from "./util";
//# #endif
import { graphviz } from "@hpcc-js/wasm";
import * as path from "path";
import { SvgExporter } from "./SvgExporter";
import { OpenInBrowser } from "./OpenInBrowser";
import { getPreviewTemplate, CONTENT_FOLDER, getHtml } from "./ContentUtils";

export class GraphvizPreviewGenerator
//# #if HAVE_VSCODE
extends Disposable
//# #endif
{

    webviewPanels = new Map<Uri, PreviewPanel>();

    timeout: NodeJS.Timeout | undefined;

    constructor(private context: ExtensionContext) {
        //# #if HAVE_VSCODE
        super(() => this.dispose());
        //# #endif
     }

    setNeedsRebuild(uri: Uri, needsRebuild: boolean): void {
        let panel = this.webviewPanels.get(uri);

        if (panel) {
            panel.setNeedsRebuild(needsRebuild);

            this.resetTimeout();
        }
    }

    resetTimeout(): void {
        if (this.timeout) {
            this.timeout.refresh();
        } else {
            this.timeout = setTimeout(() => this.rebuild(), 1000);
        }
    }

    dispose(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    rebuild(): void {
        this.webviewPanels.forEach(panel => {
            if (panel.getNeedsRebuild() && panel.getPanel().visible) {
                this.updateContent(panel, workspace.textDocuments.find(doc =>
                    //# #if HAVE_VSCODE
                    doc.uri
                    //# #elif HAVE_COC_NVIM
                    //# Uri.parse(doc.uri)
                    //# #endif
                        == panel.uri));
            }
        });
    }

    async revealOrCreatePreview(doc: TextDocument,
        displayColumn:
        //# #if HAVE_VSCODE
        ViewColumn
        //# #elif HAVE_COC_NVIM
        //# { openURL: boolean }
        //# #endif
    ): Promise<void> {
        let previewPanel = this.webviewPanels.get(
            //# #if HAVE_VSCODE
            doc.uri
            //# #elif HAVE_COC_NVIM
            //# Uri.parse(doc.uri)
            //# #endif
        );

        if (previewPanel) {
            previewPanel.reveal(displayColumn);
        }
        else {
            previewPanel = await this.createPreviewPanel(doc, displayColumn);
            this.webviewPanels.set(
                //# #if HAVE_VSCODE
                doc.uri,
                //# #elif HAVE_COC_NVIM
                //# Uri.parse(doc.uri),
                //# #endif
                previewPanel);
            // when the user closes the tab, remove the panel
            previewPanel.getPanel().onDidDispose(() => this.webviewPanels.delete(
                //# #if HAVE_VSCODE
                doc.uri,
                //# #elif HAVE_COC_NVIM
                //# Uri.parse(doc.uri),
                //# #endif
            ), undefined, this.context.subscriptions);
            // when the pane becomes visible again, refresh it
            previewPanel.getPanel().onDidChangeViewState(_ => this.rebuild());

            previewPanel.getPanel().webview.onDidReceiveMessage(e => this.handleMessage(previewPanel, e), undefined, this.context.subscriptions);
        }

        this.updateContent(previewPanel, doc);
    }

    handleMessage(previewPanel: PreviewPanel, message: any): void {
        console.log(`Message received from the webview: ${message.command}`);

        switch(message.command){
            case 'scale':
                previewPanel.setScale(message.value);
                break;
            case 'layout':
                previewPanel.setLayout(message.value);
				previewPanel.setNeedsRebuild(true);
                break;
            case 'fitToHeight':
                previewPanel.setFitToHeight(message.value);
                break;
            case 'fitToWidth':
                previewPanel.setFitToWidth(message.value);
                break;
            case 'export':
                new SvgExporter().export(previewPanel.uri);
                break;
            case 'open':
                new OpenInBrowser(this.context).open(previewPanel.uri);
                break;
            default:
                console.warn('Unexpected command: ' + message.command);
        }
    }

    async createPreviewPanel(doc: TextDocument,
        //# #if HAVE_VSCODE
        displayColumn: ViewColumn
        //# #elif HAVE_COC_NVIM
        //# displayColumn_: { openURL: boolean }
        //# #endif
    ): Promise<PreviewPanel> {
        const previewTitle = `Preview: '${path.basename(doc.uri)}'`;
        //# #if HAVE_COC_NVIM
        //# const displayColumn = { openURL: displayColumn_.openURL, routeName: 'graphvizPreview' };
        //# #endif
        const webViewPanel =
        //# #if HAVE_VSCODE
        window
        //# #elif HAVE_COC_NVIM
        //# await getWebviewAPI()
        //# #endif
        .createWebviewPanel('graphvizPreview', previewTitle, displayColumn, {
            //# #if HAVE_VSCODE
            enableFindWidget: true,
            //# #endif
            enableScripts: true,
            localResourceRoots: [Uri.file(path.join(this.context.extensionPath, "content"))]
        });

        webViewPanel.iconPath = Uri.file(this.context.asAbsolutePath("content/icon.svg"));

        return new PreviewPanel(
            //# #if HAVE_VSCODE
            doc.uri,
            //# #elif HAVE_COC_NVIM
            //# Uri.parse(doc.uri),
            //# #endif
            webViewPanel
        );
    }

    async updateContent(previewPanel: PreviewPanel, doc: TextDocument) {
        if(!previewPanel.getPanel().webview.html) {
            previewPanel.getPanel().webview.html = "Please wait...";
        }
        previewPanel.setNeedsRebuild(false);
        previewPanel.getPanel().webview.html = await this.getPreviewHtml(previewPanel, doc);
    }

    toSvg(layout: string, doc: TextDocument): Thenable<string> | string {
        let text = doc.getText();
		type Engine = "circo" | "dot" | "fdp" | "neato" | "osage" | "patchwork" | "twopi"
		return graphviz.layout(text, "svg", layout as Engine);
    }

    private async getPreviewHtml(previewPanel: PreviewPanel, doc: TextDocument): Promise<string> {
        let templateHtml = await getPreviewTemplate(this.context, "previewTemplate.html");

        // change resource URLs to vscode-resource:
        templateHtml = templateHtml.replace(/<script src="(.+)">/g, (scriptTag, srcPath) => {
            scriptTag;
            let resource=Uri.file(
                path.join(this.context.extensionPath,
                    CONTENT_FOLDER,
                    srcPath))
                    .with({scheme: "vscode-resource"});
            return `<script src="${resource}">`;
        }).replace("initializeScale(1,false,false,\'dot\')",
            `initializeScale(${previewPanel.getScale()}, ${previewPanel.getFitToWidth()}, ${previewPanel.getFitToHeight()}, \'${previewPanel.getLayout()}\')`);

        let svg = "";
        try {
			let layout = previewPanel.getLayout();
            svg = await this.toSvg(layout, doc);
        }catch(error){
            svg = error.toString();
        }

        return templateHtml.replace("PLACEHOLDER", svg);
    }
}

class PreviewPanel {

    needsRebuild = false;
    scale = 1;
    fitToWidth = false;
    fitToHeight = false;
	layout = "dot";

    constructor(public uri: Uri, private panel: WebviewPanel) {}

    setScale(value: number): void {
        this.scale = value;
    }

	setLayout(value: string): void {
		this.layout = value;
	}

	getScale(): number {
        return this.scale;
    }

	getLayout(): string {
        return this.layout;
    }

    setFitToWidth(value: boolean): void {
        this.fitToWidth = value;
    }

    getFitToWidth(): boolean {
        return this.fitToWidth;
    }

    setFitToHeight(value: boolean): void {
        this.fitToHeight = value;
    }

    getFitToHeight(): boolean {
        return this.fitToHeight;
    }

    reveal(displayColumn:
        //# #if HAVE_VSCODE
        ViewColumn,
        //# #elif HAVE_COC_NVIM
        //# { openURL: boolean }
        //# #endif
    ): void {
        this.panel.reveal(displayColumn);
    }

    setNeedsRebuild(needsRebuild: boolean) {
        this.needsRebuild = needsRebuild;
    }

    getNeedsRebuild(): boolean {
        return this.needsRebuild;
    }

    getPanel(): WebviewPanel {
        return this.panel;
    }
}
