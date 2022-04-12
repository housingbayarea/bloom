import React, { useContext } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import Head from "next/head"
import {
  SiteHeader,
  SiteFooter,
  FooterNav,
  FooterSection,
  ExygyFooter,
  MenuLink,
  t,
  AuthContext,
  setSiteAlertMessage,
} from "@bloom-housing/ui-components"

const Layout = (props) => {
  const { profile, signOut } = useContext(AuthContext)
  const router = useRouter()

  const languages =
    router?.locales?.map((item) => ({
      prefix: item === "en" ? "" : item,
      label: t(`languages.${item}`),
    })) || []
  const notice = (
    <>
      {t("nav.getFeedback")}
      <a href="https://www.surveymonkey.com/r/2QLBYML" target="_blank">
        {t("nav.yourFeedback")}
      </a>
    </>
  )

  const menuLinks: MenuLink[] = [
    {
      title: t("nav.listings"),
      href: "/listings",
    },
  ]
  if (process.env.housingCounselorServiceUrl) {
    menuLinks.push({
      title: t("pageTitle.getAssistance"),
      href: process.env.housingCounselorServiceUrl,
    })
  }
  if (profile) {
    menuLinks.push({
      title: t("nav.myAccount"),
      subMenuLinks: [
        {
          title: t("nav.myDashboard"),
          href: "/account/dashboard",
        },
        {
          title: t("account.myApplications"),
          href: "/account/applications",
        },
        {
          title: t("account.accountSettings"),
          href: "/account/edit",
        },
        {
          title: t("nav.signOut"),
          onClick: async () => {
            setSiteAlertMessage(t(`authentication.signOut.success`), "notice")
            await router.push("/sign-in")
            signOut()
          },
        },
      ],
    })
  } else {
    menuLinks.push({
      title: t("nav.signIn"),
      href: "/sign-in",
    })
  }

  return (
    <div className="site-wrapper">
      <div className="site-content">
        <Head>
          <title>{t("nav.siteTitle")}</title>
        </Head>
        <SiteHeader
          logoSrc="/images/logo_glyph.svg"
          homeURL="/"
          notice={notice}
          title={t("nav.siteTitle")}
          languages={languages.map((lang) => {
            return {
              label: lang.label,
              onClick: () =>
                void router.push(router.asPath, router.asPath, { locale: lang.prefix || "en" }),
              active: t("config.routePrefix") === lang.prefix,
            }
          })}
          menuLinks={menuLinks}
          logoWidth={"medium"}
        />
        <main id="main-content" className="md:overflow-x-hidden">
          {props.children}
        </main>
      </div>

      <SiteFooter>
        <FooterSection>
          <p>
            {t("footer.header")}
            <br />
            <a href={t("footer.headerUrl")} target="_blank">
              {t("footer.headerLink")}
            </a>
          </p>
          <p className="mt-10 text-tiny">{t("footer.forListingQuestions")}</p>
          <p className="text-tiny">{t("footer.forGeneralInquiries")}</p>
          <p className="mt-10 text-tiny">
            {t("footer.forAdditionalOpportunities")}
            <br />
            <a className="px-2" href={t("footer.SFHousingUrl")} target="_blank">
              {t("footer.SFHousingPortal")}
            </a>
            |
            <a className="px-2" href="https://housing.acgov.org/" target="_blank">
              Alameda County Housing Portal
            </a>
            |
            <a className="px-2" href="https://housing.sanjoseca.gov/" target="_blank">
              City of San José Housing Portal
            </a>
          </p>
        </FooterSection>
        <FooterSection>
          <img
            className="h-16 w-16"
            src="/images/eho-logo-white.svg"
            alt="Equal Housing Opportunity Logo"
          />
        </FooterSection>
        <FooterNav copyright={t("footer.copyRight")}>
          <a href="https://www.surveymonkey.com/r/2QLBYML" target="_blank">
            {t("footer.giveFeedback")}
          </a>
          <a href="mailto:housing@smchousing.org">{t("footer.contact")}</a>
          <a href="https://smc.housingbayarea.org/disclaimer" target="_blank">
            {t("footer.disclaimer")}
          </a>
          <Link href="/privacy">{t("footer.privacyPolicy")}</Link>
        </FooterNav>
        <FooterSection className="bg-black" small>
          <ExygyFooter />
        </FooterSection>
      </SiteFooter>
    </div>
  )
}

export default Layout
