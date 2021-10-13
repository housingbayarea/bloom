import React from "react"
import ReactDOMServer from "react-dom/server"
import Markdown from "markdown-to-jsx"
import {
  Listing,
  ListingEvent,
  ListingEventType,
  ListingApplicationAddressType,
  ApplicationMethod,
  ApplicationMethodType,
} from "@bloom-housing/backend-core/types"
import {
  AdditionalFees,
  ApplicationStatus,
  Description,
  DownloadLotteryResults,
  ExpandableText,
  GetApplication,
  GroupedTable,
  ImageCard,
  InfoCard,
  LeasingAgent,
  ListSection,
  ListingDetailItem,
  ListingDetails,
  ListingMap,
  LotteryResultsEvent,
  Message,
  OneLineAddress,
  OpenHouseEvent,
  PreferencesList,
  PublicLotteryEvent,
  ReferralApplication,
  StandardTable,
  SubmitApplication,
  TableHeaders,
  UnitTables,
  Waitlist,
  WhatToExpect,
  cloudinaryPdfFromId,
  getOccupancyDescription,
  getSummariesTable,
  imageUrlFromListing,
  occupancyTable,
  t,
} from "@bloom-housing/ui-components"
import moment from "moment"
import { ErrorPage } from "../pages/_error"
import { useGetApplicationStatusProps } from "../lib/hooks"
import { getGenericAddress, openInFuture } from "../lib/helpers"

interface ListingProps {
  listing: Listing
  preview?: boolean
}

