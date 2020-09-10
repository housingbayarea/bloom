/*
2.2 - Add Members
Add household members
*/
import Router, { useRouter } from "next/router"
import {
  AlertBox,
  Button,
  DOBField,
  ErrorMessage,
  Field,
  Form,
  FormCard,
  FormOptions,
  ProgressNav,
  relationshipKeys,
  t,
} from "@bloom-housing/ui-components"
import { HouseholdMember } from "@bloom-housing/core"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import { AppSubmissionContext } from "../../../lib/AppSubmissionContext"
import ApplicationConductor from "../../../lib/ApplicationConductor"
import { useContext, useMemo } from "react"
import { Select } from "@bloom-housing/ui-components/src/forms/Select"
import { stateKeys } from "@bloom-housing/ui-components/src/helpers/formOptions"

class Member implements HouseholdMember {
  id: number
  firstName = ""
  middleName = ""
  lastName = ""
  birthMonth = null
  birthDay = null
  birthYear = null
  emailAddress = ""
  noEmail = null
  phoneNumber = ""
  phoneNumberType = ""
  noPhone = null

  constructor(id) {
    this.id = id
  }
  address = {
    placeName: null,
    city: "",
    county: "",
    state: "string",
    street: "",
    street2: "",
    zipCode: "",
    latitude: null,
    longitude: null,
  }
  workAddress = {
    placeName: null,
    city: "",
    county: "",
    state: "string",
    street: "",
    street2: "",
    zipCode: "",
    latitude: null,
    longitude: null,
  }
  sameAddress?: boolean
  relationship?: string
  workInRegion?: boolean
}

