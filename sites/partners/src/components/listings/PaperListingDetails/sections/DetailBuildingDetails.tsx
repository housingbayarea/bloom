import React, { useContext } from "react"
import { t } from "@bloom-housing/ui-components"
import { FieldValue, Grid } from "@bloom-housing/ui-seeds"
import { ListingContext } from "../../ListingContext"
import { getDetailFieldString } from "./helpers"
import SectionWithGrid from "../../../shared/SectionWithGrid"

const DetailBuildingDetails = () => {
  const listing = useContext(ListingContext)
  return (
    <SectionWithGrid heading={t("listings.sections.buildingDetailsTitle")} inset>
      <SectionWithGrid.HeadingRow>Building Address</SectionWithGrid.HeadingRow>
      {listing.buildingAddress ? (
        <>
          <Grid.Row columns={3}>
            <FieldValue
              id="buildingAddress.street"
              className="seeds-grid-span-2"
              label={t("application.contact.streetAddress")}
            >
              {listing.buildingAddress?.street}
            </FieldValue>
            <FieldValue id="neighborhood" label={t("t.neighborhood")}>
              {listing?.neighborhood}
            </FieldValue>
          </Grid.Row>
          <Grid.Row columns={6}>
            <FieldValue
              id="buildingAddress.city"
              className="seeds-grid-span-2"
              label={t("application.contact.city")}
            >
              {listing.buildingAddress?.city}
            </FieldValue>
            <FieldValue id="buildingAddress.state" label={t("application.contact.state")}>
              {listing.buildingAddress?.state}
            </FieldValue>
            <FieldValue id="buildingAddress.zipCode" label={t("application.contact.zip")}>
              {listing.buildingAddress?.zipCode}
            </FieldValue>
            <FieldValue
              id="yearBuilt"
              className="seeds-grid-span-2"
              label={t("listings.yearBuilt")}
            >
              {listing.yearBuilt}
            </FieldValue>
          </Grid.Row>
          <Grid.Row columns={3}>
            <FieldValue id="longitude" label={t("listings.longitude")}>
              {listing.buildingAddress?.longitude && listing.buildingAddress.longitude.toString()}
            </FieldValue>
            <FieldValue id="latitude" label={t("listings.latitude")}>
              {listing.buildingAddress?.latitude && listing.buildingAddress.latitude.toString()}
            </FieldValue>
          </Grid.Row>
        </>
      ) : (
        <FieldValue>{getDetailFieldString(null)}</FieldValue>
      )}
    </SectionWithGrid>
  )
}

export default DetailBuildingDetails