export const ListingView = (props: ListingProps) => {
  let buildingSelectionCriteria, preferencesSection
  const { listing } = props

  const {
    content: appStatusContent,
    subContent: appStatusSubContent,
  } = useGetApplicationStatusProps(listing)

  const appOpenInFuture = openInFuture(listing)
  const hasNonReferralMethods = listing?.applicationMethods
    ? listing.applicationMethods.some((method) => method.type !== ApplicationMethodType.Referral)
    : false

  if (!listing) {
    return <ErrorPage />
  }

  const oneLineAddress = <OneLineAddress address={getGenericAddress(listing.buildingAddress)} />

  const googleMapsHref =
    "https://www.google.com/maps/place/" + ReactDOMServer.renderToStaticMarkup(oneLineAddress)

  const unitSummariesHeaders = {
    unitType: t("t.unitType"),
    minimumIncome: t("t.minimumIncome"),
    rent: t("t.rent"),
    availability: t("t.availability"),
  }

  const amiValues = listing?.unitsSummarized?.amiPercentages
    ? listing.unitsSummarized.amiPercentages
        .map((percent) => {
          const percentInt = parseInt(percent, 10)
          return percentInt
        })
        .sort(function (a, b) {
          return a - b
        })
    : []

  const hmiHeaders = listing?.unitsSummarized?.hmi?.columns as TableHeaders

  const hmiData = listing?.unitsSummarized?.hmi?.rows.map((row) => {
    return {
      ...row,
      sizeColumn: (
        <strong>
          {listing.units[0].bmrProgramChart ? t(row["sizeColumn"]) : row["sizeColumn"]}
        </strong>
      ),
    }
  })
  let groupedUnits: Record<string, React.ReactNode>[] = null

  if (amiValues.length == 1) {
    groupedUnits = getSummariesTable(listing.unitsSummarized.byUnitTypeAndRent)
  } // else condition is handled inline below

  const occupancyDescription = getOccupancyDescription(listing)
  const occupancyHeaders = {
    unitType: "t.unitType",
    occupancy: "t.occupancy",
  }
  const occupancyData = occupancyTable(listing)

  const householdMaximumIncomeSubheader = listing?.units[0]?.bmrProgramChart
    ? t("listings.forIncomeCalculationsBMR")
    : t("listings.forIncomeCalculations")

  if (listing.buildingSelectionCriteriaFile) {
    buildingSelectionCriteria = (
      <p>
        <a
          href={cloudinaryPdfFromId(
            listing.buildingSelectionCriteriaFile.fileId,
            process.env.cloudinaryCloudName
          )}
        >
          {t("listings.moreBuildingSelectionCriteria")}
        </a>
      </p>
    )
  } else if (listing.buildingSelectionCriteria) {
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

  const getReservedTitle = () => {
    if (
      listing.reservedCommunityType.name === "senior55" ||
      listing.reservedCommunityType.name === "senior62" ||
      listing.reservedCommunityType.name === "senior"
    ) {
      return t("listings.reservedCommunitySeniorTitle")
    } else return t("listings.reservedCommunityTitleDefault")
  }

  // TODO: Move the below methods into our shared helper library when setup
  const hasMethod = (applicationMethods: ApplicationMethod[], type: ApplicationMethodType) => {
    return applicationMethods.some((method) => method.type == type)
  }

  const getMethod = (applicationMethods: ApplicationMethod[], type: ApplicationMethodType) => {
    return applicationMethods.find((method) => method.type == type)
  }

  type AddressLocation = "dropOff" | "pickUp"

  const getAddress = (
    addressType: ListingApplicationAddressType | undefined,
    location: AddressLocation
  ) => {
    if (addressType === ListingApplicationAddressType.leasingAgent) {
      return listing.leasingAgentAddress
    }
    if (addressType === ListingApplicationAddressType.mailingAddress) {
      return listing.applicationMailingAddress
    }
    if (location === "dropOff") {
      return listing.applicationDropOffAddress
    } else {
      return listing.applicationPickUpAddress
    }
  }

  const getOnlineApplicationURL = () => {
    let onlineApplicationURL
    if (hasMethod(listing.applicationMethods, ApplicationMethodType.Internal)) {
      onlineApplicationURL = `/applications/start/choose-language?listingId=${listing.id}`
    } else if (hasMethod(listing.applicationMethods, ApplicationMethodType.ExternalLink)) {
      onlineApplicationURL =
        getMethod(listing.applicationMethods, ApplicationMethodType.ExternalLink)
          ?.externalReference || ""
    }
    return onlineApplicationURL
  }

  const getPaperApplications = () => {
    return (
      getMethod(listing.applicationMethods, ApplicationMethodType.FileDownload)
        ?.paperApplications.sort((a, b) => {
          // Ensure English is always first
          if (a.language == "en") return -1
          if (b.language == "en") return 1

          // Otherwise, do regular string sort
          const aLang = t(`languages.${a.language}`)
          const bLang = t(`languages.${b.language}`)
          if (aLang < bLang) return -1
          if (aLang > bLang) return 1
          return 0
        })
        .map((paperApp) => {
          return {
            fileURL: paperApp?.file?.fileId.includes("https")
              ? paperApp?.file?.fileId
              : cloudinaryPdfFromId(
                  paperApp?.file?.fileId || "",
                  process.env.cloudinaryCloudName || ""
                ),
            languageString: t(`languages.${paperApp.language}`),
          }
        }) ?? null
    )
  }

  // Move the above methods into our shared helper library when setup

  const applySidebar = () => (
    <>
      <Waitlist
        isWaitlistOpen={listing.isWaitlistOpen}
        waitlistMaxSize={listing.waitlistMaxSize}
        waitlistCurrentSize={listing.waitlistCurrentSize}
        waitlistOpenSpots={listing.waitlistOpenSpots}
        unitsAvailable={listing.unitsAvailable}
      />
      <GetApplication
        onlineApplicationURL={getOnlineApplicationURL()}
        applicationsDueDate={moment(listing.applicationDueDate).format(
          `MMM. DD, YYYY [${t("t.at")}] h A`
        )}
        applicationsOpen={!appOpenInFuture}
        applicationsOpenDate={moment(listing.applicationOpenDate).format("MMMM D, YYYY")}
        paperApplications={getPaperApplications()}
        paperMethod={!!getMethod(listing.applicationMethods, ApplicationMethodType.FileDownload)}
        postmarkedApplicationsReceivedByDate={moment(
          listing.postmarkedApplicationsReceivedByDate
        ).format(`MMM. DD, YYYY [${t("t.at")}] h A`)}
        applicationPickUpAddressOfficeHours={listing.applicationPickUpAddressOfficeHours}
        applicationPickUpAddress={getAddress(listing.applicationPickUpAddressType, "pickUp")}
        preview={props.preview}
      />
      <SubmitApplication
        applicationMailingAddress={listing.applicationMailingAddress}
        applicationDropOffAddress={getAddress(listing.applicationDropOffAddressType, "dropOff")}
        applicationDropOffAddressOfficeHours={listing.applicationDropOffAddressOfficeHours}
        applicationOrganization={listing.applicationOrganization}
        postmarkedApplicationData={{
          postmarkedApplicationsReceivedByDate: moment(
            listing.postmarkedApplicationsReceivedByDate
          ).format(`MMM. DD, YYYY [${t("t.at")}] h A`),
          developer: listing.developer,
          applicationsDueDate: moment(listing.applicationDueDate).format(
            `MMM. DD, YYYY [${t("t.at")}] h A`
          ),
        }}
      />
    </>
  )

  const applicationsClosed = moment() > moment(listing.applicationDueDate)

  return (
    <article className="flex flex-wrap relative max-w-5xl m-auto">
      <header className="image-card--leader">
        <ImageCard
          title={listing.name}
          imageUrl={imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize))}
          tagLabel={
            listing.reservedCommunityType
              ? t(`listings.reservedCommunityTypes.${props.listing.reservedCommunityType.name}`)
              : undefined
          }
        />
        <div className="p-3">
          <p className="font-alt-sans uppercase tracking-widest text-sm font-semibold">
            {oneLineAddress}
          </p>
          <p className="text-gray-700 text-base">{listing.developer}</p>
          <p className="text-xs">
            <a href={googleMapsHref} target="_blank" aria-label="Opens in new window">
              {t("t.viewOnMap")}
            </a>
          </p>
        </div>
      </header>

      <div className="w-full md:w-2/3 md:mt-6 md:mb-6 md:px-3 md:pr-8">
        {listing.reservedCommunityType && (
          <Message warning={true}>
            {t("listings.reservedFor", {
              type: t(`listings.reservedCommunityTypes.${listing.reservedCommunityType.name}`),
            })}
          </Message>
        )}
        {amiValues.length > 1 &&
          amiValues.map((percent) => {
            const byAMI = listing.unitsSummarized.byAMI.find((item) => {
              return parseInt(item.percent, 10) == percent
            })

            groupedUnits = byAMI ? getSummariesTable(byAMI.byUnitType) : []

            return (
              <React.Fragment key={percent}>
                <h2 className="mt-4 mb-2">{t("listings.percentAMIUnit", { percent: percent })}</h2>
                <GroupedTable
                  headers={unitSummariesHeaders}
                  data={[{ data: groupedUnits }]}
                  responsiveCollapse={true}
                />
              </React.Fragment>
            )
          })}
        {amiValues.length == 1 && (
          <GroupedTable
            headers={unitSummariesHeaders}
            data={[{ data: groupedUnits }]}
            responsiveCollapse={true}
          />
        )}
      </div>
      <div className="w-full md:w-2/3 md:mt-3 md:hidden md:mx-3 border-gray-400 border-b">
        <ApplicationStatus content={appStatusContent} subContent={appStatusSubContent} />
        <div className="mx-4">
          <DownloadLotteryResults
            event={lotteryResults}
            cloudName={process.env.cloudinaryCloudName}
          />
          {hasNonReferralMethods && !applicationsClosed ? <>{applySidebar()}</> : <></>}
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
            {listing.reservedCommunityType && (
              <ListSection title={getReservedTitle()} subtitle={null}>
                <InfoCard
                  title={t(`listings.reservedCommunityTypes.${listing.reservedCommunityType.name}`)}
                  subtitle={t("listings.allUnits")}
                >
                  <ExpandableText className="text-sm text-gray-700">
                    {listing.reservedCommunityDescription}
                  </ExpandableText>
                </InfoCard>
              </ListSection>
            )}

            <ListSection
              title={t("listings.householdMaximumIncome")}
              subtitle={householdMaximumIncomeSubheader}
            >
              <StandardTable
                headers={hmiHeaders}
                data={hmiData}
                responsiveCollapse={true}
                translateData={true}
              />
            </ListSection>

            <ListSection title={t("t.occupancy")} subtitle={occupancyDescription}>
              <StandardTable
                headers={occupancyHeaders}
                data={occupancyData}
                responsiveCollapse={false}
              />
            </ListSection>

            {listing.rentalAssistance && (
              <ListSection
                title={t("listings.sections.rentalAssistanceTitle")}
                subtitle={listing.rentalAssistance}
              />
            )}

            {preferencesSection}

            {(listing.creditHistory ||
              listing.rentalHistory ||
              listing.criminalBackground ||
              buildingSelectionCriteria) && (
              <ListSection
                title={t("listings.sections.additionalEligibilityTitle")}
                subtitle={t("listings.sections.additionalEligibilitySubtitle")}
              >
                <>
                  {listing.creditHistory && (
                    <InfoCard title={t("listings.creditHistory")}>
                      <ExpandableText className="text-sm text-gray-700">
                        {listing.creditHistory}
                      </ExpandableText>
                    </InfoCard>
                  )}
                  {listing.rentalHistory && (
                    <InfoCard title={t("listings.rentalHistory")}>
                      <ExpandableText className="text-sm text-gray-700">
                        {listing.rentalHistory}
                      </ExpandableText>
                    </InfoCard>
                  )}
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
            )}
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
              <ApplicationStatus content={appStatusContent} subContent={appStatusSubContent} />
              <DownloadLotteryResults
                event={lotteryResults}
                cloudName={process.env.cloudinaryCloudName}
              />
              {openHouseEvents && <OpenHouseEvent events={openHouseEvents} />}
              {hasNonReferralMethods && !applicationsClosed && applySidebar()}
              {listing?.referralApplication && (
                <ReferralApplication
                  phoneNumber={
                    listing.referralApplication.phoneNumber ||
                    t("application.referralApplication.phoneNumber")
                  }
                  description={
                    listing.referralApplication.externalReference ||
                    t("application.referralApplication.instructions")
                  }
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
            {!appOpenInFuture && <LeasingAgent listing={listing} />}
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
              {listing.neighborhood && (
                <Description term={t("t.neighborhood")} description={listing.neighborhood} />
              )}
              {listing.yearBuilt && (
                <Description term={t("t.built")} description={listing.yearBuilt} />
              )}
              {listing.smokingPolicy && (
                <Description term={t("t.smokingPolicy")} description={listing.smokingPolicy} />
              )}
              {listing.petPolicy && (
                <Description term={t("t.petsPolicy")} description={listing.petPolicy} />
              )}
              {listing.amenities && (
                <Description term={t("t.propertyAmenities")} description={listing.amenities} />
              )}
              {listing.unitAmenities && (
                <Description term={t("t.unitAmenities")} description={listing.unitAmenities} />
              )}
              {listing.servicesOffered && (
                <Description term={t("t.servicesOffered")} description={listing.servicesOffered} />
              )}
              {listing.accessibility && (
                <Description term={t("t.accessibility")} description={listing.accessibility} />
              )}
              <Description
                term={t("t.unitFeatures")}
                description={
                  <UnitTables
                    units={listing.units}
                    unitSummaries={listing?.unitsSummarized?.byUnitType}
                    disableAccordion={listing.disableUnitsAccordion}
                  />
                }
              />
            </dl>
            <AdditionalFees
              depositMin={listing.depositMin}
              depositMax={listing.depositMax}
              applicationFee={listing.applicationFee}
              costsNotIncluded={listing.costsNotIncluded}
            />
          </div>
        </ListingDetailItem>

        <ListingDetailItem
          imageAlt={t("listings.neighborhoodBuildings")}
          imageSrc="/images/listing-neighborhood.svg"
          title={t("listings.sections.neighborhoodTitle")}
          subtitle={t("listings.sections.neighborhoodSubtitle")}
          desktopClass="bg-primary-lighter"
        >
          <div className="listing-detail-panel">
            <ListingMap
              address={getGenericAddress(listing.buildingAddress)}
              listingName={listing.name}
            />
          </div>
        </ListingDetailItem>

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
  )
}
