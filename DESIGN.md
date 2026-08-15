# DESIGN.md — Karang Taruna UI Design System

> **Scope:** Visual design only — colors, typography, surfaces, spacing, borders, shadows, icons, states, and visual treatment.
>
> **Important:** This document intentionally does **not** define sidebar structure, navigation order, page structure, routes, business logic, or component placement. The existing project structure should be preserved.

---

## 1. Design Direction

### Visual Theme

**Modern Youth Community — Clean, Energetic, Friendly, Professional**

The interface should feel like a modern community/productivity application rather than a government administration system.

Key characteristics:

- Modern and youthful
- Clean and spacious
- Friendly but professional
- Energetic without being visually noisy
- Rounded UI elements
- Soft shadows
- Teal/emerald as the primary identity
- Orange/yellow as energetic accents
- Blue and purple as secondary functional colors
- White content surfaces on a very light neutral background
- Strong typography hierarchy
- Subtle gradients are allowed
- Avoid excessive borders and heavy visual decoration

### Reference Feeling

The visual language should resemble a combination of:

- Modern SaaS dashboard
- Youth community platform
- Productivity application
- Social collaboration interface

It should **not** look like:

- Old-fashioned administrative software
- Dense government forms
- Flat monochrome CRUD interface
- Excessively corporate banking UI
- Overly colorful children's application

---

## 2. Color System

Use CSS variables/design tokens so the entire application can be themed consistently.

### Primary — Emerald / Teal

```css
--color-primary-50:  #ECFDF5;
--color-primary-100: #D1FAE5;
--color-primary-200: #A7F3D0;
--color-primary-300: #6EE7B7;
--color-primary-400: #34D399;
--color-primary-500: #10B981;
--color-primary-600: #059669;
--color-primary-700: #047857;
--color-primary-800: #065F46;
--color-primary-900: #064E3B;
```

**Primary usage:**

- Main brand identity
- Active states
- Primary buttons
- Positive progress
- Selected controls
- Important links
- Online indicators
- Key dashboard highlights

Preferred main brand color:

`#059669`

---

### Dark Teal — Navigation / Strong Contrast

```css
--color-teal-dark:  #064E3B;
--color-teal-deep:  #043C35;
--color-teal-mid:   #0F766E;
```

Use for:

- Dark visual surfaces
- Strong brand areas
- Illustration backgrounds
- High-contrast sections
- Existing sidebar if the project already uses one

Avoid using dark teal as the main background for the entire application.

---

### Accent — Orange / Energy

```css
--color-orange-50:  #FFF7ED;
--color-orange-100: #FFEDD5;
--color-orange-200: #FED7AA;
--color-orange-300: #FDBA74;
--color-orange-400: #FB923C;
--color-orange-500: #F97316;
--color-orange-600: #EA580C;
```

Use for:

- Financial highlights
- Important attention states
- Activity indicators
- Secondary CTA
- Event emphasis
- Small decorative elements

Preferred accent:

`#F97316`

Orange should be an **accent**, not the dominant page color.

---

### Yellow — Optimistic Highlight

```css
--color-yellow-400: #FBBF24;
--color-yellow-500: #F59E0B;
```

Use sparingly for:

- Highlight text
- Badges
- Achievement indicators
- Small decorative details
- Hero section accents

---

### Blue — Information

```css
--color-blue-50:  #EFF6FF;
--color-blue-100: #DBEAFE;
--color-blue-500: #3B82F6;
--color-blue-600: #2563EB;
```

Use for:

- Information
- Calendar
- Events
- Neutral action indicators
- Informational charts

---

### Purple — Programs / Secondary Category

```css
--color-purple-50:  #FAF5FF;
--color-purple-100: #F3E8FF;
--color-purple-500: #8B5CF6;
--color-purple-600: #7C3AED;
```

Use for:

- Program categories
- Secondary analytics
- Special labels
- Supporting visual differentiation

---

## 3. Neutral Color System

The application should primarily use neutral surfaces.

```css
--color-background: #F8FAFC;
--color-surface:    #FFFFFF;

--color-text-900:   #0F172A;
--color-text-800:   #1E293B;
--color-text-700:   #334155;
--color-text-600:   #475569;
--color-text-500:   #64748B;
--color-text-400:   #94A3B8;

--color-border:     #E2E8F0;
--color-border-soft:#EEF2F7;
```

### Usage

**Page background**

`#F8FAFC`

**Card background**

`#FFFFFF`

