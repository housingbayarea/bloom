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
  // Content of markdown file
  let fileContent = ""
  let writePath = ""
  for (const row of json) {
    // First loop iteration or iterated through all rows for a single markdown file
    if (row.file !== fileName) {
      // Markdown generated in fileContent (all rows have been iterated through)
      if (fileContent !== "") {
        // write to path
        fs.writeFileSync(writePath, fileContent)
        // empty to build markdown content for new row.file value
        fileContent = ""
      }
      writePath = path.resolve("", `sites/public/page_content/resources/${row.file}`)
      fileName = row.file
    }
    // Skip empty rows (incomplete template csv)
    if (!row.body || !row.title) continue

    const style = JSON.parse(`{"md":"${row.style}"}`)

    if (style.md.length) {
      fileContent += style.md
    }
    let section = `<RenderIf language="${row.lang}">\n`
    row.url ? (section += `### [${row.title}](${row.url}) \n`) : (section += `### ${row.title} \n`)
    section += `\n${row.body}\n`
    section += "</RenderIf>\n"
    fileContent += section
  }
  // handle final file write
  fs.writeFileSync(writePath, fileContent)
}

void main()
