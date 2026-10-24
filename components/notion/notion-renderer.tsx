'use client'

import { BlockObjectResponse } from '@/lib/types'
import { CodeHighlighter } from '../code'
import { MermaidDiagram } from '../mermaid-diagram'
import { RichText } from './rich-text'
import { ParagraphBlock, HeadingBlock } from './text-blocks'
import { BulletedListItemBlock, NumberedListItemBlock, TodoBlock, ToggleBlock } from './list-blocks'
import { ImageBlock, VideoBlock, AudioBlock, FileBlock } from './media-blocks'
import { TableBlock, TableRowBlock, ColumnListBlock, ColumnBlock, TableOfContentsBlock, BreadcrumbBlock } from './layout-blocks'

type BlockWithChildren = BlockObjectResponse & { 
  children?: BlockWithChildren[] 
}

interface NotionRendererProps {
  blocks: BlockWithChildren[]
}

export function NotionRenderer({ blocks }: NotionRendererProps) {
  // console.table(
  //   blocks.map((b) => ({
  //     id: b.id,
  //     type: b.type,
  //     content: b[b.type],
  //     data: JSON.stringify(b[b.type]?.rich_text),
  //   }))
  // );
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        // Notion sends numbered items one by one; count the run of consecutive ones.
        let number = 1
        if (block.type === 'numbered_list_item') {
          while (i - number >= 0 && blocks[i - number].type === 'numbered_list_item') number++
        }
        return <BlockRenderer key={block.id} block={block} number={number} />
      })}
    </div>
  )
}

function BlockRenderer({ block, number }: { block: BlockWithChildren; number: number }) {
  const { type } = block

  switch (type) {
    case "paragraph":
      return <ParagraphBlock block={block.paragraph} />;

    case "heading_1":
      return <HeadingBlock level={1} block={block.heading_1} />;

    case "heading_2":
      return <HeadingBlock level={2} block={block.heading_2} />;

    case "heading_3":
      return <HeadingBlock level={3} block={block.heading_3} />;

    case "bulleted_list_item":
      return (
        <BulletedListItemBlock
          block={block.bulleted_list_item}
          children={block.children}
        />
      );

    case "numbered_list_item":
      return (
        <NumberedListItemBlock
          block={block.numbered_list_item}
          index={number}
          children={block.children}
        />
      );

    case "to_do":
      return <TodoBlock block={block.to_do} children={block.children} />;

    case "toggle":
      return <ToggleBlock block={block.toggle} children={block.children} />;

    case "code":
      return <CodeBlock block={block.code} />;

    case "quote":
      return <QuoteBlock block={block.quote} />;

    case "callout":
      return <CalloutBlock block={block.callout} children={block.children} />;

    case "divider":
      return <hr className="my-7 border-0 border-t border-foreground" />;

    case "image":
      return <ImageBlock block={block.image} />;

    case "video":
      return <VideoBlock block={block.video} />;

    case "audio":
      return <AudioBlock block={block.audio} />;

    case "file":
      return <FileBlock block={block.file} />;

    case "bookmark":
      return <BookmarkBlock block={block.bookmark} />;

    case "link_preview":
      return <LinkPreviewBlock block={block.link_preview} />;

    case "embed":
      return <EmbedBlock block={block.embed} />;

    case "equation":
      return <EquationBlock block={block.equation} />;

    case "table":
      return <TableBlock block={block.table} children={block.children} />;

    case "table_row":
      return <TableRowBlock block={block.table_row} />;

    case "column_list":
      return (
        <ColumnListBlock block={block.column_list} children={block.children} />
      );

    case "column":
      return <ColumnBlock children={block.children} />;

    case "table_of_contents":
      return <TableOfContentsBlock />;

    case "breadcrumb":
      return <BreadcrumbBlock />;
      
    default:
      console.warn(`Unsupported block type: ${type}`);
      return null;
  }
}

function CodeBlock({ block }: { block: any }) {
  const language = block.language || 'text'
  const code = block.rich_text?.map((text: any) => text.plain_text).join('') || ''

  const isDiagram = language === 'mermaid' || 
                   code.trim().startsWith('graph') || 
                   code.trim().startsWith('flowchart') ||
                   code.trim().startsWith('sequenceDiagram') ||
                   code.trim().startsWith('classDiagram') ||
                   code.trim().startsWith('stateDiagram') ||
                   code.trim().startsWith('pie') ||
                   code.trim().startsWith('gitgraph') ||
                   code.trim().includes('-->') ||
                   code.trim().includes('->') && code.includes(';')

  if (isDiagram) {
    return (
      <div className="my-6 border border-foreground p-4">
        <MermaidDiagram chart={code} className="w-full" />
      </div>
    )
  }

  return (
    <div className="my-6">
      <CodeHighlighter
        codeString={code}
        language={language}
        className="border border-foreground overflow-hidden"
      />
    </div>
  )
}

function QuoteBlock({ block }: { block: any }) {
  return (
    <blockquote className="my-6 max-w-[40rem] border-l border-foreground pl-5 text-body italic text-foreground">
      <RichText richText={block.rich_text} />
    </blockquote>
  )
}

function CalloutBlock({ block, children }: { block: any; children?: BlockWithChildren[] }) {
  const emoji = block.icon?.type === 'emoji' ? block.icon.emoji : null

  return (
    <div className="my-6 flex items-start gap-4 border border-foreground p-4">
      {emoji && <span aria-hidden className="flex-shrink-0 text-title">{emoji}</span>}
      <div className="min-w-0 flex-1 space-y-3 text-body text-foreground">
        <div>
          <RichText richText={block.rich_text} />
        </div>
        {children && children.length > 0 && <NotionRenderer blocks={children} />}
      </div>
    </div>
  )
}

/** Bookmark / link preview: a ruled line, kind in mono, the URL as a plain link. */
function UrlRow({ kind, url }: { kind: string; url: string }) {
  return (
    <p className="my-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-y border-border py-3">
      <span className="font-mono text-meta text-muted-foreground">{kind}</span>
      <a href={url} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all underline decoration-1">
        {url}
      </a>
    </p>
  )
}

function BookmarkBlock({ block }: { block: any }) {
  return <UrlRow kind="lien" url={block.url} />
}

function LinkPreviewBlock({ block }: { block: any }) {
  return <UrlRow kind="lien" url={block.url} />
}

function EmbedBlock({ block }: { block: any }) {
  return (
    <div className="my-6 w-full aspect-video overflow-hidden border border-foreground bg-muted">
      <iframe
        src={block.url}
        className="w-full h-full"
        allowFullScreen
        loading="lazy"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        title="Contenu intégré"
      />
    </div>
  )
}

function EquationBlock({ block }: { block: any }) {
  return (
    <div className="my-6 overflow-x-auto bg-muted p-4 text-center">
      <code className="font-mono text-title text-foreground">{block.expression}</code>
    </div>
  )
}
