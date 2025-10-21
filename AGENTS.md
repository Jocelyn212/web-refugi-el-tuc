Este es el documento final `AGENTS.md`, adaptado a sus requisitos específicos: utilizando exclusivamente **JavaScript**, integrando **Mongoose** y **MongoDB Atlas** para la gestión de datos, y priorizando **pnpm** para la administración de paquetes.

---

### AGENTS.md

Este documento sirve como la guía de contexto e instrucciones principales para los agentes de codificación de IA, asegurando un trabajo consistente y alineado con la arquitectura del proyecto.

#### 1. Resumen del Proyecto y Arquitectura

Este proyecto es una aplicación web moderna y **orientada al contenido** construida sobre **Astro**, un framework web de JavaScript optimizado para la velocidad. La lógica dinámica del lado del servidor se maneja con Node.js, Mongoose y Express (según la práctica común en el ecosistema, aunque Astro gestiona el _server-first rendering_).

- **Framework:** **Astro** (Server-First, Zero JavaScript por defecto).
- **Estilizado:** **Tailwind CSS** (zero-runtime, utiliza clases de utilidad).
- **Base de Datos:** **MongoDB Atlas** (servicio de base de datos en la nube), modelado mediante **Mongoose** (para esquemas, _casting_ y lógica de negocio).
- **Despliegue:** **Vercel**.

#### 2. Configuración y Comandos de Desarrollo

Se debe utilizar **pnpm** para todas las operaciones relacionadas con paquetes. pnpm ofrece instalaciones más rápidas y ahorra espacio en disco al utilizar un almacén de contenido direccionable (_content-addressable store_).

| Tarea                              | Comando (pnpm) | Notas                                                        |
| :--------------------------------- | :------------- | :----------------------------------------------------------- |
| **Instalar dependencias**          | `pnpm install` | Acelera la instalación gracias al almacén único.             |
| **Iniciar servidor de desarrollo** | `pnpm dev`     | Inicia el servidor de desarrollo de Astro.                   |
| **Compilar para producción**       | `pnpm build`   | Compila el sitio (necesario antes del despliegue en Vercel). |

#### 3. Estilo y Convenciones de Código (JavaScript)

El proyecto utiliza **JavaScript (JS)** estándar y sigue las convenciones de los Módulos de ECMAScript (ES Modules):

- **Lenguaje:** **Solo JavaScript**. Abstenerse de utilizar TypeScript.
- **Módulos:** Utilizar sintaxis de importación/exportación de **ES Modules** (`import`/`export`) en lugar de `require` (CommonJS).
- **Backend:** Las funciones asíncronas deben manejar `await` y `async` para evitar el bloqueo del _thread_ principal, especialmente en operaciones costosas como el _hashing_.
- **Estilos:** Los estilos se deben implementar utilizando las clases de utilidad de **Tailwind CSS**.

#### 3.1. Documentación y Comentarios en el Código

Para mantener un código limpio, comprensible y mantenible, se deben seguir estas prácticas de documentación:

- **Comentarios de Función:**

  - Cada función debe tener un comentario explicativo claro y comprensible en lenguaje natural.
  - Priorizar explicaciones sencillas sobre sintaxis técnica estricta.
  - Incluir el propósito, parámetros (con explicaciones claras) y qué devuelve la función.
  - Usar formato de documentación mixto: estructura JSDoc pero con explicaciones naturales.

  ```javascript
  /**
   * Función que autentica a un usuario verificando sus credenciales
   *
   * Esta función se encarga de verificar si un usuario puede acceder al sistema
   * comparando su email y contraseña con los datos guardados en la base de datos.
   *
   * Parámetros:
   * - email: El correo electrónico del usuario
   * - password: La contraseña sin encriptar que ingresó el usuario
   *
   * Devuelve: Un objeto con el token JWT y los datos del usuario si es exitoso
   */
  async function authenticateUser(email, password) {
    // Buscar usuario en la base de datos por su email
    const user = await User.findOne({ email });
    // ... resto de la lógica
  }
  ```

- **Comentarios Inline:**

  - Explicar lógica compleja en términos sencillos y comprensibles.
  - Documentar decisiones de diseño importantes y el porqué de las mismas.
  - Aclarar el propósito de variables, constantes o procesos que no sean obvios.
  - Usar lenguaje natural: "Buscar usuario en la base de datos" en lugar de "Query user from DB".

