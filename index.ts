import MarkdownIt from 'markdown-it'
import {mkdir, readdir, readFile, writeFile} from "fs/promises";
import { resolve } from 'path';

const pagesDir = './pages'
const outputDir = './docs'

await mkdir(outputDir, {recursive: true})

const files = await readdir(pagesDir, {withFileTypes:true})

const md = new MarkdownIt({
  html:         true,        // Enable HTML tags in source
  xhtmlOut:     true,        // Use '/' to close single tags (<br />).
  breaks:       true,        // Convert '\n' in paragraphs into <br>
  linkify:      true,        // Autoconvert URL-like text to links
})

for (const file of files) {
  if(file.isFile() && file.name.endsWith('.md')){
    const markdown = await readFile(resolve(pagesDir, file.name)).then(String)
    const html = md.render(markdown)
    const htmlName = file.name.replace(/\.md$/, '.html')
    await writeFile(resolve(outputDir, htmlName), html)
  }
}
