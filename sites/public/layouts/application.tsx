import React from "react"
// import React, { useContext } from "react"
// import { useRouter } from "next/router"
import Head from "next/head"
import {
  LocalizedLink,
  SiteHeader,
  SiteFooter,
  FooterNav,
  FooterSection,
  ExygyFooter,
  t,
  // UserNav,
  // UserContext,
  // setSiteAlertMessage,
} from "@bloom-housing/ui-components"
import SVG from "react-inlinesvg"

const Layout = (props) => {
  // const { profile, signOut } = useContext(UserContext)
  // const router = useRouter()

  const LANGUAGES =
    process.env.languages?.split(",")?.map((item) => ({
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

  return (
    <div className="site-wrapper">
      <div className="site-content">
        <Head>
          <title>{t("nav.siteTitle")}</title>
        </Head>
        <SiteHeader
          skip={t("nav.skip")}
          logoSrc="/images/logo_glyph.svg"
          notice={notice}
          title={t("nav.siteTitle")}
          languages={LANGUAGES}
        >
          <LocalizedLink href="/listings" className="navbar-item">
            {t("nav.listings")}
          </LocalizedLink>
          {/* Only show Get Assistance if housing counselor data is available */}
          {process.env.housingCounselorServiceUrl && (
            <LocalizedLink href={process.env.housingCounselorServiceUrl} className="navbar-item">
              {t("nav.getAssistance")}
            </LocalizedLink>
          )}
          {/* <UserNav
            signedIn={!!profile}
            signOut={async () => {
              setSiteAlertMessage(t(`authentication.signOut.success`), "notice")
              await router.push("/sign-in")
              signOut()
              window.scrollTo(0, 0)
            }}
          >
            <LocalizedLink href="/account/dashboard" className="navbar-item">
              {t("nav.myDashboard")}
            </LocalizedLink>
            <LocalizedLink href="/account/applications" className="navbar-item">
              {t("nav.myApplications")}
            </LocalizedLink>
            <LocalizedLink href="/account/settings" className="navbar-item">
              {t("nav.accountSettings")}
            </LocalizedLink>
          </UserNav> */}
        </SiteHeader>
        <main id="main-content">{props.children}</main>
      </div>

      <SiteFooter>
        <FooterSection>
          <img src="/images/logo-smc.png" />
        </FooterSection>
        <FooterSection>
          <p>
            {t("footer.header")}
            <br />
            <a href={t("footer.headerUrl")} target="_blank">
              {t("footer.headerLink")}
            </a>
            <br />
            <span className="text-tiny">
              {t("footer.inPartnershipWith")}
              <br />
              <a href={t("footer.sanMateoISDurl")} target="_blank">
                {t("footer.sanMateoISD")}
              </a>
              <br />
              <a href={t("footer.cityOfSouthSFurl")} target="_blank">
                {t("footer.cityOfSouthSF")}
              </a>
            </span>
          </p>
          <p className="mt-8 text-tiny">{t("footer.forListingQuestions")}</p>
          <p className="text-tiny">{t("footer.forGeneralInquiries")}</p>
          <p className="mt-8 text-tiny">
            {t("footer.forAdditionalOpportunities")}
            <br />
            <a className="px-2" href={t("footer.SFHousingUrl")} target="_blank">
              {t("footer.SFHousingPortal")}
            </a>
            |
            <a className="px-2" href={t("footer.SJHousingUrl")} target="_blank">
              {t("footer.SJHousingPortal")}
            </a>
            |
            <a className="px-2" href={t("footer.ALAHousingUrl")} target="_blank">
              {t("footer.ALAHousingPortal")}
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
          <LocalizedLink href="/disclaimer">{t("footer.disclaimer")}</LocalizedLink>
          <LocalizedLink href="/privacy">{t("footer.privacyPolicy")}</LocalizedLink>
        </FooterNav>
        <FooterSection className="bg-black" small>
          <ExygyFooter />
        </FooterSection>
      </SiteFooter>
      <SVG src="/images/icons.svg" />
    </div>
  )
}

export default Layout
