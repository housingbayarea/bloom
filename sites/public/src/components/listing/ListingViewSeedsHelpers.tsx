import React from "react"
import { UseFormMethods } from "react-hook-form"
import dayjs from "dayjs"
import { Button, Dialog, Link } from "@bloom-housing/ui-seeds"
import {
  ApplicationAddressTypeEnum,
  ApplicationMethod,
  ApplicationMethodsTypeEnum,
  FeatureFlagEnum,
  IdDTO,
  Jurisdiction,
  Listing,
  ListingMultiselectQuestion,
  MultiselectQuestionsApplicationSectionEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import {
  FieldGroup,
  Form,
  getTranslationWithArguments,
  StackedTable,
  StandardTableData,
  t,
  TableHeaders,
} from "@bloom-housing/ui-components"
import {
  cloudinaryPdfFromId,
  getOccupancyDescription,
  stackedOccupancyTable,
  stackedUnitGroupsOccupancyTable,
} from "@bloom-housing/shared-helpers"
import { downloadExternalPDF, isFeatureFlagOn } from "../../lib/helpers"
import { CardList, ContentCardProps } from "../../patterns/CardList"
import { OrderedCardList } from "../../patterns/OrderedCardList"
import { ReadMore } from "../../patterns/ReadMore"

export const getFilteredMultiselectQuestions = (
  multiselectQuestions: ListingMultiselectQuestion[],
  section: MultiselectQuestionsApplicationSectionEnum
) => {
  return multiselectQuestions.filter(
    (elem) =>
      elem.multiselectQuestions.applicationSection === section &&
      !elem.multiselectQuestions.hideFromListing
  )
}

export const getMultiselectQuestionData = (multiselectQuestions: ListingMultiselectQuestion[]) => {
  return multiselectQuestions.map((listingMultiselectQuestion, index) => {
    return {
      ordinal: index + 1,
      links: listingMultiselectQuestion?.multiselectQuestions?.links,
      title: listingMultiselectQuestion?.multiselectQuestions?.text,
      description: listingMultiselectQuestion?.multiselectQuestions?.description,
    }
  })
}

export const hasMethod = (
  applicationMethods: ApplicationMethod[],
  type: ApplicationMethodsTypeEnum
) => {
  return applicationMethods.some((method) => method.type == type)
}

export const getMethod = (
  applicationMethods: ApplicationMethod[],
  type: ApplicationMethodsTypeEnum
) => {
  return applicationMethods.find((method) => method.type == type)
}

export const getPaperApplications = (applicationMethods: ApplicationMethod[]) => {
  return (
    getMethod(applicationMethods, ApplicationMethodsTypeEnum.FileDownload)
      ?.paperApplications.sort((a, b) => {
        // Ensure English is always first
        if (a.language == "en") return -1
        if (b.language == "en") return 1

        // Otherwise, do regular string sort
        return t(`languages.${a.language}`).localeCompare(t(`languages.${b.language}`))
      })
      .map((paperApp) => {
        return {
          fileURL: paperApp?.assets?.fileId?.includes("https")
            ? paperApp?.assets?.fileId
            : cloudinaryPdfFromId(
                paperApp?.assets?.fileId || "",
                process.env.cloudinaryCloudName || ""
              ),
          languageString: t(`languages.${paperApp.language}`),
        }
      }) ?? null
  )
}

export const getOnlineApplicationURL = (
  applicationMethods: ApplicationMethod[],
  listingId: string,
  preview: boolean
) => {
  let onlineApplicationURL
  let isCommonApp = false
  if (hasMethod(applicationMethods, ApplicationMethodsTypeEnum.Internal)) {
    onlineApplicationURL = `/applications/start/choose-language?listingId=${listingId}`
    onlineApplicationURL += `${preview ? "&preview=true" : ""}`
    isCommonApp = true
  } else if (hasMethod(applicationMethods, ApplicationMethodsTypeEnum.ExternalLink)) {
    onlineApplicationURL =
      getMethod(applicationMethods, ApplicationMethodsTypeEnum.ExternalLink)?.externalReference ||
      ""
  }
  return { url: onlineApplicationURL, isCommonApp }
}

export const getHasNonReferralMethods = (listing: Listing) => {
  return listing?.applicationMethods
    ? listing.applicationMethods.some(
        (method) => method.type !== ApplicationMethodsTypeEnum.Referral
      )
    : false
}

export const getAccessibilityFeatures = (listing: Listing) => {
  const enabledFeatures = Object.entries(listing?.listingFeatures ?? {})
    .filter(([_, value]) => value)
    .map((item) => item[0])
  if (enabledFeatures.length > 0) {
    return enabledFeatures.map((feature, index) => {
      return `${t(`eligibility.accessibility.${feature}`)}${
        index < enabledFeatures.length - 1 ? ", " : ""
      }`
    })
  }

  return []
}

export const getUtilitiesIncluded = (listing: Listing) => {
  const enabledUtilities = Object.entries(listing?.listingUtilities ?? {})
    .filter(([_, value]) => value)
    .map((item) => item[0])

  if (enabledUtilities.length > 0) {
    return enabledUtilities.map((utility, index) => {
      return `${t(`listings.utilities.${utility}`)}${
        index < enabledUtilities.length - 1 ? ", " : ""
      }`
    })
  }

  return []
}

export const getFeatures = (
  listing: Listing,
  jurisdiction: Jurisdiction
): { heading: string; subheading: string }[] => {
  const features = []
  if (listing.yearBuilt) {
    features.push({ heading: t("t.built"), subheading: listing.yearBuilt })
  }
  if (listing.smokingPolicy) {
    features.push({ heading: t("t.smokingPolicy"), subheading: listing.smokingPolicy })
  }
  if (listing.petPolicy) {
    features.push({ heading: t("t.petsPolicy"), subheading: listing.petPolicy })
  }
  if (listing.amenities) {
    features.push({ heading: t("t.propertyAmenities"), subheading: listing.amenities })
  }
  if (listing.unitAmenities) {
    features.push({ heading: t("t.unitAmenities"), subheading: listing.unitAmenities })
  }
  if (listing.servicesOffered) {
    features.push({ heading: t("t.servicesOffered"), subheading: listing.servicesOffered })
  }
  const accessibilityFeatures = getAccessibilityFeatures(listing)
  const enableAccessibilityFeatures = jurisdiction?.featureFlags?.some(
    (flag) => flag.name === "enableAccessibilityFeatures" && flag.active
  )
  if (!!accessibilityFeatures.length && enableAccessibilityFeatures) {
    features.push({ heading: t("t.accessibility"), subheading: accessibilityFeatures })
  }
  if (listing.accessibility) {
    features.push({ heading: t("t.additionalAccessibility"), subheading: listing.accessibility })
  }

  return features
}

export const getAmiValues = (listing: Listing) => {
  return listing?.unitsSummarized?.amiPercentages
    ? listing.unitsSummarized.amiPercentages
        .map((percent) => {
          const percentInt = parseInt(percent, 10)
          return percentInt
        })
        .sort(function (a, b) {
          return a - b
        })
    : []
}

export const getHmiData = (listing: Listing): StandardTableData => {
  return listing?.unitsSummarized?.hmi?.rows.map((row) => {
    const amiRows = Object.keys(row).reduce((acc, rowContent) => {
      acc[rowContent] = { content: row[rowContent] }
      return acc
    }, {})
    return {
      ...amiRows,
      sizeColumn: {
        content: (
          <strong>
            {listing.units[0].bmrProgramChart ? t(row["sizeColumn"]) : row["sizeColumn"]}
          </strong>
        ),
      },
    }
  })
}

export const getStackedHmiData = (listing: Listing) => {
  return (
    listing?.unitsSummarized?.hmi?.rows.map((row) => {
      const amiRows = Object.keys(row).reduce((acc, rowContent) => {
        acc[rowContent] = { cellText: getTranslationWithArguments(row[rowContent].toString()) }
        return acc
      }, {})

      return {
        ...amiRows,
        sizeColumn: {
          cellText: listing.units[0].bmrProgramChart ? t(row["sizeColumn"]) : row["sizeColumn"],
        },
      }
    }) || []
  )
}

export const getStackedUnitGroupsHmiData = (listing: Listing) => {
  if (listing.unitGroups !== undefined && listing.unitGroups.length > 0) {
    const { rows } = listing.unitGroupsSummarized.householdMaxIncomeSummary

    return rows.map((row) => {
      const obj = {}

      for (const key in row) {
        if (key === "householdSize") {
          obj[key] = {
            cellText: `${row[key]} ${row[key] === "1" ? t("t.person") : t("t.people")}`,
          }
        } else {
          obj[key] = {
            cellText: `$${row[key].toLocaleString("en")} ${t("t.perYear")}`,
          }
        }
      }

      return obj
    })
  }

  return []
}

export const getUnitGroupsHmiHeaders = (listing: Listing): TableHeaders => {
  const hmiHeaders: TableHeaders = {}

  if (listing.unitGroups !== undefined && listing.unitGroups.length > 0) {
    const { columns } = listing.unitGroupsSummarized.householdMaxIncomeSummary

    for (const key in columns) {
      if (key === "householdSize") {
        hmiHeaders[key] = t(`listings.householdSize`)
      } else {
        hmiHeaders[key] = t("listings.percentAMIUnit", { percent: key.replace("percentage", "") })
      }
    }
  }

  return hmiHeaders
}

export type AddressLocation = "dropOff" | "pickUp" | "mailIn"

export const getAddress = (
  addressType: ApplicationAddressTypeEnum | undefined,
  location: AddressLocation,
  listing: Listing
) => {
  const addressMap = {
    dropOff: listing.listingsApplicationDropOffAddress,
    pickUp: listing.listingsApplicationPickUpAddress,
    mailIn: listing.listingsApplicationMailingAddress,
  }
  if (addressType === ApplicationAddressTypeEnum.leasingAgent) {
    return listing.listingsLeasingAgentAddress
  }
  return addressMap[location]
}

export const getReservedTitle = (reservedCommunityType: IdDTO) => {
  if (
    reservedCommunityType.name === "senior55" ||
    reservedCommunityType.name === "senior62" ||
    reservedCommunityType.name === "senior"
  ) {
    return t("listings.reservedCommunitySeniorTitle")
  } else return t("listings.reservedCommunityTitleDefault")
}

export const getDateString = (date: Date, format: string) => {
  return date ? dayjs(date).format(format) : null
}

export const getBuildingSelectionCriteria = (listing: Listing) => {
  if (listing.listingsBuildingSelectionCriteriaFile) {
    return (
      <div className={"seeds-m-bs-content"}>
        <Link
          href={cloudinaryPdfFromId(
            listing.listingsBuildingSelectionCriteriaFile.fileId,
            process.env.cloudinaryCloudName
          )}
        >
          {t("listings.moreBuildingSelectionCriteria")}
        </Link>
      </div>
    )
  } else if (listing.buildingSelectionCriteria) {
    return (
      <div className={"seeds-m-bs-content"}>
        <Link href={listing.buildingSelectionCriteria}>
          {t("listings.moreBuildingSelectionCriteria")}
        </Link>
      </div>
    )
  }
}

export type EligibilitySection = {
  header: string
  subheader?: string
  content?: React.ReactNode
  note?: string
  hide?: boolean
}

export const getEligibilitySections = (
  jurisdiction: Jurisdiction,
  listing: Listing
): EligibilitySection[] => {
  const eligibilityFeatures: EligibilitySection[] = []

  const swapCommunityTypeWithPrograms = isFeatureFlagOn(
    jurisdiction,
    FeatureFlagEnum.swapCommunityTypeWithPrograms
  )
  const enableUnitGroups = isFeatureFlagOn(jurisdiction, FeatureFlagEnum.enableUnitGroups)

  const disableListingPreferences = isFeatureFlagOn(
    jurisdiction,
    FeatureFlagEnum.disableListingPreferences
  )

  // Reserved community type
  if (!swapCommunityTypeWithPrograms && listing.reservedCommunityTypes) {
    eligibilityFeatures.push({
      header: getReservedTitle(listing.reservedCommunityTypes),
      content: (
        <CardList
          cardContent={[
            {
              heading: t(`listings.reservedCommunityTypes.${listing.reservedCommunityTypes.name}`),
              description: listing.reservedCommunityDescription,
            },
          ]}
        />
      ),
    })
  }

  // HMI
  const stackedUnitGroupsHmiData = getStackedUnitGroupsHmiData(listing)
  const stackedHmiData = getStackedHmiData(listing)
  eligibilityFeatures.push({
    header: t("listings.householdMaximumIncome"),
    subheader: listing?.units[0]?.bmrProgramChart
      ? t("listings.forIncomeCalculationsBMR")
      : t("listings.forIncomeCalculations"),
    content: (
      <StackedTable
        headers={
          enableUnitGroups
            ? getUnitGroupsHmiHeaders(listing)
            : ((listing?.unitsSummarized?.hmi?.columns || []) as TableHeaders)
        }
        stackedData={enableUnitGroups ? stackedUnitGroupsHmiData : stackedHmiData}
      />
    ),
    hide:
      (enableUnitGroups && stackedUnitGroupsHmiData.length === 0) ||
      (!enableUnitGroups && stackedHmiData.length === 0),
  })

  // Occupancy
  const stackedUnitGroupsOccupancyData = stackedUnitGroupsOccupancyTable(listing)
  const stackedOccupancyData = stackedOccupancyTable(listing)

  eligibilityFeatures.push({
    header: t("t.occupancy"),
    subheader: getOccupancyDescription(listing, enableUnitGroups),
    content: (
      <StackedTable
        headers={{
          unitType: "t.unitType",
          occupancy: "t.occupancy",
        }}
        stackedData={enableUnitGroups ? stackedUnitGroupsOccupancyData : stackedOccupancyData}
      />
    ),
    hide:
      (enableUnitGroups && stackedUnitGroupsOccupancyData.length === 0) ||
      (!enableUnitGroups && stackedOccupancyData.length === 0),
  })

  // Rental Assistance
  if (listing.rentalAssistance) {
    eligibilityFeatures.push({
      header: t("listings.sections.rentalAssistanceTitle"),
      subheader: listing.rentalAssistance,
    })
  }

  // Preferences
  const preferences = getFilteredMultiselectQuestions(
    listing.listingMultiselectQuestions,
    MultiselectQuestionsApplicationSectionEnum.preferences
  )
  if (preferences?.length > 0 && !disableListingPreferences) {
    eligibilityFeatures.push({
      header: t("listings.sections.housingPreferencesTitle"),
      subheader: t("listings.sections.housingPreferencesSubtitle"),
      note: t("listings.remainingUnitsAfterPreferenceConsideration"),
      content: (
        <OrderedCardList
          cardContent={preferences.map((question) => {
            return {
              heading: question.multiselectQuestions.text,
              description: question.multiselectQuestions.description,
            }
          })}
        />
      ),
    })
  }

  // Programs
  const programs = getFilteredMultiselectQuestions(
    listing.listingMultiselectQuestions,
    MultiselectQuestionsApplicationSectionEnum.programs
  )
  if (programs?.length > 0) {
    eligibilityFeatures.push(
      !swapCommunityTypeWithPrograms
        ? {
            header: t("listings.sections.housingProgramsTitle"),
            subheader: t("listings.sections.housingProgramsSubtitle"),
            note: t("listings.remainingUnitsAfterPrograms"),
            content: (
              <CardList
                cardContent={programs.map((question) => {
                  return {
                    heading: question.multiselectQuestions.text,
                    description: question.multiselectQuestions.description,
                  }
                })}
              />
            ),
          }
        : {
            header: t("listings.communityTypes"),
            subheader: t("listings.communityTypesDescription"),
            note: t("listings.communityTypesNote"),
            content: (
              <CardList
                cardContent={programs.map((question) => {
                  return {
                    heading: t(
                      question.multiselectQuestions.untranslatedText
                        ? t(
                            `listingFilters.program.${question.multiselectQuestions.untranslatedText}`
                          )
                        : t(`listingFilters.program.${question.multiselectQuestions.text}`)
                    ),
                    description: question.multiselectQuestions.description,
                  }
                })}
              />
            ),
          }
    )
  }

  // Additional Eligibility Rules
  if (
    listing.creditHistory ||
    listing.rentalHistory ||
    listing.criminalBackground ||
    listing.listingsBuildingSelectionCriteriaFile ||
    listing.buildingSelectionCriteria
  ) {
    const cardContent: ContentCardProps[] = []
    if (listing.creditHistory)
      cardContent.push({
        heading: t("listings.creditHistory"),
        description: <ReadMore content={listing.creditHistory} />,
      })
    if (listing.rentalHistory)
      cardContent.push({
        heading: t("listings.rentalHistory"),
        description: <ReadMore content={listing.rentalHistory} />,
      })
    if (listing.criminalBackground)
      cardContent.push({
        heading: t("listings.criminalBackground"),
        description: <ReadMore content={listing.criminalBackground} />,
      })
    eligibilityFeatures.push({
      header: t("listings.sections.additionalEligibilityTitle"),
      subheader: t("listings.sections.additionalEligibilitySubtitle"),
      content: (
        <>
          <CardList cardContent={cardContent} />
          {getBuildingSelectionCriteria(listing)}
        </>
      ),
    })
  }
  return eligibilityFeatures
}

export const getAdditionalInformation = (listing: Listing) => {
  const cardContent: ContentCardProps[] = []
  if (listing.requiredDocuments)
    cardContent.push({
      heading: t("listings.requiredDocuments"),
      description: <ReadMore content={listing.requiredDocuments} />,
    })
  if (listing.programRules)
    cardContent.push({
      heading: t("listings.importantProgramRules"),
      description: <ReadMore content={listing.programRules} />,
    })
  if (listing.specialNotes)
    cardContent.push({
      heading: t("listings.specialNotes"),
      description: <ReadMore content={listing.specialNotes} />,
    })
  return cardContent
}

interface PaperApplicationDialogProps {
  showDialog: boolean
  setShowDialog: React.Dispatch<React.SetStateAction<boolean>>
  register: UseFormMethods["register"]
  paperApplications: {
    fileURL: string
    languageString: string
  }[]
  paperApplicationUrl: string
  listingName: string
}

export const PaperApplicationDialog = (props: PaperApplicationDialogProps) => {
  return (
    <Dialog
      isOpen={!!props.showDialog}
      onClose={() => props.setShowDialog(false)}
      ariaLabelledBy="get-application-header"
    >
      <Dialog.Header id="get-application-header">{t("listings.chooseALanguage")}</Dialog.Header>
      <Dialog.Content>
        <Form>
          <fieldset>
            <legend className="sr-only">{t("listings.chooseALanguage")}</legend>
            <FieldGroup
              name="paperApplicationLanguage"
              fieldGroupClassName="grid grid-cols-1"
              fieldClassName="ml-0"
              type="radio"
              register={props.register}
              validation={{ required: true }}
              fields={props.paperApplications?.map((app, index) => ({
                id: app.languageString,
                label: app.languageString,
                value: app.fileURL,
                defaultChecked: index === 0,
              }))}
              dataTestId={"paper-application-language"}
            />
          </fieldset>
        </Form>
      </Dialog.Content>
      <Dialog.Footer>
        <Button
          variant="primary"
          size="sm"
          onClick={async () => {
            await downloadExternalPDF(props.paperApplicationUrl, props.listingName)
            props.setShowDialog(false)
          }}
        >
          {t("t.download")}
        </Button>
        <Button
          variant="primary-outlined"
          size="sm"
          onClick={() => {
            props.setShowDialog(false)
          }}
        >
          {t("t.cancel")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
