# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Peers and the cultural/art community: designers, artists, researchers who follow Quentin Perchais's (essenlive) works and experiments. They browse projects, read documentation, and may reach out via mail or GitHub. A secondary audience uses the teaching section as a reference (not confirmed as primary).

## Product Purpose

Personal portfolio at essenlive.xyz presenting works, experiments and teaching. Success: peers can browse the work easily and understand each project through its documentation.

## Positioning

A lowtech portfolio: the site's lightness (dithered images, minimal payload) is part of the message, not just an optimization.

## Operating Context

Notion is the headless CMS. Routes and sections are declared in the `SITE_DATA` env var (`/`, `/works`, `/experiments`, `/teaching`), mapping paths to Notion pages or databases with filters, sorts, and per-section card/page properties. `/teaching` is a compact list without item links. Navigation shows the sitename and socials (mail, GitHub). Built with Next.js 16, React 19, Tailwind/ShadCN, deployed from the `refonte-lowtech` branch work.

## Capabilities and Constraints

- Notion stays the CMS; content, structure and routes come from Notion / `SITE_DATA`, never hard-coded.
- Images are dithered against an extracted 32-color palette (own Atkinson diffusion in `lib/imageProcessor.ts`) and served as-is, with no next/image re-encoding.
- Lowtech: keep payloads small; avoid heavy client JS and animation where avoidable.
- Mermaid diagrams are supported in content.
- Dark palette follows the browser (`prefers-color-scheme`); no toggle.

## Brand Commitments

Sitename "essenlive.xyz". Contact: hello@essenlive.xyz, github.com/essenlive.

## Evidence on Hand

Real works, experiments and teaching entries live in the Notion databases (not in the repo). No testimonials or metrics are on hand; do not fabricate them.

## Product Principles

- Lightness is the message: weight, in bytes and in visual noise, is a design decision.
- The work leads; the interface serves peers reading about projects.
- Content lives in Notion; design must adapt to whatever structure the CMS provides.
- Treat image treatment (dithering) as identity, not as an effect to hide.
