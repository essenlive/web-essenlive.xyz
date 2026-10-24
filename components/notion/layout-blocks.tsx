'use client'

import React from 'react'
import { RichText } from './rich-text'
import { BlockWithChildren } from "@/lib/types";

export function TableBlock({ block, children }: { block: any; children?: BlockWithChildren[] }) {
  if (!children || children.length === 0) return null

  const hasColumnHeader = block.has_column_header
  const hasRowHeader = block.has_row_header
  const tableRows = children.filter(child => child.type === 'table_row')
  const bodyRows = tableRows.slice(hasColumnHeader ? 1 : 0)
  // Header-less two-column table = a colophon: name, then a mono description; stacked on mobile.
  const colophon = !hasColumnHeader && block.table_width === 2

  if (colophon) {
    return (
      <div className="my-7 border-t border-foreground [h2+&]:border-t-0">
        <table className="block w-full md:table">
          <tbody className="block md:table-row-group">
            {bodyRows.map((row) => (
              <tr key={row.id} className="block border-b border-dashed border-border py-1.75 md:table-row md:py-0">
                {row.table_row?.cells?.map((cell: any[], cellIndex: number) =>
                  cellIndex === 0 ? (
                    <th key={cellIndex} scope="row" className="block text-left font-normal md:table-cell md:w-64 md:py-1.75 md:pr-6 md:align-top">
                      <RichText richText={cell} />
                    </th>
                  ) : (
                    <td key={cellIndex} className="block text-meta font-mono text-muted-foreground md:table-cell md:py-1.75 md:align-top">
                      <RichText richText={cell} />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-body">
        {hasColumnHeader && tableRows.length > 0 && (
          <thead>
            <tr className="border-b border-foreground">
              {tableRows[0].table_row?.cells?.map((cell: any[], cellIndex: number) => (
                <th key={cellIndex} scope="col" className="py-2 pr-6 align-top font-bold last:pr-0">
                  <RichText richText={cell} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {bodyRows.map((row) => (
            <tr key={row.id} className="border-b border-border">
              {row.table_row?.cells?.map((cell: any[], cellIndex: number) =>
                hasRowHeader && cellIndex === 0 ? (
                  <th key={cellIndex} scope="row" className="py-2 pr-6 align-top font-bold">
                    <RichText richText={cell} />
                  </th>
                ) : (
                  <td key={cellIndex} className="py-2 pr-6 align-top last:pr-0">
                    <RichText richText={cell} />
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TableRowBlock({ block }: { block: any }) {
  return null
}

export function ColumnListBlock({
  block,
  children,
  renderChildren
}: {
  block: any;
  children?: BlockWithChildren[];
  renderChildren?: (blocks: BlockWithChildren[]) => React.ReactNode;
}) {
  if (!children || children.length === 0) return null

  const columns = children.filter(child => child.type === 'column')
  const gridCols = columns.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
                   columns.length <= 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                   'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={`my-6 grid ${gridCols} gap-6`}>
      {columns.map((column, index) => (
        <ColumnBlock
          key={column.id}
          children={column.children}
          renderChildren={renderChildren}
        />
      ))}
    </div>
  )
}

export function ColumnBlock({
  children,
  renderChildren
}: {
  children?: BlockWithChildren[];
  renderChildren?: (blocks: BlockWithChildren[]) => React.ReactNode;
}) {
  return (
    <div className="h-fit min-w-0">
      {children && children.length > 0 && renderChildren && (
        <div className="space-y-4">
          {renderChildren(children)}
        </div>
      )}
    </div>
  )
}

// ponytail: placeholders used to print fake text ("Home → Blog"); render nothing until implemented.
export function TableOfContentsBlock() {
  return null
}

export function BreadcrumbBlock() {
  return null
}
