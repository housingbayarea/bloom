import * as React from "react"
import { t } from "@bloom-housing/ui-components"
import { HeadingGroup, Link } from "@bloom-housing/ui-seeds"
import { oneLineAddress, Map } from "@bloom-housing/shared-helpers"
import {
  Address,
  ListingNeighborhoodAmenities,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { getGenericAddress } from "../../../lib/helpers"
import { CollapsibleSection } from "../../../patterns/CollapsibleSection"
import styles from "../ListingViewSeeds.module.scss"

type NeighborhoodProps = {
  address: Address
  name: string
  neighborhood?: string
  neighborhoodAmenities?: ListingNeighborhoodAmenities
  region?: string
}

export const Neighborhood = ({
  address,
  name,
  neighborhood,
  neighborhoodAmenities,
  region,
}: NeighborhoodProps) => {
  const googleMapsHref = "https://www.google.com/maps/place/" + oneLineAddress(address)
  const hasNeighborhoodAmenities = neighborhoodAmenities
    ? Object.values(neighborhoodAmenities).some((value) => value !== null && value !== undefined)
    : null

  return (
    <CollapsibleSection
      title={t("t.neighborhood")}
      subtitle={t("listings.sections.neighborhoodSubtitle")}
      priority={2}
    >
      <div className={`${styles["mobile-inline-collapse-padding"]} seeds-m-bs-section`}>
        <Map address={getGenericAddress(address)} listingName={name} />
        <Link href={googleMapsHref} newWindowTarget={true} className={"seeds-m-bs-4"}>
          {t("t.getDirections")}
        </Link>
        {neighborhood && (
          <HeadingGroup
            heading={t("t.neighborhood")}
            subheading={neighborhood}
            headingProps={{ priority: 3, size: "lg" }}
            className={`${styles["heading-group"]} seeds-m-bs-section`}
          />
        )}
        {region && (
          <HeadingGroup
            heading={t("t.region")}
            subheading={region}
            headingProps={{ priority: 3, size: "lg" }}
            className={`${styles["heading-group"]} seeds-m-bs-section`}
          />
        )}
        {hasNeighborhoodAmenities && (
          <>
            <HeadingGroup
              heading={t("listings.sections.neighborhoodAmenitiesTitle")}
              subheading={t("listings.sections.neighborhoodAmenitiesSubtitle")}
              headingProps={{ priority: 3, size: "lg" }}
              className={`${styles["heading-group"]} seeds-m-bs-section`}
            />
            {Object.keys(neighborhoodAmenities).map((amenity, index) => {
              if (!neighborhoodAmenities[amenity]) return
              return (
                <HeadingGroup
                  heading={t(`listings.amenities.${amenity}`)}
                  subheading={neighborhoodAmenities[amenity]}
                  headingProps={{ priority: 4, size: "lg" }}
                  className={`${styles["heading-group"]} ${styles["nested-heading-group"]} seeds-m-bs-content`}
                  key={index}
                />
              )
            })}
          </>
        )}
      </div>
    </CollapsibleSection>
  )
}
