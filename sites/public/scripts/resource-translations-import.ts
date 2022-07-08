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
  for (const row of json) {
    const writePath = path.resolve("", `sites/public/page_content/resources/${row.file}`)
    let resource = ""

    const style = JSON.parse(`{"md":"${row.style}"}`)

    if (style.md.length) {
      resource = style.md
    }

    const emptyTrans = ["en"]

    for (const key in row) {
      if (key !== "file" && key !== "style" && row[key].length === 0) {
        emptyTrans.push(key)
      }
    }

    const en = JSON.parse(`{"md":"${row["String to Translate"]}"}`)

    resource += `<RenderIf language="${emptyTrans.join(",")}">${en.md}</RenderIf>\n`

    for (const key in row) {
      if (
        key === "file" ||
        key === "style" ||
        key === "String to Translate" ||
        row[key].length === 0
      )
        continue
      const parsed = JSON.parse(`{"md":"${row[key]}"}`)
      resource += `<RenderIf language="${key}">${parsed.md}</RenderIf>\n`
    }

    fs.writeFileSync(writePath, resource)
  }
}

void main()
