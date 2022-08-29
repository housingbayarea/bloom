import csv from "csvtojson"
import * as fs from "fs"
import * as path from "path"

// run with e.g. ts-node sites/public/scripts/resource-translations-import.ts sites/public/scripts/resource-translations-export.csv

async function main() {
  if (process.argv[2] === undefined) {
    console.error("Please specify the csv path from root.")
    return
  }
  const json = await csv({ delimiter: "," }).fromFile(process.argv[2])
  console.log(json)
  let fileName = ""
  let resource = ""
  let writePath = ""
  for (const row of json) {
    writePath = path.resolve("", `sites/public/page_content/resources/${row.file}`)
    if (fileName !== row.file && writePath !== "") {
      fs.writeFileSync(writePath, resource)
      resource = ""
      fileName = row.file
    }

    const style = JSON.parse(`{"md":"${row.style}"}`)

    if (style.md.length) {
      resource += style.md
    }

    // const emptyTrans = ["en"]

    // for (const key in row) {
    //   if (key !== "file" && key !== "style" && row[key].length === 0) {
    //     emptyTrans.push(key)
    //   }
    // }

    let section = `<RenderIf language="${row.lang}">\n`
    row.url ? (section += `### [${row.title}] (${row.url}) \n`) : (section += `### ${row.title} \n`)
    section += `\n ${row.body} \n`
    section += "</RenderIf>\n"
    resource += section
    // for (const key in row) {
    //   if (
    //     key === "file" ||
    //     key === "style" ||
    //     key === "String to Translate" ||
    //     row[key].length === 0
    //   )
    //     continue
    //   const parsed = JSON.parse(`{"md":"${row[key]}"}`)
    //   resource += `<RenderIf language="${key}">${parsed.md}</RenderIf>\n`
    // }

    // fs.writeFileSync(writePath, resource)
  }
  console.log("hmmmm")
  console.log(writePath, resource)
  fs.writeFileSync(writePath, resource)
}

void main()
