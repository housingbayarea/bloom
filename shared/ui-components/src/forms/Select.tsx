import React from "react"
import { ErrorMessage } from "../notifications/ErrorMessage"
import { FormOptions } from "../helpers/formOptions"

interface SelectProps {
  error?: boolean
  errorMessage?: string
  controlClassName?: string
  labelClassName?: string
  type?: string
  id?: string
  name: string
  label?: string
  defaultValue?: string
  placeholder?: string
  register: any // comes from React Hook Form
  validation?: Record<string, any>
  disabled?: boolean
  options: string[]
  keyPrefix: string
}

export const Select = ({
  error,
  errorMessage,
  controlClassName,
  labelClassName,
  id,
  name,
  label,
  defaultValue = "",
  placeholder,
  register,
  validation,
  disabled,
  options,
  keyPrefix,
}: SelectProps) => {
  return (
    <div className={"field " + (error ? "error" : "")}>
      <label className={labelClassName} htmlFor={id}>
        {label}
      </label>
      <div className={controlClassName}>
        <select
          className="input"
          id={id || name}
          name={name}
          defaultValue={defaultValue}
          ref={register(validation)}
          disabled={disabled}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          <FormOptions options={options} keyPrefix={keyPrefix} />
        </select>
      </div>
      {error && errorMessage && <ErrorMessage error={error}>{errorMessage}</ErrorMessage>}
    </div>
  )
}
