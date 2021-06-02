import * as ApiClient from "../types/src/backend-swagger"
import axios from "axios"

if (process.argv.length !== 9) {
  console.error(
    "usage: yarn run ts-node scripts/add-new-leasing-agent.ts apiUrl email firstName lastName listingId adminUsername adminPassword"
  )
  process.exit(-1)
}

const [
  apiUrl,
  email,
  firstName,
  lastName,
  listingId,
  adminEmail,
  adminPassword,
] = process.argv.slice(2)

const config = {
  baseURL: apiUrl,
  timeout: 5000,
}

async function loginAs(email, password) {
  ApiClient.serviceOptions.axios = axios.create(config)
  const { accessToken } = await new ApiClient.AuthService().login({
    body: {
      email: email,
      password: password,
    },
  })
  ApiClient.serviceOptions.axios = axios.create({
    ...config,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

async function main() {
  try {
    await loginAs(adminEmail, adminPassword)
    const userService = new ApiClient.UserService()

    const randomPassword = Math.random().toString(36).substring(2)

    await userService.create({
      body: {
        appUrl: "https://housing.acgov.org",
        // appUrl: "https://ala.bloom.exygy.dev",
        dob: new Date(),
        email: email,
        emailConfirmation: email,
        firstName: firstName,
        language: ApiClient.Language.en,
        lastName: lastName,
        middleName: "",
        password: randomPassword,
        passwordConfirmation: randomPassword,
      },
    })
    console.log(email)
    console.log(randomPassword)
    // await loginAs(email, randomPassword)
    // const profile = await userService.userControllerProfile()
    // console.log(profile)
    // await loginAs(adminEmail, adminPassword)
    //
    // const listingService = new ApiClient.ListingsService()
    // const listing = await listingService.retrieve({ listingId: listingId })
    //
    // let oldLeasingAgentsIds = []
    // if (listing.leasingAgents && Array.isArray(listing.leasingAgents)) {
    //   oldLeasingAgentsIds = listing.leasingAgents.map((la) => {
    //     return { id: la.id }
    //   })
    // }
    //
    // await listingService.update({
    //   listingId: listingId,
    //   body: {
    //     ...listing,
    //     leasingAgents: [...oldLeasingAgentsIds, { id: profile.id }],
    //   },
    // })
    // console.log(email)
    // console.log(randomPassword)
  } catch (e) {
    console.log(e)
  }
}

void main()
