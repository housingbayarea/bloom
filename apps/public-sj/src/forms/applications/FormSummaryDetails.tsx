import React, { ReactNode, Fragment, useEffect, useState } from "react"
import Link from "next/link"
import { MultiLineAddress, ViewItem, t } from "@bloom-housing/ui-components"
import { Address } from "@bloom-housing/core"

const EditLink = (props: { href: string }) => (
  <div className="float-right flex">
    <Link href={props.href}>
      <a className="edit-link">{t("label.edit")}</a>
    </Link>
  </div>
)

const accessibilityLabels = (accessibility) => {
  const labels = []
  if (accessibility.mobility) labels.push(t("application.ada.mobility"))
  if (accessibility.vision) labels.push(t("application.ada.vision"))
  if (accessibility.hearing) labels.push(t("application.ada.hearing"))
  if (labels.length === 0) labels.push(t("t.no"))

  return labels
}

const reformatAddress = (address: Address) => {
  const { street, street2, city, state, zipCode } = address
  const newAddress = {
    placeName: street,
    street: street2,
    city,
    state,
    zipCode,
  } as Address
  if (newAddress.street === null || newAddress.street === "") {
    if (newAddress.placeName) {
      newAddress.street = newAddress.placeName
      delete newAddress.placeName
    }
  }
  return newAddress
}

