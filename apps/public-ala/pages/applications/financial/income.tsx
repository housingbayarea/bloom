/*
3.2 Income
Total pre-tax household income from all sources
*/
import Link from "next/link"
import {
  AlertBox,
  AlertNotice,
  Button,
  ErrorMessage,
  Field,
  Form,
  FormCard,
  ProgressNav,
  t,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import { AppSubmissionContext } from "../../../lib/AppSubmissionContext"
import { useContext, useState } from "react"
import FormStep from "../../../src/forms/applications/FormStep"
import { Listing } from "@bloom-housing/core"

type IncomeError = "low" | "high" | null
type IncomePeriod = "perMonth" | "perYear"

function verifyIncome(listing: Listing, income: number, period: IncomePeriod): IncomeError {
  // Look through all the units on this listing to see what the absolute max/min income requirements are.
  const [annualMin, annualMax, monthlyMin] = listing.units.reduce(
    ([aMin, aMax, mMin], unit) => [
      Math.min(aMin, parseFloat(unit.annualIncomeMin)),
      Math.max(aMax, parseFloat(unit.annualIncomeMax)),
      Math.min(mMin, unit.monthlyIncomeMin),
    ],
    [Infinity, 0, Infinity]
  )

  // For now, transform the annual max into a monthly max (DB records for Units don't have this value)
  const monthlyMax = annualMax / 12.0

  const compareMin = period === "perMonth" ? monthlyMin : annualMin
  const compareMax = period === "perMonth" ? monthlyMax : annualMax

  if (income < compareMin) {
    return "low"
  } else if (income > compareMax) {
    return "high"
  }
  return null
}

export default () => {
  const { conductor, application, listing } = useContext(AppSubmissionContext)
  const [incomeError, setIncomeError] = useState<IncomeError>(null)
  const currentPageStep = 3

  /* Form Handler */
  const { register, handleSubmit, errors, getValues, setValue } = useForm({
    defaultValues: {
      income: application.income,
      incomePeriod: application.incomePeriod,
    },
    shouldFocusError: false,
  })
  const onSubmit = (data) => {
    const { income, incomePeriod } = data
    // Skip validation of total income if the applicant has income vouchers.
    // Not running this validation for the time being -JW
    //const validationError = application.incomeVouchers
    //  ? null
    //  : verifyIncome(listing, income, incomePeriod)
    const validationError = null
    setIncomeError(validationError)

    if (!validationError) {
      const toSave = { income, incomePeriod }
      new FormStep(conductor).save(toSave)

      conductor.completeStep(3)
      conductor.sync()
      conductor.routeToNextOrReturnUrl("/applications/review/demographics")
    }
  }
  const onError = () => {
    window.scrollTo(0, 0)
  }

  const formatValue = () => {
    const { income } = getValues()
    const numericIncome = parseFloat(income)
    if (!isNaN(numericIncome)) {
      setValue("income", numericIncome.toFixed(2))
    }
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
            <Link href="/applications/financial/vouchers">
              <a>{t("t.back")}</a>
            </Link>
          </strong>
        </p>

        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">
            {t("application.financial.income.title")}
          </h2>

          <p className="field-note mt-5 mb-4">{t("application.financial.income.instruction1")}</p>

          <p className="field-note">{t("application.financial.income.instruction2")}</p>
        </div>

        {Object.entries(errors).length > 0 && (
          <AlertBox type="alert" inverted closeable>
            {t("t.errorsToResolve")}
          </AlertBox>
        )}

        {incomeError && (
          <>
            <AlertBox type="alert" inverted onClose={() => setIncomeError(null)}>
              {t("application.financial.income.validationError.title")}
            </AlertBox>
            <AlertNotice
              title={t(`application.financial.income.validationError.reason.${incomeError}`)}
              type="alert"
              inverted
            >
              <p className="mb-2">
                {t(`application.financial.income.validationError.instruction1`)}
              </p>
              <p className="mb-2">
                {t(`application.financial.income.validationError.instruction2`)}
              </p>
              <p>
                <a href="#">{t("application.financial.income.validationError.assistance")}</a>
              </p>
            </AlertNotice>
          </>
        )}

        <Form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="form-card__group">
            <p className="field-label mb-2">{t("application.financial.income.prompt")}</p>

            <div className={`field ${errors.income ? "error" : ""}`}>
              <Field
                id="income"
                name="income"
                type="number"
                placeholder={t("application.financial.income.placeholder")}
                validation={{ required: true, min: 0.01 }}
                error={errors.income}
                register={register}
                prepend="$"
                errorMessage={t("application.financial.income.incomeError")}
                inputProps={{ step: 0.01, onBlur: formatValue }}
              />
            </div>

            <div className={`field-group`}>
              <div className={`field ${errors.incomePeriod ? "error" : ""}`}>
                <input
                  type="radio"
                  id="incomePeriodMonthly"
                  name="incomePeriod"
                  value="perMonth"
                  ref={register({ required: true })}
                />
                <label htmlFor="incomePeriodMonthly" className="font-semibold">
                  {t("application.financial.income.perMonth")}
                </label>
              </div>

              <div className={`field ${errors.incomePeriod ? "error" : ""}`}>
                <input
                  type="radio"
                  id="incomePeriodYearly"
                  name="incomePeriod"
                  value="perYear"
                  ref={register({ required: true })}
                />
                <label htmlFor="incomePeriodYearly" className="font-semibold">
                  {t("application.financial.income.perYear")}
                </label>
              </div>

              <ErrorMessage error={errors.incomePeriod}>
                {t("application.financial.income.periodError")}
              </ErrorMessage>
            </div>
          </div>

          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button
                filled={true}
                onClick={() => {
                  conductor.returnToReview = false
                }}
              >
                {t("t.next")}
              </Button>
            </div>

            {conductor.canJumpForwardToReview() && (
              <div className="form-card__pager-row">
                <Button
                  className="button is-unstyled mb-4"
                  onClick={() => {
                    conductor.returnToReview = true
                  }}
                >
                  {t("application.form.general.saveAndReturn")}
                </Button>
              </div>
            )}
          </div>
        </Form>
      </FormCard>
    </FormsLayout>
  )
}
