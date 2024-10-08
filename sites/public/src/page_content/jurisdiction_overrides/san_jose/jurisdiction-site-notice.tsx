import React from "react"
import { t } from "@bloom-housing/ui-components"
import { LanguagesEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { useRouter } from "next/router"

export const JursidictionSiteNotice = () => {
  const router = useRouter()

  const feedbackLink = () => {
    switch (router.locale) {
      case LanguagesEnum.es:
        return "https://docs.google.com/forms/d/e/1FAIpQLScmOWY8qR92vfJbPq6uCgIVW25N_D_u4RF-hwZ17NvprNgqkw/viewform"
      case LanguagesEnum.vi:
        return "https://docs.google.com/forms/d/e/1FAIpQLScCANRADZxFT7l0BiHVNifLXWeSstNmaNXqlfpy53jtxF8gxg/viewform"
      case LanguagesEnum.zh:
        return "https://docs.google.com/forms/d/e/1FAIpQLSedEJqjP3MtArBrhDwUTAY8jSCTLsIsKVV_i3tMk9EK59XOew/viewform"
      default:
        return "https://docs.google.com/forms/d/e/1FAIpQLScAZrM-4biqpQPFSJfaYef0dIiONYJ95n8pK1c8a5a8I78xxw/viewform"
    }
  }

  return (
    <>
      {t("nav.getFeedback")}
      <a href={feedbackLink()} target="_blank" className={"cursor-pointer"} rel="noreferrer">
        {t("nav.yourFeedback")}
      </a>
      {t("nav.bonusFeedback")}
    </>
  )
}
