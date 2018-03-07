# MDSS

> Stylesheets for displaying and printing Markdown documents

**This project is currently in beta!**

## Usage

**MDSS** is a CSS stylesheet to render [Markdown](https://en.wikipedia.org/wiki/Markdown) documents beautifully both in browsers and in print. You can create your own separate builds for screen and print or a single build for both media. MDSS also supports **printing Markdown as slides** by setting the page orientation to landscape when printing.

To create a production build run the `npm run build:bundle` command. This will create a *combined* stylesheet with both *screen*, *print* and *slides* styles. Individual builds for each media type can be created with the `npm run build:screen`, `npm run build:print` and `npm run build:slides` commands. The `npm run build:all` command creates all four files. Development versions (non-compressed, non-optimized) are also available by putting the `-dev` suffix to any build command.

```bash
npm run build:bundle # optimized for all three media
npm run build:screen # optimized only for screen
npm run build:print  # optimized only for printing
npm run build:screen # optimized only for printing as slides
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

### Using with pandoc

**MDSS** works well with document converters such as *[pandoc](https://pandoc.org/)*. To create standalone HTML pages that are formatted with **MDSS** you have to link it in the output document of the *pandoc* conversion.

```bash
pandoc -s path/to/source/file.md -c path/to/mdss/mdss.min.css -o path/to/output/file.html
```

**Note** The path to **MDSS** has to be relative to the output HTML file.

### Creating PDF files

To create PDF it is recommended to convert to HTML first and use the browsers build in printing dialog to save the result as PDF. Using the printer of the browser will automatically apply the print styles for a bundled build.

## Extras

The stylesheets include several visual extras by default in addition to standard Markdown elements. All extras can be enabled or disabled for a single build. Extras include the following:

- Automatic numbering of specified elements (e.g. headings) **(all media)**
- Replace horizontal rules/thematic breaks with page breaks **(print, slides)**
- Automatic page breaks before specified elements **(print)**
- Avoid page breaks after specified elements **(print)**
- Automatic URL insertion after links **(print, slides)**

**MDSS** is created with automatic syntax highlighting in mind and is compatible with syntax hightlighting libraries such as *[highlight.js](https://highlightjs.org/)*. The configuration includes options to use the built in syntax highlighting theme with most of syntax highlighters.

## Markdown Extensions

Various Markdown Extensions that extend the capabilites of the CommonMark compliant Markdown are also supported. In the configuration you can select what extensions should your build support. Supported extensions include:

- Containers
  + Flex containers
  + Aligned containers
  + Containers with text align
  + Custom, colored containers

We also plan to support in the future:

- Abbreviations
- Definition lists
- Inserted content
- Marked content
- Strikethroughs
- Tables

## Configuration

Most visual aspects (like color, sizes, spacing) can be configured. The `src/config` folder contains all the options to be modified the rest of the code uses the variables declared here. You can configure each media type individually.

You can also enable/disable all extra features using the `src/config/extras.scss` file. External resources (e.g. fonts) can be imported by adding them to the `src/config/external.scss`.

**MDSS** supports defining a root selector for styling (`src/config/shared.scss`). If set only elements inside the root selector get affected by the stylesheet. By default there is no root selector thus the entire document gets formatted.

Configuration files include the following options:

File            | Options
----------------|--------------------------------------------
`external.scss` | external imports (e.g. fonts)
`extras.scss`   | enable/disable and configure extra features
`print.scss`    | variables for print styles
`screen.scss`   | variables for screen styles
`shared.scss`   | colors, fonts and root selector
`slides.scss`   | variables for screen styles

## Installation

To use **MDSS** you should clone this repository, install dependencies and build your own bundle.

```bash
git clone https://github.com/vimtaai/mdss
cd mdss
npm install
npm run build
```

**Note** You need to have [Node.js](https://nodejs.org) installed on your computer to create your own builds.

## Contributing

All ideas, recommendations, bug reports, pull requests are welcome. :smile:
