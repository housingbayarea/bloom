import React, { Component } from "react"
import ReactDOMServer from "react-dom/server"
import Head from "next/head"
import axios from "axios"
import Markdown from "markdown-to-jsx"
import { Listing, ListingEvent, ListingEventType } from "@bloom-housing/backend-core/types"
import {
  AdditionalFees,
  ApplicationSection,
  ApplicationStatus,
  StandardTable,
  Description,
  ExpandableText,
  getOccupancyDescription,
  GroupedTable,
  GroupedTableGroup,
  groupNonReservedAndReservedSummaries,
  ImageCard,
  imageUrlFromListing,
  InfoCard,
  LeasingAgent,
  ListingDetailItem,
  ListingDetails,
  ListingMap,
  ListSection,
  MetaTags,
  occupancyTable,
  OneLineAddress,
  PreferencesList,
  TableHeaders,
  t,
  UnitTables,
  WhatToExpect,
  PublicLotteryEvent,
  LotteryResultsEvent,
  OpenHouseEvent,
  DownloadLotteryResults,
  ReferralApplication,
} from "@bloom-housing/ui-components"
import Layout from "../layouts/application"
import moment from "moment"

interface ListingProps {
  listing: Listing
}

export default class extends Component<ListingProps> {
  public static async getInitialProps({ query }) {
    const listingId = query.id as string
    let listing = {}

    try {
      const response = await axios.get(process.env.backendApiBase + "/listings/" + listingId)
      listing = response.data
    } catch (error) {
      console.log(error)
    }

    return { listing }
  }

