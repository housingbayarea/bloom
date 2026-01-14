import React, { useEffect, useContext, useState } from "react"
import { PageHeader, MarkdownSection, t } from "@bloom-housing/ui-components"
import Markdown from "markdown-to-jsx"
import { PageView, pushGtmEvent, AuthContext } from "@bloom-housing/shared-helpers"
import { UserStatus } from "../../lib/constants"
import Layout from "../../layouts/application"
import RenderIf from "../../RenderIf"

const getDisclaimerSection = async (jurisdiction: string) => {
  return import(
    `../../page_content/jurisdiction_overrides/${jurisdiction
      .toLowerCase()
      .replace(" ", "_")}/disclaimer.md`
  )
}

const DisclaimerDeprecated = () => {
  const { profile } = useContext(AuthContext)
  const [disclaimerSection, setDisclaimerSection] = useState("")

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Disclaimer",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  useEffect(() => {
    const loadPageContent = async () => {
      const disclaimer = await getDisclaimerSection(process.env.jurisdictionName || "")
      setDisclaimerSection(disclaimer.default)
    }
    loadPageContent().catch(() => {
      console.log("disclaimer section doesn't exist")
    })
  }, [])

  const pageTitle = <>{t("pageTitle.disclaimer")}</>

  return (
    <Layout>
      <PageHeader inverse={true} title={pageTitle} />
      <MarkdownSection>
        <Markdown
          options={{
            overrides: {
              RenderIf,
            },
          }}
        >
          {disclaimerSection.toString()}
        </Markdown>
      </MarkdownSection>
    </Layout>
  )
}

export default DisclaimerDeprecated
