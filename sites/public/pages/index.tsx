import React, { useContext, useEffect, useState } from "react"
import Head from "next/head"
import { Jurisdiction } from "@bloom-housing/backend-core/types"
import {
  AuthContext,
  AlertBox,
  LinkButton,
  Hero,
  t,
  SiteAlert,
  ActionBlock,
  Icon,
} from "@bloom-housing/ui-components"
import { PageView, pushGtmEvent } from "@bloom-housing/shared-helpers"
import { UserStatus } from "../lib/constants"
import Layout from "../layouts/application"
import { ConfirmationModal } from "../src/ConfirmationModal"
import { MetaTags } from "../src/MetaTags"
import { fetchJurisdictionByName } from "../lib/hooks"
import Markdown from "markdown-to-jsx"

import pageContent from "../page_content/homepage_how_it_works.md"

interface IndexProps {
  jurisdiction: Jurisdiction
}

export default function Home(props: IndexProps) {
  const blankAlertInfo = {
    alertMessage: null,
    alertType: null,
  }
  const { profile } = useContext(AuthContext)
  const [alertInfo, setAlertInfo] = useState(blankAlertInfo)

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Housing Portal",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  const heroTitle = (
    <>
      {t("welcome.title")} <em>{t("region.name")}</em>
    </>
  )

  const metaDescription = t("pageDescription.welcome", { regionName: t("region.name") })
  const metaImage = "" // TODO: replace with hero image
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  return (
    <Layout>
      <Head>
        <title>{t("nav.siteTitle")}</title>
      </Head>
      <MetaTags title={t("nav.siteTitle")} image={metaImage} description={metaDescription} />
      <div className="flex absolute w-full flex-col items-center">
        <SiteAlert type="alert" className={alertClasses} />
        <SiteAlert type="success" className={alertClasses} timeout={30000} />
      </div>
      {alertInfo.alertMessage && (
        <AlertBox
          className=""
          onClose={() => setAlertInfo(blankAlertInfo)}
          type={alertInfo.alertType}
        >
          {alertInfo.alertMessage}
        </AlertBox>
      )}
      <Hero title={heroTitle} buttonTitle={t("welcome.seeRentalListings")} buttonLink="/listings" />
      <div className="homepage-extra">
        <div className="action-blocks mt-4 mb-4 w-full">
          {props.jurisdiction && props.jurisdiction.notificationsSignUpURL && (
            <ActionBlock
              className="flex-1"
              header={t("welcome.signUp")}
              icon={<Icon size="3xl" symbol="envelope" />}
              actions={[
                <LinkButton key={"sign-up"} href={props.jurisdiction.notificationsSignUpURL}>
                  {t("welcome.signUpToday")}
                </LinkButton>,
              ]}
            />
          )}
          <ActionBlock
            className="flex-1"
            header={t("welcome.seeMoreOpportunitiesTruncated")}
            icon={<Icon size="3xl" symbol="house" />}
            actions={[
              <LinkButton href="/additional-resources" key={"additional-resources"}>
                {t("welcome.viewAdditionalHousingTruncated")}
              </LinkButton>,
            ]}
          />
        </div>
      </div>
      {process.env.showHIW && (
        <div className="homepage-extra bg-gray-100 px-4 pb-16">
          <ActionBlock
            className="pb-0 -mb-1"
            header={t("welcome.howDoesItWork")}
            icon={<Icon size="3xl" symbol="frontDoor" />}
            actions={[]}
          />

          <p className="text-center">{t("welcome.learnHowToApply")}</p>

          <div className="markdown max-w-7xl">
            <Markdown
              options={{
                overrides: {
                  ol: {
                    component: ({ ...props }) => (
                      <ol {...props} className="process-list has-horizontal-layout" />
                    ),
                  },
                  h4: {
                    component: ({ children, ...props }) => (
                      <h4
                        {...props}
                        className="font-alt-sans font-semibold text-base text-black mb-1 mt-0"
                      >
                        {children}
                      </h4>
                    ),
                  },
                  p: {
                    component: ({ children, ...props }) => (
                      <p {...props} className="text-gray-700 text-sm mt-3 mb-2">
                        {children}
                      </p>
                    ),
                  },
                },
              }}
            >
              {pageContent}
            </Markdown>
          </div>

          <LinkButton href="/how-it-works">{t("welcome.readAboutHowItWorks")}</LinkButton>
        </div>
      )}
      <ConfirmationModal
        setSiteAlertMessage={(alertMessage, alertType) => setAlertInfo({ alertMessage, alertType })}
      />
    </Layout>
  )
}

export async function getStaticProps() {
  const jurisdiction = await fetchJurisdictionByName()

  return {
    props: { jurisdiction },
  }
}
