import React, { useEffect, useContext } from "react"
import Head from "next/head"
import Markdown from "markdown-to-jsx"
import Layout from "../layouts/application"
import {
  t,
  InfoCardGrid,
  PageHeader,
  MarkdownSection,
  AuthContext,
} from "@bloom-housing/ui-components"
import { UserStatus } from "../lib/constants"
import { PageView, pushGtmEvent } from "@bloom-housing/shared-helpers"
import Resource from "../src/Resource"
import RenderIf from "../src/RenderIf"

// Import Markdown resource cards:
import sidebarContent from "../page_content/resources/sidebar.md"
import alaResourceFinder211 from "../page_content/resources/alaResourceFinder211.md"
import independentLiving from "../page_content/resources/independentLiving.md"
import echoHousing from "../page_content/resources/echoHousing.md"
import hrc from "../page_content/resources/hrc.md"
import depositRentalAssistance from "../page_content/resources/depositRentalAssistance.md"
import hcdDepartment from "../page_content/resources/hcdDepartment.md"
import acBoost from "../page_content/resources/acBoost.md"
import acAntiDisplacement from "../page_content/resources/acAntiDisplacement.md"
import acEmergencyRental from "../page_content/resources/acEmergencyRental.md"
import acHomeownerServices from "../page_content/resources/acHomeownerServices.md"
import acHousingPreservation from "../page_content/resources/acHousingPreservation.md"

const AdditionalResources = () => {
  const pageTitle = t("pageTitle.additionalResources")
  const subTitle = t("pageDescription.additionalResources")

  const { profile } = useContext(AuthContext)

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Additional Resources",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <Layout>
      <Head>
        <title>
          {pageTitle} - {t("nav.siteTitle")}
        </title>
      </Head>

      <PageHeader title={<>{pageTitle}</>} subtitle={subTitle} inverse={true}></PageHeader>

      <section className="md:px-5">
        <article className="markdown max-w-5xl m-auto md:flex">
          <div className="pt-4 md:w-8/12 md:py-0 serif-paragraphs">
            <MarkdownSection>
              <InfoCardGrid
                title={t("additionalResources.immediateHousing.title")}
                subtitle={t("additionalResources.immediateHousing.description")}
              >
                <Resource>{alaResourceFinder211}</Resource>
                <Resource>{independentLiving}</Resource>
                <Resource>{echoHousing}</Resource>
                <Resource>{hrc}</Resource>
                <Resource>{depositRentalAssistance}</Resource>
              </InfoCardGrid>
              <InfoCardGrid title={t("additionalResources.alaCountyHCD.title")}>
                <Resource>{hcdDepartment}</Resource>
                <Resource>{acBoost}</Resource>
                <Resource>{acAntiDisplacement}</Resource>
                <Resource>{acEmergencyRental}</Resource>
                <Resource>{acHomeownerServices}</Resource>
                <Resource>{acHousingPreservation}</Resource>
              </InfoCardGrid>
            </MarkdownSection>
          </div>
          <aside className="pt-4 pb-10 md:w-4/12 md:pl-4 md:py-0 md:shadow-left">
            <MarkdownSection>
              <Markdown
                options={{
                  overrides: {
                    h4: {
                      component: ({ children, ...props }) => (
                        <h4 {...props} className="text-caps-underline">
                          {children}
                        </h4>
                      ),
                    },
                    RenderIf,
                  },
                }}
              >
                {sidebarContent}
              </Markdown>
            </MarkdownSection>
          </aside>
        </article>
      </section>
    </Layout>
  )
}

export default AdditionalResources
