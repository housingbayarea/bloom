import React from "react"
import { render, cleanup } from "@testing-library/react"
import { ImageCard } from "../../src/blocks/ImageCard"
import { t } from "../../src/helpers/translator"
import { ApplicationStatusType } from "../../src/global/ApplicationStatusType"

afterEach(cleanup)

describe("<ImageCard>", () => {
  it("renders title, subtitle, image and alt text", () => {
    const { getByText, getByAltText } = render(
      <ImageCard
        imageUrl={"/images/listing.jpg"}
        title={"My Building"}
        subtitle={"The Address"}
        description={"A description of the image"}
      />
    )
    expect(getByText("My Building")).not.toBeNull()
    expect(getByText("The Address")).not.toBeNull()
    expect(getByAltText("A description of the image")).not.toBeNull()
  })
  it("renders with a link", () => {
    const { getByAltText } = render(
      <ImageCard
        imageUrl={"/images/listing.jpg"}
        title={"My Building"}
        subtitle={"The Address"}
        href="/listings"
      />
    )
    expect(getByAltText("A picture of the building").closest("a")?.getAttribute("href")).toBe(
      "/listings"
    )
  })
  it("renders with an application status bar", () => {
    const { getByText } = render(
      <ImageCard
        imageUrl={"/images/listing.jpg"}
        title={"My Building"}
        subtitle={"The Address"}
        appStatus={ApplicationStatusType.Closed}
        appStatusContent={t("listings.applicationsClosed")}
      />
    )
    expect(getByText("Applications Closed", { exact: false })).not.toBeNull()
  })
})
