# 4 Video Travel Frontend Template

An editorial luxury travel landing page template with a cinematic hero video, scroll-revealed philosophy manifesto, pale split-layout principles section, membership tiers, and a heritage-styled footer.

## Features

- Full-screen hero with looping background video and glass content card
- Adaptive navigation that switches text color over dark and light sections
- Scroll-scrubbed manifesto text reveal using SplitType + GSAP
- Split-layout principles section with sticky 3D helix effect
- Membership tiers with alternating image/text layout
- Refined editorial footer with brand block and structured link columns

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v3
- GSAP + ScrollTrigger
- Lenis
- Three.js
- SplitType

## Quick Start

1. Install dependencies: `npm install`
2. Edit `src/config.ts`
3. Add images to `public/images/`
4. Add video to `public/videos/`
5. Run the dev server: `npm run dev`
6. Build for production: `npm run build`

## Configuration

All content is configured in `src/config.ts`. Do not modify section or effect files unless you are fixing a real bug.

### `siteConfig`

```ts
export const siteConfig = {
  language: "",         // Language code, e.g. "en", "zh-CN", "ja"
  siteTitle: "",        // Browser tab title
  siteDescription: "",  // Meta description
}
```

### `navigationConfig`

```ts
export const navigationConfig = {
  brandName: "",        // Brand text shown on the left side of the nav
  links: [
    // { label: "", target: "#manifesto" }
  ],
}
```

### `heroConfig`

```ts
export const heroConfig = {
  videoPath: "",        // Path like "videos/hero.mp4"
  eyebrow: "",          // Small label above the hero heading
  titleLine: "",        // Main hero line before the italic emphasis
  titleEmphasis: "",    // Italic emphasized line
  subtitleLine1: "",    // First subtitle line
  subtitleLine2: "",    // Second subtitle line
  ctaText: "",          // CTA text
  ctaTargetId: "",      // Scroll target like "#tiers"
}
```

### `manifestoConfig`

```ts
export const manifestoConfig = {
  sectionLabel: "",     // Small uppercase label, e.g. "Our Philosophy"
  text: "",             // Large manifesto paragraph
}
```

### `anatomyConfig`

```ts
export const anatomyConfig = {
  sectionLabel: "",     // Small uppercase section label
  title: "",            // Main heading
  pillars: [
    {
      label: "",        // Small label
      title: "",        // Pillar title
      body: "",         // Paragraph body
    },
  ],
}
```

### `tiersConfig`

```ts
export const tiersConfig = {
  sectionLabel: "",     // Small uppercase section label
  title: "",            // Main heading
  tiers: [
    {
      name: "",         // Tier name
      price: "",        // Price number without the currency symbol
      frequency: "",    // Price qualifier like "per annum"
      journeys: "",     // Small label above tier name
      image: "",        // Path like "images/tier-01.jpg"
      description: "",  // Tier description
      amenities: [],    // Bullet list of amenities
      ctaText: "",      // Button text
      ctaHref: "",      // Button href or "#"
    },
  ],
}
```

### `footerConfig`

```ts
export const footerConfig = {
  ageGateText: "",      // Large italic footer intro line
  brandName: "",        // Brand heading in the footer
  brandTaglineLines: [],// 1-3 short lines below the brand
  columns: [
    {
      heading: "",      // Column heading
      links: [
        // { label: "", href: "" }
      ],
    },
  ],
  copyright: "",        // Bottom legal line
}
```

## Required Images

Place all images in `public/images/`.

### Membership Tiers

- `images/tier-01.jpg`
- `images/tier-02.jpg`
- `images/tier-03.jpg`

Recommended specs:

- Aspect ratio: 4:3
- Minimum size: 1200x900
- Photography should feel premium, cinematic, and low-noise

## Required Video

Place all videos in `public/videos/`.

- `videos/hero.mp4`

Recommended specs:

- Aspect ratio: 16:9 or wider
- Resolution: 1920x1080 or higher
- Muted looping video with calm motion and strong tonal range

## Design

**Colors**

- Dark base: `#180c04`
- Cream / pale sections: `#f0ecd7` and `#fcfaee`
- Accent muted gold: `#938977`
- Light text: `#fcfaee`
- Dark text: `#180c04`

**Fonts**

- Display: `Cormorant Garamond`
- Body: `Inter`

**Animations**

- GSAP entrance animations in hero and tiers
- Scroll-scrubbed word reveal in the manifesto
- Adaptive navigation color based on current section background
- Sticky Three.js helix panel in the principles section

## Notes

- Empty config values hide the corresponding section or element
- `tiersConfig.tiers` works best with 2-4 entries
- `anatomyConfig.pillars` works best with exactly 3 pillars for balanced pacing
- The hero title is designed for a short two-part composition: a regular line plus an italic emphasis line
