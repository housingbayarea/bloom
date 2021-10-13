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

  const menuLinks: MenuLink[] = [
    {
      title: t("nav.listings"),
      href: "/listings",
    },
  ]
  if (process.env.housingCounselorServiceUrl) {
    menuLinks.push({
      title: t("nav.getAssistance"),
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
          title: t("nav.myApplications"),
          href: "/account/applications",
        },
        {
          title: t("nav.accountSettings"),
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
          notice={
            <>
              {t("nav.getFeedback")}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScFVVvd7FDa7puUN4iH2SBl_KAWBu8dRTXNuLIt8Ff9iYF3uA/viewform?usp=sf_link"
                target="_blank"
                className={"cursor-pointer"}
              >
                {t("nav.yourFeedback")}
              </a>
              {t("nav.bonusFeedback")}
            </>
          }
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
        />
        <main id="main-content">{props.children}</main>
      </div>

      <SiteFooter>
        <FooterSection>
          <img src="/images/san-jose-logo-white.png" alt="San José" />
        </FooterSection>
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
            <a className="px-2" href="https://smc.housingbayarea.org/" target="_blank">
              San Mateo County Housing Portal
            </a>
            |
            <a className="px-2" href="https://housing.acgov.org/" target="_blank">
              Alameda County Housing Portal
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
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScFVVvd7FDa7puUN4iH2SBl_KAWBu8dRTXNuLIt8Ff9iYF3uA/viewform?usp=sf_link"
            target="_blank"
          >
            {t("footer.giveFeedback")}
          </a>
          <a href="mailto:housing@sanjoseca.gov">{t("footer.contact")}</a>
          <Link href="/disclaimer">
            <a>{t("footer.disclaimer")}</a>
          </Link>
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
