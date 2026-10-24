'use client'

import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { RichText } from './rich-text'

type BlockWithChildren = BlockObjectResponse & { 
  children?: BlockWithChildren[] 
}

export function ParagraphBlock({ block }: { block: any }) {
  if (!block.rich_text || block.rich_text.length === 0) {
    return <div className="h-7" />
  }
  
  return (
    <p className="my-3.5 max-w-[40rem] first:mt-0 text-foreground">
      <RichText richText={block.rich_text} />
    </p>
  )
}

export function HeadingBlock({ level, block }: { level: 1 | 2 | 3; block: any }) {
  const className = {
    1: 'text-display-sm md:text-display font-bold mt-14 mb-7 tracking-tight max-w-[40rem] text-balance',
    2: 'text-title font-bold mt-14 first:mt-0 mb-3.5 pb-1.75 border-b border-foreground',
    3: 'text-title font-bold mt-7 mb-1.75'
  }[level]

  if (level === 1) {
    return (
      <h1 className={`${className} text-foreground`}>
        <RichText richText={block.rich_text} />
      </h1>
    )
  }
  
  if (level === 2) {
    return (
      <h2 className={`${className} text-foreground`}>
        <RichText richText={block.rich_text} />
      </h2>
    )
  }
  
  return (
    <h3 className={`${className} text-foreground`}>
      <RichText richText={block.rich_text} />
    </h3>
  )
} 