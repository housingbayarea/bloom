/*
0.2 - What To Expect
A notice regarding application process and rules
*/
import {
  AppearanceStyleType,
  Button,
  FormCard,
  t,
  ProgressNav,
  Form,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import { useFormConductor } from "../../../lib/hooks"
import { OnClientSide } from "@bloom-housing/shared-helpers"
import Markdown from "markdown-to-jsx"

const ApplicationWhatToExpect = () => {
  const { conductor, application, listing } = useFormConductor("whatToExpect")
  const currentPageSection = 1

  /* Form Handler */
  const { handleSubmit } = useForm()
  const onSubmit = () => {
    conductor.routeToNextOrReturnUrl()
  }

  return (
    <FormsLayout>
      <FormCard header={listing?.name}>
        <ProgressNav
          currentPageSection={currentPageSection}
          completedSections={application.completedSections}
          labels={conductor.config.sections.map((label) => t(`t.${label}`))}
          mounted={OnClientSide()}
        />
      </FormCard>
      <FormCard>
        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless mt-4">
            {t("application.start.whatToExpect.title")}
          </h2>
        </div>
        <div className="form-card__pager-row px-16">
          <div className="markdown mt-4">
            <Markdown
              options={{
                disableParsingRawHTML: false,
                overrides: {
                  ol: {
                    component: ({ children, ...props }) => (
                      <ol {...props} className="large-numbers">
                        {children}
                      </ol>
                    ),
                  },
                },
              }}
            >
              {t("application.start.whatToExpect.steps")}
            </Markdown>

            <Markdown
              options={{
                disableParsingRawHTML: false,
                overrides: {
                  li: {
                    component: ({ children, ...props }) => (
                      <li {...props} className="mb-5">
                        {children}
                      </li>
                    ),
                  },
                },
              }}
            >
              {t("application.start.whatToExpect.finePrint")}
            </Markdown>
          </div>
        </div>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button
                styleType={AppearanceStyleType.primary}
                onClick={() => conductor.setNavigatedBack(false)}
                data-test-id={"app-next-step-button"}
              >
                {t("t.next")}
              </Button>
            </div>
          </div>
        </Form>
      </FormCard>
    </FormsLayout>
  )
}

export default ApplicationWhatToExpect
