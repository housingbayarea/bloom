import * as React from "react"

import { PageHeader } from "./PageHeader"

export default {
  title: "Headers/Page Header",
}

export const withTextContent = () => <PageHeader>Hello World</PageHeader>

export const withSubtitle = () => <PageHeader subtitle="Here is a subtitle">Hello World</PageHeader>
