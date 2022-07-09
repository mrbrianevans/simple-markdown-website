import {generateSite} from "./generateSite.js";


await generateSite({
  description:'A simple NodeJS website generator for converting markdown to HTML',
  // faviconFilename:'favicon.png',
  faviconSvg:'<svg></svg>',
  language:'en',
  outputDir:'./docs',
  pagesDir:'./pages',
  theme:'minimal',
  title:'Simple markdown website generator'
})