const FormSummaryDetails = ({ application, editMode = false }) => {
  // fix for rehydration
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, [])
  if (!hasMounted) {
    return null
  }

  const alternateContactName = () => {
    switch (application.alternateContact.type) {
      case "other":
        return application.alternateContact.otherType
      case "caseManager":
        return application.alternateContact.agency
      case "":
        return ""
      default:
        return t(`application.alternateContact.type.options.${application.alternateContact.type}`)
    }
  }

  return (
    <>
      <h3 className="form--card__sub-header">
        {t("t.you")}
        {editMode && <EditLink href="/applications/contact/name" />}
      </h3>

      <div className="form-card__group mx-0">
        <ViewItem id="applicantName" label={t("t.name")}>
          {application.applicant.firstName} {application.applicant.middleName}{" "}
          {application.applicant.lastName}
        </ViewItem>

        <ViewItem id="applicantbirthDay" label={t("application.household.member.dateOfBirth")}>
          {application.applicant.birthMonth}/{application.applicant.birthDay}/
          {application.applicant.birthYear}
        </ViewItem>

        {application.applicant.phoneNumber && (
          <ViewItem
            id="applicantPhone"
            label={t("t.phone")}
            helper={t(
              `application.contact.phoneNumberTypes.${application.applicant.phoneNumberType}`
            )}
          >
            {application.applicant.phoneNumber}
          </ViewItem>
        )}

        {application.additionalPhoneNumber && (
          <ViewItem
            id="applicantAdditionalPhone"
            label={t("t.additionalPhone")}
            helper={t(
              `application.contact.phoneNumberTypes.${application.additionalPhoneNumberType}`
            )}
          >
            {application.additionalPhoneNumber}
          </ViewItem>
        )}

        {application.applicant.emailAddress && (
          <ViewItem id="applicantEmail" label={t("label.email")}>
            {application.applicant.emailAddress}
          </ViewItem>
        )}

        <ViewItem id="applicantAddress" label={t("application.contact.address")}>
          <MultiLineAddress address={reformatAddress(application.applicant.address)} />
        </ViewItem>

        {application.sendMailToMailingAddress && (
          <ViewItem id="applicantMailingAddress" label={t("application.contact.mailingAddress")}>
            <MultiLineAddress address={reformatAddress(application.mailingAddress)} />
          </ViewItem>
        )}

        {application.applicant.workInRegion === "yes" && (
          <ViewItem id="applicantWorkAddress" label={t("application.contact.workAddress")}>
            <MultiLineAddress address={reformatAddress(application.applicant.workAddress)} />
          </ViewItem>
        )}

        {application.contactPreferences && (
          <ViewItem
            id="applicantPreferredContactType"
            label={t("application.contact.preferredContactType")}
          >
            {application.contactPreferences
              ?.map((item) => t(`application.form.options.contact.${item}`))
              .join(", ")}
          </ViewItem>
        )}
      </div>

      {application.alternateContact.type !== "" &&
        application.alternateContact.type !== "noContact" && (
          <div id="alternateContact">
            <h3 className="form--card__sub-header">
              {t("application.alternateContact.type.label")}
              {editMode && <EditLink href="/applications/contact/alternate-contact-type" />}
            </h3>

            <div className="form-card__group mx-0">
              <p className="field-note mb-5">
                {t(`application.alternateContact.type.description`)}
              </p>
              <ViewItem id="alternateName" label={t("t.name")} helper={alternateContactName()}>
                {application.alternateContact.firstName} {application.alternateContact.lastName}
              </ViewItem>

              {application.alternateContact.emailAddress && (
                <ViewItem id="alternateEmail" label={t("t.email")}>
                  {application.alternateContact.emailAddress}
                </ViewItem>
              )}

              {application.alternateContact.phoneNumber && (
                <ViewItem id="alternatePhone" label={t("t.phone")}>
                  {application.alternateContact.phoneNumber}
                </ViewItem>
              )}

              {Object.values(application.alternateContact.mailingAddress).some(
                (value) => value !== ""
              ) && (
                <ViewItem id="alternateMailingAddress" label={t("application.contact.address")}>
                  <MultiLineAddress address={application.alternateContact.mailingAddress} />
                </ViewItem>
              )}
            </div>
          </div>
        )}

      {application.householdSize > 1 && (
        <div id="householdMembers">
          <h3 className="form--card__sub-header">
            {t("application.household.householdMembers")}
            {editMode && <EditLink href="/applications/household/add-members" />}
          </h3>

          <div id="members" className="form-card__group info-group mx-0">
            {application.householdMembers.map((member) => (
              <div className="info-group__item" key={`${member.firstName} - ${member.lastName}`}>
                <ViewItem>
                  {member.firstName} {member.lastName}
                </ViewItem>
                <div>
                  <ViewItem label={t("application.household.member.dateOfBirth")}>
                    {member.birthMonth}/{member.birthDay}/{member.birthYear}
                  </ViewItem>
                  {member.sameAddress === "no" && (
                    <ViewItem label={t("application.contact.address")}>
                      <MultiLineAddress address={reformatAddress(member.address)} />
                    </ViewItem>
                  )}
                  {member.sameAddress !== "no" && (
                    <ViewItem label={t("application.review.sameAddressAsApplicant")}></ViewItem>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div id="householdDetails">
        <h3 className="form--card__sub-header">
          {t("application.review.householdDetails")}
          {editMode && <EditLink href="/applications/household/preferred-units" />}
        </h3>

        <div className="form-card__group mx-0">
          {application.preferredUnit && (
            <ViewItem
              id="householdUnitType"
              label={t("application.household.preferredUnit.preferredUnitType")}
            >
              {application.preferredUnit
                .map((item) => t(`application.household.preferredUnit.options.${item}`))
                .join(", ")}
            </ViewItem>
          )}
          <ViewItem id="householdAda" label={t("application.ada.label")}>
            {accessibilityLabels(application.accessibility).map((item) => (
              <Fragment key={item}>
                {item}
                <br />
              </Fragment>
            ))}
          </ViewItem>
        </div>

        <h3 className="form--card__sub-header">
          {t("t.income")}
          {editMode && <EditLink href="/applications/financial/vouchers" />}
        </h3>

        <div className="form-card__group border-b mx-0">
          <ViewItem id="incomeVouchers" label={t("application.review.voucherOrSubsidy")}>
            {application.incomeVouchers ? t("t.yes") : t("t.no")}
          </ViewItem>

          {application.incomePeriod && (
            <ViewItem id="incomeValue" label={t("t.income")}>
              ${application.income} {t(`application.financial.income.${application.incomePeriod}`)}
            </ViewItem>
          )}
        </div>

        <h3 className="form--card__sub-header">
          {t("t.preferences")}
          {editMode && <EditLink href="/applications/preferences/select" />}
        </h3>

        <div id="preferences" className="form-card__group border-b mx-0">
          {application.preferences.none ? (
            <p className="field-note text-black">
              {t("application.preferences.general.title")}{" "}
              {t("application.preferences.general.preamble")}
            </p>
          ) : (
            <>
              {Object.entries(application.preferences)
                .filter((option) => option[0] != "none" && option[1])
                .map((option) => (
                  <ViewItem label={t("application.preferences.youHaveClaimed")}>
                    {t(`application.preferences.${option[0]}.label`)}
                  </ViewItem>
                ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default FormSummaryDetails
