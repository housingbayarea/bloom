import React, { Component } from "react"
import ReactDOMServer from "react-dom/server"
import Head from "next/head"
import axios from "axios"
import { Listing } from "@bloom-housing/core"
import {
  AdditionalFees,
  ApplicationStatus,
  BasicTable,
  Description,
  GroupedTable,
  GroupedTableGroup,
  Headers,
  InfoCard,
  ImageCard,
  LeasingAgent,
  ListingDetails,
  ListingDetailItem,
  ListingMap,
  ListSection,
  MetaTags,
  OneLineAddress,
  PreferencesList,
  UnitTables,
  WhatToExpect,
  getOccupancyDescription,
  groupNonReservedAndReservedSummaries,
  occupancyTable,
  t,
} from "@bloom-housing/ui-components"
import { ApplicationSection } from "../src/page_components/listing/listing_sidebar/ApplicationSection"
import Layout from "../layouts/application"
import Markdown from "markdown-to-jsx"
interface ListingProps {
  listing: Listing
}

export default class extends Component<ListingProps> {
  public static async getInitialProps({ query }) {
    const listingId = query.id
    let listing = {}

    try {
      const response = await axios.get(process.env.listingServiceUrl)
      listing = response.data.listings.find((l) => l.id == listingId)
    } catch (error) {
      console.log(error)
    }

    return { listing }
  }

