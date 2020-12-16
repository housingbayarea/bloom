import moment from "moment"
import { t, formatIncome } from "@bloom-housing/ui-components"
import { IncomePeriod } from "@bloom-housing/core"

export function getColDefs(maxHouseholdSize: number) {
  const defs = [
    {
      headerName: t("application.details.submittedDate"),
      field: "createdAt",
      sortable: true,
      filter: false,
      pinned: "left",
      width: 200,
      minWidth: 150,
      sort: "asc",
      valueFormatter: ({ value }) => {
        if (!value) return ""

        const date = moment(value).format("MM/DD/YYYY")
        const time = moment(value).format("HH:mm:ss A")

        return `${date} ${t("t.at")} ${time}`
      },
    },
    {
      headerName: t("application.details.number"),
      field: "id",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 120,
      pinned: "left",
      type: "rightAligned",
      cellRenderer: "formatLinkCell",
    },
    {
      headerName: t("application.name.firstName"),
      field: "applicant.firstName",
      sortable: true,
      filter: false,
      pinned: "left",
      width: 125,
      minWidth: 100,
    },
    {
      headerName: t("application.name.lastName"),
      field: "applicant.lastName",
      sortable: true,
      filter: "agTextColumnFilter",
      pinned: "left",
      width: 125,
      minWidth: 100,
    },
    {
      headerName: t("application.details.householdSize"),
      field: "householdSize",
      sortable: true,
      filter: false,
      width: 125,
      minWidth: 120,
      type: "rightAligned",
    },
    {
      headerName: t("applications.table.declaredAnnualIncome"),
      field: "income",
      sortable: true,
      filter: false,
      width: 180,
      minWidth: 150,
      type: "rightAligned",
      valueFormatter: ({ data, value }) => {
        if (!value) return ""

        return data.incomePeriod === IncomePeriod.perYear
          ? formatIncome(value, data.incomePeriod, IncomePeriod.perYear)
          : t("t.n/a")
      },
    },
    {
      headerName: t("applications.table.declaredMonthlyIncome"),
      field: "income",
      sortable: true,
      filter: false,
      width: 180,
      minWidth: 150,
      type: "rightAligned",
      valueFormatter: ({ data, value }) => {
        if (!value) return ""

        return data.incomePeriod === IncomePeriod.perMonth
          ? formatIncome(value, data.incomePeriod, IncomePeriod.perMonth)
          : t("t.n/a")
      },
    },
    {
      headerName: t("applications.table.subsidyOrVoucher"),
      field: "incomeVouchers",
      sortable: true,
      filter: false,
      width: 120,
      minWidth: 100,
      valueFormatter: (data) => {
        if (!data.value) return ""

        return data.value ? t("t.yes") : t("t.no")
      },
    },
    {
      headerName: t("applications.table.requestAda"),
      field: "accessibility",
      sortable: true,
      filter: false,
      width: 120,
      minWidth: 100,
      valueFormatter: (data) => {
        if (!data.value) return ""

        const posiviveValues = Object.entries(data.value).reduce((acc, curr) => {
          if (curr[1] && !["id", "createdAt", "updatedAt"].includes(curr[0])) {
            acc.push(t(`application.ada.${curr[0]}`))
          }

          return acc
        }, [])

        return posiviveValues.length ? posiviveValues.join(", ") : t("t.none")
      },
    },
    {
      headerName: t("applications.table.preferenceClaimed"),
      field: "preferences",
      sortable: true,
      filter: false,
      width: 150,
      minWidth: 100,
      valueFormatter: (data) => {
        if (!data.value) return ""

        const posiviveValues = Object.entries(data.value).reduce((acc, curr) => {
          if (
            curr[0] !== "none" &&
            !["id", "createdAt", "updatedAt"].includes(curr[0]) &&
            curr[1]
          ) {
            acc.push(t(`application.preferences.options.${curr[0]}`))
          }

          return acc
        }, [])

        return posiviveValues.length ? posiviveValues.join(", ") : t("t.none")
      },
    },
    {
      headerName: t("applications.table.primaryDob"),
      field: "applicant",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
      valueFormatter: ({ value }) => {
        if (!value) return ""
        return `${value.birthMonth}/${value.birthDay}/${value.birthYear}`
      },
    },
    {
      headerName: t("t.email"),
      field: "applicant.emailAddress",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
    },
    {
      headerName: t("t.phone"),
      field: "applicant.phoneNumber",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
    },
    {
      headerName: t("applications.table.phoneType"),
      field: "applicant.phoneNumberType",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
      valueFormatter: ({ value }) => {
        if (!value) return ""
        return t(`application.contact.phoneNumberTypes.${value}`)
      },
    },
    {
      headerName: t("t.additionalPhone"),
      field: "additionalPhoneNumber",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
      valueFormatter: ({ value }) => {
        if (!value) return ""
        return value ? value : t("t.none")
      },
    },
    {
      headerName: t("applications.table.additionalPhoneType"),
      field: "additionalPhoneNumberType",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
      valueFormatter: ({ value }) => {
        if (!value) return ""
        return value ? t(`application.contact.phoneNumberTypes.${value}`) : t("t.none")
      },
    },
    {
      headerName: t("applications.table.residenceStreet"),
      field: "applicant.address.street",
      sortable: false,
      filter: false,
      width: 175,
      minWidth: 150,
    },
    {
      headerName: t("applications.table.residenceCity"),
      field: "applicant.address.city",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 120,
    },
    {
      headerName: t("applications.table.residenceState"),
      field: "applicant.address.state",
      sortable: false,
      filter: false,
      width: 120,
      minWidth: 100,
    },
    {
      headerName: t("applications.table.residenceZip"),
      field: "applicant.address.zipCode",
      sortable: false,
      filter: false,
      width: 120,
      minWidth: 100,
    },
    {
      headerName: t("applications.table.mailingStreet"),
      field: "mailingAddress.street",
      sortable: false,
      filter: false,
      width: 175,
      minWidth: 150,
      valueFormatter: function ({ data, value }) {
        if (!value) return ""
        return `${data.sendMailToMailingAddress ? value : data.applicant.address.street}`
      },
    },
    {
      headerName: t("applications.table.mailingCity"),
      field: "mailingAddress.city",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 120,
      valueFormatter: function ({ data, value }) {
        if (!value) return ""

        return `${data.sendMailToMailingAddress ? value : data.applicant.address.city}`
      },
    },
    {
      headerName: t("applications.table.mailingState"),
      field: "mailingAddress.state",
      sortable: false,
      filter: false,
      width: 120,
      minWidth: 100,
      valueFormatter: function ({ data, value }) {
        if (!value) return ""

        return `${data.sendMailToMailingAddress ? value : data.applicant.address.state}`
      },
    },
    {
      headerName: t("applications.table.mailingZip"),
      field: "mailingAddress.zipCode",
      sortable: false,
      filter: false,
      width: 120,
      minWidth: 100,
      valueFormatter: function ({ data, value }) {
        if (!value) return ""

        return `${data.sendMailToMailingAddress ? value : data.applicant.address.zipCode}`
      },
    },
    {
      headerName: t("applications.table.workStreet"),
      field: "applicant.workAddress.street",
      sortable: false,
      filter: false,
      width: 175,
      minWidth: 150,
    },
    {
      headerName: t("applications.table.workCity"),
      field: "applicant.workAddress.city",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 120,
    },
    {
      headerName: t("applications.table.workState"),
      field: "applicant.workAddress.state",
      sortable: false,
      filter: false,
      width: 120,
      minWidth: 100,
    },
    {
      headerName: t("applications.table.workZip"),
      field: "applicant.workAddress.zipCode",
      sortable: false,
      filter: false,
      width: 120,
      minWidth: 100,
    },
    {
      headerName: t("applications.table.altContactFirstName"),
      field: "alternateContact.firstName",
      sortable: false,
      filter: false,
      width: 125,
      minWidth: 100,
    },
    {
      headerName: t("applications.table.altContactLastName"),
      field: "alternateContact.lastName",
      sortable: false,
      filter: false,
      width: 125,
      minWidth: 100,
    },
    {
      headerName: t("applications.table.altContactRelationship"),
      field: "alternateContact.type",
      sortable: false,
      filter: false,
      width: 125,
      minWidth: 100,
      valueFormatter: ({ data, value }) => {
        if (!value) return ""

        return value == "other"
          ? data.alternateContact.otherType
          : t(`application.alternateContact.type.options.${value}`)
      },
    },
    {
      headerName: t("applications.table.altContactAgency"),
      field: "alternateContact.agency",
      sortable: false,
      filter: false,
      width: 125,
      minWidth: 100,
      valueFormatter: ({ value }) => {
        if (!value) return ""
        return value?.length ? value : t("t.none")
      },
    },
    {
      headerName: t("applications.table.altContactEmail"),
      field: "alternateContact.emailAddress",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
    },
    {
      headerName: t("applications.table.altContactPhone"),
      field: "alternateContact.phoneNumber",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
    },

    {
      headerName: t("applications.table.altContactStreetAddress"),
      field: "alternateContact.mailingAddress.street",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
    },
    {
      headerName: t("applications.table.altContactCity"),
      field: "alternateContact.mailingAddress.city",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
    },
    {
      headerName: t("applications.table.altContactState"),
      field: "alternateContact.mailingAddress.state",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
    },
    {
      headerName: t("applications.table.altContactZip"),
      field: "alternateContact.mailingAddress.zipCode",
      sortable: false,
      filter: false,
      width: 150,
      minWidth: 100,
    },
  ]

  const householdCols = []
  // householdSize property includes primary applicant, so we have to exclude it
  for (let i = 0; i < maxHouseholdSize - 1; i++) {
    const householdIndex = i + 1

    householdCols.push(
      {
        headerName: `${t("applications.table.householdFirstName")} ${householdIndex}`,
        field: "householdMembers",
        sortable: false,
        filter: false,
        width: 125,
        minWidth: 100,
        valueFormatter: ({ value }) => {
          if (!value) return ""

          return value[i] ? value[i].firstName : ""
        },
      },
      {
        headerName: `${t("applications.table.householdLastName")} ${householdIndex}`,
        field: "householdMembers",
        sortable: false,
        filter: false,
        width: 125,
        minWidth: 100,
        valueFormatter: ({ value }) => {
          if (!value) return ""

          return value[i] ? value[i].lastName : ""
        },
      },
      {
        headerName: `${t("applications.table.householdRelationship")} ${householdIndex}`,
        field: "householdMembers",
        sortable: false,
        filter: false,
        width: 125,
        minWidth: 100,
        valueFormatter: ({ value }) => {
          if (!value) return ""

          return value[i] ? t(`application.form.options.relationship.${value[i].relationship}`) : ""
        },
      },
      {
        headerName: `${t("applications.table.householdDob")} ${householdIndex}`,
        field: "householdMembers",
        sortable: false,
        filter: false,
        width: 125,
        minWidth: 100,
        valueFormatter: ({ value }) => {
          if (!value) return ""

          return value[i] ? `${value[i].birthMonth}/${value[i].birthDay}/${value[i].birthYear}` : ""
        },
      },
      {
        headerName: `${t("applications.table.householdStreetAddress")} ${householdIndex}`,
        field: "householdMembers",
        sortable: false,
        filter: false,
        width: 125,
        minWidth: 100,
        valueFormatter: ({ value }) => {
          if (!value) return ""

          return value[i] ? value[i].address.street : ""
        },
      },
      {
        headerName: `${t("applications.table.householdCity")} ${householdIndex}`,
        field: "householdMembers",
        sortable: false,
        filter: false,
        width: 125,
        minWidth: 100,
        valueFormatter: ({ value }) => {
          if (!value) return ""

          return value[i] ? value[i].address.city : ""
        },
      },
      {
        headerName: `${t("applications.table.householdState")} ${householdIndex}`,
        field: "householdMembers",
        sortable: false,
        filter: false,
        width: 125,
        minWidth: 100,
        valueFormatter: ({ value }) => {
          if (!value) return ""

          return value[i] ? value[i].address.state : ""
        },
      },
      {
        headerName: `${t("applications.table.householdZip")} ${householdIndex}`,
        field: "householdMembers",
        sortable: false,
        filter: false,
        width: 125,
        minWidth: 100,
        valueFormatter: ({ value }) => {
          if (!value) return ""

          return value[i] ? value[i].address.zipCode : ""
        },
      }
    )
  }

  return [...defs, ...householdCols]
}
