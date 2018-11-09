/*
Activation Trigger:
    Keybindings .preview and .previewToSide commands (editorTextFocus matching languageId)

On Activation:
    Create a webview generator
    Register the `languageId`.preview and `languageId`.previewToSide commands

On .preview command execution:
    Call GraphvizPreviewGenerator::revealOrCreatePreview(...) targeting the active editor view column

On .previewToSide execution:
    Call GraphvizPreviewGenerator::revealOrCreatePreview(...) targeting the next editor view column
*/
// https://code.visualstudio.com/Docs/extensionAPI/vscode-api

'use strict';
import {
    workspace,
    window,
    commands,
    ExtensionContext,
    ViewColumn,
    TextDocumentChangeEvent,
    TextDocument
} from 'vscode';

import { GraphvizPreviewGenerator } from './GraphvizPreviewGenerator';

const DOT = 'dot';

export function activate(context: ExtensionContext) {

    const graphvizPreviewGenerator = new GraphvizPreviewGenerator(context);

    // When the active document is changed set the provider for rebuild
    // this only occurs after an edit in a document
    context.subscriptions.push(workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
        if (e.document.languageId === DOT) {
            graphvizPreviewGenerator.setNeedsRebuild(e.document.uri, true);
        }
    }));

    context.subscriptions.push(workspace.onDidSaveTextDocument((doc: TextDocument) => {
        if (doc.languageId === DOT) {
            graphvizPreviewGenerator.setNeedsRebuild(doc.uri, true);
        }
    }))

    let previewToSide = commands.registerCommand("graphviz.previewToSide", () => {
        if (window.activeTextEditor != null && window.activeTextEditor.document.languageId === DOT) {
            return graphvizPreviewGenerator.revealOrCreatePreview(window.activeTextEditor.document, ViewColumn.Beside);
        }
    })

    let preview = commands.registerCommand("graphviz.preview", () => {
        if (window.activeTextEditor != null && window.activeTextEditor.document.languageId === DOT)
        return graphvizPreviewGenerator.revealOrCreatePreview(window.activeTextEditor.document, window.activeTextEditor.viewColumn);
    })

    context.subscriptions.push(previewToSide, preview, graphvizPreviewGenerator);
}

// this method is called when your extension is deactivated
export function deactivate() { }