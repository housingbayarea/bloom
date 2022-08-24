import * as fs from "fs"
import * as path from "path"

const LANGUAGES = "es,zh,vi"
const langArray = LANGUAGES.split(",")

// run with e.g. ts-node sites/public/scripts/resource-translations-export.ts

function main() {
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
    if (sections === null) continue

    // const langIndex = langArray.reduce((acc, curr, i) => {
    //   acc[curr] = {
    //     i,
    //     content: "",
    //   }
    //   return acc
    // }, {})
    for (const section of sections) {
      writeStream.write(`${file},`)
      writeStream.write(style !== null ? JSON.stringify(style[0] + "\n") + "," : ",")
      const languageMatch = section.match(/language="((\w+,?)+)"/)
      const language = languageMatch[1].split(",")
      // const hasEn = language.some((lang) => lang === "en")
      // const noEn = language.filter((lang) => lang !== "en")
      const contentMatch = section.match(/<RenderIf language="(\w+,?)+">((.|\s)*?)<\/RenderIf>/)
      const content = contentMatch[2]
      const resourceCardComponents = []
      const titleMatch = content.match(/###\s*\[(.+)\]/)
      resourceCardComponents.push(titleMatch ? titleMatch[1] : ",")
      const urlMatch = content.match(/\s*\((.*\))/)
      resourceCardComponents.push(urlMatch ? urlMatch[1] : ",")
      const bodyMatch = content.match(/(\n+\s+|.+)+/)
      resourceCardComponents.push(bodyMatch ? `"${bodyMatch[1]}"` : ",")
      writeStream.write(language.toString() + ",")
      writeStream.write(resourceCardComponents.toString())

      // const content = JSON.stringify(contentMatch[2])
      //   if (hasEn) {
      //     writeStream.write(`${content},`)

      //     if (noEn.length > 0) {
      //       noEn.forEach((lang) => {
      //         if (langIndex[lang]) {
      //           langIndex[lang].content = ""
      //         }
      //       })
      //     }
      //   } else {
      //     langIndex[language[0]].content = content
      //   }
      // }
      // const translations = new Array(langArray.length)
      // for (const lang in langIndex) {
      //   translations[langIndex[lang].i] = langIndex[lang].content
      // }

      writeStream.write(`\n`)
      // break
    }
  }
}

void main()
