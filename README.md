# MDSS

> Stylesheets for displaying and printing Markdown documents

**This project is currently in beta!**

## Usage

**MDSS** is a CSS stylesheet to render [Markdown](https://en.wikipedia.org/wiki/Markdown) documents beautifully both in browsers and in print. You can create your own separate builds for screen and print or a single build for both media. MDSS also supports **printing Markdown as slides**. All you need to do is to set the page orientation to landscape when printing.

To create a production build run the `npm run build` command. This will create a *combined* stylesheet with both *screen*, *print* and *slides* styles. Individual builds for each media type can be created with the `npm run build:screen`, `npm run build:print` and `npm run build:slides` commands. The `npm run build:all` command creates all four files. Development versions (non-compressed) are also available by putting the `-dev` suffix to any build command.

**MDSS** is created with automatic syntax highlighting in mind and is compatible with syntax hightlighting libraries such as *[highlight.js](https://highlightjs.org/)*. For the default styleing I recommend the [Mono Blue](https://github.com/isagalaev/highlight.js/blob/master/src/styles/mono-blue.css) *highlight.js* theme.

## Extras

**MDSS** includes several visual extras in addition to standard Markdown elements. All extras can be enabled or disabled for a single build. Extras include the following:

- Automatic numbering of specified elements (e.g. headings) **(all media)**
- Replace horizontal rules/thematic breaks with page breaks **(print, slides)**
- Automatic page breaks before specified elements **(print)**
- Avoid page breaks after specified elements **(print)**
- Automatic URL insertion after links **(print, slides)**
- Format emphasised and strong links as buttons **(screen)**
  ```
  [**This is a button**](button-href-target)
  ```

## Configuration

Most visual aspects (like color, sizes, spacing) can be configured. The `src/config` folder contains all the options to be modified the rest of the code uses the variables declared here. You can configure each media type individually. You can also enable/disable all extra features using the `src/config/extras.scss` file. External resources (e.g. fonts) can be imported by adding them to the `src/config/external.scss` file.

**MDSS** supports defining a root selector for styling (`src/config/shared.scss`). If set only elements inside the root selector get affected by the stylesheet. By default there is no root selector thus the entire document gets formatted.

## Installation

To use **MDSS** you should clone this repository, install dependencies and build your own bundle.

```bash
git clone https://github.com/vimtaai/mdss
cd mdss
npm install
npm run build
```

## Contributing

All ideas, recommendations, bug reports, pull requests are welcome. :smile:
