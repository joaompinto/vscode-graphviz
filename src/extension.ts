/*
Activation Trigger:
    Keybindings .preview and .previewToSide commands (editorTextFocus matching languageId)

On Activation:
    Create a provider for the `languageId`-preview uri scheme
    Register the `languageId`.preview and `languageId`.previewToSide command functions

On .preview command execution:
    Call CreateHTMLWindow() targetting the active editor view column

On .previewToSide execution:
    Call CreateHTMLWindow() targetting the next editor view column

*/
// https://code.visualstudio.com/Docs/extensionAPI/vscode-api

'use strict';
import {
    workspace,
    window,
    commands,
    Disposable,
    ExtensionContext,
    ViewColumn,
    TextDocumentChangeEvent,
    TextEditorSelectionChangeEvent,
    TextDocument,
    Uri
} from 'vscode';

import GraphvizProvider, {
    CreateHTMLWindow,
    MakePreviewUri
} from './GraphvizProvider';

import * as path from "path";

export function activate(context: ExtensionContext) {

    const provider = new GraphvizProvider();
    const providerRegistrations = Disposable.from(
        workspace.registerTextDocumentContentProvider(GraphvizProvider.scheme, provider)
    )

    // When the active document is changed set the provider for rebuild
    // this only occurs after an edit in a document
    workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
        if (e.document === window.activeTextEditor.document) {
            provider.setNeedsRebuild(true);
        }
    })

    // This occurs whenever the selected document changes, its useful to keep the
    window.onDidChangeTextEditorSelection((e: TextEditorSelectionChangeEvent) => {
        if (!!e && !!e.textEditor && (e.textEditor === window.activeTextEditor)) {
            provider.setNeedsRebuild(true);
        }
    })

    workspace.onDidSaveTextDocument((e: TextDocument) => {
        if (e === window.activeTextEditor.document) {
            provider.update(MakePreviewUri(e));
        }
    })

    let previewToSide = commands.registerCommand("graphviz.previewToSide", () => {
        let displayColumn: ViewColumn;
        switch (window.activeTextEditor.viewColumn) {
            case ViewColumn.One:
                displayColumn = ViewColumn.Two;
                break;
            case ViewColumn.Two:
            case ViewColumn.Three:
                displayColumn = ViewColumn.Three;
                break;
        }
        return CreateHTMLWindow(provider, displayColumn);
    })

    let preview = commands.registerCommand("graphviz.preview", () => {
        return CreateHTMLWindow(provider, window.activeTextEditor.viewColumn);
    })

    context.subscriptions.push(previewToSide, preview, providerRegistrations);
}

// this method is called when your extension is deactivated
export function deactivate() { }