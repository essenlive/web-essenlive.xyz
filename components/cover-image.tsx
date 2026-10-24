'use client'

import Image, { type ImageProps } from "next/image"
import { useState } from "react"

/** A cover that fails to load disappears, leaving the hatch behind it instead of a broken-image glyph. */
export function CoverImage(props: ImageProps) {
  const [broken, setBroken] = useState(false)
  if (broken) return null
  return <Image {...props} onError={() => setBroken(true)} />
}
