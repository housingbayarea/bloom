/*
 0.1 - Choose Language
 Applicants are given the option to start the Application in one of a number of languages via button group. Once inside the application the applicant can use the language selection at the top of the page.
 https://github.com/bloom-housing/bloom/issues/277
 */
import axios from "axios"
import { useRouter } from "next/router"
import { Button } from "@bloom-housing/ui-seeds"
import {
  ImageCard,
  ActionBlock,
  FormCard,
  ProgressNav,
  t,
  Heading,
  setSiteAlertMessage,
} from "@bloom-housing/ui-components"
import {
  imageUrlFromListing,
  OnClientSide,
  PageView,
  pushGtmEvent,
  AuthContext,
} from "@bloom-housing/shared-helpers"
import FormsLayout from "../../../layouts/forms"
import {
  AppSubmissionContext,
  retrieveApplicationConfig,
} from "../../../lib/applications/AppSubmissionContext"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { Language, ListingStatus } from "@bloom-housing/backend-core/types"
import { useGetApplicationStatusProps } from "../../../lib/hooks"
import { UserStatus } from "../../../lib/constants"

const loadListing = async (listingId, stateFunction, conductor, context, language) => {
  const response = await axios.get(`${process.env.backendApiBase}/listings/${listingId}`, {
    headers: { language },
  })
  conductor.listing = response.data
  const applicationConfig = retrieveApplicationConfig(conductor.listing) // TODO: load from backend
  conductor.config = applicationConfig
  stateFunction(conductor.listing)
  context.syncListing(conductor.listing)
}

const ApplicationChooseLanguage = () => {
  const router = useRouter()
  const [listing, setListing] = useState(null)
  const context = useContext(AppSubmissionContext)
  const { initialStateLoaded, profile } = useContext(AuthContext)
  const { conductor, application } = context

  const listingId = router.query.listingId
  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Choose Language",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  useEffect(() => {
    conductor.reset()
    if (!router.isReady && !listingId) return
    if (router.isReady && !listingId) {
      void router.push("/")
      return
    }

    if (!context.listing || context.listing.id !== listingId) {
      void loadListing(listingId, setListing, conductor, context, "en")
    } else {
      conductor.listing = context.listing
      setListing(context.listing)
    }
    if (typeof window !== "undefined" && router.query.source === "dhp") {
      window.sessionStorage.setItem("bloom-app-source", "dhp")
    }
  }, [router, conductor, context, listingId])

  useEffect(() => {
    if (listing && router.isReady) {
      if (listing?.status !== ListingStatus.active && router.query.preview !== "true") {
        setSiteAlertMessage(t("listings.applicationsClosedRedirect"), "alert")
        void router.push(`/${router.locale}/listing/${listing?.id}/${listing?.urlSlug}`)
      }
    }
  }, [listing, router])

  const currentPageSection = 1

  const imageUrl = listing?.assets
    ? imageUrlFromListing(listing, parseInt(process.env.listingPhotoSize))[0]
    : ""

  const onLanguageSelect = useCallback(
    (language: Language) => {
      conductor.currentStep.save({
        language,
      })
      void loadListing(listingId, setListing, conductor, context, language).then(() => {
        void router.push(conductor.determineNextUrl(), null, { locale: language })
      })
    },
    [conductor, context, listingId, router]
  )

  const { content: appStatusContent } = useGetApplicationStatusProps(listing)

  return (
    <FormsLayout>
      <FormCard header={<Heading priority={1}>{listing?.name}</Heading>}>
        <ProgressNav
          currentPageSection={currentPageSection}
          completedSections={application.completedSections}
          labels={conductor.config.sections.map((label) => t(`t.${label}`))}
          mounted={OnClientSide()}
        />
      </FormCard>
      <FormCard className="overflow-hidden">
        <div className="form-card__lead">
          <h1 className="form-card__title is-borderless">
            {t("application.chooseLanguage.letsGetStarted")}
          </h1>
        </div>

        {listing && (
          <div className="form-card__group p-0 m-0">
            <ImageCard
              imageUrl={imageUrl}
              statuses={[{ content: appStatusContent }]}
              description={listing.name}
            />
          </div>
        )}

        <div className="form-card__pager">
          <div className="form-card__pager-row px-4">
            {listing?.applicationConfig.languages.length > 1 && (
              <>
                <div className="w-full">
                  <Heading styleType="underlineWeighted">
                    {t("application.chooseLanguage.chooseYourLanguage")}
                  </Heading>
                </div>
                {listing.applicationConfig.languages.map((lang, index) => (
                  <Button
                    variant="primary-outlined"
                    className="language-select mx-1 mb-2"
                    onClick={() => {
                      onLanguageSelect(lang)
                    }}
                    key={index}
                  >
                    {t(`applications.begin.${lang}`)}
                  </Button>
                ))}
              </>
            )}
          </div>

          {initialStateLoaded && !profile && (
            <>
              <ActionBlock
                className="border-t border-gray-450"
                header={<Heading priority={2}>{t("account.haveAnAccount")}</Heading>}
                subheader={t("application.chooseLanguage.signInSaveTime")}
                background="primary-lighter"
                actions={[
                  <Button
                    variant="primary-outlined"
                    href={`/sign-in?redirectUrl=/applications/start/choose-language&listingId=${listingId?.toString()}`}
                    id={"app-choose-language-sign-in-button"}
                    size="sm"
                  >
                    {t("nav.signIn")}
                  </Button>,
                ]}
              />
              <ActionBlock
                className="border-t border-gray-450"
                header={
                  <Heading priority={2}>{t("authentication.createAccount.noAccount")}</Heading>
                }
                background="primary-lighter"
                actions={[
                  <Button
                    variant="primary-outlined"
                    href={"/create-account"}
                    id={"app-choose-language-create-account-button"}
                    size="sm"
                  >
                    {t("account.createAccount")}
                  </Button>,
                ]}
              />
            </>
          )}
        </div>
      </FormCard>
    </FormsLayout>
  )
}

export default ApplicationChooseLanguage
