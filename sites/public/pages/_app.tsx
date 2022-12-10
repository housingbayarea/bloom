import "@bloom-housing/ui-components/src/global/css-imports.scss"
import "@bloom-housing/ui-components/src/global/app-css.scss"
import React, { useEffect, useMemo, useState } from "react"
import type { AppProps } from "next/app"
import ReactDOM from "react-dom"
import { addTranslation, GenericRouter, NavigationContext } from "@bloom-housing/ui-components"
import {
  blankApplication,
  LoggedInUserIdleTimeout,
  ConfigProvider,
  AuthProvider,
} from "@bloom-housing/shared-helpers"
import { pageChangeHandler, gaLoadScript, gaCaptureScript, uaScript } from "../src/customScripts"
import { AppSubmissionContext } from "../lib/AppSubmissionContext"
import ApplicationConductor, {
  loadApplicationFromAutosave,
  loadSavedListing,
} from "../lib/ApplicationConductor"
import { translations, overrideTranslations, jurisdictionTranslations } from "../src/translations"
import LinkComponent from "../src/LinkComponent"

// Note: import overrides.scss last so that it overrides styles defined in imports above
import "../styles/overrides.scss"

function BloomApp({ Component, router, pageProps }: AppProps) {
  const { locale } = router
  const [initialized, setInitialized] = useState(false)
  const [application, setApplication] = useState(() => {
    return loadApplicationFromAutosave() || { ...blankApplication }
  })
  const [savedListing, setSavedListing] = useState(() => {
    return loadSavedListing()
  })

  const conductor = useMemo(() => {
    return new ApplicationConductor(application, savedListing)
  }, [application, savedListing])

  useMemo(() => {
    setInitialized(false)
    addTranslation(translations.general, true)
    if (locale && locale !== "en" && translations[locale]) {
      addTranslation(translations[locale])
    }
    addTranslation(overrideTranslations.en)
    if (overrideTranslations[locale]) {
      addTranslation(overrideTranslations[locale])
    }
    const loadJurisdictionTranslations = async () => {
      const jurisdictionOverride = await jurisdictionTranslations()
      if (jurisdictionOverride) {
        addTranslation(jurisdictionOverride["en"])
        addTranslation(jurisdictionOverride[locale])
      }
      setInitialized(true)
    }
    loadJurisdictionTranslations().catch(() => {
      console.log("jurisdiction translations loading failed")
    })
  }, [locale])

  useEffect(() => {
    if (!document.body.dataset.customScriptsLoaded) {
      router.events.on("routeChangeComplete", pageChangeHandler)

      // GA 4 Tracking
      const gaLoadNode = gaLoadScript()
      const gaCaptureNode = gaCaptureScript()
      if (gaLoadNode) document.head.append(gaLoadNode)
      if (gaCaptureNode) document.head.append(gaCaptureNode)

      // UA Tracking
      const uaScriptTag = document.createElement("script")
      uaScriptTag.textContent = uaScript()
      if (uaScriptTag.textContent !== "") {
        document.head.append(uaScriptTag)
      }

      document.body.dataset.customScriptsLoaded = "true"
    }
  })

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const axe = require("@axe-core/react")
      void axe(React, ReactDOM, 5000)
    }
  }, [])

  if (!initialized) {
    return null
  }

  return (
    <NavigationContext.Provider
      value={{
        LinkComponent,
        router: router as GenericRouter,
      }}
    >
      <AppSubmissionContext.Provider
        value={{
          conductor: conductor,
          application: application,
          listing: savedListing,
          syncApplication: setApplication,
          syncListing: setSavedListing,
        }}
      >
        <ConfigProvider apiUrl={process.env.backendApiBase}>
          <AuthProvider>
            <LoggedInUserIdleTimeout onTimeout={() => conductor.reset()} />
            <Component {...pageProps} />
          </AuthProvider>
        </ConfigProvider>
      </AppSubmissionContext.Provider>
    </NavigationContext.Provider>
  )
}

export default BloomApp