- **Comentarios de Archivo:**

  - Cada archivo debe comenzar con un comentario que explique claramente su propósito.
  - Describir qué problema resuelve el archivo y cómo encaja en la aplicación.
  - Incluir información sobre dependencias principales cuando sea relevante.
  - Usar explicaciones accesibles para desarrolladores de cualquier nivel.

- **Comentarios de Sección:**
  - Dividir archivos largos en secciones lógicas con comentarios descriptivos.
  - Usar separadores visuales para mejorar la legibilidad.
  - Explicar el flujo general de cada sección antes de entrar en detalles.

#### 3.2. Estilo de Documentación

**IMPORTANTE:** Priorizar la claridad y comprensión sobre la rigidez técnica:

- **Lenguaje Natural:** Usar explicaciones en español claro y directo.
- **Evitar Jerga Técnica Excesiva:** Preferir "Los datos que queremos enviar" sobre "Payload object".
- **Explicar el Contexto:** No solo qué hace una función, sino por qué es necesaria.
- **Ejemplos Prácticos:** Incluir ejemplos de códigos de estado HTTP (200 = éxito, 400 = error).
- **Educativo:** La documentación debe servir como guía de aprendizaje.

**Formato Preferido:**

```javascript
/**
 * Descripción clara de qué hace la función
 *
 * Explicación más detallada del contexto y propósito.
 * Incluir información sobre el flujo de trabajo si es relevante.
 *
 * Parámetros:
 * - nombreParametro: Explicación clara y comprensible
 * - otroParametro: Qué representa y para qué se usa
 *
 * Devuelve: Qué tipo de resultado produce la función
 */
```

#### 4. Gestión de Datos (Mongoose y MongoDB Atlas)

La capa de datos debe integrarse con MongoDB Atlas, utilizando Mongoose como ODM (Object Data Modeling):

- **Mongoose Schemas:** Para definir la estructura y aplicar la validación de los datos de la aplicación antes de interactuar con MongoDB.
- **Operaciones de Base de Datos:** Todas las interacciones con la base de datos (creación, búsqueda, actualización) deben utilizar métodos de Mongoose.
- **Conexión a Atlas:** La cadena de conexión a MongoDB Atlas debe ser tratada como una **variable de entorno secreta** en el entorno de despliegue (Vercel).

#### 5. Seguridad y Autenticación (JWT y bcryptjs)

El proyecto utiliza autenticación sin estado (_stateless_) mediante **JSON Web Tokens (JWT)**, garantizando la seguridad en el manejo de credenciales:

- **Hashing de Contraseñas (`bcryptjs`):**
  - Las contraseñas **nunca deben almacenarse en texto plano**.
  - Deben ser hasheadas utilizando la función asíncrona de **bcryptjs** (e.g., `bcrypt.hash()`) con un factor de _salt rounds_ (generalmente 10).
  - La verificación de contraseñas de inicio de sesión debe realizarse comparando el _hash_ almacenado con el _hash_ de la contraseña proporcionada (e.g., `bcrypt.compare()`), sin intentar nunca descodificar el _hash_ a texto plano.
- **Manejo de Tokens (JWT):**
  - La **clave secreta (Secret Key)** para firmar los JWT es vital y **debe ser una variable de entorno secreta**.
  - Los tokens de acceso deben tener un **tiempo de expiración corto** (e.g., una hora).
- **Almacenamiento del Token (Cookies):**
  - Los tokens deben ser almacenados en **Cookies**.
  - La Cookie debe configurarse con la bandera **`HttpOnly`** para prevenir el acceso desde JavaScript del lado del cliente, mitigando ataques XSS (Cross-Site Scripting).
  - Se debe configurar la bandera **`Secure`** si se está en producción (para asegurar que solo se envían sobre HTTPS).

#### 6. Despliegue (Vercel)

- **Plataforma:** El despliegue se gestiona a través de Vercel. Asegúrese de que las variables de entorno para la clave secreta de JWT y la conexión de MongoDB Atlas estén configuradas correctamente en el entorno de Vercel.
- **Funciones de Servidor:** Si se utilizan funciones dinámicas o _Server Islands_ (que dependen del servidor, como la detección de país o la puntuación dinámica), es crucial que el proyecto utilice el adaptador de Vercel para gestionar la lógica del lado del servidor.
