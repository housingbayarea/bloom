import * as client from "../types/src/backend-swagger"
import axios from "axios"
import { serviceOptions } from "../types/src/backend-swagger"

// NOTE: This script relies on any logged-in users having permission to update
// listings (defined in backend/core/src/auth/authz_policy.csv)

const listingsService = new client.ListingsService()
const authService = new client.AuthService()

export type ListingPropertyFieldsUpdate = Pick<
  client.ListingUpdate,
  | "id"
  | "name"
  | "buildingAddress"
  | "accessibility"
  | "amenities"
  | "buildingTotalUnits"
  | "developer"
  | "householdSizeMax"
  | "householdSizeMin"
  | "neighborhood"
  | "petPolicy"
  | "smokingPolicy"
  | "unitsAvailable"
  | "unitAmenities"
  | "yearBuilt"
  | "servicesOffered"
>

async function getListing(id: string) {
  try {
    return await listingsService.retrieve({
      id,
    })
  } catch (e) {
    console.log(id)
    throw new Error(e.response.data.message)
  }
}

async function updateListing(
  existingListing: client.Listing,
  listingUpdate: ListingPropertyFieldsUpdate
) {
  const newListing = { ...existingListing, ...listingUpdate }
  try {
    return await listingsService.update({
      id: existingListing.id,
      body: newListing,
    })
  } catch (e) {
    console.log(newListing)
    throw new Error(e.response.data.message)
  }
}

export async function reformatAndUpdateListing(
  apiUrl: string,
  email: string,
  password: string,
  listingUpdate: ListingPropertyFieldsUpdate
) {
  serviceOptions.axios = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
  })

  // Log in to retrieve an access token.
  const { accessToken } = await authService.login({
    body: {
      email: email,
      password: password,
    },
  })

  // Update the axios config so future requests include the access token in the header.
  serviceOptions.axios = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const existingListing = await getListing(listingUpdate.id)

  // Update the listing, and then return it.
  return await updateListing(existingListing, listingUpdate)
}
