import React, { useState } from "react"
import Head from "next/head"
import { Jurisdiction } from "@bloom-housing/backend-core/types"
import {
  AlertBox,
  LinkButton,
  Hero,
  t,
  SiteAlert,
  ActionBlock,
  Icon,
} from "@bloom-housing/ui-components"
import axios from "axios"
import Layout from "../layouts/application"
import { ConfirmationModal } from "../src/ConfirmationModal"
import { MetaTags } from "../src/MetaTags"

interface IndexProps {
  jurisdiction: Jurisdiction
}

export default function Home(props: IndexProps) {
  const blankAlertInfo = {
    alertMessage: null,
    alertType: null,
  }

  const [alertInfo, setAlertInfo] = useState(blankAlertInfo)

  const heroTitle = (
    <>
      {t("welcome.title")} <em>{t("region.name")}</em>
    </>
  )

  const metaDescription = t("pageDescription.welcome", { regionName: t("region.name") })
  const metaImage = "" // TODO: replace with hero image
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  return (
    <Layout>
      <Head>
        <title>{t("nav.siteTitle")}</title>
      </Head>
      <MetaTags title={t("nav.siteTitle")} image={metaImage} description={metaDescription} />
      <div className="flex absolute w-full flex-col items-center">
        <SiteAlert type="alert" className={alertClasses} />
        <SiteAlert type="success" className={alertClasses} timeout={30000} />
      </div>
      {alertInfo.alertMessage && (
        <AlertBox
          className=""
          onClose={() => setAlertInfo(blankAlertInfo)}
          type={alertInfo.alertType}
        >
          {alertInfo.alertMessage}
        </AlertBox>
      )}
      <Hero title={heroTitle} buttonTitle={t("welcome.seeRentalListings")} buttonLink="/listings" />
      <div className="homepage-extra">
        {props.jurisdiction && props.jurisdiction.notificationsSignUpURL && (
          <ActionBlock
            header={t("welcome.signUp")}
            icon={<Icon size="3xl" symbol="mail" />}
            actions={[
              <LinkButton key={"sign-up"} href={props.jurisdiction.notificationsSignUpURL}>
                {t("welcome.signUpToday")}
              </LinkButton>,
            ]}
          />
        )}
        <ActionBlock
          header={t("welcome.seeMoreOpportunities")}
          icon={<Icon size="3xl" symbol="building" />}
          actions={[
            <LinkButton href="/additional-resources" key={"additional-resources"}>
              {t("welcome.viewAdditionalHousing")}
            </LinkButton>,
          ]}
        />
      </div>
      <ConfirmationModal
        setSiteAlertMessage={(alertMessage, alertType) => setAlertInfo({ alertMessage, alertType })}
      />
    </Layout>
  )
}

export async function getStaticProps() {
  let thisJurisdiction = null
  try {
    const jurisdictionName = process.env.jurisdictionName
    const jurisdiction = await axios.get(
      `${process.env.backendApiBase}/jurisdictions/byName/${jurisdictionName}`
    )
    thisJurisdiction = jurisdiction?.data ? jurisdiction.data : null
  } catch (error) {
    console.error(error)
  }

  return {
    props: { jurisdiction: thisJurisdiction },
  }
}
