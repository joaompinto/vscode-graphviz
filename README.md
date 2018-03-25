# Graphviz Support

[![Version](https://vsmarketplacebadge.apphb.com/version/joaompinto.vscode-graphviz.svg)](https://marketplace.visualstudio.com/items?itemName=joaompinto.vscode-graphviz)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/joaompinto.vscode-graphviz.svg)](https://marketplace.visualstudio.com/items?itemName=joaompinto.vscode-graphviz)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/joaompinto.vscode-graphviz.svg)](https://vsmarketplacebadge.apphb.com/rating/joaompinto.vscode-graphviz.svg)

A vscode extension that provides live preview for the Graphviz format.

The preview uses the [Vis.js](https://github.com/mdaines/viz.js/) library.

The extension can be activated in two ways

* Toggle Preview - `ctrl+shift+v` (Mac: `cmd+shift+v`)
* Open Preview to the Side - `ctrl+k v` (Mac: `cmd+k shift+v`)

## How to install

Launch VS Code Quick Open (Ctrl+P), paste the following command, and press enter:

    ext install joaompinto.vscode-graphviz

## Demo

![alt](images/simple.png)

## How to build and install from source (Linux)

```bash
git clone https://github.com/joaompinto/vscode-graphviz
cd vscode-graphviz
npm install
sudo npm install -g vsce typescript
vsce package
code --install-extension *.vsix
```

## Credits

The preview uses <https://github.com/mdaines/viz.js/> .
The syntax highlight/snippets support is based on <https://github.com/Stephanvs/vscode-graphviz> .
