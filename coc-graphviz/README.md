# Graphviz Support

Ported from [vscode-graphviz](https://github.com/joaompinto/vscode-graphviz).

![graphvizPreview](https://github.com/user-attachments/assets/d3dac671-fa7d-46f2-9367-d28fa60c637c)

Because some APIs of [vscode](github.com/microsoft/vscode) are missing in
[coc.nvim](https://github.com/neoclide/coc.nvim), disable some features
temporarily:

- command `graphviz.previewToSide`: miss `vscode.ViewColumn`
- save as svg: miss `vscode.window.showSaveDiaglog()`

## Install

- [coc-marketplace](https://github.com/fannheyward/coc-marketplace)
- [npm](https://www.npmjs.com/package/coc-graphviz)
- vim:

```vim
" command line
CocInstall coc-graphviz
" or add the following code to your vimrc
let g:coc_global_extensions = ['coc-graphviz', 'other coc-plugins']
```

## Usage

Refer [vscode-graphviz](https://github.com/joaompinto/vscode-graphviz).
