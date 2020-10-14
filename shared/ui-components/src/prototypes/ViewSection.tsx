import * as React from "react"
import "./ViewSection.scss"

export interface ViewSectionProps {
  title?: string
  edit?: string
  subtitle?: string
  tinted?: boolean
  insetGrid?: boolean
  className?: string
  children: React.ReactNode
}

const ViewSection = (props: ViewSectionProps) => {
  const viewGridClasses = ["view-grid"]
  if (props.tinted) viewGridClasses.push("is-tinted")
  if (props.insetGrid) viewGridClasses.push("is-inset")
  if (props.className) viewGridClasses.push(props.className)

  return (
    <div className="view-section">
      {props.title && (
        <header className="view-section__header">
          <h2 className="view-section__title">{props.title}</h2>
          {props.edit && (
            <span className="ml-auto">
              <a className="edit-link">{props.edit}</a>
            </span>
          )}
        </header>
      )}

      <div className={viewGridClasses.join(" ")}>{props.children}</div>
    </div>
  )
}

export { ViewSection as default, ViewSection }
