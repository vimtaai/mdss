# MDSS

> Stylesheets for displaying and printing Markdown documents

## About

**MDSS** is a CSS stylesheet to render [Markdown](https://en.wikipedia.org/wiki/Markdown) documents beautifully both in browsers and in print. You can create your own separate builds for screen and print or a single build for both media. MDSS also supports *printing Markdown as slides* by setting the page orientation to landscape when printing.

## Extras

The stylesheets include several visual extras by default in addition to standard Markdown elements. All extras can be enabled or disabled for a single build. Extras include the following:

- Automatic numbering of specified elements (e.g. headings) **(all media)**
- Replace horizontal rules/thematic breaks with page breaks **(print, slides)**
- Automatic page breaks before specified elements **(print)**
- Avoid page breaks after specified elements **(print)**
- Automatic URL insertion after links **(print, slides)**

**MDSS** is created with automatic syntax highlighting in mind and is compatible with syntax highlighting libraries such as *[highlight.js](https://highlightjs.org/)*. The configuration includes options to use the built in syntax highlighting theme with most of syntax highlighters.

## Markdown Extensions

Various Markdown Extensions that extend the capabilities of the CommonMark compliant Markdown are also supported. In the configuration you can select what extensions should your build support. Supported extensions include:

- Containers
  + Flex containers
  + Aligned containers
  + Containers with text align
  + Custom, colored containers
- Definition lists
- Tables

To use these features you need a compiler that supports transforming their syntax (e.g. *pandoc* or *markdown-it*).

## Basic Usage

To create your own bundle of **MDSS** you have to clone this repository, edit the configuration a create a new build.

```bash
git clone https://github.com/vimtaai/mdss
```

To create a bundled build run the `npm run build` command. This will create a *combined* stylesheet with both *screen*, *print* and *slides* styles. Individual builds for each media type can be created with `npm run build:all`. This command creates all four stylesheet files.

```bash
npm run build
# or
npm run build:all
```

Bundled builds should be included in HTML documents as simple stylesheets as they include media queries. To use **MDSS** only to format different media individually set the `media` property of the `link` tag.

```html
<!-- All purpose -->
<link rel="stylesheet" href="mdss.min.css">
<!-- Screen only -->
<link rel="stylesheet" href="mdss-screen.min.css" media="screen">
<!-- Printing only -->
<link rel="stylesheet" href="mdss-print.min.css" media="print">
<!-- Slides printing only -->
<link rel="stylesheet" href="mdss-slides.min.css" media="print and (orientation: landscape)">
```

### Configuration

Most visual aspects (like color, sizes, spacing) can be configured. The `src/config` folder contains all the options to be modified the rest of the code uses the variables declared here. You can configure each media type individually.

You can also enable/disable all extra features using the `src/config/extras.config.scss` file. External resources (e.g. fonts) can be imported by adding them to the `src/config/external.config.scss`.

**MDSS** supports defining a root selector for styling (`src/config/shared.config.scss`). If set only elements inside the root selector get affected by the stylesheet. By default there is no root selector thus the entire document gets formatted.

Configuration files include the following options:

File            | Options
----------------|--------------------------------------------
`external.config.scss` | external imports (e.g. fonts)
`extras.config.scss`   | enable/disable and configure extra features
`print.config.scss`    | variables for print styles
`screen.config.scss`   | variables for screen styles
`shared.config.scss`   | colors, fonts and root selector
`slides.config.scss`   | variables for screen styles

## Advanced Usage

**MDSS** also comes with a CLI tool that allows advanced usage with more options. The CLI tool is included as the NPM package's `bin` command. You can use the CLI tool with a cloned repository or with an NPM install.

```bash
# With git clone
git clone https://github.com/vimtaai/mdss
cd mdss
bin/mdss.js build

# With NPM install
npm install mdss
./node_modules/.bin/mdss build
```

If you are using **MDSS** as an installed NPM package it is recommended to create your own scripts for your common build tasks.

```json
{
  "scripts": {
    "build-mdss": "mdss build",
    "build-mdss-dev": "mdss build -d"
  }
}
```
The CLI tool has several options. To see all options see the help of the command in the command line.

```bash
./node_modules/.bin/mdss --help
```

### Using with pandoc

**MDSS** works well with document converters such as *[pandoc](https://pandoc.org/)*. To create standalone HTML pages that are formatted with **MDSS** you have to link it in the output document of the *pandoc* conversion.

```bash
pandoc -s path/to/source/file.md -c path/to/mdss/mdss.min.css -o path/to/output/file.html
```

**Note.** The path to **MDSS** has to be relative to the output HTML file.

### Creating PDF files

To create PDF it is recommended to convert to HTML first and use the browsers build in printing dialog to save the result as PDF. Using the printer of the browser will automatically apply the print styles for a bundled build.

## Prerequisites

**Note.** You need to have [Node.js](https://nodejs.org) installed on your computer to create your own builds.

## Contributing

All ideas, recommendations, bug reports, pull requests are welcome. :smile:
