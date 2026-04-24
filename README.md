# 🌿 EcoDistrito

Sistema web de gestión de recolección de residuos para el Distrito Nacional, desarrollado con Node.js y Express.

---

## 📋 Descripción

**EcoDistrito** es una aplicación web que permite gestionar y visualizar las rutas de recolección de residuos sólidos en diferentes sectores del Distrito Nacional (República Dominicana). El sistema incluye un panel de administración, mapas interactivos, seguimiento de rutas, reportes y más.

---

## 🚀 Funcionalidades

- 🔐 **Login** — Autenticación de usuarios con credenciales de administrador
- 🗺️ **Mapas** — Visualización interactiva de rutas de recolección por sector
- 🚛 **Rutas** — Gestión de rutas con sectores, días y horarios de servicio
- ♻️ **Recolección** — Registro y seguimiento de actividades de recolección
- 📊 **Dashboard** — Panel de control con estadísticas generales
- 📑 **Reportes** — Generación de informes de actividades
- ⚙️ **Administración** — Gestión de usuarios y configuración del sistema

---

## 🛠️ Tecnologías

- **Backend:** Node.js, Express.js
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Mapas:** Integración con API de mapas (Leaflet/Google Maps)
- **Estilos:** CSS personalizado

---

## 📁 Estructura del Proyecto

```
EcoDistrito/
├── server.js           # Servidor Express principal
├── script.js           # Lógica general del frontend
├── styles.css          # Estilos globales
├── login.html          # Página de inicio de sesión
├── index.html          # Página principal
├── dashboard.html      # Panel de control
├── mapas.html          # Vista de mapas
├── rutas.html          # Gestión de rutas
├── recoleccion.html    # Seguimiento de recolección
├── reportes.html       # Reportes
├── administracion.html # Administración del sistema
├── Imagenes/           # Recursos gráficos
│   ├── Logo.png
│   ├── Logo sin fondo.png
│   └── Fondo.png
└── package.json
```

---

## ⚙️ Instalación y Uso

### Requisitos
- Node.js v14 o superior
- npm

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/janc-cyber/PROYECTO---ECODISTRITO.git

# 2. Entrar al directorio
cd PROYECTO---ECODISTRITO

# 3. Instalar dependencias
npm install

# 4. Iniciar el servidor
node server.js
```

### Acceder a la aplicación
Abre tu navegador y visita: `http://localhost:3000`

### Credenciales por defecto
| Usuario | Contraseña |
|---------|-----------|
| admin   | 1234      |

---

## 🗺️ Rutas de Recolección Disponibles

El sistema incluye rutas para sectores como:
- Residencial Botánico
- Los Próceres / Cerik Leonardo Ekman
- Las Aldabas
- Y más sectores del Distrito Nacional

---

## 🤝 Contribuciones

Este es un proyecto académico/de desarrollo. Si deseas contribuir, puedes hacer un fork y enviar un pull request.

---

## 📄 Licencia

ISC — Ver `package.json` para más detalles.

---

*Desarrollado con 💚 para una gestión más eficiente de residuos en el Distrito Nacional*
