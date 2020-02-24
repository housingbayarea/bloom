import moment from "moment"
import { Listing } from "@bloom-housing/core/src/listings"

export const openDateState = (listing: Listing) => {
  const nowTime = moment()
  return (
    (listing.applicationOpenDate && nowTime < moment(listing.applicationOpenDate)) ||
    listing.applicationDueDate == ""
  )
}
