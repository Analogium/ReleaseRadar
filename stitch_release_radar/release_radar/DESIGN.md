---
name: Release Radar
colors:
  surface: '#15121b'
  surface-dim: '#15121b'
  surface-bright: '#3b3742'
  surface-container-lowest: '#0f0d15'
  surface-container-low: '#1d1a23'
  surface-container: '#211e27'
  surface-container-high: '#2c2832'
  surface-container-highest: '#37333d'
  on-surface: '#e7e0ed'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e7e0ed'
  inverse-on-surface: '#322f39'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#ffb0cd'
  on-secondary: '#640039'
  secondary-container: '#aa0266'
  on-secondary-container: '#ffbad3'
  tertiary: '#ffb869'
  on-tertiary: '#482900'
  tertiary-container: '#ca801e'
  on-tertiary-container: '#3f2300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#ffd9e4'
  secondary-fixed-dim: '#ffb0cd'
  on-secondary-fixed: '#3e0022'
  on-secondary-fixed-variant: '#8c0053'
  tertiary-fixed: '#ffdcbb'
  tertiary-fixed-dim: '#ffb869'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#15121b'
  on-background: '#e7e0ed'
  surface-variant: '#37333d'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  micro:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is built for a high-end, immersive music discovery experience. It prioritizes the artist's visual intent—album artwork—above all else, acting as a sophisticated gallery for new releases. 

The aesthetic is **Dark-Mode Minimalist** with a **Glassmorphic** edge. It evokes a "late-night" atmosphere that is quiet, premium, and focused. By using deep, near-black tones, the interface recedes into the background, allowing vibrant album covers and the electric violet-to-magenta accents to command the user's attention. The emotional response should be one of curated exclusivity and effortless discovery.

## Colors
The palette is rooted in a deep-space obsidian to minimize eye strain and maximize the pop of color.

- **Background:** A solid near-black (#0B0B0F) provides the canvas.
- **Surfaces:** Cards and elevated containers use #16161C, creating a subtle but distinct separation from the background.
- **Accents:** An electric gradient from Violet (#8B5CF6) to Magenta (#EC4899) is used sparingly for primary actions, active states, and progress indicators.
- **Functional Colors:** Success, Warning, and Error states should be desaturated to maintain the premium feel, using thin strokes rather than heavy blocks of color.

## Typography
The design system utilizes **Inter** exclusively to achieve a clean, systematic, and utilitarian look that doesn't compete with artistic assets. 

- **Hierarchy:** Dramatic contrast between high-weight headlines and light-weight body text.
- **Micro-labels:** Used for metadata (release dates, durations, track counts). These should be rendered in `text_secondary` or `text_tertiary` to maintain the visual hierarchy.
- **Captions:** Use the `label-caps` style for status badges like "NEW" or "ALBUM" to ensure they are legible even at small sizes.

## Layout & Spacing
The layout follows a **Fluid Grid** model with generous "breathing room" to maintain the premium feel.

- **Desktop:** A 12-column grid with a maximum content width of 1440px. 
- **Mobile:** A 4-column grid with 16px side margins. 
- **Rhythm:** All spacing is derived from a 4px baseline. Use `lg` (40px) for section vertical spacing and `sm` (16px) for internal component padding.
- **Album Grids:** On desktop, use a flexible 5 or 6 column layout for covers. On mobile, use a 2-column layout to keep artwork large and impactful.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Subtle Blurs** rather than traditional heavy shadows.

- **Level 0 (Background):** #0B0B0F.
- **Level 1 (Cards/Tiles):** #16161C with a 1px inner border (border-white, 5% opacity) to define edges.
- **Level 2 (Modals/Popovers):** #1C1C24 with a 40px backdrop blur when overlaying content.
- **Shadows:** Use a single, very soft ambient shadow for floating elements: `0px 10px 30px rgba(0, 0, 0, 0.5)`.
- **Interactions:** On hover, cards should slightly scale (1.02x) and increase their inner border opacity to 15%.

## Shapes
The shape language is "Rounded-Soft," providing a friendly but modern counterpoint to the dark theme.

- **Album Art:** Standardized at `rounded-lg` (16px) to match the premium feel of modern OS interfaces.
- **Buttons:** Primary buttons use `rounded-xl` (24px) or full pills to distinguish them from rectangular content blocks.
- **Inputs:** Use `rounded-sm` (8px) for a slightly more precise, technical appearance in forms.

## Components
- **Buttons:** Primary buttons utilize the Violet-to-Magenta gradient with white text. Secondary buttons are "Ghost" style—transparent with a 1px border.
- **Status Badges:** Compact, high-contrast pills (e.g., a "NEW" badge with a gradient background, "ALBUM" in a subtle grey stroke).
- **Artwork Cards:** The core component. Minimal padding. Artist and Title appear below the image. A "Quick Play" floating action button (FAB) appears on hover.
- **Music Player Bar:** A fixed bottom bar with a 60% opacity background and heavy backdrop blur. It should feel like it's floating over the content.
- **List Items:** High-density rows for tracklists. Subtle separators (1px, 5% white). Active track is highlighted with a violet glow on the track number.
- **Search Bar:** Large, centered, with a `text_tertiary` placeholder and a subtle 2px bottom border that glows when focused.