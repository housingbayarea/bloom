import { t } from "@bloom-housing/ui-components"
import RentalsFinder from "../components/finder/RentalsFinder"
import Layout from "../layouts/application"

export default function Finder() {
  return (
    <Layout pageTitle={t("pageTitle.rentalFinder")}>
      <RentalsFinder />
    </Layout>
  )
}
