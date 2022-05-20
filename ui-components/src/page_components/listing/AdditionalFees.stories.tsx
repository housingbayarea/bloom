import * as React from "react"

import { AdditionalFees } from "./AdditionalFees"

export default {
  title: "Listing/Additional Fees",
  component: AdditionalFees,
}

const strings = {
  sectionHeader: "Additional Fees",
  deposit: "Deposit",
  applicationFee: "Application Fee",
}

export const allFields = () => {
  return (
    <AdditionalFees
      deposit={"$1140 - $1500"}
      applicationFee={"$30"}
      costsNotIncluded={
        "Resident responsible for PG&E, internet and phone.  Owner pays for water, trash, and sewage.  Residents encouraged to obtain renter's insurance but this is not a requirement.  Rent is due by the 5th of each month. Late fee $35 and returned check fee is $35 additional."
      }
      strings={{
        ...strings,
        applicationFeeSubtext: ["per applicant age 18 and over", "Due at interview"],
        depositSubtext: ["or one month's rent", "May be higher for lower credit scores"],
      }}
    />
  )
}

export const showsJustDepositRange = () => {
  return <AdditionalFees deposit={"$1140 - $1500"} strings={strings} />
}

export const showsJustFee = () => {
  return <AdditionalFees applicationFee={"$30"} strings={strings} />
}

export const showsJustCostsNotIncluded = () => {
  return (
    <AdditionalFees
      strings={strings}
      costsNotIncluded={
        "Resident responsible for PG&E, internet and phone.  Owner pays for water, trash, and sewage.  Residents encouraged to obtain renter's insurance but this is not a requirement.  Rent is due by the 5th of each month. Late fee $35 and returned check fee is $35 additional."
      }
    />
  )
}
