/*
1.4 - Alternate Contact
Type of alternate contact
*/
import Link from "next/link"
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
import React, { useContext, useMemo } from "react"
import { Select } from "@bloom-housing/ui-components/src/forms/Select"
import { PhoneField } from "@bloom-housing/ui-components/src/forms/PhoneField"
import { stateKeys } from "@bloom-housing/ui-components/src/helpers/formOptions"

export default () => {
  const { conductor, application, listing } = useContext(AppSubmissionContext)
  const currentPageStep = 1
  /* Form Handler */
  const { control, register, handleSubmit, errors, watch } = useForm<Record<string, any>>({
    shouldFocusError: false,
  })
  const onSubmit = (data) => {
    application.alternateContact.phoneNumber = data.phoneNumber
    application.alternateContact.emailAddress = data.emailAddress
    application.alternateContact.mailingAddress.street = data.mailingAddress.street
    application.alternateContact.mailingAddress.state = data.mailingAddress.state
    application.alternateContact.mailingAddress.zipCode = data.mailingAddress.zipCode
    application.alternateContact.mailingAddress.city = data.mailingAddress.city
    conductor.sync()
    conductor.routeToNextOrReturnUrl("/applications/household/live-alone")
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
            <Link href="/applications/contact/alternate-contact-name">
              <a>{t("t.back")}</a>
            </Link>
          </strong>
        </p>
        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">
            {t("application.alternateContact.contact.title")}
          </h2>
          <p className="field-note my-4">{t("application.alternateContact.contact.description")}</p>
        </div>

        {Object.entries(errors).length > 0 && (
          <AlertBox type="alert" inverted closeable>
            {t("t.errorsToResolve")}
          </AlertBox>
        )}

        <Form
          id="applications-contact-alternate-contact"
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          <div className="form-card__group border-b">
            <label className="field-label--caps" htmlFor="phoneNumber">
              {t("application.alternateContact.contact.phoneNumberFormLabel")}
            </label>
            <PhoneField
              name="phoneNumber"
              label={t("application.alternateContact.contact.phoneNumberFormLabel")}
              error={errors.phoneNumber}
              errorMessage={t("application.contact.phoneNumberError")}
              controlClassName="control mt-2"
              control={control}
              defaultValue={application.alternateContact.phoneNumber}
            />
          </div>
          <div className="form-card__group border-b">
            <label className="field-label--caps">
              {t("application.alternateContact.contact.emailAddressFormLabel")}
            </label>
            <Field
              controlClassName="mt-2"
              id="emailAddress"
              name="emailAddress"
              placeholder={t("application.alternateContact.contact.emailAddressFormPlaceHolder")}
              defaultValue={application.alternateContact.emailAddress}
              register={register}
            />
          </div>
          <div className="form-card__group">
            <label className="field-label--caps">
              {t("application.alternateContact.contact.contactMailingAddressLabel")}
            </label>
            <p className="field-note my-2">
              {t("application.alternateContact.contact.contactMailingAddressHelperText")}
            </p>
            <Field
              id="mailingAddress.street"
              name="mailingAddress.street"
              placeholder={t("application.alternateContact.contact.streetFormPlaceholder")}
              defaultValue={application.alternateContact.mailingAddress.street}
              register={register}
            />

            <div className="flex max-w-2xl">
              <Field
                id="mailingAddress.city"
                name="mailingAddress.city"
                label={t("application.alternateContact.contact.cityFormLabel")}
                placeholder={t("application.alternateContact.contact.cityFormPlaceholder")}
                defaultValue={application.alternateContact.mailingAddress.city}
                register={register}
              />

              <Select
                id="mailingAddress.state"
                name="mailingAddress.state"
                label={t("application.alternateContact.contact.stateFormPlaceholder")}
                defaultValue={application.alternateContact.mailingAddress.state}
                register={register}
                controlClassName="control"
                options={stateKeys}
                keyPrefix="application.form.options.states"
              />
            </div>
            <Field
              id="mailingAddress.zipCode"
              name="mailingAddress.zipCode"
              label={t("application.alternateContact.contact.zipcodeFormLabel")}
              placeholder={t("application.alternateContact.contact.zipcodeFormPlaceholder")}
              defaultValue={application.alternateContact.mailingAddress.zipCode}
              register={register}
            />
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
