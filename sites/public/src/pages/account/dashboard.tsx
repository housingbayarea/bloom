import React, { useEffect, useState, useContext } from "react"
import Head from "next/head"
import { NextRouter, withRouter } from "next/router"
import { t, AlertBox } from "@bloom-housing/ui-components"
import {
  PageView,
  pushGtmEvent,
  AuthContext,
  RequireLogin,
  BloomCard,
} from "@bloom-housing/shared-helpers"
import Layout from "../../layouts/application"
import { MetaTags } from "../../components/shared/MetaTags"
import { UserStatus } from "../../lib/constants"
import { Button, Card, Grid } from "@bloom-housing/ui-seeds"

import styles from "./account.module.scss"

interface DashboardProps {
  router: NextRouter
}

function Dashboard(props: DashboardProps) {
  const { profile } = useContext(AuthContext)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      pushGtmEvent<PageView>({
        event: "pageView",
        pageTitle: "My Dashboard",
        status: UserStatus.LoggedIn,
      })
    }
    if (props.router.query?.alert) {
      const alert = Array.isArray(props.router.query.alert)
        ? props.router.query.alert[0]
        : props.router.query.alert
      setAlertMessage(alert)
    }
  }, [props.router, profile])

  const closeAlert = () => {
    void props.router.push("/account/dashboard", undefined, { shallow: true })
    setAlertMessage(null)
  }

  return (
    <RequireLogin signInPath="/sign-in" signInMessage={t("t.loginIsRequired")}>
      <Layout>
        <Head>
          <title>{t("nav.myDashboard")}</title>
        </Head>
        <MetaTags title={t("nav.myDashboard")} description="" />
        {alertMessage && (
          <AlertBox className="" onClose={() => closeAlert()} type="success">
            {t(alertMessage)}
          </AlertBox>
        )}
        <section className="bg-gray-300 border-t border-gray-450">
          <div className="max-w-5xl mx-auto sm:py-8">
            <h1 className={"sr-only"}>{t("nav.myDashboard")}</h1>
            <Grid spacing="lg" className={styles["account-card-container"]}>
              <Grid.Row columns={2}>
                <Grid.Cell>
                  <BloomCard
                    iconSymbol="application"
                    title={t("account.myApplications")}
                    subtitle={t("account.myApplicationsSubtitle")}
                    variant={"block"}
                    headingPriority={2}
                  >
                    <Card.Section>
                      <Button
                        size="sm"
                        href={"/account/applications"}
                        variant="primary-outlined"
                        id="account-dashboard-applications"
                      >
                        {t("account.viewApplications")}
                      </Button>
                    </Card.Section>
                  </BloomCard>
                </Grid.Cell>
                <Grid.Cell>
                  <BloomCard
                    iconSymbol="profile"
                    title={t("account.accountSettings")}
                    subtitle={t("account.accountSettingsSubtitle")}
                    id="account-dashboard-settings"
                    variant={"block"}
                    headingPriority={2}
                  >
                    <Card.Section>
                      <Button size="sm" href={"/account/edit"} variant="primary-outlined">
                        {t("account.accountSettingsUpdate")}
                      </Button>
                    </Card.Section>
                  </BloomCard>
                </Grid.Cell>
              </Grid.Row>
            </Grid>
          </div>
        </section>
      </Layout>
    </RequireLogin>
  )
}

export default withRouter(Dashboard)
