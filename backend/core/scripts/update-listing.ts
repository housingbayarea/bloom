import * as client from "../types/src/backend-swagger"
import axios from "axios"
import axiosStatic from "axios"

import qs from "qs"
import { serviceOptions } from "../types/src/backend-swagger"

// NOTE: This script relies on any logged-in users having permission to update
// listings (defined in backend/core/src/auth/authz_policy.csv)

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

async function updateListing(
  existingListing: client.Listing,
  listingUpdate: ListingPropertyFieldsUpdate
) {
  const newListing = { ...existingListing, ...listingUpdate }
  const listingsService = new client.ListingsService()

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
      language: "en",
    },
  })

  console.log("axios config created")

  const listingsService = new client.ListingsService()

  console.log(listingUpdate.id)
  console.log({ listingUpdate })
  console.log(listingUpdate.developer)

  const existingListing = await listingsService.retrieve(
    {
      id: listingUpdate.id,
      view: "full",
    },
    { headers: { test: "123" } }
  )

  // console.log({ existingListing })

  const updatedListing = await updateListing(existingListing, listingUpdate)
  // console.log({ updatedListing })
  // Update the listing, and then return it.
  return updatedListing

  return null
}
