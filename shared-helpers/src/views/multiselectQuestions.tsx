import * as React from "react"

import { UseFormMethods } from "react-hook-form"
import {
  ExpandableContent,
  Field,
  FieldGroup,
  resolveObject,
  t,
} from "@bloom-housing/ui-components"
import { stateKeys } from "../utilities/formKeys"
import {
  ApplicationMultiselectQuestion,
  ApplicationMultiselectQuestionOption,
  InputType,
  Listing,
  ListingMultiselectQuestion,
  MultiselectOption,
  MultiselectQuestion,
  MultiselectQuestionsApplicationSectionEnum,
} from "../types/backend-swagger"
import { AddressHolder } from "../utilities/constants"
import { FormAddressAlternate } from "./address/FormAddressAlternate"

// Removes periods, commas, and apostrophes
export const cleanMultiselectString = (name: string | undefined) => {
  return name?.replace(/\.|,|'/g, "")
}

export const listingSectionQuestions = (
  listing: Listing,
  applicationSection: MultiselectQuestionsApplicationSectionEnum
) => {
  const selectQuestions = listing?.listingMultiselectQuestions?.filter(
    (question) =>
      question?.multiselectQuestions?.applicationSection ===
      MultiselectQuestionsApplicationSectionEnum[applicationSection]
  )
  return selectQuestions
}

// Get a field name for an application multiselect question
export const fieldName = (
  questionName: string,
  applicationSection: MultiselectQuestionsApplicationSectionEnum,
  optionName?: string
) => {
  return `application.${applicationSection}.${cleanMultiselectString(questionName)}${
    optionName ? `.${cleanMultiselectString(optionName)}` : ""
  }`
}

// Get an array of option field name strings for all options within a single question that are exclusive
export const getExclusiveKeys = (
  question: MultiselectQuestion,
  applicationSection: MultiselectQuestionsApplicationSectionEnum
): string[] => {
  const exclusive: string[] = []
  question?.options?.forEach((option: MultiselectOption) => {
    if (option.exclusive) exclusive.push(fieldName(question.text, applicationSection, option.text))
  })
  if (question?.optOutText)
    exclusive.push(fieldName(question.text, applicationSection, question.optOutText))
  return exclusive
}

// Set the value as false for a set of option field names
const uncheckOptions = (options: string[], setValue: (key: string, value: boolean) => void) => {
  options?.forEach((option) => {
    setValue(option, false)
  })
}

// Set the value of an exclusive field, adjusting other fields to follow the exclusive behavior
export const setExclusive = (
  exclusiveValue: boolean,
  setValue: (key: string, value: boolean) => void,
  exclusiveKeys: string[],
  exclusiveName: string,
  allOptions: string[]
) => {
  if (exclusiveValue) {
    // Uncheck all other keys if setting an exclusive key to true
    uncheckOptions(allOptions, setValue)
    setValue(exclusiveName, true)
  } else {
    // Uncheck all exclusive keys if setting a multiselect key to true
    exclusiveKeys.forEach((exclusiveOption) => {
      setValue(exclusiveOption, false)
    })
  }
}

// Get the input type for all options in a single question - if all are exclusive use a radio
export const getInputType = (options: MultiselectOption[]) => {
  return options?.filter((option) => option.exclusive).length === options?.length
    ? "radio"
    : "checkbox"
}

// Get the question with the same ordinal as the current page if it exists
export const getPageQuestion = (questions: ListingMultiselectQuestion[], page: number) => {
  const ordinalQuestions = questions?.filter((item) => {
    return item.ordinal === page
  })

  return ordinalQuestions?.length ? ordinalQuestions[0]?.multiselectQuestions : null
}

// Get all option field names for a question, including the potential opt out option
export const getAllOptions = (
  question: MultiselectQuestion,
  applicationSection: MultiselectQuestionsApplicationSectionEnum
) => {
  const optionPaths =
    question?.options?.map((option) => fieldName(question.text, applicationSection, option.text)) ??
    []
  if (question?.optOutText) {
    optionPaths.push(fieldName(question?.text, applicationSection, question?.optOutText))
  }
  return optionPaths
}

export const getRadioFields = (
  options: MultiselectOption[],
  register: UseFormMethods["register"],
  question: MultiselectQuestion,
  applicationSection: MultiselectQuestionsApplicationSectionEnum,
  errors?: UseFormMethods["errors"]
) => {
  return (
    <fieldset>
      {applicationSection === MultiselectQuestionsApplicationSectionEnum.preferences && (
        <legend className="text__caps-spaced mb-4">{question?.text}</legend>
      )}
      <FieldGroup
        fieldGroupClassName="grid grid-cols-1"
        fieldClassName="ml-0"
        type={"radio"}
        groupNote={t("t.pleaseSelectOne")}
        name={fieldName(question?.text, applicationSection)}
        error={errors && errors?.application?.programs?.[question?.text]}
        errorMessage={errors && t("errors.selectAnOption")}
        register={register}
        validation={{ required: true }}
        fields={options?.map((option) => {
          return {
            id: `${question?.text}-${option?.text}`,
            label: option?.text,
            value: option?.text,
            description: option?.description,
            dataTestId: "app-question-option",
          }
        })}
      />
    </fieldset>
  )
}

const getCheckboxField = (
  option: MultiselectOption,
  question: MultiselectQuestion,
  applicationSection: MultiselectQuestionsApplicationSectionEnum,
  register: UseFormMethods["register"],
  setValue: UseFormMethods["setValue"],
  getValues: UseFormMethods["getValues"],
  allOptions: string[],
  optionFieldName: string,
  trigger?: UseFormMethods["trigger"],
  exclusiveKeys?: string[]
) => {
  return (
    <Field
      id={option.text}
      name={optionFieldName}
      type={"checkbox"}
      label={option.text}
      register={register}
      inputProps={{
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.checked && trigger) {
            void trigger()
          }
          const allOptions =
            question?.options?.map((option) =>
              fieldName(question.text, applicationSection, option.text)
            ) ?? []
          if (question.optOutText) {
            allOptions.push(fieldName(question.text, applicationSection, question.optOutText))
          }
          if (option.exclusive && e.target.checked && exclusiveKeys) {
            setExclusive(true, setValue, exclusiveKeys, optionFieldName, allOptions)
          }
          if (!option.exclusive && exclusiveKeys) {
            setExclusive(false, setValue, exclusiveKeys, optionFieldName, allOptions)
          }
        },
      }}
      validation={{
        validate: {
          somethingIsChecked: (value) => {
            if (question.optOutText && trigger) {
              return value || !!allOptions.find((option) => getValues(option))
            }
          },
        },
      }}
      dataTestId={"app-question-option"}
    />
  )
}

