import React from "react"
import { useRouter } from "next/router"
import {
  FeatureFlagEnum,
  Jurisdiction,
  Listing,
  MultiselectQuestion,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import {
  decodeQueryToFilterData,
  encodeFilterDataToBackendFilters,
  isFiltered,
} from "../components/browse/FilterDrawerHelpers"
import { ListingBrowse, TabsIndexEnum } from "../components/browse/ListingBrowse"
import { ListingBrowseDeprecated } from "../components/browse/ListingBrowseDeprecated"
import { isFeatureFlagOn } from "../lib/helpers"
import {
  fetchClosedListings,
  fetchJurisdictionByName,
  fetchMultiselectData,
  fetchOpenListings,
} from "../lib/hooks"

export interface ListingsProps {
  openListings: Listing[]
  closedListings: Listing[]
  paginationData: {
    currentPage: number
    itemCount: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
  }
  jurisdiction: Jurisdiction
  areFiltersActive: boolean
  multiselectData: MultiselectQuestion[]
}

export default function ListingsPage(props: ListingsProps) {
  const router = useRouter()

  return (
    <>
      {process.env.showNewSeedsDesigns ? (
        <ListingBrowse
          listings={props.openListings}
          tab={TabsIndexEnum.open}
          jurisdiction={props.jurisdiction}
          multiselectData={props.multiselectData}
          paginationData={props.paginationData}
          key={router.asPath}
          areFiltersActive={props.areFiltersActive}
        />
      ) : (
        <ListingBrowseDeprecated
          openListings={props.openListings}
          closedListings={props.closedListings}
        />
      )}
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getServerSideProps(context: { req: any; query: any }) {
  let openListings
  let closedListings
  let areFiltersActive = false

  if (isFiltered(context.query)) {
    const filterData = decodeQueryToFilterData(context.query)
    const filters = encodeFilterDataToBackendFilters(filterData)
    openListings = await fetchOpenListings(context.req, Number(context.query.page) || 1, filters)
    areFiltersActive = true
  } else {
    openListings = await fetchOpenListings(context.req, Number(context.query.page) || 1)
    closedListings = await fetchClosedListings(context.req, Number(context.query.page) || 1)
  }
  const jurisdiction = await fetchJurisdictionByName(context.req)
  const multiselectData = isFeatureFlagOn(
    jurisdiction,
    FeatureFlagEnum.swapCommunityTypeWithPrograms
  )
    ? await fetchMultiselectData(context.req, jurisdiction?.id)
    : null

  return {
    props: {
      openListings: openListings?.items || [],
      closedListings: closedListings?.items || [],
      paginationData: openListings?.items?.length ? openListings.meta : null,
      jurisdiction: jurisdiction,
      areFiltersActive,
      multiselectData: multiselectData,
    },
  }
}
