import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  },
  build: {
    charset: 'utf8',
  },
})
```

Guarda con **Ctrl+S** y luego en la terminal:
```
git add .
```
```
git commit -m "fix utf8 vercel"
```
```
git push
