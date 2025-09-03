---
trigger: model_decision
description: When working on anything related to design, color, styles, branding, UI, UX, content
---


# AI Design Instructions: The "robonxt" Brand & Design System

You are an expert UI/UX designer. Your task is to design components, interfaces, and user experiences following the "robonxt" Brand & Design System. Adhere strictly to the rules, tokens, and component blueprints outlined below.

## 1. Core Philosophy: The Pragmatic Professional

This is the foundation of all design and copy decisions.

*   **Persona:** Your design should embody a confident, expert guide. It is efficient, clear, and has a witty, human touch. The personality is semi-minimalist, professional, and subtly playful.
*   **[GOLDEN RULE] Clarity First, Always:** Personality, humor, or clever design elements must **never** sacrifice the user's ability to understand. If a choice is between "clever" and "clear," always choose "clear."
*   **Voice & Tone:**
    *   **Default (90% of content):** Keep copy casual, clear, concise, and helpful. Use simple language.
    *   **Clever Asides (10% of content):** In low-stakes moments (e.g., success messages, empty states), you can use witty, context-aware humor (puns, dad jokes).
    *   **Critical Information (Errors, Warnings):** The tone must be 100% professional and direct. **No jokes in error messages.**

## 2. Theming & Color System

**RULE:** All components **must** use the following semantic color tokens. Do not reference raw hex codes directly in designs. The system is designed for both light and dark modes automatically through these tokens.

| Semantic Token | Light Mode Value | Dark Mode Value | Use Case |
| :--- | :--- | :--- | :--- |
| `color-primary` | Teal (`#14B8A6`) | Teal (`#14B8A6`) | Main interactive elements, CTAs, active states. |
| `color-accent` | Crimson (`#D94452`) | Crimson (`#D94452`) | Secondary/destructive actions. |
| `color-background` | Paper (`#F5F7FA`) | Deep Onyx (`#161F27`) | The main page background. |
| `color-surface` | Paper (`#F5F7FA`) | Onyx (`#1F2933`) | Component backgrounds (Cards, Modals). |
| `color-text-high` | Slate (`#343F4B`) | Paper (`#F5F7FA`) | High-emphasis text (Headings, body). |
| `color-text-medium` | Medium Gray (`#8A94A6`) | Medium Gray (`#8A94A6`) | Medium-emphasis text (Labels, helper text). |
| `color-text-low` | Light Gray (`#E1E5EA`) | Slate (`#343F4B`) | Low-emphasis text, disabled states. |
| `color-border-default` | Light Gray (`#E1E5EA`) | Slate (`#343F4B`) | Default borders and dividers. |
| `color-border-focus` | Teal (`#14B8A6`) | Teal (`#14B8A6`) | Focus rings on interactive elements. |
| `color-success` | Green (`#22C55E`) | Green (`#22C55E`) | Success states and messaging. |
| `color-warning` | Amber (`#F59E0B`) | Amber (`#F59E0B`) | Warning states and messaging. |
| `color-error` | Crimson (`#D94452`) | Crimson (`#D94452`) | Error states and messaging. |

## 3. Typography System

**RULE:** All text must use the `Inter` font family and adhere to the following typographic scale and rules.

| Role | Size (rem/px) | Weight | Use Case |
| :--- | :--- | :--- | :--- |
| **Jumbo** | `10rem` / 160px | Black (900) | Ultra-impactful, single words or numbers. |
| **Display XL**| `6rem` / 96px | Bold (700) | Marketing hero headlines. |
| **Heading 1** | `2.25rem` / 36px | Bold (700) | Primary page titles. |
| **Heading 2** | `1.5rem` / 24px | Semi-Bold (600) | Section titles. |
| **Heading 3** | `1.25rem` / 20px | Semi-Bold (600) | Sub-sections, component titles. |
| **Body (Lead)**| `1.125rem` / 18px | Regular (400) | Introductory paragraphs. |
| **Body (Base)**| `1rem` / 16px | Regular (400) | **Default text.** All main content. |
| **Label** | `0.875rem` / 14px | Medium (500) | Buttons, form labels, navigation. |
| **Caption** | `0.875rem` / 14px | Regular (400) | Helper text, metadata. |
| **Micro** | `0.75rem` / 12px | Regular (400) | Timestamps, secondary details. |
| **Fine Print**| `0.625rem` / 10px | Regular (400) | **Legal disclaimers only.** |

*   **Readability Rules:**
    *   **Line Height:** `1.6` for body text, `1.3` for headings.
    *   **Letter Spacing:** `-1%` for headings.

## 4. Layout, Spacing, & Primitives

**[CORE PRINCIPLE] The 8-Point Grid System:** All spacing values (margins, padding, gaps) **must be a multiple of 8px.** Use the following tokens.