export default () => {
  let memberId, member, saveText, cancelText
  const { conductor, application, listing } = useContext(AppSubmissionContext)
  const router = useRouter()
  const currentPageStep = 2

  if (router.query.memberId) {
    memberId = parseInt(router.query.memberId.toString())
    member = application.householdMembers[memberId]
    saveText = t("application.household.member.updateHouseholdMember")
    cancelText = t("application.household.member.deleteThisPerson")
  } else {
    memberId = application.householdMembers.length
    member = new Member(memberId)
    saveText = t("application.household.member.saveHouseholdMember")
    cancelText = t("application.household.member.cancelAddingThisPerson")
  }

  /* Form Handler */
  const { register, handleSubmit, errors, watch } = useForm({
    shouldFocusError: false,
  })
  const onSubmit = (data) => {
    application.householdMembers[memberId] = { ...member, ...data } as HouseholdMember
    conductor.sync()
    Router.push("/applications/household/add-members").then(() => window.scrollTo(0, 0))
  }
  const onError = () => {
    window.scrollTo(0, 0)
  }
  const deleteMember = () => {
    if (member.id != undefined) {
      application.householdMembers.splice(member.id, 1)
      conductor.sync()
    }
    Router.push("/applications/household/add-members").then(() => window.scrollTo(0, 0))
  }

  const sameAddress = watch("sameAddress")
  const workInRegion = watch("workInRegion")

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
        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless">
            {t("application.household.member.title")}
          </h2>
          <p className="mt-4 field-note">{t("application.household.member.subTitle")}</p>
        </div>

        {member && (
          <>
            {Object.entries(errors).length > 0 && (
              <AlertBox type="alert" inverted>
                {t("t.errorsToResolve")}
              </AlertBox>
            )}

            <Form onSubmit={handleSubmit(onSubmit, onError)}>
              <div className="form-card__group border-b">
                <label className="field-label--caps" htmlFor="firstName">
                  {t("application.household.member.name")}
                </label>

                <Field
                  name="firstName"
                  placeholder={t("application.name.firstName")}
                  controlClassName="mt-2"
                  defaultValue={member.firstName}
                  validation={{ required: true }}
                  error={errors.firstName}
                  errorMessage={t("application.name.firstNameError")}
                  register={register}
                />

                <Field
                  name="middleName"
                  placeholder={t("application.name.middleName")}
                  defaultValue={member.middleName}
                  register={register}
                />

                <Field
                  name="lastName"
                  placeholder={t("application.name.lastName")}
                  defaultValue={member.lastName}
                  validation={{ required: true }}
                  error={errors.lastName}
                  errorMessage={t("application.name.lastNameError")}
                  register={register}
                />
              </div>

              <div className="form-card__group border-b">
                <DOBField
                  applicant={member}
                  register={register}
                  error={errors}
                  watch={watch}
                  label={t("application.household.member.dateOfBirth")}
                />
              </div>

              <div className="form-card__group border-b">
                <label className="field-label--caps" htmlFor="sameAddress">
                  {t("application.household.member.haveSameAddress")}
                </label>

                <div className={"field mt-4 " + (errors.sameAddress ? "error" : "")}>
                  <input
                    type="radio"
                    id="sameAddressYes"
                    name="sameAddress"
                    value="yes"
                    defaultChecked={member.sameAddress == "yes"}
                    ref={register({ required: true })}
                  />
                  <label className="font-semibold" htmlFor="sameAddressYes">
                    {t("t.yes")}
                  </label>
                </div>
                <div className={"field " + (errors.sameAddress ? "error" : "")}>
                  <input
                    type="radio"
                    id="sameAddressNo"
                    name="sameAddress"
                    value="no"
                    defaultChecked={member.sameAddress == "no"}
                    ref={register({ required: true })}
                  />
                  <label className="font-semibold" htmlFor="sameAddressNo">
                    {t("t.no")}
                  </label>
                  <ErrorMessage error={errors.sameAddress}>
                    {t("application.form.errors.selectOption")}
                  </ErrorMessage>
                </div>
                {(sameAddress == "no" || (!sameAddress && member.sameAddress == "no")) && (
                  <>
                    <label className="field-label--caps" htmlFor="street">
                      {t("application.contact.address")}
                    </label>

                    <Field
                      id="addressStreet"
                      name="address.street"
                      placeholder={t("application.contact.streetAddress")}
                      defaultValue={member.address.street}
                      validation={{ required: true }}
                      error={errors.address?.street}
                      errorMessage={t("application.contact.streetError")}
                      register={register}
                    />

                    <Field
                      id="addressStreet2"
                      name="address.street2"
                      label={t("application.contact.apt")}
                      placeholder={t("application.contact.apt")}
                      defaultValue={member.address.street2}
                      register={register}
                    />

                    <div className="flex max-w-2xl">
                      <Field
                        id="addressCity"
                        name="address.city"
                        label={t("application.contact.cityName")}
                        placeholder={t("application.contact.cityName")}
                        defaultValue={member.address.city}
                        validation={{ required: true }}
                        error={errors.address?.city}
                        errorMessage={t("application.contact.cityError")}
                        register={register}
                      />

                      <Select
                        id="addressState"
                        name="address.state"
                        label="State"
                        defaultValue={member.address.state}
                        validation={{ required: true }}
                        error={errors.address?.state}
                        errorMessage={t("application.contact.stateError")}
                        register={register}
                        controlClassName="control"
                        options={stateKeys}
                        keyPrefix="application.form.options.states"
                      />
                    </div>

                    <Field
                      id="addressZipCode"
                      name="address.zipCode"
                      label="Zip"
                      placeholder="Zipcode"
                      defaultValue={member.address.zipCode}
                      validation={{ required: true }}
                      error={errors.address?.zipCode}
                      errorMessage={t("application.contact.zipCodeError")}
                      register={register}
                    />
                  </>
                )}
              </div>

              {/* <div className="form-card__group border-b">
                <label className="field-label--caps" htmlFor="firstName">
                  {t("application.household.member.workInRegion")}
                </label>
                <p className="field-note my-2">
                  {t("application.household.member.workInRegionNote")}
                </p>

                <div className={"field mt-4 " + (errors.workInRegion ? "error" : "")}>
                  <input
                    type="radio"
                    id="workInRegionYes"
                    name="workInRegion"
                    value="yes"
                    defaultChecked={member.workInRegion == "yes"}
                    ref={register({ required: true })}
                  />
                  <label className="font-semibold" htmlFor="workInRegionYes">
                    {t("t.yes")}
                  </label>
                </div>
                <div className={"field " + (errors.workInRegion ? "error" : "")}>
                  <input
                    type="radio"
                    id="workInRegionNo"
                    name="workInRegion"
                    value="no"
                    defaultChecked={member.workInRegion == "no"}
                    ref={register({ required: true })}
                  />
                  <label className="font-semibold" htmlFor="workInRegionNo">
                    {t("t.no")}
                  </label>

                  <ErrorMessage error={errors.workInRegion}>
                    {t("application.form.errors.selectOption")}
                  </ErrorMessage>
                </div>
                {(workInRegion == "yes" || (!workInRegion && member.workInRegion == "yes")) && (
                  <>
                    <label className="field-label--caps" htmlFor="street">
                      {t("application.contact.address")}
                    </label>

                    <Field
                      id="addressStreet"
                      name="workAddress.street"
                      placeholder={t("application.contact.streetAddress")}
                      defaultValue={member.workAddress.street}
                      validation={{ required: true }}
                      error={errors.workAddress?.street}
                      errorMessage={t("application.contact.streetError")}
                      register={register}
                    />

                    <Field
                      id="addressStreet2"
                      name="workAddress.street2"
                      label={t("application.contact.apt")}
                      placeholder={t("application.contact.apt")}
                      defaultValue={member.workAddress.street2}
                      register={register}
                    />

                    <div className="flex max-w-2xl">
                      <Field
                        id="addressCity"
                        name="workAddress.city"
                        label={t("application.contact.cityName")}
                        placeholder={t("application.contact.cityName")}
                        defaultValue={member.workAddress.city}
                        validation={{ required: true }}
                        error={errors.workAddress?.city}
                        errorMessage={t("application.contact.cityError")}
                        register={register}
                      />

                      <Select
                        id="addressState"
                        name="workAddress.state"
                        label="State"
                        defaultValue={member.workAddress.state}
                        validation={{ required: true }}
                        error={errors.workAddress?.state}
                        errorMessage={t("application.contact.stateError")}
                        register={register}
                        controlClassName="control"
                        options={stateKeys}
                        keyPrefix="application.form.options.states"
                      />
                    </div>

                    <Field
                      id="addressZipCode"
                      name="workAddress.zipCode"
                      label="Zip"
                      placeholder="Zipcode"
                      defaultValue={member.workAddress.zipCode}
                      validation={{ required: true }}
                      error={errors.workAddress?.zipCode}
                      errorMessage={t("application.contact.zipCodeError")}
                      register={register}
                    />
                  </>
                )}
              </div> */}

              <div className="form-card__group">
                <div className={"field " + (errors.relationship ? "error" : "")}>
                  <label className="field-label--caps" htmlFor="relationship">
                    {t("application.household.member.whatIsTheirRelationship")}
                  </label>
                  <div className="control">
                    <select
                      id="relationship"
                      name="relationship"
                      defaultValue={member.relationship}
                      ref={register({ required: true })}
                      className="w-full"
                    >
                      <FormOptions
                        options={relationshipKeys}
                        keyPrefix="application.form.options.relationship"
                      />
                    </select>
                  </div>
                  <ErrorMessage error={errors.relationship}>
                    {t("application.form.errors.selectOption")}
                  </ErrorMessage>
                </div>
              </div>

              <div className="form-card__pager">
                <div className="form-card__pager-row primary">
                  <Button
                    filled={true}
                    className=""
                    onClick={() => {
                      //
                    }}
                  >
                    {saveText}
                  </Button>
                </div>
                <div className="form-card__pager-row py-8">
                  <a href="#" className="lined text-tiny" onClick={deleteMember}>
                    {cancelText}
                  </a>
                </div>
              </div>
            </Form>
          </>
        )}
      </FormCard>
    </FormsLayout>
  )
}
