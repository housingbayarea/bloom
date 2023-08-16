import * as React from "react"
import { AppearanceStyleType, Tag } from "@bloom-housing/ui-components"
import styles from "./StatusBar.module.scss"

export interface StatusBarProps {
  backButton?: React.ReactNode
  tagStyle: AppearanceStyleType
  tagLabel: string
}

const StatusBar = (props: StatusBarProps) => {
  return (
    <section className={styles["status-bar"]}>
      <div
        className={`${styles["status-bar__row"]} ${!props.backButton ? styles["tag-only"] : ""}`}
      >
        {props.backButton}

        <div className={styles["status-bar__tag"]}>
          <Tag styleType={props.tagStyle} pillStyle fillContainer>
            {props.tagLabel}
          </Tag>
        </div>
      </div>
    </section>
  )
}

export { StatusBar as default, StatusBar }
