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


Instead of emojis. Fix the padding so every component is spaced perfectly - not too close to other components but not too dispersed to waste space.
 
The goal of the site is to look sleek, premium, and minimalist, like a spa in Switzerland. Design this in a way that matches what a working professional would reasonably pay thousands of dollars a month for, in a way that would make Steve Jobs smile.
 
Avoid using colors unnecessarily, instead pick from a palette that is cohesive and stick to it. Ensure the site is responsive and elegant on both desktop and mobile."
## Usage Instructions

When asked to create or optimize a page in this project:
1. Always use these Tailwind classes to match the existing home page.
2. Avoid generic Bootstrap/Material UI styles.
3. Ensure empty states and lists have ample padding (`py-12`, `px-6`) and rounded shapes.