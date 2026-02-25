import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

Guarda con **Ctrl+S** y luego en la terminal escribe los 3 comandos **uno por uno**:
```
git add .
```
```
git commit -m "fix vite config"
```
```
git push
