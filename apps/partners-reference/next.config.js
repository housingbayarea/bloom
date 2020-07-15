/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const withTM = require("next-transpile-modules")(["@bloom-housing"])
const withSass = require("@zeit/next-sass")
const withCSS = require("@zeit/next-css")
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})
const axios = require("axios")
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

// Set up app-wide constants
let LISTING_SERVICE_URL = "http://localhost:3001"
if (process.env.INCOMING_HOOK_BODY && process.env.INCOMING_HOOK_BODY.startsWith("http")) {
  // This is a value that can get set via a Netlify webhook for branch deploys
  LISTING_SERVICE_URL = decodeURIComponent(process.env.INCOMING_HOOK_BODY)
} else if (process.env.LISTING_SERVICE_URL) {
  LISTING_SERVICE_URL = process.env.LISTING_SERVICE_URL
}
console.log(`Using ${LISTING_SERVICE_URL} for the listing service.`)

// Load the Tailwind theme and set up SASS vars
const bloomTheme = require("./tailwind.config.js")
const tailwindVars = require("@bloom-housing/ui-components/tailwind.tosass.js")(bloomTheme)

// Tell webpack to compile the ui components package
// https://www.npmjs.com/package/next-transpile-modules
module.exports = withCSS(
  withBundleAnalyzer(
    withSass(
      withTM({
        env: {
          listingServiceUrl: LISTING_SERVICE_URL,
        },
        sassLoaderOptions: {
          prependData: tailwindVars,
        },
        // exportPathMap adapted from https://github.com/zeit/next.js/blob/canary/examples/with-static-export/next.config.js
        async exportPathMap() {
          // we fetch our list of listings, this allow us to dynamically generate the exported pages
          let listings = []
          try {
            const response = await axios.get(LISTING_SERVICE_URL)
            listings = response.data.listings
          } catch (error) {
            console.log(error)
          }

          // tranform the list of posts into a map of pages with the pathname `/post/:id`
          const listingPaths = listings.reduce(
            (listingPaths, listing) =>
              Object.assign({}, listingPaths, {
                [`/listing/${listing.id}/${listing.urlSlug}`]: {
                  page: "/listing",
                  query: { id: listing.id },
                },
                // Create a redirect so that the base ID redirects to the ID with URL slug
                [`/listing/${listing.id}`]: {
                  page: "/redirect",
                  query: { to: `/listing/${listing.id}/${listing.urlSlug}` },
                },
              }),
            {}
          )

          // define page paths for various available languages
          const translatablePaths = Object.assign({}, listingPaths, {
            "/": { page: "/" },
            "/listings": { page: "/listings" },
          })
          const languages = ["es"] // add new language codes here
          const languagePaths = {}
          Object.entries(translatablePaths).forEach(([key, value]) => {
            languagePaths[key] = value
            languages.forEach((language) => {
              const query = Object.assign({}, value.query)
              query.language = language
              languagePaths[`/${language}${key.replace(/^\/$/, "")}`] = {
                ...value,
                query: query,
              }
            })
          })

          // combine the map of all various types of page paths
          return Object.assign({}, languagePaths, {
            "/disclaimer": { page: "/disclaimer" },
            "/privacy": { page: "/privacy" },
            "/applications/new": { page: "/applications/new" },
            "/applications/step2": { page: "/applications/step2" },
            "/applications/complete": { page: "/applications/complete" },
            "/sign-in": { page: "/sign-in" },
          })
        },
      })
    )
  )
)
