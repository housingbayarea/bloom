/*
0.2 - What To Expect
A notice regarding application process and rules
*/
import { Button, FormCard, ProgressNav, t, Form } from "@bloom-housing/ui-components"
import FormsLayout from "../../../layouts/forms"
import { useForm } from "react-hook-form"
import { useFormConductor } from "../../../lib/hooks"

export default () => {
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
          labels={conductor.config.sections}
        />
      </FormCard>

      <FormCard>
        <div className="form-card__lead border-b">
          <h2 className="form-card__title is-borderless mt-4">
            {t("application.start.whatToExpect.title")}
          </h2>
        </div>
        <div className="form-card__pager-row px-16">
          <p className="field-note py-2">{t("application.start.whatToExpect.info1")}</p>
          <p className="field-note py-2">{t("application.start.whatToExpect.info2")}</p>
          <p className="field-note py-2">{t("application.start.whatToExpect.info3")}</p>
        </div>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button
                filled={true}
                onClick={() => {
                  //
                }}
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