  public render() {
    let buildingSelectionCriteria, preferencesSection
    const listing = this.props.listing

    const oneLineAddress = <OneLineAddress address={listing.buildingAddress} />

    const googleMapsHref =
      "https://www.google.com/maps/place/" + ReactDOMServer.renderToStaticMarkup(oneLineAddress)

    const unitSummariesHeaders = {
      unitType: "Unit Type",
      minimumIncome: "Minimum Income",
      rent: "Rent",
      availability: "Availability",
    }

    const amiValues = listing.unitsSummarized.amiPercentages
      .map((percent) => {
        const percentInt = parseInt(percent, 10)
        return percentInt
      })
      .sort()
    const hmiHeaders = listing.unitsSummarized.hmi.columns as Headers
    const hmiData = listing.unitsSummarized.hmi.rows
    let groupedUnits: GroupedTableGroup[] = null

    if (amiValues.length == 1) {
      groupedUnits = groupNonReservedAndReservedSummaries(
        listing.unitsSummarized.byNonReservedUnitType,
        listing.unitsSummarized.byReservedType
      )
    } // else condition is handled inline below

    const occupancyDescription = getOccupancyDescription(listing)
    const occupancyHeaders = {
      unitType: t("t.unitType"),
      occupancy: t("t.occupancy"),
    }
    const occupancyData = occupancyTable(listing)

    const pageTitle = `${listing.name} - ${t("nav.siteTitle")}`
    const metaDescription = t("pageDescription.listing", {
      regionName: t("region.name"),
      listingName: listing.name,
    })
    const metaImage = listing.imageUrl

    if (listing.buildingSelectionCriteria) {
      buildingSelectionCriteria = (
        <p>
          <a href={listing.buildingSelectionCriteria}>
            {t("listings.moreBuildingSelectionCriteria")}
          </a>
        </p>
      )
    }

    if (listing.preferences) {
      preferencesSection = (
        <ListSection
          title={t("listings.sections.housingPreferencesTitle")}
          subtitle={t("listings.sections.housingPreferencesSubtitle")}
        >
          <>
            <PreferencesList preferences={listing.preferences} />
            <p className="text-gray-700 text-tiny">
              {t("listings.remainingUnitsAfterPreferenceConsideration")}
            </p>
          </>
        </ListSection>
      )
    }

    return (
      <Layout>
        <Head>
          <title>{pageTitle}</title>
        </Head>
        <MetaTags title={listing.name} image={metaImage} description={metaDescription} />
        <article className="flex flex-wrap relative max-w-5xl m-auto">
          <header className="image-card--leader">
            <ImageCard title={listing.name} imageUrl={listing.imageUrl} />
            <div className="p-3">
              <p className="font-alt-sans uppercase tracking-widest text-sm font-semibold">
                {oneLineAddress}
              </p>
              <p className="text-gray-700 text-base">{listing.developer}</p>
              <p className="text-xs">
                <a href={googleMapsHref} target="_blank" aria-label="Opens in new window">
                  View on Map
                </a>
              </p>
            </div>
          </header>
          <div className="w-full md:w-2/3 mt-3 md:hidden bg-primary-light block text-center md:mx-3">
            <ApplicationStatus listing={listing} />
          </div>

          <div className="w-full md:w-2/3 md:mt-6 md:mb-6 md:px-3 md:pr-8">
            {amiValues.length > 1 &&
              amiValues.map((percent) => {
                const byAMI = listing.unitsSummarized.byAMI.find((item) => {
                  return parseInt(item.percent, 10) == percent
                })

                groupedUnits = groupNonReservedAndReservedSummaries(
                  byAMI.byNonReservedUnitType,
                  byAMI.byReservedType
                )

                return (
                  <>
                    <h2 className="mt-4 mb-2">{percent}% AMI Unit</h2>
                    <GroupedTable
                      headers={unitSummariesHeaders}
                      data={groupedUnits}
                      responsiveCollapse={true}
                    />
                  </>
                )
              })}
            {amiValues.length == 1 && (
              <GroupedTable
                headers={unitSummariesHeaders}
                data={groupedUnits}
                responsiveCollapse={true}
              />
            )}
          </div>
          <div className="w-full md:w-2/3 md:mt-3 md:hidden md:mx-3">
            <ApplicationSection listing={listing} />
          </div>
          <ListingDetails>
            <ListingDetailItem
              imageAlt="eligibility-notebook"
              imageSrc="/images/listing-eligibility.svg"
              title="Eligibility"
              subtitle="Income, occupancy, preferences, and subsidies"
              desktopClass="bg-primary-lighter"
            >
              <ul>
                <ListSection
                  title={t("listings.householdMaximumIncome")}
                  subtitle={t("listings.forIncomeCalculations")}
                >
                  <BasicTable headers={hmiHeaders} data={hmiData} responsiveCollapse={true} />
                </ListSection>

                <ListSection title={t("t.occupancy")} subtitle={occupancyDescription}>
                  <BasicTable
                    headers={occupancyHeaders}
                    data={occupancyData}
                    responsiveCollapse={false}
                  />
                </ListSection>

                <ListSection
                  title="Rental Assistance"
                  subtitle="Housing Choice Vouchers, Section 8 and other valid rental assistance programs will be 
                    considered for this property. In the case of a valid rental subsidy, the required minimum income 
                    will be based on the portion of the rent that the tenant pays after use of the subsidy."
                />

                {preferencesSection}

                <ListSection
                  title={t("listings.sections.additionalEligibilityTitle")}
                  subtitle={t("listings.sections.additionalEligibilitySubtitle")}
                >
                  <>
                    <InfoCard title={t("listings.creditHistory")}>
                      <p className="text-sm text-gray-700">
                        <Markdown children={listing.creditHistory} />
                      </p>
                    </InfoCard>
                    <InfoCard title={t("listings.rentalHistory")}>
                      <p className="text-sm text-gray-700">
                        <Markdown children={listing.rentalHistory} />
                      </p>
                    </InfoCard>
                    <InfoCard title={t("listings.criminalBackground")}>
                      <p className="text-sm text-gray-700">
                        <Markdown children={listing.criminalBackground} />
                      </p>
                    </InfoCard>
                    {buildingSelectionCriteria}
                  </>
                </ListSection>
              </ul>
            </ListingDetailItem>

            <ListingDetailItem
              imageAlt="process-info"
              imageSrc="/images/listing-process.svg"
              title="Process"
              subtitle="Important dates and contact information"
              hideHeader={true}
              desktopClass="header-hidden"
            >
              <aside className="w-full static md:absolute md:right-0 md:w-1/3 md:top-0 sm:w-2/3 mb-5 md:ml-2 h-full md:border border-gray-400 bg-white">
                <div className="hidden md:block">
                  <ApplicationStatus listing={listing} />
                  <ApplicationSection listing={listing} />
                </div>
                <WhatToExpect listing={listing} />
                <LeasingAgent listing={listing} />
              </aside>
            </ListingDetailItem>

            <ListingDetailItem
              imageAlt="features-cards"
              imageSrc="/images/listing-features.svg"
              title="Features"
              subtitle="Amenities, unit details and additional fees"
            >
              <div className="listing-detail-panel">
                <dl className="column-definition-list">
                  <Description term="Neighborhood" description={listing.neighborhood} />
                  <Description term="Built" description={listing.yearBuilt} />
                  <Description term="Smoking Policy" description={listing.smokingPolicy} />
                  <Description term="Pets Policy" description={listing.petPolicy} />
                  <Description term="Property Amenities" description={listing.amenities} />
                  <Description term="Unit Amenities" description={listing.unitAmenities} />
                  <Description markdown term="Accessibility" description={listing.accessibility} />
                  <Description
                    term="Unit Features"
                    description={
                      <UnitTables
                        units={listing.units}
                        unitSummaries={listing.unitsSummarized.byUnitType}
                      />
                    }
                  />
                </dl>
                <AdditionalFees listing={listing} />
              </div>
            </ListingDetailItem>

            <ListingDetailItem
              imageAlt="neighborhood-buildings"
              imageSrc="/images/listing-neighborhood.svg"
              title="Neighborhood"
              subtitle="Location and transportation"
              desktopClass="bg-primary-lighter"
            >
              <div className="listing-detail-panel">
                <ListingMap address={listing.buildingAddress} listing={listing} />
              </div>
            </ListingDetailItem>

            <ListingDetailItem
              imageAlt="additional-information-envelope"
              imageSrc="/images/listing-legal.svg"
              title="Additional Information"
              subtitle="Required documents and selection criteria"
            >
              <div className="listing-detail-panel">
                <div className="info-card">
                  <h3 className="text-serif-lg">{t("listings.requiredDocuments")}</h3>
                  <p className="text-sm text-gray-700">{listing.requiredDocuments}</p>
                </div>
                {listing.programRules && (
                  <div className="info-card">
                    <h3 className="text-serif-lg">{t("listings.importantProgramRules")}</h3>
                    <p className="text-sm text-gray-700">{listing.programRules}</p>
                  </div>
                )}
              </div>
            </ListingDetailItem>
          </ListingDetails>
        </article>
      </Layout>
    )
  }
}
