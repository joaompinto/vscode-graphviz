import {resolve} from 'path';
import {
	window,
	workspace,
	services,
	ExtensionContext,
	// Disposable,
	DidChangeTextDocumentParams,
	// ViewColumn,
	TextDocument,
	TransportKind,
	// TextEditorSelectionChangeEvent,
	commands
} from "coc.nvim";

import {
	ServerOptions,
	LanguageClient,
	LanguageClientOptions,
} from "coc.nvim";

// import * as gvp from "./GraphvizProvider";

export function activate(context: ExtensionContext) {
	let serverModule = resolve(context.extensionPath, 'out', 'src', 'server')
	const lc = createLanguageClient(serverModule);
	const lcDisposable = services.registLanguageClient(lc);

	// const gvProviders = createGraphvizProviders();

	context.subscriptions.push(lcDisposable/* , ...gvProviders */);
}

function createLanguageClient(serverModule: string) {
	const serverOptions: ServerOptions = {
		run : {
			module: serverModule,
			transport: TransportKind.ipc,
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: {
				execArgv: [
					"--nolazy",
					"--debug=6009"
				]
			}
		},

		// Type assertion because of unreleased patch
		// https://github.com/Microsoft/vscode-languageserver-node/issues/358
		options: { shell: true } as any
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ language: "dot" }],
		synchronize: {
			configurationSection: "dotLanguageServer",
			// Notify the server about file changes to '.clientrc files contain in the workspace
			fileEvents: workspace.createFileSystemWatcher("**/.clientrc")
		}
	};

	return new LanguageClient(
		"dotLanguageServer",
		"DOT Language Server",
		serverOptions,
		clientOptions,
	);
}
