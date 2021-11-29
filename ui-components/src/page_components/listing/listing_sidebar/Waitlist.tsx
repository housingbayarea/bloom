import * as React from "react"
import { t } from "../../../helpers/translator"

export interface WaitlistProps {
  isWaitlistOpen: boolean
  waitlistMaxSize?: number | null
  waitlistCurrentSize?: number | null
  waitlistOpenSpots?: number | null
}

const WaitlistItem = (props: { className?: string; value: number; text: string }) => (
  <li className={`uppercase text-gray-800 text-tiny ${props.className}`}>
    <span className="text-right w-12 inline-block pr-2">{props.value}</span>
    <span>{props.text}</span>
  </li>
)

const Waitlist = (props: WaitlistProps) => {
  if (!props.isWaitlistOpen) return <></>

  return (
    <section className="aside-block is-tinted">
      <h4 className="text-caps-tiny">{t("listings.waitlist.unitsAndWaitlist")}</h4>
      <div>
        <p className="text-tiny text-gray-800 pb-3">{t("listings.waitlist.submitAnApplication")}</p>
        <ul>
          {props.waitlistCurrentSize !== null && props.waitlistCurrentSize !== undefined && (
            <WaitlistItem
              value={props.waitlistCurrentSize}
              text={t("listings.waitlist.currentSize")}
            />
          )}
          {props.waitlistOpenSpots !== null && props.waitlistOpenSpots !== undefined && (
            <WaitlistItem
              value={props.waitlistOpenSpots}
              text={t("listings.waitlist.openSlots")}
              className={"font-semibold"}
            />
          )}
          {props.waitlistMaxSize != null && (
            <WaitlistItem value={props.waitlistMaxSize} text={t("listings.waitlist.finalSize")} />
          )}
        </ul>
      </div>
    </section>
  )
}

export { Waitlist as default, Waitlist }
