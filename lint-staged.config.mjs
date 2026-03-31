export default {
  '*.{ts,tsx,js,jsx,mjs}': ['eslint --fix', 'prettier --check'],
  '*.{ts,tsx}': ['pnpm exec tsc --noEmit'],
  '*.{json,css,md}': ['prettier --check'],
};
