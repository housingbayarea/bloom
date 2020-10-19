/*
2.2 - Add Members
Add household members
*/
import Router from "next/router"
import {
  Button,
  FormCard,
  HouseholdMemberForm,
  ProgressNav,
  t,
  HouseholdSizeField,
  Form,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import FormBackLink from "../../../src/forms/applications/FormBackLink"
import { useFormConductor } from "../../../lib/hooks"

export default () => {
  const { conductor, application, listing } = useFormConductor("addMembers")
  const currentPageSection = 2
  const householdSize = application.householdMembers.length + 1

  /* Form Handler */
  const { errors, handleSubmit, register, clearErrors } = useForm()
  const onSubmit = (data) => {
    conductor.currentStep.save({
      householdSize: application.householdMembers.length + 1,
    })
    conductor.routeToNextOrReturnUrl()
  }

  const onAddMember = () => {
    Router.push("/applications/household/member").then(() => window.scrollTo(0, 0))
  }

  const applicant = application.applicant

  const membersSection = application.householdMembers.map((member, key) => {
    return (
      <HouseholdMemberForm
        member={member}
        key={"member" + key}
        type={t("application.household.householdMember")}
      />
    )
  })

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
          <h2 className="form-card__title is-borderless mt-4">
            {t("application.household.addMembers.title")}
          </h2>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <HouseholdSizeField
              listing={listing}
              householdSize={householdSize}
              validate={true}
              register={register}
              error={errors.householdSize}
              clearErrors={clearErrors}
              assistanceUrl={t("application.household.assistanceUrl")}
            />
          </div>
          <div className="form-card__group my-0 mx-0 pb-4 pt-4">
            <HouseholdMemberForm
              member={applicant}
              type={t("application.household.primaryApplicant")}
            />
            {membersSection}
          </div>
        </Form>
        <div className="form-card__group pt-0 mt-0">
          <div className="text-center">
            <Button onClick={onAddMember}>
              {t("application.household.addMembers.addHouseholdMember")}
            </Button>
          </div>
        </div>
        <div className="form-card__pager">
          <div className="form-card__pager-row primary">
            <Button
              filled={true}
              className=""
              onClick={() => {
                conductor.returnToReview = false
                handleSubmit(onSubmit)()
              }}
            >
              {t("application.household.addMembers.done")}
            </Button>
          </div>

          {conductor.canJumpForwardToReview() && (
            <div className="form-card__pager-row">
              <Button
                className="button is-unstyled mb-4"
                onClick={() => {
                  conductor.returnToReview = true
                  handleSubmit(onSubmit)()
                }}
              >
                {t("application.form.general.saveAndReturn")}
              </Button>
            </div>
          )}
        </div>
      </FormCard>
    </FormsLayout>
  )
}
