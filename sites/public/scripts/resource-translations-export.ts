import * as fs from "fs"
import * as path from "path"

const LANGUAGES = "es,zh,vi"
const langArray = LANGUAGES.split(",")
const langTranslated = []
const ignoreFiles = ["Sidebar.md"]

// run with e.g. ts-node sites/public/scripts/resource-translations-export.ts

/**
 * Breaks down resource card content (everything between RenderIf) to populate a single row in csv
 * @param content single string including title, url, and description
 * @param lang language code of row
 * @returns comma-separated string in structure of csv
 */
const deconstructResource = (content: string, lang: string): string => {
  const resourceCardArr = [lang]
  const titleMatch = content.match(/###\s*\[(.+)\]|### ([ \S]*)/)
  resourceCardArr.push(titleMatch ? titleMatch[1] : ",")
  const urlMatch = content.match(/\s*\((.*)\)/)
  resourceCardArr.push(urlMatch ? urlMatch[1] : ",")
  const bodyMatch = content.match(/\n+([\s\S]+)/)
  resourceCardArr.push(bodyMatch[1] ? `"${bodyMatch[1].trim()}"` : ",")
  return resourceCardArr.toString()
}
/**
 * Generates template rows for which translations can be later filled in
 * @param file string of markdown file name
 * @param style custom css regex match object
 * @param lang language code
 * @returns comma-separated string in structure of csv
 */
const templateRow = (file: string, style: RegExpMatchArray, lang: string): string => {
  let rowStr = `${file},`
  rowStr += style !== null ? JSON.stringify(style[0] + "\n") + "," : ","
  rowStr += `${lang},,,\n`
  return rowStr
}

function main() {
  let translationTemplate = false
  if (process.argv[2] === "template") {
    translationTemplate = true
  }
  const filePath = path.resolve("", "sites/public/page_content/resources")
  const files = fs.readdirSync(filePath)
  const writeStream = fs.createWriteStream(
    path.resolve("", "sites/public/scripts/resource-translations-export.csv")
  )
  // write headers
  writeStream.write(`file,style,lang, title, url, body\n`)

  for (const file of files) {
    const readPath = path.resolve("", `${filePath}/${file}`)
    const content = fs.readFileSync(readPath, "utf8")
    const style = content.match(/<style>(.|\s)*?<\/style>/)
    const sections = content.match(/<RenderIf language="(\w+,?)+">(.|\s)*?<\/RenderIf>/g)
    // Path 1: sections is null when the RenderIf format hasn't been implemented (aka no translations)
    if (sections === null) {
      //Path 1a: Go to next file (sidebar not in resource card format)
      if (!translationTemplate || ignoreFiles.includes(file)) continue
      //Path 1b: Write english content to csv, write empty rows for all other languages
      else {
        writeStream.write(`${file},`)
        writeStream.write(style !== null ? JSON.stringify(style[0] + "\n") + "," : ",")
        writeStream.write(deconstructResource(content, "en"))
        writeStream.write(`\n`)
        for (const lang of langArray) {
          writeStream.write(templateRow(file, style, lang))
        }
      }
    }
    // Path 2: RenderIf format exists, deconstruct + write each language to a new row
    else {
      for (const section of sections) {
        writeStream.write(`${file},`)
        writeStream.write(style !== null ? JSON.stringify(style[0] + "\n") + "," : ",")
        const contentMatch = section.match(
          /<RenderIf language="(\w+,?)+">\n*((.|\s)*?)<\/RenderIf>/
        )
        const content = contentMatch[2]
        const languageMatch = section.match(/language="((\w+,?)+)"/)
        langTranslated.push(languageMatch[1])
        writeStream.write(deconstructResource(content, languageMatch[1] ?? "en"))
        writeStream.write(`\n`)
      }
      if (translationTemplate) {
        // Generate empty rows for languages in langArray that weren't in file (handles adding new languages)
        const missingTranslations = langArray.filter((lang) => !langTranslated.includes(lang))
        for (const lang of missingTranslations) {
          writeStream.write(templateRow(file, style, lang))
        }
      }
    }
  }
}

void main()
