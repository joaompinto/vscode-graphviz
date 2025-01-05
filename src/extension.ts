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
    TextDocument,
    Uri,
//# #if HAVE_VSCODE
    ViewColumn,
    TextDocumentChangeEvent
} from 'vscode';
//# #elif HAVE_COC_NVIM
//# DidChangeTextDocumentParams,
//# } from 'coc.nvim';
//# #endif

import { GraphvizPreviewGenerator } from './GraphvizPreviewGenerator';

const DOT = 'dot';

export function activate(context: ExtensionContext) {

    const graphvizPreviewGenerator = new GraphvizPreviewGenerator(context);

    // When the active document is changed set the provider for rebuild
    // this only occurs after an edit in a document
    context.subscriptions.push(workspace.onDidChangeTextDocument((e:
        //# #if HAVE_VSCODE
        TextDocumentChangeEvent
        //# #elif HAVE_COC_NVIM
        //# DidChangeTextDocumentParams
        //# #endif
    ) => {
        //# #if HAVE_VSCODE
        if (e.document.languageId === DOT) {
            graphvizPreviewGenerator.setNeedsRebuild(e.document.uri, true);
        }
        //# #elif HAVE_COC_NVIM
        //# graphvizPreviewGenerator.setNeedsRebuild(Uri.parse(e.textDocument.uri), true);
        //# #endif
    }));

    context.subscriptions.push(workspace.onDidSaveTextDocument((doc: TextDocument) => {
        if (doc.languageId === DOT) {
            graphvizPreviewGenerator.setNeedsRebuild(
                //# #if HAVE_VSCODE
                doc.uri,
                //# #elif HAVE_COC_NVIM
                //# Uri.parse(doc.uri),
                //# #endif
                true
            );
        }
    }))

    //# #if HAVE_VSCODE
    let previewToSide = commands.registerCommand("graphviz.previewToSide", async (dotDocumentUri: Uri) => {
        let dotDocument = await getDotDocument(dotDocumentUri);
        if (dotDocument) {
            return graphvizPreviewGenerator.revealOrCreatePreview(dotDocument, ViewColumn.Beside);
        }
    })
    context.subscriptions.push(previewToSide);
    //# #endif

    let preview = commands.registerCommand("graphviz.preview", async (dotDocumentUri: Uri) => {
        let dotDocument = await getDotDocument(dotDocumentUri);
        if (dotDocument) {
            return graphvizPreviewGenerator.revealOrCreatePreview(
                dotDocument,
                //# #if HAVE_VSCODE
                window.activeTextEditor?.viewColumn ?? ViewColumn.Active
                //# #elif HAVE_COC_NVIM
                //# {openURL: true}
                //# #endif
            );
        }
    })

    context.subscriptions.push(preview, graphvizPreviewGenerator);
}

async function getDotDocument(dotDocumentUri: Uri | undefined): Promise<TextDocument> {
    if (dotDocumentUri) {
        //# #if HAVE_VSCODE
        return await workspace.openTextDocument(dotDocumentUri);
        //# #elif HAVE_COC_NVIM
        //# return (await workspace.openTextDocument(dotDocumentUri)).textDocument;
        //# #endif
    } else {
        if (window.activeTextEditor?.document.languageId === DOT) {
            //# #if HAVE_VSCODE
            return window.activeTextEditor.document;
            //# #elif HAVE_COC_NVIM
            //# return window.activeTextEditor.document.textDocument;
            //# #endif
        }
        else {
            return undefined;
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() { }
