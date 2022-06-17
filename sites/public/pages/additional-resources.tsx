import React, { useEffect, useContext } from "react"
import Head from "next/head"
import Markdown from "markdown-to-jsx"
import Layout from "../layouts/application"
import { t, InfoCardGrid, PageHeader, MarkdownSection } from "@bloom-housing/ui-components"
import { UserStatus } from "../lib/constants"
import { AuthContext, PageView, pushGtmEvent } from "@bloom-housing/shared-helpers"
import Resource from "../src/Resource"
import SMCHousingSearch from "../page_content/resources/SMCHousingSearch.md"
import HavenConnect from "../page_content/resources/HavenConnect.md"
import AffordableRentalHousingList from "../page_content/resources/AffordableRentalHousingList.md"
import HIPHousing from "../page_content/resources/HIPHousing.md"
import HAotCoSM from "../page_content/resources/HAotCoSM.md"
import CIH from "../page_content/resources/CIH.md"
import BayArea211 from "../page_content/resources/BayArea211.md"
import ProjectSentinel from "../page_content/resources/ProjectSentinel.md"
import HousingChoices from "../page_content/resources/HousingChoices.md"
import Sidebar from "../page_content/resources/Sidebar.md"
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
                title={t("additionalResources.rentals")}
                subtitle={t("additionalResources.rentalsDescription")}
              >
                <Resource>{SMCHousingSearch}</Resource>
                <Resource>{HavenConnect}</Resource>
                <Resource>{AffordableRentalHousingList}</Resource>
              </InfoCardGrid>
              <InfoCardGrid
                title={t("additionalResources.sharedHousing")}
                subtitle={t("additionalResources.sharedHousingDescription")}
              >
                <Resource>{HIPHousing}</Resource>
              </InfoCardGrid>
              <InfoCardGrid
                title={t("additionalResources.otherResources")}
                subtitle={t("additionalResources.otherResourcesDescription")}
              >
                <Resource>{HAotCoSM}</Resource>
                <Resource>{CIH}</Resource>
                <Resource>{BayArea211}</Resource>
                <Resource>{ProjectSentinel}</Resource>
                <Resource>{HousingChoices}</Resource>
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
                  },
                }}
              >
                {Sidebar}
              </Markdown>
            </MarkdownSection>
          </aside>
        </article>
      </section>
    </Layout>
  )
}

export default AdditionalResources
