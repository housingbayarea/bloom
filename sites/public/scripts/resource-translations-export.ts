import * as fs from "fs"
import * as path from "path"

const LANGUAGES = "es,zh,vi"
const langArray = LANGUAGES.split(",")

// run with e.g. ts-node sites/public/scripts/resource-translations-export.ts
const deconstructResource = (content: string, lang: string): string => {
  const resourceCardArr = [lang]
  const titleMatch = content.match(/###\s*\[(.+)\]/)
  resourceCardArr.push(titleMatch ? titleMatch[1] : ",")
  const urlMatch = content.match(/\s*\((.*)\)/)
  resourceCardArr.push(urlMatch ? urlMatch[1] : ",")
  const bodyMatch = content.match(/(\)\s+\n)((\n+|\s+|.+)+)/)
  console.log(bodyMatch)
  resourceCardArr.push(bodyMatch ? `"${bodyMatch[2]}"` : ",")
  return resourceCardArr.toString()
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
    if (sections === null) {
      if (!translationTemplate || file === "Sidebar.md") continue
      else {
        writeStream.write(`${file},`)
        writeStream.write(style !== null ? JSON.stringify(style[0] + "\n") + "," : ",")
        writeStream.write(deconstructResource(content, "en"))
        writeStream.write(`\n`)
        for (const lang of langArray) {
          writeStream.write(`${file},`)
          writeStream.write(style !== null ? JSON.stringify(style[0] + "\n") + "," : ",")
          writeStream.write(`${lang},,,\n`)
        }
      }
    } else {
      for (const section of sections) {
        writeStream.write(`${file},`)
        writeStream.write(style !== null ? JSON.stringify(style[0] + "\n") + "," : ",")
        const contentMatch = section.match(/<RenderIf language="(\w+,?)+">((.|\s)*?)<\/RenderIf>/)
        const content = contentMatch[2]
        const languageMatch = section.match(/language="((\w+,?)+)"/)
        writeStream.write(deconstructResource(content, languageMatch[1] ?? "en"))
        writeStream.write(`\n`)
      }
    }
  }
}

void main()
