/*
3.1 Vouchers Subsidies
Question asks if anyone on the application receives a housing voucher or subsidy.
*/
import Link from "next/link"
import { useRouter } from "next/router"
import {
  AlertBox,
  Button,
  ErrorMessage,
  Form,
  FormCard,
  ProgressNav,
  t,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import { AppSubmissionContext } from "../../../lib/AppSubmissionContext"
import { useContext } from "react"
import FormStep from "../../../src/forms/applications/FormStep"

export default () => {
  const { conductor, application, listing } = useContext(AppSubmissionContext)
  const router = useRouter()
  const currentPageStep = 3

  /* Form Handler */
  const { register, handleSubmit, errors } = useForm({
    defaultValues: { incomeVouchers: application.incomeVouchers?.toString() },
    shouldFocusError: false,
  })

  const onSubmit = (data) => {
    const { incomeVouchers } = data
    const toSave = { incomeVouchers: JSON.parse(incomeVouchers) }
    new FormStep(conductor).save(toSave)

    router.push("/applications/financial/income").then(() => window.scrollTo(0, 0))
  }
  const onError = () => {
    window.scrollTo(0, 0)
  }

  return (
    <FormsLayout>
      <FormCard header={listing?.name}>
        <ProgressNav
          currentPageStep={currentPageStep}
          completedSteps={application.completedStep}
          labels={["You", "Household", "Income", "Preferences", "Review"]}
        />
      </FormCard>

      <FormCard>
        <p className="form-card__back">
          <strong>
            <Link href="/applications/household/ada">
              <a>{t("t.back")}</a>
            </Link>
          </strong>
        </p>

        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">
            {t("application.financial.vouchers.title")}
          </h2>

          <p className="field-note mb-4 mt-5">
            <strong>{t("application.financial.vouchers.housingVouchers.strong")}</strong>
            {` ${t("application.financial.vouchers.housingVouchers.text")}`}
          </p>

          <p className="field-note mb-4">
            <strong>{t("application.financial.vouchers.nonTaxableIncome.strong")}</strong>
            {` ${t("application.financial.vouchers.nonTaxableIncome.text")}`}
          </p>

          <p className="field-note">
            <strong>{t("application.financial.vouchers.rentalSubsidies.strong")}</strong>
            {` ${t("application.financial.vouchers.rentalSubsidies.text")}`}
          </p>
        </div>

        {Object.entries(errors).length > 0 && (
          <AlertBox type="alert" inverted closeable>
            {t("t.errorsToResolve")}
          </AlertBox>
        )}

        <Form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className={`form-card__group field text-lg ${errors.incomeVouchers ? "error" : ""}`}>
            <p className="field-note mb-4">{t("application.financial.vouchers.prompt")}</p>

            <div className="field">
              <input
                type="radio"
                id="incomeVouchersYes"
                name="incomeVouchers"
                value="true"
                ref={register({ required: true })}
              />

              <label htmlFor="incomeVouchersYes" className="font-semibold">
                {t("application.financial.vouchers.yes")}
              </label>
            </div>

            <div className="field">
              <input
                type="radio"
                id="incomeVouchersNo"
                name="incomeVouchers"
                value="false"
                ref={register({ required: true })}
              />

              <label htmlFor="incomeVouchersNo" className="font-semibold">
                {t("application.financial.vouchers.no")}
              </label>
            </div>

            <ErrorMessage error={errors.incomeVouchers}>
              {t("application.financial.vouchers.error")}
            </ErrorMessage>
          </div>

          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button
                filled={true}
                onClick={() => {
                  // Do nothing - handled by React Hook Forms
                }}
              >
                {t("t.next")}
              </Button>
            </div>
          </div>
        </Form>
      </FormCard>
    </FormsLayout>
  )
}
