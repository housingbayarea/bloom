import React, { useRef } from "react"
import "./Modal.scss"
import { Icon } from "../icons/Icon"
import { Overlay, OverlayProps } from "./Overlay"
import { nanoid } from "nanoid"

export interface ModalProps extends Omit<OverlayProps, "children"> {
  title: string
  actions?: React.ReactNode[]
  hideCloseIcon?: boolean
  children?: React.ReactNode
  slim?: boolean
  role?: string
  modalClassNames?: string
  innerClassNames?: string
  closeClassNames?: string
  scrollable?: boolean
}

const ModalHeader = (props: { title: string; uniqueId?: string }) => (
  <>
    <header className="modal__inner">
      <h1 className="modal__title" id={props.uniqueId}>
        {props.title}
      </h1>
    </header>
  </>
)

const ModalFooter = (props: { actions: React.ReactNode[] }) => (
  <footer className="modal__footer bg-primary-lighter" data-testid="footer">
    <div className="flex flex-row-reverse gap-5">
      {props.actions.map((action: React.ReactNode, index: number) => (
        <div key={index}>{action}</div>
      ))}
    </div>
  </footer>
)

export const Modal = (props: ModalProps) => {
  const uniqueIdRef = useRef(nanoid())
  const modalClassNames = ["modal"]
  const innerClassNames = ["modal__inner"]
  const closeClassNames = ["modal__close"]
  if (props.scrollable) innerClassNames.push("is-scrollable")
  if (props.modalClassNames) modalClassNames.push(...props.modalClassNames.split(" "))
  if (props.innerClassNames) innerClassNames.push(...props.innerClassNames.split(" "))
  if (props.closeClassNames) closeClassNames.push(...props.closeClassNames.split(" "))

  return (
    <Overlay
      ariaLabelledBy={uniqueIdRef.current}
      ariaDescription={props.ariaDescription}
      open={props.open}
      onClose={props.onClose}
      backdrop={props.backdrop}
      slim={props.slim}
      role={props.role ? props.role : "dialog"}
    >
      <div className={modalClassNames.join(" ")}>
        <ModalHeader title={props.title} uniqueId={uniqueIdRef.current} />

        <section className={innerClassNames.join(" ")}>
          {typeof props.children === "string" ? (
            <p className="c-steel">{props.children}</p>
          ) : (
            props.children
          )}
        </section>

        {props.actions && <ModalFooter actions={props.actions} />}

        {!props.hideCloseIcon && (
          <button
            className={closeClassNames.join(" ")}
            aria-label="Close"
            onClick={props.onClose}
            tabIndex={0}
          >
            <Icon size="medium" symbol="close" />
          </button>
        )}
      </div>
    </Overlay>
  )
}
