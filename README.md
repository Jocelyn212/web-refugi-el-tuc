# 🐶 Refugio ElTuc - Plataforma Web

![Refugio ElTuc Logo](public/favicon.svg)

## 📋 Descripción del Proyecto

Refugio ElTuc es una plataforma web desarrollada para gestionar y promocionar la adopción de animales rescatados. El sitio permite a los visitantes conocer a los animales disponibles para adopción, filtrarlos por diferentes criterios y contactar al refugio para iniciar el proceso de adopción.

## ✨ Características

- **Catálogo de animales** con filtros por tipo, estado y género
- **Información detallada** de cada animal (edad, tamaño, historia, etc.)
- **Formulario de adopción** para iniciar el proceso
- **Panel de administración** protegido para gestionar los animales
- **Sistema de autenticación** seguro para los administradores
- **Diseño responsivo** adaptado a dispositivos móviles y escritorio
- **Base de datos MongoDB** para almacenamiento persistente

## 🚀 Tecnologías Utilizadas

- **[Astro](https://astro.build/)**: Framework web para crear sitios rápidos
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS para diseño moderno
- **[MongoDB](https://www.mongodb.com/)**: Base de datos NoSQL
- **[JWT](https://jwt.io/)**: Autenticación mediante tokens
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)**: Encriptación de contraseñas
- **[Vercel](https://vercel.com/)**: Plataforma de despliegue

## 🧩 Estructura del Proyecto

```text
/
├── public/              # Archivos estáticos (imágenes, favicon)
├── src/
│   ├── assets/          # Recursos (SVG, imágenes)
│   ├── components/      # Componentes reutilizables (NavBar, Footer, etc.)
│   ├── layouts/         # Plantillas de página
│   ├── middleware.js    # Middleware de autenticación
│   ├── pages/
│   │   ├── admin/       # Panel de administración
│   │   ├── api/         # Endpoints de la API (animales, autenticación)
│   │   │   ├── auth/    # Endpoints de autenticación
│   │   │   ├── models/  # Modelos de datos
│   │   ├── adoptar-mascota.astro # Página de adopción individual
│   │   ├── adopta.astro # Listado de animales
│   │   └── index.astro  # Página principal
│   ├── scripts/         # Scripts utilitarios
│   ├── styles/          # Estilos globales
│   └── utils/           # Utilidades (autenticación, etc.)
└── package.json
```

## 🛠️ Instalación y Configuración

### Requisitos Previos

- Node.js (v16+)
- pnpm (o npm/yarn)
- MongoDB (local o acceso a MongoDB Atlas)

### Pasos para Instalación Local

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/Jocelyn212/Refugio_el_tuc.git
   cd RefugioEltuc
   ```

2. **Instalar dependencias:**

   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` basado en `.env.example` con tus propias credenciales:

   ```
   MONGODB_URI=tu_mongodb_uri
   JWT_SECRET=tu_jwt_secret
   ```

4. **Iniciar el servidor de desarrollo:**

   ```bash
   pnpm dev
   ```

5. **Acceder al sitio web:**
   Abre `http://localhost:4321` en tu navegador

## 🚀 Despliegue

Este proyecto está configurado para desplegarse en Vercel. Para configurar el despliegue:

1. Conecta tu repositorio GitHub a Vercel
2. Configura las variables de entorno necesarias (ver `.env.example`)
3. Despliega automáticamente con cada push a la rama principal

## 🧪 Acceso al Panel de Administración

El panel de administración está protegido por un sistema de autenticación. Para acceder:

1. Usa la URL específica para acceder al login administrativo (documentación interna)
2. Ingresa las credenciales proporcionadas por el administrador del sistema

## 🧞 Comandos

Todos los comandos se ejecutan desde la raíz del proyecto, desde una terminal:

| Comando          | Acción                                               |
| :--------------- | :--------------------------------------------------- |
| `pnpm install`   | Instala dependencias                                 |
| `pnpm dev`       | Inicia servidor local en `localhost:4321`            |
| `pnpm build`     | Compila el sitio para producción en `./dist/`        |
| `pnpm preview`   | Previsualiza la compilación localmente               |
| `pnpm astro ...` | Ejecuta comandos CLI como `astro add`, `astro check` |

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 📞 Contacto

Para más información sobre el proyecto o para colaborar, puedes contactar:

- **Refugio ElTuc**: [Sitio web](https://refugio-el-tuc.vercel.app)

---

Desarrollado con ❤️ para los animales del Refugio ElTuc
