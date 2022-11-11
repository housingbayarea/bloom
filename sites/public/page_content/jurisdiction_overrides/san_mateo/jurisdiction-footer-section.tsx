import { ExygyFooter, FooterNav, FooterSection, SiteFooter, t } from "@bloom-housing/ui-components"
import Link from "next/link"

export const JurisdictionFooterSection = () => {
  return (
    <SiteFooter>
      <FooterSection>
        <p>
          {t("footer.header")}
          <br />
          <a href={t("footer.headerUrl")} target="_blank" rel="noreferrer">
            {t("footer.headerLink")}
          </a>
        </p>
        <p className="mt-10 text-tiny">{t("footer.forListingQuestions")}</p>
        <p className="text-tiny">{t("footer.forGeneralInquiries")}</p>
        <p className="mt-10 text-tiny">
          {t("footer.forAdditionalOpportunities")}
          <br />
          <a className="px-2" href={t("footer.SFHousingUrl")} target="_blank" rel="noreferrer">
            {t("footer.SFHousingPortal")}
          </a>
          |
          <a className="px-2" href="https://housing.acgov.org/" target="_blank" rel="noreferrer">
            Alameda County Housing Portal
          </a>
          |
          <a
            className="px-2"
            href="https://housing.sanjoseca.gov/"
            target="_blank"
            rel="noreferrer"
          >
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
        <a href="https://www.surveymonkey.com/r/2QLBYML" target="_blank" rel="noreferrer">
          {t("footer.giveFeedback")}
        </a>
        <a href="mailto:doorway@smchousing.org">{t("footer.contact")}</a>
        <a href="https://smc.housingbayarea.org/disclaimer" target="_blank" rel="noreferrer">
          {t("footer.disclaimer")}
        </a>
        <Link href="/privacy">{t("footer.privacyPolicy")}</Link>
      </FooterNav>
      <FooterSection className="bg-black" small>
        <ExygyFooter />
      </FooterSection>
    </SiteFooter>
  )
}