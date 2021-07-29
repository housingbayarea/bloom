import React, { useContext } from "react"
import { t, GridSection, ViewItem, GridCell } from "@bloom-housing/ui-components"
import { ListingContext } from "../../ListingContext"
import { getDetailFieldString } from "./helpers"

const DetailAdditionalFees = () => {
  const listing = useContext(ListingContext)

  return (
    <GridSection
      className="bg-primary-lighter"
      title={t("listings.sections.additionalFees")}
      grid={false}
      inset
    >
      <GridSection columns={3}>
        <GridCell>
          <ViewItem label={t("listings.applicationFee")}>
            {getDetailFieldString(listing.applicationFee)}
          </ViewItem>
        </GridCell>
        <GridCell>
          <ViewItem label={t("listings.depositMin")}>
            {getDetailFieldString(listing.depositMin)}
          </ViewItem>
        </GridCell>
        <GridCell>
          <ViewItem label={t("listings.depositMax")}>
            {getDetailFieldString(listing.depositMax)}
          </ViewItem>
        </GridCell>
      </GridSection>
      <GridSection columns={2}>
        <GridCell>
          <ViewItem label={t("listings.sections.costsNotIncluded")}>
            {getDetailFieldString(listing.costsNotIncluded)}
          </ViewItem>
        </GridCell>
      </GridSection>
    </GridSection>
  )
}

export default DetailAdditionalFees
