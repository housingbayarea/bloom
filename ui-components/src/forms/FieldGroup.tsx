import React from "react"
import { ErrorMessage } from "../notifications/ErrorMessage"
import { UseFormMethods } from "react-hook-form"

interface FieldSingle {
  id: string
  label: string
  value?: string
  defaultChecked?: boolean
  note?: string
  inputProps?: Record<string, unknown>
}

interface FieldGroupProps {
  error?: boolean
  errorMessage?: string
  name: string
  type?: string
  groupLabel?: string
  fields?: FieldSingle[]
  groupNote?: string
  groupSubNote?: string
  register: UseFormMethods["register"]
  validation?: Record<string, unknown>
  fieldGroupClassName?: string
  fieldClassName?: string
  fieldLabelClassName?: string
}

const FieldGroup = ({
  name,
  groupLabel,
  fields,
  type = "checkbox",
  validation = {},
  error,
  errorMessage,
  groupNote,
  register,
  fieldGroupClassName,
  fieldClassName,
  fieldLabelClassName,
  groupSubNote,
}: FieldGroupProps) => {
  // Always align two-option radio groups side by side
  if (fields?.length === 2) {
    fieldGroupClassName = `${fieldGroupClassName} flex`
    fieldClassName = `${fieldClassName} flex-initial mr-4`
  }
  return (
    <>
      {groupLabel && <label className="field-label--caps">{groupLabel}</label>}
      {groupNote && <p className="field-note mb-4">{groupNote}</p>}

      <div className={`field ${error && "error"} ${fieldGroupClassName || ""} mb-0`}>
        {fields?.map((item) => (
          <div className={`field ${fieldClassName || ""} mb-1`} key={item.id}>
            <input
              aria-describedby={`${name}-error`}
              aria-invalid={!!error || false}
              type={type}
              id={item.id}
              defaultValue={item.value || item.id}
              name={name}
              defaultChecked={item.defaultChecked || false}
              ref={register(validation)}
              {...item.inputProps}
            />
            <label htmlFor={item.id} className={`font-semibold ${fieldLabelClassName}`}>
              {item.label}
            </label>
            {item.note && <span className={"field-note font-normal"}>{item.note}</span>}
          </div>
        ))}
      </div>
      {groupSubNote && <p className="field-sub-note">{groupSubNote}</p>}
      {error && errorMessage && (
        <ErrorMessage id={`${name}-error`} error={error}>
          {errorMessage}
        </ErrorMessage>
      )}
    </>
  )
}

export { FieldGroup as default, FieldGroup }
