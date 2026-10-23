'use client'

import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { RichText } from './rich-text'

type BlockWithChildren = BlockObjectResponse & { 
  children?: BlockWithChildren[] 
}

export function ParagraphBlock({ block }: { block: any }) {
  if (!block.rich_text || block.rich_text.length === 0) {
    return <div className="h-6" />
  }
  
  return (
    <p className="my-3 max-w-[40rem] leading-7 text-foreground">
      <RichText richText={block.rich_text} />
    </p>
  )
}

export function HeadingBlock({ level, block }: { level: 1 | 2 | 3; block: any }) {
  const className = {
    1: 'text-4xl md:text-[2.75rem] font-bold leading-[1.1] mt-10 mb-5 tracking-tight max-w-[40rem]',
    2: 'text-lg font-bold mt-14 mb-4 pb-2 border-b border-foreground',
    3: 'text-lg font-bold mt-8 mb-1'
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