# MDSS

> Stylesheets for displaying and printing Markdown documents

## Usage

**MDSS** is a small CSS code to render [Markdown](https://en.wikipedia.org/wiki/Markdown) documents beautifully both in browsers and in print. You can create your own builds for both screen and print or a single build for both media.

To create a production build run the `npm run build` command. Individual *screen* and *print* builds can be created with the `npm run build-screen` and `npm run build-print` commands.

## Extras

**MDSS** includes several visual extras in addition to the standard Markdown elements. All extras can be enabled or disabled for a single build of **MDSS**. Extras include the following:

### Screen

- Convert emphasised and strong links into buttons
  ```
  `**[This is a button](button-href-target)**`
  ```
- Convert emphasised and strong code into message boxes
  ```
  **`This is a very important message`**
  ```

### Print

- Replace horizontal rules/thematic breaks with page breaks
- Automatic page breaks before given elements
- Automatic numbering of given elements (e.g. headings)
- Automatic URL insertion after links

## Configuration

Most visual aspects (like color, sizes, paddings) can be configured in **MDSS**. The `source/config` folder contains all the options to be modified the rest of the code uses the variables declared here.

## Installation

To use **MDSS** you should clone this repository, install dependencies and build your own bundle.

```bash
npm install
npm run build
```

## Contributing

All ideas, recommendations, bugs, pull requests are welcome. :smile:
