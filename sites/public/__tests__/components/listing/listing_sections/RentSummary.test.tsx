import React from "react"
import { render, cleanup } from "@testing-library/react"
import { RentSummary } from "../../../../src/components/listing/listing_sections/RentSummary"
import { ReviewOrderTypeEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"

afterEach(cleanup)

describe("<RentSummary>", () => {
  it("shows all content for one percentage", () => {
    const { getAllByText, getByText } = render(
      <RentSummary
        amiValues={[30]}
        reviewOrderType={ReviewOrderTypeEnum.firstComeFirstServe}
        unitsSummarized={{
          unitTypes: [],
          priorityTypes: [],
          amiPercentages: [],
          byUnitTypeAndRent: [],
          byUnitType: [],
          byAMI: [],
          hmi: null,
        }}
      />
    )
    expect(getAllByText("Rent").length).toBeGreaterThan(0)
    expect(getByText("Unit type")).toBeDefined()
    expect(getByText("Minimum income")).toBeDefined()
    expect(getByText("Availability")).toBeDefined()
  })
  it("shows all content for multiple percentages", () => {
    const { getAllByText, getByText } = render(
      <RentSummary
        amiValues={[30, 60]}
        reviewOrderType={ReviewOrderTypeEnum.firstComeFirstServe}
        unitsSummarized={{
          unitTypes: [],
          priorityTypes: [],
          amiPercentages: [],
          byUnitTypeAndRent: [],
          byUnitType: [],
          byAMI: [
            { percent: "30", byUnitType: [] },
            { percent: "60", byUnitType: [] },
          ],
          hmi: null,
        }}
      />
    )
    expect(getAllByText("Rent").length).toBeGreaterThan(0)
    expect(getByText("30% AMI unit")).toBeDefined()
    expect(getByText("60% AMI unit")).toBeDefined()
    expect(getAllByText("Unit type").length).toBe(2)
    expect(getAllByText("Minimum income").length).toBe(2)
    expect(getAllByText("Availability").length).toBe(2)
  })
})