**Primary text**

`#0F172A`

**Secondary text**

`#64748B`

**Muted text**

`#94A3B8`

**Border**

`#E2E8F0`

Do not use pure black (`#000000`) for normal UI text.

---

## 4. Typography

### Recommended Font

Preferred:

**Inter**

Alternative:

**Plus Jakarta Sans**

Fallback:

```css
font-family:
  Inter,
  "Plus Jakarta Sans",
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

### Typography Hierarchy

#### Page Heading

```css
font-size: 28px–32px;
font-weight: 700;
line-height: 1.2;
letter-spacing: -0.02em;
color: #0F172A;
```

#### Section Heading

```css
font-size: 18px–20px;
font-weight: 700;
line-height: 1.3;
color: #0F172A;
```

#### Card Heading

```css
font-size: 14px–16px;
font-weight: 600;
color: #1E293B;
```

#### Body

```css
font-size: 14px–15px;
font-weight: 400;
line-height: 1.5;
color: #475569;
```

#### Small / Metadata

```css
font-size: 12px–13px;
font-weight: 400–500;
color: #64748B;
```

### Numbers / KPI

Large dashboard numbers should be:

- Bold
- High contrast
- Visually dominant
- Slightly tight letter spacing

Example:

```css
font-size: 28px–32px;
font-weight: 700;
letter-spacing: -0.02em;
```

---

## 5. Border Radius

The design uses noticeably rounded surfaces.

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### Recommended usage

| Element | Radius |
|---|---:|
| Input | 10–12px |
| Button | 10–12px |
| Badge | 9999px |
| Small card | 12–16px |
| Main card | 16px |
| Hero | 18–20px |
| Avatar | 9999px |
| Progress bar | 9999px |

Avoid sharp rectangular cards unless technically necessary.

---

## 6. Shadows

Use soft, subtle shadows.

### Default Card

```css
box-shadow:
  0 1px 3px rgba(15, 23, 42, 0.06),
  0 4px 12px rgba(15, 23, 42, 0.04);
```

### Elevated Card

```css
box-shadow:
  0 8px 24px rgba(15, 23, 42, 0.08);
```

### Floating / Modal

```css
box-shadow:
  0 20px 50px rgba(15, 23, 42, 0.14);
```

Shadows should remain soft. Avoid heavy dark shadows.

---

## 7. Cards

Cards are one of the primary visual patterns.

### Card Style

```css
background: #FFFFFF;
border: 1px solid #EEF2F7;
border-radius: 16px;
box-shadow:
  0 1px 3px rgba(15, 23, 42, 0.06),
  0 4px 12px rgba(15, 23, 42, 0.04);
```

### Card Behavior

On hover:

- Slight elevation
- Border becomes slightly more visible
- Transition should be subtle

Example:

```css
transition:
  transform 180ms ease,
  box-shadow 180ms ease,
  border-color 180ms ease;
```

Avoid exaggerated hover animations.

---

## 8. Buttons

### Primary Button

```css
background: #059669;
color: #FFFFFF;
border-radius: 10px;
font-weight: 600;
```

Hover:

```css
background: #047857;
```

### Secondary Button

```css
background: #ECFDF5;
color: #047857;
border: 1px solid #D1FAE5;
```

### Neutral Button

```css
background: #FFFFFF;
color: #334155;
border: 1px solid #E2E8F0;
```

### Accent Button

Use orange only when the action needs visual emphasis:

```css
background: #F97316;
color: #FFFFFF;
```

---

## 9. Inputs & Search

Inputs should look light, modern, and comfortable.

```css
background: #FFFFFF;
border: 1px solid #E2E8F0;
border-radius: 12px;
color: #1E293B;
```

Focus:

```css
border-color: #10B981;
box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
```

Placeholder:

```css
color: #94A3B8;
```

Search fields may include a soft keyboard shortcut indicator on desktop.

---

## 10. Badges & Status

Badges should use light tinted backgrounds.

### Success

```css
background: #ECFDF5;
color: #047857;
```

### Warning

```css
background: #FFF7ED;
color: #C2410C;
```

### Information

```css
background: #EFF6FF;
color: #2563EB;
```

### Purple

```css
background: #FAF5FF;
color: #7C3AED;
```

### Neutral

```css
background: #F1F5F9;
color: #475569;
```

Use pill-shaped badges for compact status indicators.

---

## 11. Progress Bars

Progress bars should be visually lightweight.

Track:

```css
background: #E2E8F0;
border-radius: 9999px;
```

Fill:

```css
background: #10B981;
border-radius: 9999px;
```

Category colors may use:

- Emerald — primary programs
- Blue — social/information
- Orange — sports/activity
- Purple — entrepreneurship/special programs

Height:

`6–8px`

---

## 12. Charts

Charts should follow the same visual language.

### Chart Guidelines

- Minimal grid lines
- No unnecessary borders
- Rounded line joins
- Clear tooltip
- Use color sparingly
- Prefer 2–3 data colors per chart
- Use teal as the primary dataset
- Orange as comparison/secondary dataset
- Blue/purple only when additional categories are necessary

Suggested chart colors:

```css
--chart-primary:   #10B981;
--chart-secondary: #F59E0B;
--chart-info:      #3B82F6;
--chart-special:   #8B5CF6;
```

Chart labels should use:

`#64748B`

