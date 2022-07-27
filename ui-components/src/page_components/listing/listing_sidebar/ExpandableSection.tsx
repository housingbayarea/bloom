import * as React from "react"
import Markdown from "markdown-to-jsx"
import { ExpandableContent } from "../../../actions/ExpandableContent"

export interface ExpandableSectionProps {
  content: string | React.ReactNode
  expandableContent?: string | React.ReactNode
  strings: {
    title: string
    readMore?: string
    readLess?: string
  }
}

const ExpandableSection = ({ content, expandableContent, strings }: ExpandableSectionProps) => {
  if (!content) return null

  const getTextContent = (textContent: string | React.ReactNode) => {
    return (
      <>
        {typeof textContent === "string" ? (
          <Markdown options={{ disableParsingRawHTML: false }}>{textContent}</Markdown>
        ) : (
          textContent
        )}
      </>
    )
  }
  return (
    <section className="aside-block">
      <h4 className="text-caps-underline">{strings.title}</h4>
      <div className="text-tiny text-gray-750">
        {getTextContent(content)}
        {expandableContent && (
          <div className={"mt-2"}>
            <ExpandableContent strings={{ readMore: strings.readMore, readLess: strings.readLess }}>
              {getTextContent(expandableContent)}
            </ExpandableContent>
          </div>
        )}
      </div>
    </section>
  )
}

export { ExpandableSection as default, ExpandableSection }