| Token | Value | Use Case |
| :--- | :--- | :--- |
| `space-xs` | 8px | Between small, related elements (icon & text). |
| `space-sm` | 16px | Padding in buttons, gaps between list items. |
| `space-md` | 24px | Content padding inside components (cards, modals). |
| `space-lg` | 32px | Separation between distinct component groups. |
| `space-xl` | 48px | Margin between major page sections. |
| `space-2xl`| 64px | Page-level padding for significant breathing room. |

---

**[CORE PRINCIPLE] Physical Properties:** Use the following tokens for shadows, borders, and corner radii.

| Type | Token | Value | Use Case |
| :--- | :--- | :--- | :--- |
| **Shadow** | `shadow-sm` | - | Subtle shadow for interactive elements on hover. |
| | `shadow-md` | - | **Default.** Standard shadow for Cards and Popovers. |
| | `shadow-lg` | - | Prominent shadow for critical overlays like Modals. |
| **Border** | `stroke-sm` | 1px | **Default.** Borders, dividers. |
| | `stroke-md` | 2px | Focus rings, active state indicators. |
| **Radius** | `radius-sm` | 4px | Small elements like checkboxes, tooltips. |
| | `radius-md` | 8px | **Default.** Buttons, inputs. |
| | `radius-lg` | 16px | Larger components: Surfaces, Cards, Modals. |
| | `radius-full` | 9999px | Circular elements: Pills, Toggles, Avatars. |

## 5. Motion System

**RULE:** All animations must use the following tokens for duration and easing.

*   **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)`
*   **Duration Tokens:**
    *   `duration-quick`: **150ms** (For hover effects on color/shadow)
    *   `duration-medium`: **300ms** (Default, for state changes like toggles/accordions)
    *   `duration-slow`: **500ms** (For large transitions like modals appearing)

## 6. Component Blueprints

Construct all UI components using the rules and tokens defined above.

---

### **Icons**
*   **Library:** Material Symbols
*   **Style:** **Rounded** (exclusively)
*   **Sizing:** Must use the 8-point grid. `24px` is the default.
*   **Color:** Must be set to `currentColor` to inherit text color.

---

### **Buttons**
*   **Radius:** `radius-md` (8px)
*   **Typography:** `Label` style
*   **Padding:** `space-sm` (16px) vertically and horizontally (adjust for icon-only buttons).
*   **Required Variants:**
    *   `Primary`: Solid fill using `color-primary`.
    *   `Secondary`: Solid fill using `color-accent`.
    *   `Outline`: Transparent fill, `stroke-sm` border using `color-border-default`.
    *   `Ghost`: Transparent fill, no border.
*   **Required States:** All variants must have styles for `default`, `hover`, `focus-visible`, and `disabled`.

---

### **Input Fields**
*   **Structure:** Label, Input Container, Helper/Error Text.
*   **Tokens:**
    *   **Radius:** `radius-md` (8px)
    *   **Border:** `stroke-sm` (1px) default, `stroke-md` (2px) on focus.
    *   **Typography:** `Label` for the label, `Body (Base)` for input text, `Caption` for helper/error text.
    *   **Spacing:** `space-xs` (8px) between label and container, and between container and helper text. Internal padding is `space-sm` (16px).
*   **States & Colors:**
    *   **Default:** Border is `color-border-default`. Label is `color-text-high`. Helper text is `color-text-medium`.
    *   **Focus:** Border is `color-border-focus` (`stroke-md`). Label is `color-primary`.
    *   **Error:** Border, Label, and Helper Text are all `color-error`.
    *   **Disabled:** All text is `color-text-low`.

---

### **Switches (Toggles)**
*   **Purpose:** For binary on/off states that apply instantly.
*   **Anatomy:** A "track" and a "thumb".
*   **Tokens:**
    *   **Radius:** `radius-full` for both track and thumb.
    *   **Motion:** `duration-quick` (150ms) for the thumb animation.
*   **States & Colors:**
    *   **Off:** Track is `color-border-default`. Thumb is `Paper` (light mode) or `Light Gray` (dark mode).
    *   **On:** Track is `color-primary`. Thumb is `Paper` (light mode) or `Light Gray` (dark mode).
    *   **Disabled:** Track is `color-text-low`. Thumb is `Light Gray`.

---

### **Modals**
*   **Purpose:** Critical, blocking overlays that require user interaction.
*   **Structure:** Backdrop, Surface, Header (Title + Close Button), Body, Footer (Action Buttons).
*   **Tokens:**
    *   **Elevation:** `shadow-lg`
    *   **Radius:** `radius-lg` (16px) for the Surface.
    *   **Typography:** `Heading 3` for the title.
    *   **Spacing:** `space-md` (24px) for all internal padding and gaps between header/body/footer. Gap between footer buttons is `space-sm` (16px).
    *   **Motion:** `duration-slow` (500ms) for fade/scale transitions.
*   **Styling:**
    *   Surface background is `color-surface`.
    *   Backdrop is a semi-transparent black.
    *   Footer buttons should typically be a `Primary` action and an `Outline` or `Ghost` cancel action.