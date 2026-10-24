'use client'

import Image from 'next/image'

function blockUrl(block: any): string {
  if (block.type === 'file' && block.file) return block.file.url
  if (block.type === 'external' && block.external) return block.external.url
  return ''
}

/** Low-tech: a ruled line with a mono kind, a name and a plain link. */
function LinkRow({ kind, name, url, action }: { kind: string; name: string; url: string; action: string }) {
  return (
    <p className="my-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-y border-border py-3">
      <span className="font-mono text-meta text-muted-foreground">{kind}</span>
      <span className="font-bold">{name}</span>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline decoration-1">
          {action}
        </a>
      )}
    </p>
  )
}

export function ImageBlock({ block }: { block: any }) {
  let caption = ''
  const imageUrl = blockUrl(block)

  if (block.caption && block.caption.length > 0) {
    caption = block.caption.map((text: any) => text.plain_text).join('')
  }

  if (!imageUrl) return null

  return (
    <figure className="my-8">
      <div className="relative overflow-hidden border border-foreground bg-muted">
        <Image
          src={imageUrl}
          alt=""
          width={800}
          height={400}
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 font-mono text-meta text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export function VideoBlock({ block }: { block: any }) {
  return <LinkRow kind="vidéo" name="Vidéo" url={blockUrl(block)} action="regarder →" />
}

export function AudioBlock({ block }: { block: any }) {
  return <LinkRow kind="audio" name="Audio" url={blockUrl(block)} action="écouter →" />
}

export function FileBlock({ block }: { block: any }) {
  return <LinkRow kind="fichier" name={block.name || 'Fichier'} url={blockUrl(block)} action="télécharger →" />
}
