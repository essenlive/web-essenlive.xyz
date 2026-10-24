'use client'

import Link from 'next/link'

export function RichText({ richText }: { richText: any[] }) {
  if (!richText || richText.length === 0) return null

  return (
    <>
      {richText.map((text, index) => {
        const content = text.plain_text
        let className = ''

        if (text.annotations.bold) {
          className += 'font-bold '
        }
        if (text.annotations.italic) {
          className += 'italic '
        }
        if (text.annotations.strikethrough) {
          className += 'line-through '
        }
        if (text.annotations.underline) {
          className += 'underline '
        }
        if (text.annotations.code) {
          return (
            <code key={index} className="bg-muted text-foreground px-1.5 py-0.5 text-[0.9em] font-mono">
              {content}
            </code>
          )
        }

        // Palette is paper + ink + one red: Notion colors collapse to graphite, vermilion or a paper-shade mark.
        const color: string = text.annotations.color
        if (color && color !== 'default') {
          if (color === 'gray') className += 'text-muted-foreground '
          else if (color === 'red') className += 'text-highlight '
          else if (color.endsWith('_background')) className += 'bg-muted px-1 '
        }

        if (text.href) {
          return (
            <Link 
              key={index} 
              href={text.href}
              className={`${className}underline decoration-1`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {content}
            </Link>
          )
        }

        return (
          <span key={index} className={className}>
            {content}
          </span>
        )
      })}
    </>
  )
} 