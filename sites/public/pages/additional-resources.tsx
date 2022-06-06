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
import haAlamedaCounty from "../page_content/resources/haAlamedaCounty.md"
import haBerkley from "../page_content/resources/haBerkley.md"
import haAlamedaCity from "../page_content/resources/haAlamedaCity.md"
import haLivermore from "../page_content/resources/haLivermore.md"
import haOakland from "../page_content/resources/haOakland.md"
import oaklandHeader from "../page_content/resources/oaklandHeader.md"
import baCommunityServiceOakland from "../page_content/resources/baCommunityServiceOakland.md"
import bossCoordinatedEntry from "../page_content/resources/bossCoordinatedEntry.md"
import eocpCoordinatedEntry from "../page_content/resources/eocpCoordinatedEntry.md"
import familyFrontDoorOakland from "../page_content/resources/familyFrontDoorOakland.md"
import keepOaklandHoused from "../page_content/resources/keepOaklandHoused.md"
import northCountyHeader from "../page_content/resources/northCountyHeader.md"
import baCommunityServiceNorth from "../page_content/resources/baCommunityServiceNorth.md"
import familyFrontDoorNorth from "../page_content/resources/familyFrontDoorNorth.md"
import womensDropInCenter from "../page_content/resources/womensDropInCenter.md"
import midCountyHeader from "../page_content/resources/midCountyHeader.md"
import buildingFuturesSanLeandro from "../page_content/resources/buildingFuturesSanLeandro.md"
import buildingFuturesAlameda from "../page_content/resources/buildingFuturesAlameda.md"
import baCommunityServiceHayward from "../page_content/resources/baCommunityServiceHayward.md"
import eastCountyHeader from "../page_content/resources/eastCountyHeader.md"
import adobeServicesEast from "../page_content/resources/adobeServicesEast.md"
import adobeServicesSouth from "../page_content/resources/adobeServicesSouth.md"
import fremontFamily from "../page_content/resources/fremontFamily.md"
import southCountyHeader from "../page_content/resources/southCountyHeader.md"

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
              <InfoCardGrid
                title={t("additionalResources.alaHousingAuthorities.title")}
                subtitle={t("additionalResources.alaHousingAuthorities.description")}
              >
                <Resource>{haAlamedaCounty}</Resource>
                <Resource>{haBerkley}</Resource>
                <Resource>{haAlamedaCity}</Resource>
                <Resource>{haLivermore}</Resource>
                <Resource>{haOakland}</Resource>
              </InfoCardGrid>
              <section className="info-cards">
                <header className="info-cards__header">
                  <h2 className="info-cards__title">
                    {t("additionalResources.cityRegionServices.title")}
                  </h2>
                  <p className="info-cards__subtitle">
                    <a href="https://docs.google.com/document/d/1U6d4KIXAFMMF8E2H-VAi3gpLy71L3Tvm/edit?usp=sharing&ouid=104857760863458372387&rtpof=true&sd=true">
                      {t("additionalResources.cityRegionServices.description")}
                    </a>
                  </p>
                </header>
              </section>
              <Markdown>{oaklandHeader}</Markdown>
              <div className="info-cards__grid">
                <Resource>{baCommunityServiceOakland}</Resource>
                <Resource>{bossCoordinatedEntry}</Resource>
                <Resource>{eocpCoordinatedEntry}</Resource>
                <Resource>{familyFrontDoorOakland}</Resource>
                <Resource>{keepOaklandHoused}</Resource>
              </div>
              <Markdown
                options={{
                  overrides: {
                    RenderIf,
                  },
                }}
              >
                {northCountyHeader}
              </Markdown>
              <div className="info-cards__grid">
                <Resource>{baCommunityServiceNorth}</Resource>
                <Resource>{familyFrontDoorNorth}</Resource>
                <Resource>{womensDropInCenter}</Resource>
              </div>
              <Markdown
                options={{
                  overrides: {
                    RenderIf,
                  },
                }}
              >
                {midCountyHeader}
              </Markdown>
              <div className="info-cards__grid">
                <Resource>{buildingFuturesSanLeandro}</Resource>
                <Resource>{buildingFuturesAlameda}</Resource>
                <Resource>{baCommunityServiceHayward}</Resource>
              </div>
              <Markdown
                options={{
                  overrides: {
                    RenderIf,
                  },
                }}
              >
                {eastCountyHeader}
              </Markdown>
              <div className="info-cards__grid">
                <Resource>{adobeServicesEast}</Resource>
              </div>
              <Markdown
                options={{
                  overrides: {
                    RenderIf,
                  },
                }}
              >
                {southCountyHeader}
              </Markdown>
              <div className="info-cards__grid">
                <Resource>{adobeServicesSouth}</Resource>
                <Resource>{fremontFamily}</Resource>
              </div>
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
