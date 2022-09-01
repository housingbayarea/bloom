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
  let fileName = ""
  let resource = ""
  let writePath = ""
  for (const row of json) {
    console.log(row.file)
    console.log(fileName)
    console.log("------------------------------------------")

    if (row.file !== fileName) {
      if (resource === "") {
        writePath = path.resolve("", `sites/public/page_content/resources/${row.file}`)
        fileName = row.file
      } else {
        fs.writeFileSync(writePath, resource)
        writePath = path.resolve("", `sites/public/page_content/resources/${row.file}`)
        fileName = row.file
        resource = ""
      }
    }
    if (!row.body || !row.title) continue

    const style = JSON.parse(`{"md":"${row.style}"}`)

    if (style.md.length) {
      resource += style.md
    }

    let section = `<RenderIf language="${row.lang}">\n`
    row.url ? (section += `### [${row.title}](${row.url}) \n`) : (section += `### ${row.title} \n`)
    section += `\n${row.body}\n`
    section += "</RenderIf>\n"
    resource += section
  }
  fs.writeFileSync(writePath, resource)
}

void main()
