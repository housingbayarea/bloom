import * as React from "react"
import { nanoid } from "nanoid"
import { HeaderCell, Row, Cell, StandardTableProps } from "./StandardTable"

export interface GroupedTableGroup {
  header?: string | React.ReactNode
  className?: string
  data: Record<string, React.ReactNode>[]
}

export interface GroupedTableProps extends Omit<StandardTableProps, "data"> {
  data: GroupedTableGroup[]
}

export const GroupedTable = (props: GroupedTableProps) => {
  const { headers, data, cellClassName } = props

  const headerLabels = Object.values(headers).map((col) => {
    const uniqKey = process.env.NODE_ENV === "test" ? "" : nanoid()
    return <HeaderCell key={uniqKey}>{col}</HeaderCell>
  })

  const body: React.ReactNode[] = []

  data.forEach((group: GroupedTableGroup) => {
    const colSpan = Object.keys(headers).length

    const groupHeader = group.header
    const groupClassName = group.className
    const groupData = group.data

    if (groupHeader) {
      body.push(
        <Row key={process.env.NODE_ENV === "test" ? "" : nanoid()}>
          <Cell
            key={process.env.NODE_ENV === "test" ? "" : nanoid()}
            className={groupClassName}
            colSpan={colSpan}
          >
            {groupHeader}
          </Cell>
        </Row>
      )
    }

    groupData.forEach((row: Record<string, React.ReactNode>) => {
      const rowKey = (row["id"] as string) || (process.env.NODE_ENV === "test" ? "" : nanoid())
      const cols = Object.keys(headers).map((colKey) => {
        const uniqKey = process.env.NODE_ENV === "test" ? "" : nanoid()
        const header = headers[colKey]
        const cell = row[colKey]
        return (
          <Cell key={uniqKey} headerLabel={header} className={cellClassName}>
            {cell}
          </Cell>
        )
      })

      body.push(
        <Row id={"row-" + rowKey} key={rowKey} className={"group-" + groupClassName}>
          {cols}
        </Row>
      )
    })
  })

  const tableClasses = ["w-full", "text-sm"]
  if (props.responsiveCollapse) {
    tableClasses.push("responsive-collapse")
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className={tableClasses.join(" ")}>
        <thead>
          <Row>{headerLabels}</Row>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  )
}
