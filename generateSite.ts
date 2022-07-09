import MarkdownIt from 'markdown-it'
import {copyFile, mkdir, readdir, readFile, writeFile} from "fs/promises";
import { resolve, basename } from 'path';
import createHtml from 'create-html'

const themesDir = './themes'
export const Theme = {
  minimal: 'minimal.css'
} as const

// either an image filename or the raw svg contents must be specified
type FaviconOptions = {  faviconFilename: string} | {faviconSvg: string}  |{}

type GenerateSiteOptions = {
  theme: keyof typeof Theme,
  title: string,
  description: string,
  language?: string,
  faviconSvg?: string,
  faviconFilename?: string
  pagesDir: string,
  outputDir: string
} & FaviconOptions

export async function generateSite(options: GenerateSiteOptions){
  const {
    description,
    faviconFilename,
    faviconSvg,
    language,
    outputDir,
    pagesDir,
    theme,
    title
  } = options

  await mkdir(outputDir, {recursive: true})

  const files = await readdir(pagesDir, {withFileTypes:true})

  const md = new MarkdownIt({
    html:         true,        // Enable HTML tags in source
    xhtmlOut:     true,        // Use '/' to close single tags (<br />).
    breaks:       true,        // Convert '\n' in paragraphs into <br>
    linkify:      true,        // Autoconvert URL-like text to links
  })

  // generate favicon file, or copy existing favicon
  let favicon: string|undefined = undefined // refers to filename in output directory
  if(faviconSvg && faviconFilename) throw new Error('Cannot specify both favicon filename and SVG contents.')
  if(!favicon && faviconSvg) {
    favicon = 'favicon.svg'
    await writeFile(resolve(outputDir, favicon), faviconSvg)
  }else if(faviconFilename){
    const faviconPath = resolve(faviconFilename)
    favicon = basename(faviconPath)
    await copyFile(faviconPath, resolve(outputDir, favicon))
  }

  // copy stylesheets
  const commonCss = 'common.css'
  await copyFile(resolve(themesDir, commonCss),resolve(outputDir, commonCss))
  await copyFile(resolve(themesDir, Theme[theme]),resolve(outputDir, Theme[theme]))

  for (const file of files) {
    if(file.isFile() && file.name.endsWith('.md')){
      const markdown = await readFile(resolve(pagesDir, file.name)).then(String)
      const content = md.render(markdown)
      const html = createHtml({
        title,
        css: [commonCss, Theme[theme]],
        lang: language,
        head: `<meta name="description" content="${description}">`,
        body: `<main>${content}</main>`,
        favicon
      })
      const htmlName = file.name.replace(/\.md$/, '.html')
      await writeFile(resolve(outputDir, htmlName), html)
    }
  }

}
