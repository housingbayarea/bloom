import * as React from "react"
import Head from "next/head"
import t from "@bloom-housing/ui-components/src/helpers/translator"
import LocalizedLink from "@bloom-housing/ui-components/src/atoms/LocalizedLink"
import SiteHeader from "@bloom-housing/ui-components/src/headers/SiteHeader/SiteHeader"
import AlamedaFooter from "../components/AlamedaFooter"
import SVG from "react-inlinesvg"

const Layout = props => (
  <div>
    <Head>
      <title>{t("nav.siteTitle")}</title>
    </Head>
    <SiteHeader
      logoSrc="/images/logo_glyph.svg"
      notice={
        <>
          This is a preview of our new website. We're just getting started. We'd love to get{" "}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScr7JuVwiNW8q-ifFUWTFSWqEyV5ndA08jAhJQSlQ4ETrnl9w/viewform?usp=sf_link"
            target="_blank"
          >
            your feedback
          </a>
          .
        </>
      }
      title={t("nav.siteTitle")}
    >
      <LocalizedLink href="/listings" className="navbar-item">
        {t("nav.browseProperties")}
      </LocalizedLink>
      <a href="http://domain.com" target="_blank" className="navbar-item">
        {t("nav.getAssistance")}
      </a>
      {/* Only show Get Assistance if housing counselor data is available */}
      {process.env.housingCounselorServiceUrl && (
        <LocalizedLink href="/housing-counselors" className="navbar-item">
          {t("nav.getAssistance")}
        </LocalizedLink>
      )}
    </SiteHeader>
    <main>{props.children}</main>
    <AlamedaFooter />
    <SVG src="/images/icons.svg" />
  </div>
)

export default Layout
