# Laberinto Cibernético - Escape Room

Este es un juego de escape room estático diseñado para ser hospedado gratuitamente en GitHub Pages.

## 🚀 Instrucciones de Despliegue en GitHub Pages

1. **Crear Repositorio**: Crea un nuevo repositorio en GitHub (público).
2. **Subir Código**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```
3. **Configurar GitHub Pages**:
   - Ve a **Settings** (Ajustes) en tu repositorio.
   - Entra en la sección **Pages**.
   - En **Build and deployment > Source**, cambia a **GitHub Actions**.
   - ¡Listo! En unos minutos tu web estará en `https://TU_USUARIO.github.io/TU_REPO/`.

## 🛠️ Notas Técnicas
- **Tecnología**: Next.js 15 (Static Export).
- **Estilos**: Tailwind CSS + ShadCN UI.
- **Sin Servidor**: No requiere base de datos ni funciones de IA para funcionar.
