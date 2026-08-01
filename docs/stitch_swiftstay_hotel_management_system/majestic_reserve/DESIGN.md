---
name: Majestic Reserve
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#775925'
  on-secondary: '#ffffff'
  secondary-container: '#fdd494'
  on-secondary-container: '#785a26'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1e'
  on-tertiary-container: '#818486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdeab'
  secondary-fixed-dim: '#e8c182'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#5d420f'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 4px
  stack-md: 16px
  stack-lg: 40px
---

## Brand & Style

The design system is engineered to evoke an atmosphere of "Quiet Luxury"—an aesthetic that prioritizes refinement over flashiness. The target audience includes discerning travelers, luxury property managers, and hospitality administrators who value efficiency wrapped in an elegant interface.

The design style is **Modern Corporate with Tonal Minimalism**. It leverages heavy whitespace to create a sense of "breathable" luxury, ensuring that high-quality property imagery remains the focal point. Interactions should feel deliberate and smooth, utilizing subtle transitions that suggest a high-touch concierge service. The emotional response is one of calm, reliability, and exclusive access.

## Colors

The palette is anchored by **Midnight Navy** (#0F172A), representing authority and stability. **Champagne Gold** (#B49157) is used sparingly as a "precious metal" accent for primary actions, badges, and highlights to signify premium status.

- **Primary (Navy):** Used for navigation, headings, and primary buttons.
- **Secondary (Gold):** Used for call-to-actions, star ratings, and luxury tier indicators.
- **Surface (Soft Grays):** A scale of cool grays provides soft contrast for cards and background sections without the harshness of pure white.
- **Role Differentiation:** 
  - *Guest:* Standard palette with Gold accents.
  - *Owner:* Indigo-tinted neutrals to signify a "Business/Partner" environment.
  - *Admin:* Deep slate tones for a focused, data-heavy "Control Room" feel.

## Typography

This design system utilizes a high-contrast typographic pairing to balance editorial beauty with functional clarity.

1.  **Playfair Display (Headings):** Used for all display titles and section headers. It brings a literary, historical weight to the brand.
2.  **Inter (UI & Body):** Used for all functional text, descriptions, and data. Its high x-height and neutral character ensure legibility during the booking process and within complex admin tables.

**Formatting Rules:**
- Use **Display-LG** for hero sections with wide tracking.
- Use **Label-MD** in uppercase for overlines and small buttons to create a structured, architectural look.
- Maintain a generous line-height (1.5+) for body text to improve reading stamina during long property descriptions.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. Content is centered within a 1280px container on desktop, while expanding to a fluid 4-column grid on mobile. 

- **Vertical Rhythm:** Use a strict 8px baseline grid. Elements should be spaced in multiples of 8 (e.g., 16px, 24px, 40px) to maintain a rigorous, professional structure.
- **Section Breathing:** High-level sections (e.g., Hero to Featured Rooms) should use a minimum of 80px to 120px of vertical padding to emphasize the luxury of "space."
- **Admin Layout:** Uses a persistent left-hand sidebar (280px) and a fluid content area for data-heavy tables and dashboards.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering** rather than heavy lines.

- **Level 0 (Base):** Background color (#F8FAFC).
- **Level 1 (Cards):** Pure white background with a very soft, diffused shadow (0px 4px 20px rgba(15, 23, 42, 0.05)).
- **Level 2 (Modals/Overlays):** A more pronounced shadow (0px 12px 40px rgba(15, 23, 42, 0.12)) to suggest immediate focus.
- **Glassmorphism:** Use a subtle backdrop blur (12px) on navigation bars and image-top overlays to maintain context while ensuring legibility.

## Shapes

The shape language is **Soft-Geometric**. 

- **Standard Radius:** 8px (0.5rem) is the default for buttons, input fields, and small UI widgets.
- **Large Radius:** 16px (1rem) is reserved for property cards and featured content containers to give them a modern, "app-like" feel.
- **Buttons:** Avoid pill shapes; maintain the 8px radius to keep the look sophisticated and architectural.

## Components

### Buttons
- **Primary:** Navy background, white text. No border.
- **Secondary (Luxury CTA):** Gold background, Navy text. Use for "Book Now" or "Upgrade."
- **Ghost:** Navy outline (1px), transparent background. For low-priority actions like "View Details."

### Cards
- Images must have a slight zoom-in hover effect.
- Content padding should be a minimum of 24px.
- Use the Secondary Gold for price points and star ratings.

### Input Fields
- Understated design: 1px border (#E2E8F0) that thickens and changes to Navy on focus.
- Labels are always visible in **Label-MD** style.
- Error states use a soft red tint background with a 1px solid red border.

### Search Bar (Concierge Style)
- A floating horizontal bar on the hero section. 
- Integrated date pickers and guest counters with large, clear tap targets.
- Uses Level 2 elevation to appear "above" the beautiful hero imagery.

### Admin/Owner Specifics
- **Data Tables:** Use alternating row stripes (Level 0 and Level 1 colors).
- **Status Chips:** Use rounded-xl (pill) shapes for "Confirmed," "Pending," or "Cancelled" with low-opacity background tints and high-contrast text.