// Get an individual question option checkbox field
export const getCheckboxOption = (
  option: MultiselectOption,
  question: MultiselectQuestion,
  applicationSection: MultiselectQuestionsApplicationSectionEnum,
  register: UseFormMethods["register"],
  setValue: UseFormMethods["setValue"],
  getValues: UseFormMethods["getValues"],
  allOptions: string[],
  watchFields: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any
  },
  errors?: UseFormMethods["errors"],
  trigger?: UseFormMethods["trigger"],
  exclusiveKeys?: string[]
) => {
  const optionFieldName = fieldName(question.text, applicationSection, option.text)
  return (
    <div className="mb-3" key={option.text}>
      <div className={`mb-3 field ${resolveObject(optionFieldName, errors) ? "error" : ""}`}>
        {getCheckboxField(
          option,
          question,
          applicationSection,
          register,
          setValue,
          getValues,
          allOptions,
          optionFieldName,
          trigger,
          exclusiveKeys
        )}
      </div>
      {option.description && (
        <div className="ml-8 -mt-3 mb-6">
          <ExpandableContent strings={{ readMore: t("t.readMore"), readLess: t("t.readLess") }}>
            <p className="field-note mb-2">
              {option.description}
              <br />
              {option?.links?.map((link) => (
                <a
                  key={link.url}
                  className="block pt-2 text-blue-500 underline"
                  href={link.url}
                  target={"_blank"}
                  rel="noreferrer noopener"
                >
                  {link.title}
                </a>
              ))}
            </p>
          </ExpandableContent>
        </div>
      )}
      {watchFields[optionFieldName] && option.collectName && (
        <Field
          id={AddressHolder.Name}
          name={`${optionFieldName}-${AddressHolder.Name}`}
          label={t(`application.preferences.options.${AddressHolder.Name}`)}
          register={register}
          validation={{ required: true, maxLength: 64 }}
          error={!!resolveObject(`${optionFieldName}-${AddressHolder.Name}`, errors)}
          errorMessage={
            resolveObject(`${optionFieldName}-${AddressHolder.Name}`, errors)?.type === "maxLength"
              ? t("errors.maxLength")
              : t("errors.requiredFieldError")
          }
          dataTestId="addressHolder-name"
        />
      )}
      {watchFields[optionFieldName] && option.collectRelationship && (
        <Field
          id={AddressHolder.Relationship}
          name={`${optionFieldName}-${AddressHolder.Relationship}`}
          label={t(`application.preferences.options.${AddressHolder.Relationship}`)}
          register={register}
          validation={{ required: true, maxLength: 64 }}
          error={!!resolveObject(`${optionFieldName}-${AddressHolder.Relationship}`, errors)}
          errorMessage={
            resolveObject(`${optionFieldName}-${AddressHolder.Relationship}`, errors)?.type ===
            "maxLength"
              ? t("errors.maxLength")
              : t("errors.requiredFieldError")
          }
          dataTestId="addressHolder-relationship"
        />
      )}
      {watchFields[optionFieldName] && option.collectAddress && (
        <div className="pb-4">
          <FormAddressAlternate
            subtitle={t("application.preferences.options.qualifyingAddress")}
            dataKey={fieldName(question.text, applicationSection, `${option.text}-address`)}
            register={register}
            errors={errors}
            required={true}
            stateKeys={stateKeys}
            data-testid={"app-question-extra-field"}
          />
        </div>
      )}
    </div>
  )
}

