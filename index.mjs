#!/usr/bin/env node

import child_process from 'child_process';
import fs from 'fs';
import { minify } from 'html-minifier';
import inlineSass from 'inline-sass';
import { parse } from 'node-html-parser';
import path from 'path';

const defaults = {
  removeElementsBeforeSelector: '[data-purpose="dev"]',
  extractInnerHTMLSelector: 'body',
  removeHtmlSelectors: true,
  applyWidthAttributes: true,
  applyTableAttributes: true,
  minifyHTML: {
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    minifyCSS: true,
    removeRedundantAttributes: true,
    minifyURLs: true
  }
};

const copyToClipboard = (data) => {
  const pbcopy = child_process.spawn('pbcopy');
  pbcopy.stdin.write(data);
  pbcopy.stdin.end();
};

const options = {
  ...defaults,
  ...(process.argv[3] ? JSON.parse(process.argv[3]) : {})
};

let html = process.argv[2];
let dir = undefined;
let dom = undefined;

if (fs.existsSync(process.argv[2])) {
  html = fs.readFileSync(process.argv[2]);
  dir = path.dirname(process.argv[2]);
  options.url = options.url || `file://${dir}/`;
}

if (options.removeElementsBeforeSelector) {
  dom = parse(html);
  if (dom) {
    for (const elt of dom.querySelectorAll(
      options.removeElementsBeforeSelector
    )) {
      elt.remove();
    }
    html = String(dom);
  }
}

inlineSass(html, options)
  .then((result) => {
    if (options.extractInnerHTMLSelector) {
      const dom = parse(String(result));
      result = dom.querySelector(options.extractInnerHTMLSelector).innerHTML;
    }
    if (options.minifyHTML) {
      result = minify(String(result), options.minifyHTML);
    }
    copyToClipboard(String(result).trim());
    console.log('Styled HTML copied to clipboard');
  })
  .catch(console.error);
