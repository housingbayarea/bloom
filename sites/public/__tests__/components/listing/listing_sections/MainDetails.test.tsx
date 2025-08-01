import React from "react"
import { render, cleanup } from "@testing-library/react"
import { listing, jurisdiction } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import { MainDetails } from "../../../../src/components/listing/listing_sections/MainDetails"
import { oneLineAddress } from "@bloom-housing/shared-helpers"
import {
  FeatureFlagEnum,
  ReviewOrderTypeEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"

afterEach(cleanup)

describe("<MainDetails>", () => {
  it("shows nothing if no listing", () => {
    const { queryByText } = render(
      <MainDetails listing={null} dueDateContent={[]} jurisdiction={jurisdiction} />
    )
    expect(queryByText(listing.name)).toBeNull()
  })
  it("shows all content", () => {
    const { getByText, getByRole, getByAltText } = render(
      <MainDetails listing={listing} dueDateContent={[]} jurisdiction={jurisdiction} />
    )
    expect(getByRole("heading", { level: 1 })).toHaveTextContent(listing.name)
    expect(getByText(oneLineAddress(listing.listingsBuildingAddress))).toBeDefined()
    expect(getByText("View on Map")).toBeDefined()
    expect(getByText(listing.developer)).toBeDefined()
    expect(getByAltText("A picture of the building")).toBeDefined()
  })
  it("shows no tags", () => {
    const { queryByTestId } = render(
      <MainDetails
        listing={{
          ...listing,
          reviewOrderType: ReviewOrderTypeEnum.lottery,
          reservedCommunityTypes: null,
        }}
        dueDateContent={[]}
        jurisdiction={jurisdiction}
      />
    )
    expect(queryByTestId("listing-tags")).toBeNull()
  })
  it("shows reserved tag", () => {
    const { getByTestId, getAllByText } = render(
      <MainDetails
        listing={{
          ...listing,
          reviewOrderType: ReviewOrderTypeEnum.lottery,
          reservedCommunityTypes: { id: "id", name: "veteran" },
        }}
        dueDateContent={[]}
        jurisdiction={jurisdiction}
      />
    )
    expect(getByTestId("listing-tags")).toBeDefined()
    expect(getAllByText("Veteran").length).toBeGreaterThan(0)
  })
  it("hides reserved tag when swapCommunityTypeWithPrograms is true", () => {
    const view = render(
      <MainDetails
        listing={listing}
        jurisdiction={{
          ...jurisdiction,
          featureFlags: [
            ...jurisdiction.featureFlags,
            {
              name: FeatureFlagEnum.swapCommunityTypeWithPrograms,
              id: "id",
              createdAt: new Date(),
              updatedAt: new Date(),
              active: true,
              description: "",
              jurisdictions: [],
            },
          ],
        }}
      />
    )
    expect(view.queryByText("Veteran")).toBeNull()
  })
})