export const mapRadiosToApi = (
  data: { [name: string]: string },
  question: MultiselectQuestion
): ApplicationMultiselectQuestion => {
  const [key, value] = Object.entries(data)[0]
  const options: ApplicationMultiselectQuestionOption[] = []

  if (value) {
    options.push({
      key: value,
      checked: true,
      extraData: [],
    })
  }

  question?.options?.forEach((option) => {
    if (option.text !== value) {
      options.push({
        key: option.text,
        checked: false,
        extraData: [],
      })
    }
  })

  return {
    multiselectQuestionId: question.id,
    key,
    claimed: Object.keys(data)?.length !== 0,
    options,
  }
}

export const mapCheckboxesToApi = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: { [name: string]: any },
  question: MultiselectQuestion,
  applicationSection: MultiselectQuestionsApplicationSectionEnum
): ApplicationMultiselectQuestion => {
  const data =
    formData["application"][applicationSection][cleanMultiselectString(question.text) || ""]
  const claimed = !!Object.keys(data).filter((key) => data[key] === true).length

  const addressFields = Object.keys(data).filter((option) => Object.keys(data[option]))
  const questionOptions: ApplicationMultiselectQuestionOption[] = Object.keys(data)
    .filter((option) => !Object.keys(data[option]).length)
    .map((key) => {
      const extraData = []
      const addressData = addressFields.filter((addressField) => addressField === `${key}-address`)
      const addressHolderNameData = addressFields.filter(
        (addressField) => addressField === `${key}-${AddressHolder.Name}`
      )
      const addressHolderRelationshipData = addressFields.filter(
        (addressField) => addressField === `${key}-${AddressHolder.Relationship}`
      )
      if (data[key] === true && addressData.length) {
        extraData.push({ type: InputType.address, key: "address", value: data[addressData[0]] })

        if (addressHolderNameData.length) {
          extraData.push({
            type: InputType.text,
            key: AddressHolder.Name,
            value: data[addressHolderNameData[0]],
          })
        }

        if (addressHolderRelationshipData.length) {
          extraData.push({
            type: InputType.text,
            key: AddressHolder.Relationship,
            value: data[addressHolderRelationshipData[0]],
          })
        }
      }

      const getFinalKey = () => {
        const optionKey = question?.options?.find(
          (elem) => cleanMultiselectString(elem.text) === key
        )?.text
        const cleanOptOutKey = cleanMultiselectString(question?.optOutText)
        if (cleanOptOutKey === key) return question?.optOutText || key
        return optionKey || key
      }

      return {
        key: getFinalKey(),
        mapPinPosition: data?.[`${key}-mapPinPosition`],
        checked: data[key] === true,
        extraData: extraData,
      }
    })

  return {
    multiselectQuestionId: question.id,
    key: question.text ?? "",
    claimed,
    options: questionOptions,
  }
}

