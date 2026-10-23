'use client'

import React from 'react'
import { RichText } from './rich-text'
import { BlockWithChildren } from '@/lib/types'

export function BulletedListItemBlock({
  block,
  children,
  renderChildren
}: {
  block: any;
  children?: BlockWithChildren[];
  renderChildren?: (blocks: BlockWithChildren[]) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3 ml-4">
        <span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 bg-foreground flex-shrink-0" />
        <div className="flex-1 text-base text-foreground">
          <RichText richText={block.rich_text} />
        </div>
      </div>
      {children && children.length > 0 && renderChildren && (
        <div className="ml-6">
          {renderChildren(children)}
        </div>
      )}
    </div>
  )
}

export function NumberedListItemBlock({
  block,
  index = 1,
  children,
  renderChildren
}: {
  block: any;
  /** 1-based position within the run of consecutive numbered items */
  index?: number;
  children?: BlockWithChildren[];
  renderChildren?: (blocks: BlockWithChildren[]) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3 ml-4">
        <span className="min-w-[1.5rem] font-mono text-sm leading-[1.75rem] text-muted-foreground">{index}.</span>
        <div className="flex-1 text-base text-foreground">
          <RichText richText={block.rich_text} />
        </div>
      </div>
      {children && children.length > 0 && renderChildren && (
        <div className="ml-6">
          {renderChildren(children)}
        </div>
      )}
    </div>
  )
}

export function TodoBlock({
  block,
  children,
  renderChildren
}: {
  block: any;
  children?: BlockWithChildren[];
  renderChildren?: (blocks: BlockWithChildren[]) => React.ReactNode;
}) {
  const isChecked = block.checked

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <span
          role="img"
          aria-label={isChecked ? 'fait' : 'à faire'}
          className="font-mono text-sm leading-[1.75rem] text-foreground"
        >
          {isChecked ? '[x]' : '[ ]'}
        </span>
        <div className={`flex-1 text-base ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          <RichText richText={block.rich_text} />
        </div>
      </div>
      {children && children.length > 0 && renderChildren && (
        <div className="ml-8">
          {renderChildren(children)}
        </div>
      )}
    </div>
  )
}

export function ToggleBlock({
  block,
  children,
  renderChildren
}: {
  block: any;
  children?: BlockWithChildren[];
  renderChildren?: (blocks: BlockWithChildren[]) => React.ReactNode;
}) {
  return (
    <details className="group my-4 border-y border-border">
      <summary className="flex cursor-pointer list-none items-baseline gap-3 py-2.5 font-bold marker:content-none [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="font-mono text-sm text-muted-foreground before:content-['+'] group-open:before:content-['−']" />
        <span><RichText richText={block.rich_text} /></span>
      </summary>
      {children && children.length > 0 && renderChildren && (
        <div className="mb-3 ml-1.5 border-l border-border pb-1 pl-5">
          {renderChildren(children)}
        </div>
      )}
    </details>
  )
}
