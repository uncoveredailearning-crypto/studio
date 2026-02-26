# **App Name**: Tempo

## Core Features:

- Intuitive Time Tracking: Seamlessly create and manage both regular timers for general tasks and precise sports timers for high-accuracy event tracking, with one-tap start and HH:MM:SS / MM:SS.ms display.
- Archived Sessions Management: Organize, search, and filter recorded timer sessions using a 'Folders' system, with options to move, edit, or delete entries (with confirmation).
- Progressive Goal Tracking: Set and monitor multiple swipable goals, visualizing target versus actual hours with sleek progress bars and capturing historical 'Save Progress' snapshots to the archive.
- Insightful Data Visualizations: Review productivity trends with color-coded weekly bar charts by category and a monthly heatmap calendar; tapping a day reveals a detailed record popup.
- Secure User Authentication: User access and data isolation handled securely via Firebase Authentication, supporting Anonymous or Google sign-in options.
- Offline-First Data Synchronization: Leverage Firestore Offline Persistence to ensure timers and data entry remain functional without an internet connection, with automatic synchronization upon reconnection.
- PWA Infrastructure & Caching: Implement a PWA manifest for installability, standalone display, and configure Workbox for aggressive caching of UI assets, ensuring an 'instant-on' user experience.

## Style Guidelines:

- Primary interactive color: A refined, deep indigo-grey (#3C3D4A) providing a subtle accent while maintaining a sophisticated, modern aesthetic. Hue for this color is chosen for its professional and calming undertone, supporting focus and precision.
- Main Background: Pure white (#FFFFFF), providing a clean, expansive canvas for content, enhancing readability and contributing to a light, airy feel as explicitly requested.
- Accent color: A soft, understated cyan-blue (#93CBD6), selected to be analogous to the primary while offering gentle contrast for highlights and actionable elements without overwhelming the minimalist palette.
- Text Color: Charcoal (#1C1C1E), used for primary content for optimal legibility and a contemporary, sharp look against the pure white background.
- Border Color: Thin soft-gray (#F5F5F7), for subtle delineation of UI elements, maintaining the clean and minimalist aesthetic.
- Headlines and prominent text: 'Playfair' (serif) for an elegant, high-end, and fashionable feel, aligning with the luxury aesthetic.
- Body text and general content: 'Inter' (sans-serif) for exceptional legibility and a modern, objective, and neutral look that complements the 'Playfair' headlines.
- Icons: Custom SVG outlined icons are to be used for all navigation and functional elements, maintaining a minimalist and consistent visual language across the application.
- Navigation: Fixed bottom tab navigation (Timers, Archive, Goals, Insights) ensures constant access to main features. Content is organized with vertical expandable/collapsible sections, preventing horizontal scrolling and maintaining a clean layout.