/*
5.1 Demographics
Optional demographic questions
*/
import { useMemo } from "react"
import {
  Button,
  FieldGroup,
  Form,
  FormCard,
  ProgressNav,
  Select,
  t,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import {
  ethnicityKeys,
  raceKeys,
  genderKeys,
  sexualOrientation,
  howDidYouHear,
} from "@bloom-housing/ui-components/src/helpers/formOptions"
import FormBackLink from "../../../src/forms/applications/FormBackLink"
import { useFormConductor } from "../../../lib/hooks"

const Demographics = () => {
  const { conductor, application, listing } = useFormConductor("demographics")
  const currentPageSection = 5

  /* Form Handler */
  const { register, handleSubmit } = useForm()

  const onSubmit = (data) => {
    const { ethnicity, gender, sexualOrientation, howDidYouHear } = data

    conductor.currentStep.save({
      demographics: {
        ethnicity,
        gender,
        sexualOrientation,
        howDidYouHear,
      },
    })
    conductor.routeToNextOrReturnUrl()
  }

  const howDidYouHearOptions = useMemo(() => {
    return howDidYouHear?.map((item) => ({
      id: item.id,
      label: t(`application.review.demographics.howDidYouHearOptions.${item.id}`),
      defaultChecked: item.checked,
      register,
    }))
  }, [register])

  return (
    <FormsLayout>
      <FormCard header={listing?.name}>
        <ProgressNav
          currentPageSection={currentPageSection}
          completedSections={application.completedSections}
          labels={conductor.config.sections}
        />
      </FormCard>

      <FormCard>
        <FormBackLink url={conductor.determinePreviousUrl()} />

        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">
            {t("application.review.demographics.title")}
          </h2>
          <p className="mt-4 field-note">{t("application.review.demographics.subTitle")}</p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-card__group border-b">
            <Select
              id="ethnicity"
              name="ethnicity"
              label={t("application.review.demographics.ethnicityLabel")}
              placeholder={t("application.form.general.defaultSelectPlaceholder")}
              register={register}
              labelClassName="field-label--caps mb-3"
              controlClassName="control"
              options={ethnicityKeys}
              keyPrefix="application.review.demographics.ethnicityOptions"
            />

            <Select
              id="race"
              name="race"
              label={t("application.review.demographics.raceLabel")}
              placeholder={t("application.form.general.defaultSelectPlaceholder")}
              register={register}
              labelClassName="field-label--caps mb-3"
              controlClassName="control"
              options={raceKeys}
              keyPrefix="application.review.demographics.raceOptions"
            />
          </div>

          <div className="form-card__group border-b">
            <Select
              id="gender"
              name="gender"
              label={t("application.review.demographics.genderLabel")}
              placeholder={t("application.form.general.defaultSelectPlaceholder")}
              register={register}
              labelClassName="field-label--caps mb-3"
              controlClassName="control"
              options={genderKeys}
              keyPrefix="application.review.demographics.genderOptions"
            />
          </div>

          <div className="form-card__group border-b">
            <Select
              id="sexualOrientation"
              name="sexualOrientation"
              label={t("application.review.demographics.sexualOrientationLabel")}
              placeholder={t("application.form.general.defaultSelectPlaceholder")}
              register={register}
              labelClassName="field-label--caps mb-3"
              controlClassName="control"
              options={sexualOrientation}
              keyPrefix="application.review.demographics.sexualOrientationOptions"
            />
          </div>

          <div className="form-card__group is-borderless">
            <fieldset>
              <legend className="field-label--caps">
                {t("application.review.demographics.howDidYouHearLabel")}
              </legend>
              <FieldGroup
                type="checkbox"
                name="howDidYouHear"
                fields={howDidYouHearOptions}
                register={register}
              />
            </fieldset>
          </div>

          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button
                filled={true}
                onClick={() => {
                  //
                }}
              >
                Next
              </Button>
            </div>
          </div>

          {/* <div className="p-8 text-center">
            <Link href="/">
              <a className="lined text-tiny">{t("application.form.general.saveAndFinishLater")}</a>
            </Link>
          </div> */}
        </Form>
      </FormCard>
    </FormsLayout>
  )
}

export default Demographics
