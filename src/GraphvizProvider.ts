import {
    workspace,
    window,
    commands,
    ExtensionContext,
    TextEditorSelectionChangeEvent,
    TextDocumentChangeEvent,
    TextDocumentContentProvider,
    EventEmitter,
    ViewColumn,
    Uri,
    Event,
    Disposable,
    TextDocument,
    TextEditor
} from 'vscode';

import { exec, spawn } from "child_process";
import * as path from "path";
let Viz = require("viz.js");


export default class GraphvizProvider implements TextDocumentContentProvider {
    static scheme = 'graphviz-preview';

    private _onDidChange = new EventEmitter<Uri>();
    private resultText = "";
    private lastPreviewHTML = null;
    private lastURI = null;
    private needsRebuild : boolean = true;
    private editorDocument: TextDocument = null;
    private refreshInterval = 1000;

    private resolveDocument(uri: Uri): TextDocument {
        const matches = workspace.textDocuments.filter(d => {
            return MakePreviewUri(d).toString() == uri.toString();
        });
        if (matches.length > 0) {
            return matches[0];
        } else {
            return null;
        }
    }

    public provideTextDocumentContent(uri: Uri): string | Thenable<string> {
        const doc = this.resolveDocument(uri);
        return this.createAsciiDocHTML(doc);
    }

    get onDidChange(): Event<Uri> {
        return this._onDidChange.event;
    }

    public update(uri: Uri) {
        this._onDidChange.fire(uri);
    }

    private createAsciiDocHTML(doc: TextDocument): string | Thenable<string> {
        let editor = window.activeTextEditor;

        if ( !doc || !(doc.languageId === "dot")) {
            return this.errorSnippet("Editor doesn't show a DOT document - no properties to preview.");
        }

        // Rebuild if there were changes to the file, or if the content is beeing request
        // for a different uri.
        if (this.needsRebuild || doc.uri != this.lastURI) {
            this.lastPreviewHTML = this.preview(doc);
            this.lastURI = doc.uri;
            this.needsRebuild = false
        }
        return this.lastPreviewHTML
    }

    private errorSnippet(error: string): string {
        return `
                <body>
                    ${error}
                </body>`;
    }

    private buildPage(document: string): string {
        return document;
    }

    public setNeedsRebuild(value: Boolean) {
        this.needsRebuild = true;
    }

    public preview(doc: TextDocument): Thenable<string> {
        let text = doc.getText();
        return new Promise<string>((resolve, reject) => {
            var svg = Viz(text);
            resolve(svg);
        });
    }

}

function TimerCallback(timer, provider, editor, previewUri) {
    provider._onDidChange.fire(previewUri);
}

export function CreateRefreshTimer(provider, editor, previewUri) {
    var timer = setInterval(
        () => {
            // This function gets called when the timer goes off.
            TimerCallback(timer, provider, editor, previewUri);
        },
        // The periodicity of the timer.
        provider.refreshInterval
    );
}

export function MakePreviewUri(doc: TextDocument): Uri {
    return Uri.parse(`graphviz-preview://preview/${doc.fileName}`);
}

export function CreateHTMLWindow(provider: GraphvizProvider, displayColumn: ViewColumn): PromiseLike<void> {
    let previewTitle = `Preview: '${path.basename(window.activeTextEditor.document.fileName)}'`;
    let previewUri = MakePreviewUri(window.activeTextEditor.document);

    CreateRefreshTimer(provider, window.activeTextEditor, previewUri);
    return commands.executeCommand("vscode.previewHtml", previewUri, displayColumn).then((success) => {
    }, (reason) => {
        console.warn(reason);
        window.showErrorMessage(reason);
    })
}
