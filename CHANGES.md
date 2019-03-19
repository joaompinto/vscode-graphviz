# Changes

## Version 0.0.4

- fixed [Issue #5](https://github.com/joaompinto/vscode-graphviz/issues/5)
- replaced `opn` package dependency with new VS Code API to open the .svg file in a default application (e.g. browser)
- support for cross-extension integration

Other extensions may invoke the preview pane programmatically by writing a valid .dot file to the disk and then executing this command:

```javascript
commands.executeCommand('graphviz.preview', Uri.parse('/path/graph.dot'));
```

## Version 0.0.3: Precise zooming and export to .svg file

Released 2019-01-06

As per a popular request, an export to a file was added. Click the [🢥🗋] button and select the location of the .svg file. The file may be open in any web browser, or emailed...

![Export to a .svg file](images/export.PNG)

It is also possible to open the file in the default browser by clicking on [🗔]. This creates a temp file and asks the operating system to open it in a default browser or another capable application.

![Open file in a browser](images/open_in_browser.PNG)

The zoom level value may be now set to a specific value, or gradually changed by the up/down keys on the keyboard.

![Fine-grain zooming](images/Fine_scaling.gif)

## Version 0.0.2: Scalable live preview

Released 2018-10-29

The live preview of the graph can now be:

- scaled up [▲],
- scaled down [▼],
- reset to 1:1 (one-to-one) scale,
- scaled to fit the width of the pane [↔] or
- scaled to fit the height of the pane [↕].

This greatly facilitates viewing large graphs.

To facilitate working on graph files in the editor, or visualizing files that are created by programs (i.e. search algorithms), the preview can be auto-scaled:

Double clicking on the fit-to-width [↔] or fit-to-height [↕] buttons toggles the given mode on, so when the graph source changes, the preview scales automatically to remain visible.

![Graph preview with manual and automatic scaling](images/Preview_with_scaling.gif)

The extension was also upgraded to VS Code Webview API from the deprecated `vscode.previewHtml` command.

## Version 0.0.1: Graphviz support

Syntax highlighting, snippets and live preview.
