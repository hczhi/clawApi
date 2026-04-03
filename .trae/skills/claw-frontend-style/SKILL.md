---
name: "claw-frontend-style"
description: "Applies the minimalist, premium modern UI aesthetic of the clawApi app. Invoke when creating new pages or components, or optimizing existing UI."
---

# Claw Frontend Style

This skill applies the distinctive, premium modern UI aesthetic of the clawApi application.

## Core Aesthetic Principles

- **Minimalist & High Contrast**: Heavy use of pure black (`#111111`) and white (`#FAFAFA`), relying on opacity for hierarchy (e.g., `text-black/40`, `bg-black/5`).
- **Typography**: 
  - Extra bold/black headings with tight letter spacing (`font-black tracking-tighter text-3xl`).
  - Small, ultra-wide uppercase labels for metadata/menus (`text-[10px] font-bold tracking-widest uppercase`).
- **Shapes & Shadows**:
  - Extremely rounded corners (`rounded-[2rem]`, `rounded-full`, `rounded-2xl`).
  - Soft, expansive shadows (`shadow-[0_30px_60px_rgba(0,0,0,0.12)]`).
- **Materials**: 
  - Translucent backgrounds with blur (`bg-white/80 backdrop-blur-md`).
  - Subtle borders (`border border-black/10`).
- **Interactions**: 
  - Silky smooth transitions (`transition-all duration-300`, `transition-transform duration-[1.5s] ease-out`).
  - Hover states that subtly scale or translate (`hover:scale-105 hover:-translate-y-2 group-hover:translate-x-1`).
- **Animations**: Entrance animations like `animate-slide-up`, `animate-slide-right`, `animate-fade-in-up` with staged delays.

## Common Tailwind Classes to Use

- **Backgrounds**: `bg-[#FAFAFA]`, `bg-white`, `bg-black/[0.02]` (for hover rows).
- **Text**: `text-[#111111]`, `text-black/40` (for secondary), `text-[10px] uppercase tracking-widest` (for labels).
- **Cards/Containers**: `rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-black/5`.
- **Buttons**: `rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors group`.
- **Icons**: Opacity transitions (`opacity-70 group-hover:opacity-100`).

## Usage Instructions

When asked to create or optimize a page in this project:
1. Always use these Tailwind classes to match the existing home page.
2. Avoid generic Bootstrap/Material UI styles.
3. Ensure empty states and lists have ample padding (`py-12`, `px-6`) and rounded shapes.