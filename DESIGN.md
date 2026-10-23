---
name: essenlive.xyz
description: A lowtech personal portfolio set like a printed page: paper ground, black ink, hairline rules, system type, dithered images.
colors:
  paper: "#F1EFE8"
  ink: "#1B1B1B"
  paper-shade: "#E4E1D8"
  graphite: "#57554F"
  rule: "#C9C5BA"
  vermilion: "#B0361C"
typography:
  display:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.55
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.25
rounded:
  none: "0px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  link:
    textColor: "{colors.ink}"
  link-hover:
    textColor: "{colors.vermilion}"
  image-frame:
    backgroundColor: "{colors.paper-shade}"
    rounded: "{rounded.none}"
  meta-line:
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
---

# Design System: essenlive.xyz

## Overview

**Creative North Star: "The Printed Page"**

A single column of ink on paper. The site reads like a photocopied document: a warm paper ground (#F1EFE8), near-black type, hairline rules instead of boxes, and one red used the way a proofreader uses a pen. Austere and technical: nothing is decorated, everything is either text, a rule, or a dithered image. The lowtech ethos is the aesthetic, not a constraint on it: system fonts, no shadows, no gradients, no animation, no webfont download.

Dithered images (32-color palette, Atkinson diffusion) are the one texture and the one source of color. The interface around them stays monochrome so they carry the identity. Metadata is set in monospace, like a catalogue card; everything else is the platform's default sans.

This is deliberately not a generic SaaS / ShadCN default: no rounded cards, badges, soft shadows, or theme toggle.

**Key Characteristics:**
- Light only; paper and ink, one accent.
- Zero radius, zero shadow; structure comes from 1px rules and underlines.
- System sans for reading, system mono for metadata.
- Links are underlined text, never buttons.
- Images are dithered, served as-is, framed in a 1px ink border.

## Colors

A near-monochrome palette of warm paper and ink with a single vermilion accent.

### Primary
- **Ink** (#1B1B1B): body text, headings, the 1px structural rules under the nav and section heads, image frames, and the primary fill.

### Secondary
- **Vermilion** (#B0361C): link hover only (and destructive). A signal that something is clickable, never decoration.

### Neutral
- **Paper** (#F1EFE8): page, card, and popover background.
- **Paper Shade** (#E4E1D8): image placeholder behind loading images, muted and secondary fills.
- **Graphite** (#57554F): secondary text, mono metadata lines, focus ring.
- **Rule** (#C9C5BA): soft dividers between list rows and input borders.

### Named Rules
**The Red Is A Pen Rule.** Vermilion appears only on hover/active feedback and errors. It is never a fill, never a heading color.

**The No Dark Mode Rule.** One palette. No toggle, no `.dark` variants in new work.

## Typography

**Display / Body Font:** the platform sans stack (system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial)
**Label / Mono Font:** the platform mono stack (ui-monospace, SF Mono, Menlo, Consolas)

**Character:** Default operating-system voice. Weight and size do all the hierarchy; there is no second typeface for style.

### Hierarchy
- **Display** (700, 2.75rem on md+ / 2.25rem below, 1.1, -0.025em): page H1, max-width 40rem.
- **Headline** (700, 1.125rem, snug): H2 with a 1px ink rule underneath, H3 and card titles.
- **Body** (400, 1.0625rem, 1.55): paragraphs capped at 40rem (~65ch).
- **Label** (400, 0.8125rem–0.875rem mono, graphite): dates, categories, tags joined by " · ", property keys lowercased.

### Named Rules
**The Nothing To Download Rule.** No webfont is ever loaded. Hierarchy comes from weight and size only.

## Layout

A single centered column, max-width 48rem (`max-w-3xl`), 24px side padding, on every page. Navigation sits on top with a full-column 1px ink rule under it; the footer mirrors it with a rule above. Database grids are 1 column on mobile, 2 at `sm`, 3 at `lg` with 32px column / 40px row gaps; list views are 1px-ruled rows (compact: 8px thumbnails, default: 128×96). Vertical rhythm is generous around H2s (56px above) and tight inside metadata. Mobile simply wraps; nav and socials flow onto new lines rather than collapsing into a menu.

## Elevation & Depth

Flat. No shadows exist in the system. Depth is conveyed by 1px ink rules, 1px ink image borders, and a Paper Shade placeholder. Nothing lifts on hover; only text color changes.

### Named Rules
**The Flat Page Rule.** If a surface needs separating, draw a rule. Never add a shadow, blur, or tint card.

## Shapes

Hard right angles everywhere (`--radius: 0`). Frames are 1px ink borders around 4:3 image crops. No pills, no circles, no rounded avatars.

## Components

### Links
- **Style:** underlined text with `text-underline-offset: 3px`, 1px decoration; the current nav item is bold.
- **Hover:** text turns Vermilion. No transition.

### Navigation
- Site name (bold, home link) then page links from the site structure, with github / linkedin / instagram / mail in mono at the right. Wraps on small screens. Active page gets `aria-current` and bold.

### Cards (works, experiments)
- **Shape:** none; just an optional 4:3 dithered image in an ink-bordered frame, a bold 18px title link, and a one-line mono meta string (tags · category · date).
- **No** background, border, padding, or shadow around the card itself.

### List items (teaching)
- Compact rows separated by Rule-colored hairlines; title left, mono metadata right, optional 32px thumbnail.

### Metadata
- Inline: values joined by " · " in 13px mono graphite. On project pages: a two-column `dl`, lowercase mono keys. No badges or chips.

### Images
- Dithered, served as-is (no re-encoding), `object-cover`, 1px ink border, Paper Shade placeholder.

## Do's and Don'ts

### Do:
- **Do** use Ink on Paper for text and 1px Ink rules for structure.
- **Do** set metadata in system mono, small, graphite.
- **Do** let dithered images be the only texture and color.
- **Do** keep every page a single 48rem column.
- **Do** keep payloads small: system fonts, no animation libraries on the critical path.

### Don't:
- **Don't** use rounded corners, shadows, gradients, blur, or badges (the generic SaaS / ShadCN default look).
- **Don't** add a dark mode or theme toggle.
- **Don't** use Vermilion for fills, headings, or decoration.
- **Don't** download webfonts.
- **Don't** hard-code content that belongs in Notion.
