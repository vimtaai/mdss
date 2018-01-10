# MDSS

> Stylesheets for displaying and printing Markdown documents

**This project is in beta! Some breaking changes may be made!**

## Usage

**MDSS** is CSS stylesheet to render [Markdown](https://en.wikipedia.org/wiki/Markdown) documents beautifully both in browsers and in print. You can create your own builds for both screen and print or a single build for both media. MDSS also support printing Markdown as slides. All you need to do is to set the page orientation to landscape when printing.

To create a production build run the `npm run build` command. This will create a *combined* stylesheet with both *screen*, *print* and *slides* styles. Individual builds for each media type can be created with the `npm run build:screen`, `npm run build:print` and `npm run build:slides` commands. The `npm run build:all` command creates all four files. Development versions (non-compressed) are also available by putting the `-dev` suffix to any build command.

## Extras

**MDSS** includes several visual extras in addition to the standard Markdown elements. All extras can be enabled or disabled for a single build of **MDSS**. Extras include the following:

- Automatic numbering of given elements (e.g. headings) **(all media)**
- Replace horizontal rules/thematic breaks with page breaks **(print, slides)**
- Automatic page breaks before given elements **(print, slides)**
- Automatic URL insertion after links **(print, slides)**
- Convert double strong text to large symbols on page margin **(all media)**
  ```
  ****!****
  ```
- Convert emphasised and strong links into buttons **(screen)**
  ```
  [**This is a button**](button-href-target)
  ```
- Convert emphasised and strong code into message boxes **(screen)**
  ```
  **`This is a very important message`**
  ```

## Configuration

Most visual aspects (like color, sizes, spacing) can be configured in **MDSS**. The `src/config` folder contains all the options to be modified the rest of the code uses the variables declared here. You can configure each media type individually. You can also enable/disable all extra features using the `src/config/extras.scss` file.

## Installation

To use **MDSS** you should clone this repository, install dependencies and build your own bundle.

```bash
npm install
npm run build
```

## Contributing

All ideas, recommendations, bug reports, pull requests are welcome. :smile:
