import React from "react"
import App from "next/app"
import "@bloom-housing/ui-components/src/global/index.scss"
import {
  addTranslation,
  UserProvider,
  ConfigProvider,
  ApiClientProvider,
  LoggedInUserIdleTimeout,
  blankApplication,
} from "@bloom-housing/ui-components"
import { headScript, bodyTopTag, pageChangeHandler } from "../src/customScripts"
import { AppSubmissionContext } from "../lib/AppSubmissionContext"

import ApplicationConductor, {
  loadApplicationFromAutosave,
  loadSavedListing,
} from "../lib/ApplicationConductor"

class MyApp extends App {
  constructor(props) {
    super(props)

    // Load autosaved listing application, if any
    const application = loadApplicationFromAutosave() || blankApplication()
    const savedListing = loadSavedListing()
    this.state = {
      conductor: new ApplicationConductor(application, savedListing),
      application: application,
      listing: savedListing,
    }
  }

  // This gets passed along through the context
  syncApplication = (data) => {
    this.setState({ application: data })
  }
  syncListing = (data) => {
    this.setState({ listing: data })
  }

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {} // you can add custom props that pass down to all pages here

    if (Component.getInitialProps) {
      const compAsyncProps = await Component.getInitialProps(ctx)
      pageProps = { ...pageProps, ...compAsyncProps }
    }

    const generalTranslations = await import(
      "@bloom-housing/ui-components/src/locales/general.json"
    )
    const spanishTranslations = await import("@bloom-housing/ui-components/src/locales/es.json")
    const chineseTranslations = await import("@bloom-housing/ui-components/src/locales/zh.json")
    const vietnameseTranslations = await import("@bloom-housing/ui-components/src/locales/vi.json")
    const translations = {
      general: generalTranslations,
      es: spanishTranslations,
      zh: chineseTranslations,
      vi: vietnameseTranslations,
      custom: {
        general: await import("../page_content/locale_overrides/general.json"),
        // Uncomment to add additional language overrides
        // es: await import("../page_content/locale_overrides/es.json")
      },
    }
    return { pageProps, translations }
  }

  /* eslint-disable no-undef */
  componentDidMount() {
    // NOTE: this may get called without a full page reload,
    // so we need to enforce idempotency
    if (!document.body.customScriptsLoaded) {
      this.props.router.events.on("routeChangeComplete", pageChangeHandler)

      const headScriptTag = document.createElement("script")
      headScriptTag.textContent = headScript()
      if (headScriptTag.textContent !== "") {
        document.head.append(headScriptTag)
      }

      const bodyTopTagTmpl = document.createElement("template")
      bodyTopTagTmpl.innerHTML = bodyTopTag()
      if (bodyTopTagTmpl.innerHTML !== "") {
        document.body.prepend(bodyTopTagTmpl.content.cloneNode(true))
      }

      document.body.customScriptsLoaded = true
    }
  }
  /* eslint-enable no-undef */

  render() {
    const { Component, pageProps, translations } = this.props

    // Setup translations via Polyglot
    addTranslation(translations.general)
    if (translations.custom) {
      addTranslation(translations.custom.general)
    }

    // Extend for different languages
    const language = this.props.router.query.language
    if (language) {
      addTranslation(translations[language])
      if (translations.custom && translations.custom[language]) {
        addTranslation(translations.custom[language])
      }
    }

    return (
      <AppSubmissionContext.Provider
        value={{
          conductor: this.state.conductor,
          application: this.state.application,
          listing: this.state.listing,
          syncApplication: this.syncApplication,
          syncListing: this.syncListing,
        }}
      >
        <ConfigProvider apiUrl={process.env.backendApiBase}>
          <UserProvider>
            <ApiClientProvider>
              <LoggedInUserIdleTimeout onTimeout={() => this.state.conductor.reset()} />
              <Component {...pageProps} />
            </ApiClientProvider>
          </UserProvider>
        </ConfigProvider>
      </AppSubmissionContext.Provider>
    )
  }
}

export default MyApp
