import React, { useContext, useState } from "react"
import Head from "next/head"
import { useSWRConfig } from "swr"

import {
  ApplicationSection,
  MultiselectQuestion,
  MultiselectQuestionCreate,
  MultiselectQuestionUpdate,
} from "@bloom-housing/backend-core"
import {
  AppearanceSizeType,
  Button,
  LoadingOverlay,
  MinimalTable,
  NavigationHeader,
  SiteAlert,
  StandardCard,
  t,
  AlertTypes,
  useMutate,
} from "@bloom-housing/ui-components"
import dayjs from "dayjs"
import { AuthContext } from "@bloom-housing/shared-helpers"
import Layout from "../../layouts"
import PreferenceDrawer from "../../src/settings/PreferenceDrawer"
import { useJurisdictionalMultiselectQuestionList } from "../../lib/hooks"
import ManageIconSection from "../../src/settings/ManageIconSection"

export type DrawerType = "add" | "edit"

const Settings = () => {
  const { mutate } = useSWRConfig()

  const { profile, multiselectQuestionsService } = useContext(AuthContext)

  const { mutate: updateQuestion, isLoading: isUpdateLoading } = useMutate()
  const { mutate: createQuestion, isLoading: isCreateLoading } = useMutate()

  const [preferenceDrawerOpen, setPreferenceDrawerOpen] = useState<DrawerType | null>(null)
  const [questionData, setQuestionData] = useState<MultiselectQuestion>(null)
  const [alertMessage, setAlertMessage] = useState({
    type: "alert" as AlertTypes,
    message: undefined,
  })

  const { data, loading, cacheKey } = useJurisdictionalMultiselectQuestionList(
    profile?.jurisdictions?.reduce((acc, curr) => {
      return `${acc}${","}${curr.id}`
    }, ""),
    ApplicationSection.preferences
  )

  const saveQuestion = (
    formattedData: MultiselectQuestionCreate | MultiselectQuestionUpdate,
    requestType: DrawerType
  ) => {
    if (requestType === "edit") {
      void updateQuestion(() =>
        multiselectQuestionsService
          .update({
            body: { ...formattedData, id: questionData.id },
          })
          .then(() => {
            setAlertMessage({ message: t(`settings.preferenceAlertUpdated`), type: "success" })
          })
          .catch((e) => {
            setAlertMessage({ message: t(`errors.alert.badRequest`), type: "alert" })
            console.log(e)
          })
          .finally(() => {
            setPreferenceDrawerOpen(null)
            void mutate(cacheKey)
          })
      )
    } else {
      void createQuestion(() =>
        multiselectQuestionsService
          .create({
            body: formattedData,
          })
          .then(() => {
            setAlertMessage({ message: t(`settings.preferenceAlertCreated`), type: "success" })
          })
          .catch((e) => {
            setAlertMessage({ message: t(`errors.alert.badRequest`), type: "alert" })
            console.log(e)
          })
          .finally(() => {
            setPreferenceDrawerOpen(null)
            void mutate(cacheKey)
          })
      )
    }
  }

  const getCardContent = () => {
    if (!loading && data?.length === 0) return null
    return (
      <>
        {data?.length ? (
          <MinimalTable
            headers={{
              name: "t.name",
              jurisdiction: "t.jurisdiction",
              updated: "t.updated",
              icons: "",
            }}
            cellClassName={"px-5 py-3"}
            data={data
              ?.sort((a, b) => {
                const aChar = a.text.toUpperCase()
                const bChar = b.text.toUpperCase()
                if (aChar === bChar)
                  return a.updatedAt > b.updatedAt ? -1 : a.updatedAt < b.updatedAt ? 1 : 0
                return aChar.localeCompare(bChar)
              })
              .map((preference) => {
                return {
                  name: { content: preference?.text },
                  jurisdiction: {
                    content: preference?.jurisdictions?.reduce((acc, item, index) => {
                      return `${acc}${index > 0 ? ", " : ""}${item.name}`
                    }, ""),
                  },
                  updated: {
                    content: dayjs(preference?.updatedAt).format("MM/DD/YYYY"),
                  },
                  icons: {
                    content: (
                      <ManageIconSection
                        onCopy={() => saveQuestion(preference, "add")}
                        copyTestId={`preference-copy-icon: ${preference.text}`}
                        onEdit={() => {
                          setQuestionData(preference)
                          setPreferenceDrawerOpen("edit")
                        }}
                        editTestId={`preference-edit-icon: ${preference.text}`}
                      />
                    ),
                  },
                }
              })}
          />
        ) : (
          <div className={"ml-5 mb-5"}>{t("t.none")}</div>
        )}
      </>
    )
  }

  return (
    <>
      <Layout>
        <Head>
          <title>{t("nav.siteTitlePartners")}</title>
        </Head>

        <NavigationHeader className="relative" title={t("t.settings")}>
          <div className="flex top-4 right-4 absolute z-50 flex-col items-center">
            <SiteAlert timeout={5000} dismissable alertMessage={alertMessage} />
          </div>
        </NavigationHeader>

        <section>
          <article className="flex-row flex-wrap relative max-w-screen-xl mx-auto py-8 px-4">
            <LoadingOverlay isLoading={loading}>
              <StandardCard
                title={t("t.preferences")}
                emptyStateMessage={t("t.none")}
                footer={
                  <Button
                    size={AppearanceSizeType.small}
                    onClick={() => {
                      setQuestionData(null)
                      setPreferenceDrawerOpen("add")
                    }}
                    dataTestId={"preference-add-item"}
                    disabled={loading}
                  >
                    {t("t.addItem")}
                  </Button>
                }
              >
                {getCardContent()}
              </StandardCard>
            </LoadingOverlay>
          </article>
        </section>
      </Layout>
      <PreferenceDrawer
        drawerOpen={!!preferenceDrawerOpen}
        questionData={questionData}
        setQuestionData={setQuestionData}
        drawerType={preferenceDrawerOpen}
        onDrawerClose={() => {
          setPreferenceDrawerOpen(null)
          void mutate(cacheKey)
        }}
        saveQuestion={saveQuestion}
        isLoading={isCreateLoading || isUpdateLoading}
      />
    </>
  )
}

export default Settings
