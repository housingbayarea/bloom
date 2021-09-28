import React /* , { useContext } */ from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import Head from "next/head"
import {
  SiteHeader,
  SiteFooter,
  FooterNav,
  FooterSection,
  ExygyFooter,
  t,
  // AuthContext,
  // setSiteAlertMessage,
} from "@bloom-housing/ui-components"

const Layout = (props) => {
  // const { profile, signOut } = useContext(AuthContext)
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
          language={{
            list: languages,
            codes: router?.locales,
          }}
        >
          <Link href="/listings">
            <a className="navbar-item">{t("nav.listings")}</a>
          </Link>
          {/* Only show Get Assistance if housing counselor data is available */}
          {process.env.housingCounselorServiceUrl && (
            <Link href="/housing-counselors">
              <a className="navbar-item">{t("nav.getAssistance")}</a>
            </Link>
          )}
          {/* <UserNav
            signedIn={!!profile}
            signOut={async () => {
              setSiteAlertMessage(t(`authentication.signOut.success`), "notice")
              await router.push("/sign-in")
              signOut()
            }}
          >
            <Link href="/account/dashboard">
              <a className="navbar-item">{t("nav.myDashboard")}</a>
            </Link>
            <Link href="/account/applications">
              <a className="navbar-item">{t("nav.myApplications")}</a>
            </Link>
            <Link href="/account/edit">
              <a className="navbar-item">{t("nav.accountSettings")}</a>
            </Link>
          </UserNav>*/}
        </SiteHeader>
        <main id="main-content">{props.children}</main>
      </div>

      <SiteFooter>
        <FooterNav copyright={t("footer.copyright")}>
          <Link href="/privacy">
            <a>{t("pageTitle.privacy")}</a>
          </Link>
          <Link href="/disclaimer">
            <a>{t("pageTitle.disclaimer")}</a>
          </Link>
        </FooterNav>
        <FooterSection className="bg-black" small>
          <ExygyFooter />
        </FooterSection>
      </SiteFooter>
    </div>
  )
}

export default Layout
