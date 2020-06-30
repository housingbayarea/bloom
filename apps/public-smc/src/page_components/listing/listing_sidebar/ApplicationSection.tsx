import * as React from "react"
import moment from "moment"
import { Listing } from "@bloom-housing/core"
import Apply from "@bloom-housing/ui-components/src/page_components/listing/listing_sidebar/Apply"
import Waitlist from "./Waitlist"
import { openDateState } from "@bloom-housing/ui-components"

export interface ApplicationSectionProps {
  listing: Listing
}

const ApplicationSection = (props: ApplicationSectionProps) => {
  const listing = props.listing
  const dueDate = moment(listing.applicationDueDate)
  const nowTime = moment()

  // If applications are closed, hide this section
  if (nowTime > dueDate) return null

  return (
    <div>
      {!openDateState(listing) && (
        <section className="aside-block bg-primary-lighter border-t">
          <Waitlist listing={listing} />
        </section>
      )}
      <Apply listing={listing} />
    </div>
  )
}

export { ApplicationSection as default, ApplicationSection }
