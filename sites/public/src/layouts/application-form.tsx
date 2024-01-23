import React from "react"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { Button, Card, Heading, Icon } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { t, ProgressNav, StepHeader } from "@bloom-housing/ui-components"
import ApplicationConductor from "../lib/applications/ApplicationConductor"

import styles from "./application-form.module.scss"

interface ApplicationFormLayoutProps {
  listingName: string
  heading: string
  subheading?: string | React.ReactNode
  children?: React.ReactNode
  progressNavProps: {
    currentPageSection: number
    completedSections: number
    labels: string[]
    mounted: boolean
  }
  backLink?: {
    url?: string
    onClickFxn?: () => void
  }
  conductor?: ApplicationConductor
  hideBorder?: boolean
}

const ApplicationFormLayout = (props: ApplicationFormLayoutProps) => {
  const getBackLink = (url?: string, onClickFxn?: () => void) => {
    return (
      <div className={"mb-6"}>
        <Button
          leadIcon={<Icon icon={faChevronLeft} />}
          variant={"text"}
          {...(onClickFxn ? { onClick: onClickFxn } : { href: url })}
        >
          {t("t.back")}
        </Button>
      </div>
    )
  }

  if (!props.progressNavProps.mounted) return

  return (
    <>
      <Card spacing={"sm"} className={styles["application-form-header"]}>
        <CardSection className={"bg-primary px-8 py-4 text-white"}>
          <Heading priority={1} className={"text-xl text-white font-bold font-alt-sans"}>
            {props.listingName}
          </Heading>
        </CardSection>
        <CardSection className={"px-8"}>
          <div className={"hidden md:block"}>
            <ProgressNav {...props.progressNavProps} />
          </div>
          <div className={"block md:hidden"}>
            <StepHeader
              currentStep={props.progressNavProps.currentPageSection}
              totalSteps={props.progressNavProps.labels.length}
              stepPreposition={"of"}
              stepLabeling={props.progressNavProps.labels}
            />
          </div>
        </CardSection>
      </Card>
      <Card spacing={"lg"} className={styles["application-form-body"]}>
        <CardSection divider={"inset"} className={props.hideBorder && "border-none"}>
          {props.backLink && getBackLink(props.backLink.url, props.backLink.onClickFxn)}
          <Heading priority={2} size={"2xl"}>
            {props.heading}
          </Heading>
          {props.subheading && <p className="field-note mt-6">{props.subheading}</p>}
        </CardSection>
        {props.children}
        {props.conductor && (
          <CardSection className={"bg-primary-lighter"}>
            <Button
              type="submit"
              variant="primary"
              onClick={() => {
                props.conductor.returnToReview = false
                props.conductor.setNavigatedBack(false)
              }}
              id={"app-next-step-button"}
            >
              {t("t.next")}
            </Button>

            {props.conductor.canJumpForwardToReview() && (
              <div>
                <Button
                  type="submit"
                  variant="text"
                  className="mt-4"
                  onClick={() => {
                    props.conductor.returnToReview = true
                    props.conductor.setNavigatedBack(false)
                  }}
                >
                  {t("application.form.general.saveAndReturn")}
                </Button>
              </div>
            )}
          </CardSection>
        )}
      </Card>
    </>
  )
}

export default ApplicationFormLayout