Grid lines:

`#E2E8F0`

---

## 13. Icons

Use a consistent outline icon family.

Recommended:

**Lucide Icons**

Visual rules:

- Stroke width around 1.8–2px
- Rounded line endings
- Consistent icon size
- Avoid mixing radically different icon styles

Typical sizes:

```text
16px — inline metadata
18px — buttons
20px — navigation/actions
24px — dashboard feature icons
```

Icons can use colored circular/rounded backgrounds for KPI cards.

---

## 14. KPI / Statistic Cards

KPI cards should feel visual and lightweight.

Recommended pattern:

- Small colored icon container
- Small category label
- Large number
- Small trend indicator

Example visual hierarchy:

```text
[ icon ]

Total Anggota
128

↑ 12% dari bulan lalu
```

Icon background can use:

```css
--color-primary-100
--color-blue-100
--color-purple-100
--color-orange-100
```

The number should remain dark and highly readable.

---

## 15. Hero / Welcome Area

The main welcome area can use a teal/emerald gradient.

Suggested gradient:

```css
background:
  linear-gradient(
    135deg,
    #047857 0%,
    #059669 55%,
    #10B981 100%
  );
```

Optional decorative accents:

- Soft abstract circles
- Subtle community illustration
- Very low-opacity organization emblem
- Orange/yellow curved decorative element

Hero text:

- White
- Strong weight
- High contrast

Accent phrase:

`#FBBF24`

Do not overcrowd the hero.

---

## 16. Community Illustration Style

Illustrations should communicate:

- Young people
- Collaboration
- Community
- Volunteering
- Creativity
- Local activities
- Positive energy

Recommended illustration treatment:

- Modern flat/semi-flat vector
- Clean outlines
- Slightly rounded forms
- Friendly facial expressions
- Diverse young community members
- Indonesian/local community atmosphere

Avoid:

- Photorealistic corporate stock imagery
- Generic western startup illustrations
- Overly childish cartoon style
- Plastic-looking AI characters

---

## 17. Avatar Style

Avatars should be circular.

```css
border-radius: 9999px;
```

Recommended sizes:

```text
32px — small activity list
40px — chat list
48px — profile
56px — prominent profile
```

Online indicator:

```css
background: #10B981;
border: 2px solid #FFFFFF;
border-radius: 9999px;
```

Offline:

`#CBD5E1`

---

## 18. Chat UI Visual Style

The member chat area should feel like a modern collaboration messenger.

### Chat Container

```css
background: #FFFFFF;
border: 1px solid #E2E8F0;
border-radius: 16px;
```

### Chat Header

- White
- Member count badge
- Search icon
- More menu icon

### Incoming Message

```css
background: #F1F5F9;
color: #334155;
border-radius: 14px;
```

### Outgoing Message

```css
background: #D1FAE5;
color: #065F46;
border-radius: 14px;
```

### Chat Input

```css
background: #F8FAFC;
border: 1px solid #E2E8F0;
border-radius: 12px;
```

Send button:

`#059669`

Online indicator:

`#10B981`

The chat should feel integrated into the dashboard rather than like an unrelated widget.

---

## 19. Activity Feed

Activity items should use:

- Small colored icon
- Short description
- Timestamp
- Optional avatar

Visual example:

```text
[icon]  Andi menambahkan kegiatan
        "Kerja Bakti Desa"

        2 jam yang lalu
```

Use muted timestamps:

`#94A3B8`

Keep activity rows compact and easy to scan.

---

## 20. Calendar / Event Visuals

Event cards should use strong date emphasis.

Date:

