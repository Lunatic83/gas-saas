// Route groups handle all routing. app/page.tsx would conflict with app/(marketing)/page.tsx
// since both map to /. The route group (marketing) serves / directly.
// This file exists only to prevent Next.js from showing a 404 at / .
export default function RootPage() {
  return null;
}
