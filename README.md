# MDSS

[![NPM version 3.0.0](https://img.shields.io/badge/npm-3.0.0-cc3534.svg?style=flat-square)](https://www.npmjs.com/package/mdss)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![MIT license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> Stylesheets for displaying and printing Markdown documents

## About

**MDSS** is a CSS stylesheet to render [Markdown](https://daringfireball.net/projects/markdown/syntax) documents beautifully both in browsers and in print. You can create your own separate builds for screen and print or a single build for both media.

## Features

- Formatting HTML documents generated from Markdown
- Fully customizable via variables, custom color palette
- Responsive typography and layout classes optimized for screens
- Typography optimized and page settings for printing documents
- Optional extra features
- Syntax highlighting support (with _[hightlight.js](https://highlightjs.org/)_ defaults)
- Custom styles using pre-defined variables
- Minified and uncompressed (development) builds
- CLI tool for integration into other projects

### Extra Features

The stylesheets include several visual extras by default in addition to standard Markdown elements. All extras can be enabled or disabled for a single build. Extras include the following:

- Automatic nested numbering of headings **(available: both media; default: level 1 and 2 heading)**
- Automatic numbering of specified elements (e.g. images, tables) **(available: both media; default: no elements)**
- Automatic URL insertion after links **(available: print; default: disabled)**
- Replace horizontal rules/thematic breaks with page breaks **(available: print; default: enabled)**
- Automatic page breaks before specified elements **(available: print; default: no elements)**
- Avoid page breaks after specified elements **(available: print; default: level 1 heading)**
- Print only formatted area **(available: print, default: disabled)**

### Markdown Extensions

Various Markdown Extensions that extend the capabilities of the [CommonMark](https://commonmark.org/) compliant Markdown are also supported. In the configuration files you can select what extensions should your build support. Supported extensions include:

- Tables
- Definition lists
- Strikethrough
- Containers
  - Containers with text align **(default: enabled)**
  - Floated containers **(default: enabled)**
  - Non-printing containers **(default: enabled)**
  - Flex containers **(default: enabled)**
  - Columned containers **(default: 2-4 columns enabled)**
  - Custom, colored containers (light and dark background) **(default: primary, accent and gray colors)**
  - Sticky containers **(default: enabled)**

To use these features you need a Markdown compiler that supports transforming their syntax (e.g. [_pandoc_](https://pandoc.org/) or [_markdown-it_](https://github.com/markdown-it/markdown-it)).

### Syntax Highlighting

**MDSS** is created with automatic syntax highlighting in mind and is compatible with syntax highlighting libraries such as _[highlight.js](https://highlightjs.org/)_. The configuration files include options to use the built in syntax highlighting theme with most of syntax highlighters.

Custom syntax highlighting colors can be set for a specific highlighter. There are options to assign colors to syntax highlighting CSS selectors. The default build is configured to work with _highlight.js_. If you use _highlight.js_ then **MDSS** can function as a _highlight.js_ theme so there is no need for another one. An alternative configuration is also included in config file's comments to use **MDSS** with _pandoc_'s default syntax highlighter.

## Basic Usage

To use the default bundle build of **MDSS** you don't even need a download, you can simply link the minified CSS from a CDN like [jsdelivr](https://www.jsdelivr.com/) or [unpkg](https://unpkg.com/). To apply **MDSS** for your HTML document link it in the `<head>` node as a simple stylesheet as it includes media queries.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mdss@3.0" />
```

To create your own build you can clone this repository, edit the configuration to create a new bundle.

```bash
git clone https://github.com/vimtaai/mdss
```

To create a bundled, minified build run the `npm run build` command. This will create three stylesheet files, one for each media and one bundled build for both _screen_ and _print_.

```bash
npm install
npm run build
```

To use **MDSS** only to format each media individually set the `media` property of the `link` tag.

```html
<!-- All purpose -->
<link rel="stylesheet" href="mdss.min.css" />
<!-- Screen only -->
<link rel="stylesheet" href="mdss-screen.min.css" media="screen" />
<!-- Print only -->
<link rel="stylesheet" href="mdss-print.min.css" media="print" />
```

### Configuration

Most visual aspects (like color, sizes, spacing) can be configured. The `src/config` folder contains all the options to be modified, the rest of the code uses the variables declared here. You can configure each media type individually.

You can also enable/disable all extra features using the `src/config/extras.config.scss` file. External resources (e.g. fonts) can be imported by adding them to the `src/config/external.config.scss`.

**MDSS** supports defining a root selector for styling (`src/config/shared.config.scss`). If set, only elements inside the root selector get affected by the stylesheet. By default there is no root selector thus the entire document gets formatted. You can also configure the stylesheet to print only the content of the root selector.

Configuration files include the following options:

| File                   | Options                                     |
| ---------------------- | ------------------------------------------- |
| `custom.config.scss`   | custom styles for each media                |
| `external.config.scss` | external imports (e.g. fonts)               |
| `extras.config.scss`   | enable/disable and configure extra features |
| `print.config.scss`    | variables for print styles                  |
| `screen.config.scss`   | variables for screen styles                 |
| `shared.config.scss`   | colors, fonts and root selector             |

## Advanced Usage

**MDSS** comes with a CLI tool that allows advanced usage with more options. The CLI tool is included as the NPM package's `bin` command. You can use the CLI tool with a cloned repository or with an NPM install.

```bash
# With git clone
git clone https://github.com/vimtaai/mdss
cd mdss
./bin/mdss.js build

# With NPM install
npm install mdss
npx mdss init
npx mdss build
```

If you are using **MDSS** as an installed NPM package it is recommended to create your own NPM scripts for your common build tasks.

```json
{
  "scripts": {
    "build-mdss": "mdss build",
    "build-mdss:dev": "mdss build -d"
  }
}
```

The CLI tool has several options. It has options to set the configuration and output directories, allows the creation of compressed and uncompressed builds, etc. To see all options see the help of the command in the command line.

```bash
npx mdss --help
npx mdss build --help
npx mdss customize --help
```

### Using with pandoc

**MDSS** works well with document converters such as _[pandoc](https://pandoc.org/)_. To create standalone HTML pages that are formatted with **MDSS** you have to link it in the output document of the _pandoc_ conversion.

```bash
pandoc -s path/to/source/file.md -c path/to/mdss/mdss.min.css -o path/to/output/file.html
```

**Note.** The path to **MDSS** has to be relative to the output HTML file.

### Creating PDF files

To create PDF documents formatted with **MDSS** it is recommended to convert to HTML first and use the browser's built in printing dialog to save the result as PDF. Using the printer of the browser will automatically apply the print styles for a bundled build.

Visual Studio Code has an extension called [Markdown PDF](https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf) that supports converting Markdown files to PDF. You can set an **MDSS** build for print media as the stylesheet for output documents (`markdown-pdf.styles` setting). To avoid conflict with the default stylesheet set the `markdown-pdf.includeDefaultStyles` setting to `false`. For an easy setup add the print stylesheet of **MDSS** from a CDN. The latest version of Markdown PDF uses [puppeteer](https://github.com/GoogleChrome/puppeteer) to create PDF documents so the print media will be automatically applied to the output document.

```json
{
  "markdown-pdf.styles": ["https://cdn.jsdelivr.net/npm/mdss@3.0"],
  "markdown-pdf.includeDefaultStyles": false
}
```

## Prerequisites

You need to have [Node.js](https://nodejs.org) installed on your computer to create your own bundles.

## Contributing

All ideas, recommendations, bug reports, pull requests are welcome. :smile:
