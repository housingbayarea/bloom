/*
1.4 - Alternate Contact
Type of alternate contact
*/
import Link from "next/link"
import Router from "next/router"
import {
  AlertBox,
  Button,
  Form,
  Field,
  FormCard,
  ProgressNav,
  t,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import { AppSubmissionContext } from "../../../lib/AppSubmissionContext"
import ApplicationConductor from "../../../lib/ApplicationConductor"
import { useContext, useMemo } from "react"

export default () => {
  const { conductor, application, listing } = useContext(AppSubmissionContext)
  const currentPageStep = 1

  /* Form Handler */
  const { register, handleSubmit, errors, watch } = useForm<Record<string, any>>({
    shouldFocusError: false,
  })
  const onSubmit = (data) => {
    application.alternateContact.firstName = data.firstName
    application.alternateContact.lastName = data.lastName
    application.alternateContact.agency = data.agency
    conductor.sync()
    conductor.routeToNextOrReturnUrl("/applications/contact/alternate-contact-contact")
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
            <Link href="/applications/contact/alternate-contact-type">
              <a>{t("t.back")}</a>
            </Link>
          </strong>
        </p>
        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">
            {t("application.alternateContact.name.title")}
          </h2>
        </div>

        {Object.entries(errors).length > 0 && (
          <AlertBox type="alert" inverted closeable>
            {t("t.errorsToResolve")}
          </AlertBox>
        )}

        <Form id="applications-contact-alternate-name" onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="form-card__group">
            <label className="field-label--caps" htmlFor="firstName">
              {t("application.alternateContact.name.alternateContactFormLabel")}
            </label>
            <Field
              id="firstName"
              name="firstName"
              placeholder={t("application.alternateContact.name.firstNameFormPlaceholder")}
              defaultValue={application.alternateContact.firstName}
              validation={{ required: true }}
              error={errors.firstName}
              errorMessage={t("application.alternateContact.name.firstNameValidationErrorMessage")}
              register={register}
            />
            <Field
              id="lastName"
              name="lastName"
              placeholder={t("application.alternateContact.name.lastNameFormPlaceholder")}
              defaultValue={application.alternateContact.lastName}
              validation={{ required: true }}
              error={errors.lastName}
              errorMessage={t("application.alternateContact.name.lastNameValidationErrorMessage")}
              register={register}
            />
            {application.alternateContact.type === "caseManager" && (
              <>
                <label className="field-label--caps mt-4" htmlFor="agency">
                  {t("application.alternateContact.name.caseManagerAgencyFormLabel")}
                </label>
                <Field
                  id="agency"
                  name="agency"
                  placeholder={t(
                    "application.alternateContact.name.caseManagerAgencyFormPlaceHolder"
                  )}
                  defaultValue={application.alternateContact.agency}
                  validation={{ required: true }}
                  error={errors.agency}
                  errorMessage={t(
                    "application.alternateContact.name.caseManagerAgencyValidationErrorMessage"
                  )}
                  register={register}
                />
              </>
            )}
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