  public render() {
    let buildingSelectionCriteria, preferencesSection
    const listing = this.props.listing

    const oneLineAddress = <OneLineAddress address={listing.property.buildingAddress} />

    const googleMapsHref =
      "https://www.google.com/maps/place/" + ReactDOMServer.renderToStaticMarkup(oneLineAddress)

    const unitSummariesHeaders = {
      unitType: t("t.unitType"),
      minimumIncome: t("t.minimumIncome"),
      rent: t("t.rent"),
      availability: t("t.availability"),
    }

    const amiValues = listing.property.unitsSummarized.amiPercentages
      .map((percent) => {
        const percentInt = parseInt(percent, 10)
        return percentInt
      })
      .sort()

    const hmiHeaders = listing.property.unitsSummarized.hmi.columns as TableHeaders

    const hmiData = listing.property.unitsSummarized.hmi.rows.map((row) => {
      return { ...row, householdSize: <strong>{row["householdSize"]}</strong> }
    })
    let groupedUnits: GroupedTableGroup[] = null

    if (amiValues.length == 1) {
      groupedUnits = groupNonReservedAndReservedSummaries(
        listing.property.unitsSummarized.byNonReservedUnitType,
        listing.property.unitsSummarized.byReservedType
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
    const metaImage = imageUrlFromListing(listing)

    const householdMaximumIncomeSubheader = listing.property.units[0].bmrProgramChart
      ? t("listings.forIncomeCalculationsBMR")
      : t("listings.forIncomeCalculations")

    if (listing.buildingSelectionCriteria) {
      buildingSelectionCriteria = (
        <p>
          <a href={listing.buildingSelectionCriteria}>
            {t("listings.moreBuildingSelectionCriteria")}
          </a>
        </p>
      )
    }

    if (listing.preferences && listing.preferences.length > 0) {
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

    let openHouseEvents: ListingEvent[] | null = null
    let publicLottery: ListingEvent | null = null
    let lotteryResults: ListingEvent | null = null
    if (Array.isArray(listing.events)) {
      listing.events.forEach((event) => {
        switch (event.type) {
          case ListingEventType.openHouse:
            if (!openHouseEvents) {
              openHouseEvents = []
            }
            openHouseEvents.push(event)
            break
          case ListingEventType.publicLottery:
            publicLottery = event
            break
          case ListingEventType.lotteryResults:
            lotteryResults = event
            break
        }
      })
    }

    let lotterySection
    if (publicLottery && (!lotteryResults || (lotteryResults && !lotteryResults.url))) {
      lotterySection = <PublicLotteryEvent event={publicLottery} />
      if (moment(publicLottery.startTime) < moment() && lotteryResults && !lotteryResults.url) {
        lotterySection = <LotteryResultsEvent event={lotteryResults} />
      }
    }

    return (
      <Layout>
        <Head>
          <title>{pageTitle}</title>
        </Head>
        <MetaTags title={listing.name} image={metaImage} description={metaDescription} />

        <article className="flex flex-wrap relative max-w-5xl m-auto">
          <header className="image-card--leader">
            <ImageCard title={listing.name} imageUrl={imageUrlFromListing(listing)} />
            <div className="p-3">
              <p className="font-alt-sans uppercase tracking-widest text-sm font-semibold">
                {oneLineAddress}
              </p>
              <p className="text-gray-700 text-base">{listing.property.developer}</p>
              <p className="text-xs">
                <a href={googleMapsHref} target="_blank" aria-label="Opens in new window">
                  {t("t.viewOnMap")}
                </a>
              </p>
            </div>
          </header>

          <div className="w-full md:w-2/3 md:mt-6 md:mb-6 md:px-3 md:pr-8">
            {amiValues.length > 1 &&
              amiValues.map((percent) => {
                const byAMI = listing.property.unitsSummarized.byAMI.find((item) => {
                  return parseInt(item.percent, 10) == percent
                })

                groupedUnits = groupNonReservedAndReservedSummaries(
                  byAMI.byNonReservedUnitType,
                  byAMI.byReservedType
                )

                return (
                  <>
                    <h2 className="mt-4 mb-2">
                      {t("listings.percentAMIUnit", { percent: percent })}
                    </h2>
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
          <div className="w-full md:w-2/3 md:mt-3 md:hidden md:mx-3 border-gray-400 border-b">
            <ApplicationStatus listing={listing} />
            <div className="mx-4">
              <DownloadLotteryResults event={lotteryResults} />
              <ApplicationSection
                listing={listing}
                internalFormRoute="/applications/start/choose-language"
              />
            </div>
          </div>
          <ListingDetails>
            <ListingDetailItem
              imageAlt={t("listings.eligibilityNotebook")}
              imageSrc="/images/listing-eligibility.svg"
              title={t("listings.sections.eligibilityTitle")}
              subtitle={t("listings.sections.eligibilitySubtitle")}
              desktopClass="bg-primary-lighter"
            >
              <ul>
                <ListSection
                  title={t("listings.householdMaximumIncome")}
                  subtitle={householdMaximumIncomeSubheader}
                >
                  <StandardTable headers={hmiHeaders} data={hmiData} responsiveCollapse={true} />
                </ListSection>

                <ListSection title={t("t.occupancy")} subtitle={occupancyDescription}>
                  <StandardTable
                    headers={occupancyHeaders}
                    data={occupancyData}
                    responsiveCollapse={false}
                  />
                </ListSection>

                <ListSection
                  title={t("listings.sections.rentalAssistanceTitle")}
                  subtitle={
                    listing.rentalAssistance || t("listings.sections.rentalAssistanceSubtitle")
                  }
                />

                {preferencesSection}

                <ListSection
                  title={t("listings.sections.additionalEligibilityTitle")}
                  subtitle={t("listings.sections.additionalEligibilitySubtitle")}
                >
                  <>
                    <InfoCard title={t("listings.creditHistory")}>
                      <ExpandableText className="text-sm text-gray-700">
                        {listing.creditHistory}
                      </ExpandableText>
                    </InfoCard>
                    <InfoCard title={t("listings.rentalHistory")}>
                      <ExpandableText className="text-sm text-gray-700">
                        {listing.rentalHistory}
                      </ExpandableText>
                    </InfoCard>
                    {listing.criminalBackground && (
                      <InfoCard title={t("listings.criminalBackground")}>
                        <ExpandableText className="text-sm text-gray-700">
                          {listing.criminalBackground}
                        </ExpandableText>
                      </InfoCard>
                    )}
                    {buildingSelectionCriteria}
                  </>
                </ListSection>
              </ul>
            </ListingDetailItem>

            <ListingDetailItem
              imageAlt={t("listings.processInfo")}
              imageSrc="/images/listing-process.svg"
              title={t("listings.sections.processTitle")}
              subtitle={t("listings.sections.processSubtitle")}
              hideHeader={true}
              desktopClass="header-hidden"
            >
              <aside className="w-full static md:absolute md:right-0 md:w-1/3 md:top-0 sm:w-2/3 md:ml-2 h-full md:border border-gray-400 bg-white">
                <div className="hidden md:block">
                  <ApplicationStatus listing={listing} />
                  <DownloadLotteryResults event={lotteryResults} />
                  {openHouseEvents && <OpenHouseEvent events={openHouseEvents} />}
                  {listing.applicationMethods.length > 0 ? (
                    <ApplicationSection
                      listing={listing}
                      internalFormRoute="/applications/start/choose-language"
                    />
                  ) : (
                    <ReferralApplication
                      phoneNumber={t("application.referralApplication.phoneNumber")}
                      description={t("application.referralApplication.instructions")}
                      title={t("application.referralApplication.furtherInformation")}
                    />
                  )}
                </div>

                {openHouseEvents && (
                  <div className="mb-2 md:hidden">
                    <OpenHouseEvent events={openHouseEvents} />
                  </div>
                )}
                {lotterySection}
                <WhatToExpect listing={listing} />
                <LeasingAgent listing={listing} />
              </aside>
            </ListingDetailItem>

            <ListingDetailItem
              imageAlt={t("listings.featuresCards")}
              imageSrc="/images/listing-features.svg"
              title={t("listings.sections.featuresTitle")}
              subtitle={t("listings.sections.featuresSubtitle")}
            >
              <div className="listing-detail-panel">
                <dl className="column-definition-list">
                  <Description
                    term={t("t.neighborhood")}
                    description={listing.property.neighborhood}
                  />
                  <Description term={t("t.built")} description={listing.property.yearBuilt} />
                  <Description
                    term={t("t.smokingPolicy")}
                    description={listing.property.smokingPolicy}
                  />
                  <Description term={t("t.petsPolicy")} description={listing.property.petPolicy} />
                  <Description
                    term={t("t.propertyAmenities")}
                    description={listing.property.amenities}
                  />
                  <Description
                    term={t("t.unitAmenities")}
                    description={listing.property.unitAmenities}
                  />
                  {listing.property.servicesOffered && (
                    <Description
                      term={t("t.servicesOffered")}
                      description={listing.property.servicesOffered}
                    />
                  )}
                  <Description
                    term={t("t.accessibility")}
                    description={listing.property.accessibility}
                  />
                  <Description
                    term={t("t.unitFeatures")}
                    description={
                      <UnitTables
                        units={listing.property.units}
                        unitSummaries={listing.property.unitsSummarized.byUnitType}
                        disableAccordion={listing.disableUnitsAccordion}
                      />
                    }
                  />
                </dl>
                <AdditionalFees listing={listing} />
              </div>
            </ListingDetailItem>

            {listing.property?.buildingAddress.latitude &&
              listing.property?.buildingAddress.longitude && (
                <ListingDetailItem
                  imageAlt={t("listings.neighborhoodBuildings")}
                  imageSrc="/images/listing-neighborhood.svg"
                  title={t("listings.sections.neighborhoodTitle")}
                  subtitle={t("listings.sections.neighborhoodSubtitle")}
                  desktopClass="bg-primary-lighter"
                >
                  <div className="listing-detail-panel">
                    <ListingMap address={listing.property.buildingAddress} listing={listing} />
                  </div>
                </ListingDetailItem>
              )}

            {(listing.requiredDocuments || listing.programRules || listing.specialNotes) && (
              <ListingDetailItem
                imageAlt={t("listings.additionalInformationEnvelope")}
                imageSrc="/images/listing-legal.svg"
                title={t("listings.sections.additionalInformationTitle")}
                subtitle={t("listings.sections.additionalInformationSubtitle")}
              >
                <div className="listing-detail-panel">
                  {listing.requiredDocuments && (
                    <div className="info-card">
                      <h3 className="text-serif-lg">{t("listings.requiredDocuments")}</h3>
                      <p className="text-sm text-gray-700">
                        <Markdown
                          children={listing.requiredDocuments}
                          options={{ disableParsingRawHTML: true }}
                        />
                      </p>
                    </div>
                  )}
                  {listing.programRules && (
                    <div className="info-card">
                      <h3 className="text-serif-lg">{t("listings.importantProgramRules")}</h3>
                      <p className="text-sm text-gray-700">
                        <Markdown
                          children={listing.programRules}
                          options={{ disableParsingRawHTML: true }}
                        />
                      </p>
                    </div>
                  )}
                  {listing.specialNotes && (
                    <div className="info-card">
                      <h3 className="text-serif-lg">{t("listings.specialNotes")}</h3>
                      <p className="text-sm text-gray-700">
                        <Markdown
                          children={listing.specialNotes}
                          options={{ disableParsingRawHTML: true }}
                        />
                      </p>
                    </div>
                  )}
                </div>
              </ListingDetailItem>
            )}
          </ListingDetails>
        </article>
      </Layout>
    )
  }
}