export const mapApiToMultiselectForm = (
  applicationQuestions: ApplicationMultiselectQuestion[],
  listingQuestions: ListingMultiselectQuestion[],
  applicationSection: MultiselectQuestionsApplicationSectionEnum
) => {
  const questionsFormData = { application: { [applicationSection]: Object.create(null) } }

  const applicationQuestionsWithTypes: {
    question: ApplicationMultiselectQuestion
    inputType: string
  }[] = applicationQuestions?.map((question) => {
    return {
      question,
      inputType: getInputType(
        listingQuestions?.filter(
          (listingQuestion) => listingQuestion?.multiselectQuestions?.text === question.key
        )[0]?.multiselectQuestions?.options ?? []
      ),
    }
  })

  applicationQuestionsWithTypes?.forEach((appQuestion) => {
    let options = Object.create(null)

    const question = appQuestion.question
    /**
     * Checkbox fields expect the following format
     * QuestionName: {
     *    OptionName1: true
     *    OptionName2: false
     *    OptionName1-address: {
     *      street: "",
     *      city: "",
     *      ...
     *    }
     * }
     */
    if (appQuestion.inputType === "checkbox") {
      options = question.options.reduce((acc, curr) => {
        const claimed = curr.checked
        const cleanKey = cleanMultiselectString(curr.key) || ""
        if (appQuestion.inputType === "checkbox") {
          acc[cleanKey] = claimed
          if (curr.extraData?.length) {
            acc[`${cleanKey}-address`] = curr.extraData[0].value

            const addressHolderName = curr.extraData?.find(
              (field) => field.key === AddressHolder.Name
            )
            if (addressHolderName) {
              acc[`${cleanKey}-${AddressHolder.Name}`] = addressHolderName.value
            }

            const addressHolderRelationship = curr.extraData?.find(
              (field) => field.key === AddressHolder.Relationship
            )
            if (addressHolderRelationship) {
              acc[`${cleanKey}-${AddressHolder.Relationship}`] = addressHolderRelationship.value
            }
            if (curr?.mapPinPosition) {
              acc[`${cleanKey}-mapPinPosition`] = curr.mapPinPosition
            }
          }
        }

        return acc
      }, {})

      questionsFormData["application"][applicationSection][question.key] = options
    }

    /**
     * Radio fields expect the following format
     * QuestionName: OptionName
     */
    if (appQuestion.inputType === "radio") {
      const selectedRadio = question.options.filter((option) => !!option.checked)[0]
      questionsFormData["application"][applicationSection][question?.key] = selectedRadio?.key
    }
  })

  return { ...questionsFormData }
}
