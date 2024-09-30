import React from "react"
import dayjs from "dayjs"
import { StatusItem } from "../../components/account/StatusItem"
import {
  Application,
  Listing,
  LotteryStatusEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"

export interface AppWithListing extends Application {
  listings: Listing
}
interface StatusItemWrapperProps {
  application: AppWithListing
}

const StatusItemWrapper = (props: StatusItemWrapperProps) => {
  const applicationDueDate = props.application?.listings?.applicationDueDate
  const lotteryStartDate = props.application?.listings?.listingEvents[0]?.startDate
  const lotteryLastPublishedAt = props.application?.listings?.lotteryLastPublishedAt
  return (
    <StatusItem
      applicationDueDate={applicationDueDate && dayjs(applicationDueDate).format("MMM D, YYYY")}
      applicationURL={`/account/application/${props.application?.id}`}
      confirmationNumber={props.application?.confirmationCode || props.application?.id}
      listingName={props.application?.listings?.name}
      listingURL={`/listing/${props.application?.listings?.id}`}
      listingStatus={props.application.listings.status}
      key={props.application?.id}
      lotteryStartDate={lotteryStartDate && dayjs(lotteryStartDate).format("MMM D, YYYY")}
      lotteryPublishedDate={
        lotteryLastPublishedAt && dayjs(lotteryLastPublishedAt).format("MMM D, YYYY")
      }
      lotteryResults={
        props.application?.listings?.lotteryStatus === LotteryStatusEnum.publishedToPublic
      }
      lotteryURL={`/account/application/${props.application?.id}/lottery-results`}
    />
  )
}

export { StatusItemWrapper as default, StatusItemWrapper }