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
import doorwayPortal from "../page_content/resources/doorwayPortal.md"
import alaCounty from "../page_content/resources/alaCounty.md"
import sfCounty from "../page_content/resources/sfCounty.md"
import smCounty from "../page_content/resources/smCounty.md"
import affordableHousingSCC from "../page_content/resources/affordableHousingSCC.md"
import affordableHousingSJ from "../page_content/resources/affordableHousingSJ.md"
import section8 from "../page_content/resources/section8.md"
import homelessHotline from "../page_content/resources/homelessHotline.md"
import housingChoices from "../page_content/resources/housingChoices.md"
import unitedWay211 from "../page_content/resources/unitedWay211.md"
import sidebarContent from "../page_content/resources/sidebar.md"

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
                title={t("additionalResources.doorwayPortal.title")}
                subtitle={t("additionalResources.doorwayPortal.description")}
              >
                <Resource>{doorwayPortal}</Resource>
                <Resource>{alaCounty}</Resource>
                <Resource>{sfCounty}</Resource>
                <Resource>{smCounty}</Resource>
              </InfoCardGrid>
              <InfoCardGrid
                title={t("additionalResources.sccAffordableHousing.title")}
                subtitle={t("additionalResources.sccAffordableHousing.description")}
              >
                <Resource>{affordableHousingSCC}</Resource>
                <Resource>{affordableHousingSJ}</Resource>
                <Resource>{section8}</Resource>
              </InfoCardGrid>
              <InfoCardGrid title={t("additionalResources.cityRegionResources.title")}>
                <Resource>{homelessHotline}</Resource>
                <Resource>{housingChoices}</Resource>
                <Resource>{unitedWay211}</Resource>
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
