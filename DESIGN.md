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
    textColor: "{colors.ink}"
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

Dithered images (32-color palette, Atkinson diffusion) are the one source of color and the main texture. The chrome carries only one monochrome, CSS-only texture: the diagonal hatch (135°), on the rail, fading in under hovered list rows, behind images and on cards without a cover. Nothing downloads.

This is deliberately not a generic SaaS / ShadCN default: no rounded cards, badges, soft shadows, or theme toggle.

**Key Characteristics:**
- Light only; paper and ink, one accent.
- Zero radius, zero shadow; structure comes from 1px rules and underlines.
- System sans for reading, system mono for metadata.
- Links are underlined text, never buttons.
- Images are dithered, served as-is, framed in a 1px ink border.

## Colors

A monochrome palette of warm paper and ink; vermilion stays in the tokens as a reserved accent.

### Primary
- **Ink** (#1B1B1B): body text, headings, the 1px structural rules under the nav and section heads, image frames, and the primary fill.

### Secondary
- **Vermilion** (#B0361C): kept in the palette tokens but not used on the live site today (hover is ink, selection is ink). Never a fill, never a heading color.

### Neutral
- **Paper** (#F1EFE8): page, card, and popover background.
- **Paper Shade** (#E4E1D8): image placeholder behind loading images, muted and secondary fills.
- **Graphite** (#57554F): secondary text, mono metadata lines, focus ring.
- **Rule** (#C9C5BA): soft dividers between list rows and input borders.

### Named Rules
**The Red Is A Pen Rule.** Vermilion, if it comes back, is a pen: hover underline or errors only. It is never a fill, never a heading color.

**The No Dark Mode Rule.** One palette. No toggle, no `.dark` variants in new work.

## Typography

**Display / Body Font:** the platform sans stack (system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial)
**Label / Mono Font:** the platform mono stack (ui-monospace, SF Mono, Menlo, Consolas)

**Character:** Default operating-system voice. Weight and size do all the hierarchy; there is no second typeface for style.

### Hierarchy
- **Display** (700, 3rem/3.5rem on md+, 2.25rem/2.625rem below, -0.04em): page H1 for databases and projects. On a project the parent section is a graphite link before the name; a database's entry count sits in mono on the baseline when enabled.
- **Title** (700, 1.3125rem/1.75rem): H2 with a 1px ink rule underneath, H3 and card titles.
- **Body** (400, 1.0625rem, 1.55): paragraphs capped at 40rem (~65ch).
- **Label** (400, 0.8125rem–0.875rem mono, graphite): dates, categories, tags joined by " · ", property keys lowercased.

### Named Rules
**The Nothing To Download Rule.** No webfont is ever loaded. Hierarchy comes from weight and size only.

## Layout

One left edge: at 1440 the rail's line is at 240 and every block of the main column (hero, prose, card content, images, lists, footer text) starts at 280 (24 on mobile); only ruled cell borders and full-bleed rules reach 240. Baseline unit 1.75rem (body 17/28, mono meta 13/21, headings 28 or 42/49); vertical gaps are multiples of 7px (layout gutters stay 24 / 40px). A margin-rail page, max-width 72rem (`max-w-6xl`), 24px side padding. From `md` up, a sticky 15rem rail (page links at 21px) on the left holds the site name, the page links (stacked) and the socials (mono, at the bottom), separated from the content by a 1px ink vertical rule. Below `md` the rail becomes a horizontal strip with a 1px ink rule under it; links wrap rather than collapse into a menu. The footer closes the content column with a rule above it. Reading text is capped at 40rem. On project pages the title is a breadcrumb (parent section in graphite, linking back, then the project name; there is no back link at the bottom), followed by a full-bleed ruled hero split in half: cover left, metadata `dl` right (stacked below `md`). Body text is capped at 40rem. Database grids are 1 column on mobile, 2 at `sm`, 3 at `lg` with 32px column / 40px row gaps; list views are 1px-ruled rows (compact: 8px thumbnails, default: 128×96). Vertical rhythm is generous around H2s (56px above) and tight inside metadata.

## Elevation & Depth

Flat. No shadows exist in the system. Depth is conveyed by 1px ink rules, 1px ink image borders, and a Paper Shade placeholder. Nothing lifts on hover; only text color changes.

### Named Rules
**The Flat Page Rule.** If a surface needs separating, draw a rule. Never add a shadow, blur, or tint card.

## Shapes

Hard right angles everywhere (`--radius: 0`). Frames are 1px ink borders around 4:3 image crops. No pills, no circles, no rounded avatars.

## Components

### Links
- **Style:** underlined text with `text-underline-offset: 3px`, 1px decoration; the current nav item is bold.
- **Hover:** the underline thickens from 1px to 3px over 120ms; the text and the underline stay ink. List rows fade in a diagonal hatch, nav links fade in a `>` marker.

### Navigation
- Site name (bold, home link) then page links from the site structure, with github / linkedin / instagram / mail in mono at the right. Wraps on small screens. Active page gets `aria-current` and bold.

### Cards (works, experiments)
- **Shape:** none; just an optional 4:3 dithered image in an ink-bordered frame, a bold 18px title link, and a one-line mono meta string (tags · category · date).
- Cards sit in ruled cells (`columns` per route in SITE_DATA, default 3; an incomplete last row is filled with empty ruled cells) that run from the rail's line to the right edge. The 4:3 image fills the cell edge to edge (no frame, no padding, one rule underneath); the text below sits on the page's left edge.

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
- **Do** keep the left rail and cap reading text at 40rem.
- **Do** keep payloads small: system fonts, no animation libraries on the critical path.

### Don't:
- **Don't** use rounded corners, shadows, gradients, blur, or badges (the generic SaaS / ShadCN default look).
- **Don't** add a dark mode or theme toggle.
- **Don't** use Vermilion for fills, headings, or decoration.
- **Don't** download webfonts.
- **Don't** hard-code content that belongs in Notion.
