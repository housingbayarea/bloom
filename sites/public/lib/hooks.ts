import { useContext, useEffect, useState } from "react"
import moment from "moment"
import { useRouter } from "next/router"
import { ApplicationStatusProps, isInternalLink, t } from "@bloom-housing/ui-components"
import { Listing, ListingReviewOrder } from "@bloom-housing/backend-core/types"
import { ParsedUrlQuery } from "querystring"
import { AppSubmissionContext } from "./AppSubmissionContext"
import { openInFuture } from "../lib/helpers"

export const useRedirectToPrevPage = (defaultPath = "/") => {
  const router = useRouter()

  return (queryParams: ParsedUrlQuery = {}) => {
    const redirectUrl =
      typeof router.query.redirectUrl === "string" && isInternalLink(router.query.redirectUrl)
        ? router.query.redirectUrl
        : defaultPath
    const redirectParams = { ...queryParams }
    if (router.query.listingId) redirectParams.listingId = router.query.listingId

    return router.push({ pathname: redirectUrl, query: redirectParams })
  }
}

export const useFormConductor = (stepName: string) => {
  const context = useContext(AppSubmissionContext)
  const conductor = context.conductor

  conductor.stepTo(stepName)

  useEffect(() => {
    conductor.skipCurrentStepIfNeeded()
  }, [conductor])
  return context
}

export const useGetApplicationStatusProps = (listing: Listing): ApplicationStatusProps => {
  const [props, setProps] = useState({ content: "", subContent: "" })

  useEffect(() => {
    if (!listing) return
    let content = ""
    let subContent = ""
    let formattedDate = ""
    if (openInFuture(listing)) {
      const date = listing.applicationOpenDate
      const openDate = moment(date)
      formattedDate = openDate.format("MMM. D, YYYY")
      content = t("listings.applicationOpenPeriod")
    } else {
      if (listing.applicationDueDate) {
        const dueDate = moment(listing.applicationDueDate)
        const dueTime = moment(listing.applicationDueTime)
        formattedDate = dueDate.format("MMM. DD, YYYY")
        if (listing.applicationDueTime) {
          formattedDate = formattedDate + ` ${t("t.at")} ` + dueTime.format("h:mm A")
        }
        // if due date is in future, listing is open
        if (moment() < dueDate) {
          content = t("listings.applicationDeadline")
        } else {
          content = t("listings.applicationsClosed")
        }
      }
    }
    content = formattedDate !== "" ? `${content}: ${formattedDate}` : content
    if (listing.reviewOrderType === ListingReviewOrder.firstComeFirstServe) {
      subContent = content
      content = t("listings.applicationFCFS")
    }

    setProps({ content, subContent })
  }, [listing])

  return props
}
