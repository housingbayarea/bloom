/* eslint-disable @typescript-eslint/no-var-requires */
// Prints out keys/strings that exist in the english file but not in a foreign language translation file
// Temporarily update the ui-components tsconfig to include `"module": "commonjs"`
// example: `ts-node missing-translations > missing-foreign-keys.json`

function main() {
  type TranslationsType = {
    [key: string]: string
  }
  const jurisdictions = ["shared", "alameda", "san_jose", "san_mateo"]
  jurisdictions.forEach((jurisdiction) => {
    let englishTranslations: any,
      spanishTranslations: any,
      chineseTranslations: any,
      vietnameseTranslations: any,
      tagalogTranslations: any = ""

    if (jurisdiction === "shared") {
      englishTranslations = require("../src/locales/general.json")
      spanishTranslations = require("../src/locales/es.json")
      chineseTranslations = require("../src/locales/zh.json")
      vietnameseTranslations = require("../src/locales/vi.json")
      tagalogTranslations = require("../src/locales/tl.json")
    } else {
      englishTranslations = require(`../../sites/public/page_content/jurisdiction_overrides/${jurisdiction}/locale_overrides/general.json`)
      spanishTranslations = require(`../../sites/public/page_content/jurisdiction_overrides/${jurisdiction}/locale_overrides/es.json`)
      chineseTranslations = require(`../../sites/public/page_content/jurisdiction_overrides/${jurisdiction}/locale_overrides/zh.json`)
      vietnameseTranslations = require(`../../sites/public/page_content/jurisdiction_overrides/${jurisdiction}/locale_overrides/vi.json`)
      if (jurisdiction === "alameda") {
        tagalogTranslations = require(`../../sites/public/page_content/jurisdiction_overrides/${jurisdiction}/locale_overrides/tl.json`)
      }
    }

    const allTranslations = [
      { translationKeys: spanishTranslations, language: "Spanish" },
      { translationKeys: chineseTranslations, language: "Chinese" },
      { translationKeys: vietnameseTranslations, language: "Vietnamese" },
    ]

    if (["shared", "alameda"].includes(jurisdiction)) {
      allTranslations.push({
        translationKeys: tagalogTranslations,
        language: "Tagalog",
      })
    }

    const findMissingStrings = (
      baseTranslations: TranslationsType,
      checkedTranslations: TranslationsType
    ) => {
      const baseKeys = Object.keys(baseTranslations)
      const checkedKeys = Object.keys(checkedTranslations)
      const missingKeys: string[] = []
      baseKeys.forEach((key) => {
        if (checkedKeys.indexOf(key) < 0) {
          missingKeys.push(key)
        }
      })
      return missingKeys
    }
    console.log(`------------${jurisdiction} translations------------`)
    allTranslations.forEach((foreignKeys) => {
      console.log(`Missing Public Site ${foreignKeys.language} Translations:`)
      const missingPublicSiteTranslations = findMissingStrings(
        englishTranslations,
        foreignKeys.translationKeys
      )
      missingPublicSiteTranslations.forEach((missingKey) =>
        console.log(`${missingKey},${JSON.stringify(englishTranslations[missingKey])}`)
      )
    })
  })
}

void main()

export {}
