import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// بیلد تک‌فایلی: کل سایت (کد، فونت، تصاویر) داخل یک فایل HTML
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-single' }
})
