/*
5.5 View
Optional application summary
*/
import Link from "next/link"
import moment from "moment"
import { FormCard, t } from "@bloom-housing/ui-components"
import FormsLayout from "../../layouts/forms"
import { AppSubmissionContext } from "../../lib/AppSubmissionContext"
import { useContext, useMemo } from "react"
import FormSummaryDetails from "../../src/forms/applications/FormSummaryDetails"
import { DATE_FORMAT } from "../../lib/constants"

export default () => {
  const { application, listing } = useContext(AppSubmissionContext)

  const confirmationDate = useMemo(() => {
    return moment().format(DATE_FORMAT)
  }, [])

  const origin = typeof window !== "undefined" ? window.location.origin : ""

  return (
    <FormsLayout>
      <FormCard header="Confirmation">
        <div className="py-2">
          {listing && (
            <Link
              href={`listing/id=${listing.id}`}
              as={`${origin}/listing/${listing.id}/${listing.urlSlug}`}
            >
              <a className="lined text-tiny">{t("application.confirmation.viewOriginalListing")}</a>
            </Link>
          )}
        </div>
      </FormCard>

      <FormCard>
        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">
            {t("application.confirmation.informationSubmittedTitle")}
          </h2>
          <p className="field-note mt-4 text-center">
            {t("application.confirmation.submitted")}
            {confirmationDate}
          </p>
        </div>
        <div className="form-card__group text-center">
          <h3 className="form-card__paragraph-title">
            {t("application.confirmation.lotteryNumber")}
          </h3>
          {/* TODO: replace with the number from backend */}
          <p className="font-serif text-3xl my-0">#00545847</p>
        </div>

        <FormSummaryDetails application={application} editMode={false} />

        <div className="form-card__pager hide-for-print">
          <div className="form-card__pager-row py-6">
            <a href="#" className="lined text-tiny" onClick={() => window.print()}>
              {t("application.confirmation.printCopy")}
            </a>
          </div>
        </div>
      </FormCard>
    </FormsLayout>
  )
}
