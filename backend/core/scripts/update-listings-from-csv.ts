import csv from "csv-parser"
import fs from "fs"
import * as client from "../types/src/backend-swagger"
import { reformatAndUpdateListing, ListingPropertyFieldsUpdate } from "./update-listing"

// This script reads in listing data from a CSV file and sends requests to the backend to update
// the corresponding Listings. A few notes:
// - If one listing fails to be updated, the script will still attempt all the rest. At the end,
//   it will report how many failed (with error messages) and how many succeeded.
// - Each line in the CSV file is assumed to correspond to a distinct listing.
// - This script assumes particular heading names in the input CSV file (see CSVFormat
//   below).

// Sample usage:
// $ yarn ts-node scripts/update-listings-from-csv.ts http://localhost:3100 admin@example.com:abcdef path/to/file.csv

async function main() {
  if (process.argv.length < 5) {
    console.log(
      "usage: yarn ts-node scripts/update-listings-from-csv.ts import_api_url email:password csv_file_path"
    )
    process.exit(1)
  }

  // The columns name/format needed in the CSV and the data types of the cells
  type CSVFormat = {
    name: string
    id: string
    accessibility: string
    amenities: string
    building_total_units: number
    developer: string
    household_size_max: number
    household_size_min: number
    neighborhood: string
    pet_policy: string
    smoking_policy: string
    units_available: number
    unit_amenities: string
    year_built: number
    services_offered: string
    building_address_id: string
    place_name: string
    city: string
    county: string
    state: string
    street: string
    street2: string
    zip_code: string
    latitude: number
    longitude: number
  }

  const [importApiUrl, userAndPassword, csvFilePath] = process.argv.slice(2)
  const [email, password] = userAndPassword.split(":")

  // Read raw CSV data into memory.
  // Note: createReadStream creates ReadStream's whose on("data", ...) methods are called
  // asynchronously. To ensure that all CSV lines are read in before we start trying to update
  // listings from it, we wrap this step in a Promise.
  const rawListingFields: CSVFormat[] = []
  const promise = new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (listingFields: CSVFormat) => {
        rawListingFields.push(listingFields)
      })
      .on("end", resolve)
      .on("error", reject)
  })
  await promise

  console.log(`CSV file successfully read in; ${rawListingFields.length} listings to update`)

  const getVal = (val) => {
    return val && val !== "null" ? val.toString() : null
  }

  const uploadFailureMessages = []
  let numListingsSuccessfullyUpdated = 0

  for (const listingFields of rawListingFields) {
    const buildingAddress: client.AddressUpdate = {
      id: getVal(listingFields.building_address_id),
      street: getVal(listingFields.street) ?? "",
      street2: getVal(listingFields.street2) ?? "",
      zipCode: getVal(listingFields.zip_code) ?? "",
      city: getVal(listingFields.city) ?? "",
      state: getVal(listingFields.state) ?? "",
      longitude: parseFloat(getVal(listingFields.longitude)),
      latitude: parseFloat(getVal(listingFields.latitude)),
    }

    const listing: ListingPropertyFieldsUpdate = {
      id: getVal(listingFields.id),
      name: getVal(listingFields.name),
      accessibility: getVal(listingFields.accessibility),
      amenities: getVal(listingFields.amenities),
      buildingTotalUnits: parseInt(getVal(listingFields.building_total_units)),
      developer: getVal(listingFields.developer) ?? "",
      householdSizeMax: parseInt(getVal(listingFields.household_size_max)),
      householdSizeMin: parseInt(getVal(listingFields.household_size_min)),
      neighborhood: getVal(listingFields.neighborhood),
      petPolicy: getVal(listingFields.pet_policy),
      smokingPolicy: getVal(listingFields.smoking_policy),
      unitsAvailable: parseInt(getVal(listingFields.units_available)),
      unitAmenities: getVal(listingFields.unit_amenities),
      yearBuilt: parseInt(getVal(listingFields.year_built)),
      servicesOffered: getVal(listingFields.services_offered),
    }

    if (buildingAddress.street !== "") {
      listing["buildingAddress"] = buildingAddress
    }

    try {
      const newListing = await reformatAndUpdateListing(importApiUrl, email, password, listing)
      console.log(`New listing updated successfully: ${newListing.name}`)
      numListingsSuccessfullyUpdated++
    } catch (e) {
      console.log(e)
      uploadFailureMessages.push(`Update failed for ${listing.name}: ${e}`)
    }
  }

  console.log(`\nNumber of listings successfully updated: ${numListingsSuccessfullyUpdated}`)
  console.log(`Number of failed listing updates: ${uploadFailureMessages.length}\n`)
  for (const failureMessage of uploadFailureMessages) {
    console.log(failureMessage)
  }
}

void main()
