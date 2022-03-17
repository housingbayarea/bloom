import React, { useEffect, useContext } from "react"
import Head from "next/head"
import Markdown from "markdown-to-jsx"
import Layout from "../layouts/application"
import { t, Icon, PageHeader, MarkdownSection, AuthContext } from "@bloom-housing/ui-components"
import { UserStatus } from "../lib/constants"
import { PageView, pushGtmEvent } from "@bloom-housing/shared-helpers"
import RenderIf from "../components/RenderIf"

import pageContent from "../page_content/get_assistance.md"
import sidebarContent from "../page_content/AdditionalResourcesSidebar.md"

const GetAssistance = () => {
  const pageTitle = t("pageTitle.getAssistance")
  const subTitle = t("pageDescription.getAssistance")

  const { profile } = useContext(AuthContext)

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Get Assistance",
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
          <div className="pt-4 md:w-8/12 md:py-0 md:pb-12">
            <MarkdownSection>
              <Markdown
                options={{
                  overrides: {
                    h2: {
                      component: ({ children, ...props }) => (
                        <h2 {...props} className="font-alt-sans font-semibold text-black mb-3 mt-4">
                          {children}
                        </h2>
                      ),
                    },
                    a: {
                      component: ({ children, ...props }) => (
                        <a {...props} className="underline">
                          {children}
                        </a>
                      ),
                    },
                    hr: {
                      component: ({ ...props }) => <hr {...props} className="border-t-0" />,
                    },
                    Icon,
                    RenderIf,
                  },
                }}
              >
                {pageContent}
              </Markdown>
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

export default GetAssistance
