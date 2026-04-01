export default {
  '*.{ts,tsx,js,jsx,mjs}': ['eslint --fix', 'prettier --check'],
  '*.{ts,tsx}': ['pnpm exec tsc --noEmit --skipLibCheck --esModuleInterop'],
  '*.{json,css,md}': ['prettier --check'],
};
