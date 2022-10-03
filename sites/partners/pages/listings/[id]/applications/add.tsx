import React from "react"
import Head from "next/head"
import {
  NavigationHeader,
  SiteAlert,
  t,
  Breadcrumbs,
  BreadcrumbLink,
} from "@bloom-housing/ui-components"
import Layout from "../../../../layouts"
import PaperApplicationForm from "../../../../src/applications/PaperApplicationForm/PaperApplicationForm"
import { useRouter } from "next/router"
import { useSingleListingData } from "../../../../lib/hooks"

const NewApplication = () => {
  const router = useRouter()
  const listingId = router.query.id as string

  const { listingDto: listing } = useSingleListingData(listingId)

  return (
    <Layout>
      <Head>
        <title>{t("nav.siteTitlePartners")}</title>
      </Head>
      <SiteAlert type="success" timeout={5000} dismissable sticky={true} />
      <NavigationHeader
        className="relative"
        title={t("applications.newApplication")}
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbLink href="/">{t("t.listing")}</BreadcrumbLink>
            <BreadcrumbLink href={`/listings/${listingId}`}>{listing?.name}</BreadcrumbLink>
            <BreadcrumbLink href={`/listings/${listingId}/applications`}>
              {t("nav.applications")}
            </BreadcrumbLink>
            <BreadcrumbLink href={`/listings/${listingId}/applications/add`} current>
              {t("t.add")}
            </BreadcrumbLink>
          </Breadcrumbs>
        }
      />

      <PaperApplicationForm listingId={listingId} />
    </Layout>
  )
}

export default NewApplication