- Large
- Bold
- Primary or category color

Example:

```text
25
MEI
```

Event information:

- Event name — dark text
- Location — muted text
- Time — muted text
- Status — colored pill

Do not use excessive color on the entire event card.

---

## 21. Spacing System

Use an 8px-based spacing system.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 32px;
--space-8: 40px;
--space-9: 48px;
--space-10: 64px;
```

Recommended:

- Card internal padding: 20–24px
- Small gaps: 8–12px
- Standard component gaps: 16px
- Section gaps: 24–32px

Keep the interface breathable.

---

## 22. Visual Density

Target density:

**Medium / Comfortable**

The dashboard should show useful information without feeling crowded.

Rules:

- Prefer whitespace over unnecessary borders
- Do not compress every component
- Avoid excessive text
- Use visual hierarchy
- Let cards breathe
- Keep metadata visually subordinate

---

## 23. Animation

Animations should be subtle and fast.

Recommended:

```css
transition-duration: 150ms–220ms;
transition-timing-function: ease;
```

Good animation examples:

- Button hover
- Card elevation
- Dropdown appearance
- Modal fade/scale
- Progress animation
- Chat message appearance

Avoid:

- Large bouncing animations
- Constant movement
- Excessive gradients/particles
- Slow transitions

---

## 24. Responsive Visual Behavior

The visual language should remain consistent across screen sizes.

### Desktop

- Spacious cards
- Full dashboard visual hierarchy
- Charts visible
- Chat panel visible when space allows

### Tablet

- Cards can become more compact
- Secondary information may collapse
- Maintain comfortable spacing

### Mobile

- Prioritize readability
- Cards become full-width
- Reduce decorative elements
- Maintain rounded cards
- Keep touch targets comfortable
- Preserve the same color and typography system

---

## 25. Accessibility

Maintain good contrast.

Minimum expectations:

- Primary text must be highly readable
- Do not communicate status using color alone
- Buttons must have clear text/icon meaning
- Focus states must be visible
- Interactive elements should have comfortable touch areas

Recommended minimum interactive target:

`44px`

---

## 26. Do / Don't

### DO

- Use white cards on a soft neutral background
- Use emerald/teal as the visual identity
- Use orange as an energetic accent
- Use rounded corners
- Use soft shadows
- Use clear typography hierarchy
- Use friendly community illustrations
- Use subtle micro-interactions
- Keep charts clean

### DON'T

- Don't redesign the existing sidebar structure
- Don't introduce a different navigation hierarchy
- Don't use too many saturated colors simultaneously
- Don't make every card colorful
- Don't use heavy borders
- Don't use pure black everywhere
- Don't make the dashboard look like a government portal
- Don't use excessive glassmorphism
- Don't use excessive gradients
- Don't overload the screen with decorative elements

---

## 27. Core Design Tokens

A compact implementation reference:

```css
:root {
  /* Brand */
  --primary: #059669;
  --primary-hover: #047857;
  --primary-light: #ECFDF5;
  --primary-soft: #D1FAE5;

  /* Accent */
  --accent-orange: #F97316;
  --accent-yellow: #F59E0B;
  --accent-blue: #3B82F6;
  --accent-purple: #8B5CF6;

  /* Surfaces */
  --background: #F8FAFC;
  --surface: #FFFFFF;

  /* Text */
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;

  /* Borders */
  --border: #E2E8F0;
  --border-soft: #EEF2F7;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card:
    0 1px 3px rgba(15, 23, 42, 0.06),
    0 4px 12px rgba(15, 23, 42, 0.04);

  --shadow-elevated:
    0 8px 24px rgba(15, 23, 42, 0.08);

  /* Typography */
  --font-sans:
    Inter,
    "Plus Jakarta Sans",
    system-ui,
    sans-serif;
}
```

---

## 28. Final Implementation Rule

When implementing this design in the existing project:

> **Change the visual language, not the existing information architecture.**

Preserve:

- Existing sidebar
- Existing navigation
- Existing routes
- Existing page hierarchy
- Existing business logic
- Existing functionality

Apply this document to:

- Colors
- Typography
- Cards
- Buttons
- Inputs
- Tables
- Charts
- Badges
- Avatars
- Modals
- Dropdowns
- Notifications
- Chat UI
- Empty states
- Loading states
- Hover/focus states
- Overall visual polish

The final application should visually resemble a **modern, energetic Karang Taruna community platform** while remaining clean, professional, scalable, and easy to use.
