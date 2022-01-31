import React, { useEffect, useContext } from "react"
import { AuthContext, MarkdownSection, PageHeader, t } from "@bloom-housing/ui-components"
import Markdown from "markdown-to-jsx"
import { useRouter } from "next/router"
import { PageView, pushGtmEvent } from "@bloom-housing/shared-helpers"
import { UserStatus } from "../lib/constants"
import Layout from "../layouts/application"
import pageContentEN from "../page_content/privacy_policy-en.md"
import pageContentVI from "../page_content/privacy_policy-vi.md"
import pageContentES from "../page_content/privacy_policy-es.md"
import pageContentZH from "../page_content/privacy_policy-zh.md"
import { Language } from "@bloom-housing/backend-core"

const Privacy = () => {
  const { profile } = useContext(AuthContext)

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Privacy",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  const pageTitle = <>{t("pageTitle.privacy")}</>
  const router = useRouter()
  const pageContent = () => {
    switch (router.locale) {
      case Language.es:
        return pageContentES
      case Language.vi:
        return pageContentVI
      case Language.zh:
        return pageContentZH
      default:
        return pageContentEN
    }
  }

  return (
    <Layout>
      <PageHeader title={pageTitle} inverse />
      <MarkdownSection>
        <Markdown>{pageContent()}</Markdown>
      </MarkdownSection>
    </Layout>
  )
}

export default Privacy
