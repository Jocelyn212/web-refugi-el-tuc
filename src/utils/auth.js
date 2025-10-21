/**
 * Utilidades de autenticación para el sistema del refugio
 * 
 * Este archivo contiene todas las funciones relacionadas con la seguridad
 * y autenticación del sistema: encriptación de contraseñas, manejo de tokens JWT,
 * gestión de cookies seguras y validación de variables de entorno.
 * 
 * Dependencias principales:
 * - jsonwebtoken para crear y verificar tokens de sesión
 * - bcryptjs para encriptar contraseñas de forma segura
 * - Variables de entorno para configuración de seguridad
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Función para obtener y validar variables de entorno importantes para la seguridad
 * 
 * Esta función se asegura de que las variables de entorno críticas (como claves secretas)
 * estén disponibles antes de que la aplicación inicie. Si falta alguna variable importante,
 * la aplicación se detiene para evitar problemas de seguridad.
 * 
 * Parámetros:
 * - name: El nombre de la variable de entorno que queremos obtener
 * - required: Si es verdadero, la aplicación se detiene si la variable no existe
 * - defaultValue: Valor que se usa si la variable no existe y no es requerida
 * 
 * Devuelve: El valor de la variable de entorno o el valor por defecto
 */
function getEnvVariable(name, required = true, defaultValue = null) {
    const value = import.meta.env[name];

    if (!value && required) {
        console.error(`Error crítico de seguridad: Variable de entorno ${name} no definida`);
        // En producción, mejor no mostrar qué variable falta exactamente
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Error de configuración en el servidor. Contacte con el administrador.');
        } else {
            throw new Error(`La variable de entorno ${name} es requerida pero no está definida.`);
        }
    }

    return value || defaultValue;
}

// Obtener las variables de entorno críticas para la seguridad
const JWT_SECRET = getEnvVariable('JWT_SECRET');
const JWT_EXPIRES_IN = parseInt(getEnvVariable('JWT_EXPIRES_IN', false, '86400'), 10); // 24 horas por defecto

/**
 * Función para encriptar contraseñas antes de guardarlas en la base de datos
 * 
 * Esta función toma una contraseña en texto plano y la convierte en un hash
 * seguro usando bcrypt. El hash es lo que se guarda en la base de datos,
 * nunca la contraseña original. Esto protege las contraseñas incluso si
 * alguien accede a la base de datos.
 * 
 * Parámetros:
 * - password: La contraseña que el usuario escribió (en texto normal)
 * 
 * Devuelve: Un hash encriptado que se puede guardar de forma segura
 */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * Función para verificar si una contraseña es correcta durante el login
 * 
 * Esta función compara la contraseña que el usuario escribió en el login
 * con el hash encriptado que tenemos guardado en la base de datos.
 * bcrypt se encarga de hacer esta comparación de forma segura.
 * 
 * Parámetros:
 * - password: La contraseña que el usuario escribió en el formulario de login
 * - hash: El hash encriptado que tenemos guardado en la base de datos
 * 
 * Devuelve: Verdadero si la contraseña es correcta, falso si no coincide
 */
export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

/**
 * Función para crear un token de sesión cuando el usuario se autentica
 * 
 * Esta función crea un token JWT (JSON Web Token) que contiene información
 * básica del usuario. Este token es como un "ticket" que demuestra que el
 * usuario se autenticó correctamente y puede acceder al sistema.
 * 
 * Parámetros:
 * - payload: Un objeto con la información del usuario (id, username, role)
 * 
 * Devuelve: Un token JWT firmado que se puede usar para mantener la sesión
 */
export const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: `${JWT_EXPIRES_IN}s` });
};

/**
 * Función para verificar si un token de sesión sigue siendo válido
 * 
 * Esta función revisa si un token JWT es auténtico y no ha expirado.
 * Se usa cada vez que el usuario intenta acceder a una página protegida
 * o hacer una acción que requiere estar autenticado.
 * 
 * Parámetros:
 * - token: El token JWT que queremos verificar
 * 
 * Devuelve: La información del usuario si el token es válido, o null si no es válido
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Función para encontrar el token de sesión en una petición HTTP
 * 
 * Esta función busca el token JWT en dos lugares posibles:
 * 1. En las cookies del navegador (más seguro)
 * 2. En el header Authorization (alternativa)
 * 
 * Se usa para extraer el token antes de verificar si el usuario está autenticado.
 * 
 * Parámetros:
 * - request: La petición HTTP que llegó al servidor
 * 
 * Devuelve: El token JWT si lo encuentra, o null si no hay token
 */
export const extractTokenFromRequest = (request) => {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            // Si no está en el header, buscar en las cookies (método más seguro)
            const cookies = request.headers.get('Cookie');
            if (!cookies) return null;

            // Buscar específicamente la cookie llamada 'token'
            const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
            if (!tokenCookie) return null;

            return tokenCookie.split('=')[1].trim();
        }

        // Extraer el token del header Authorization (formato: "Bearer token")
        return authHeader.split(' ')[1];
    } catch (error) {
        return null;
    }
};

/**
 * Función para configurar una cookie segura con el token de sesión
 * 
 * Esta función crea los headers necesarios para guardar el token JWT
 * en una cookie del navegador de forma segura. La cookie es HttpOnly,
 * lo que significa que solo el servidor puede leerla, no JavaScript del navegador.
 * 
 * Parámetros:
 * - token: El token JWT que queremos guardar en la cookie
 * 
 * Devuelve: Los headers HTTP necesarios para configurar la cookie
 */
export const setAuthCookie = (token) => {
    return {
        'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${JWT_EXPIRES_IN}`
    };
};

/**
 * Función para eliminar la cookie de autenticación cuando el usuario cierra sesión
 * 
 * Esta función crea los headers necesarios para borrar la cookie del token
 * del navegador del usuario. Configura la cookie para que expire inmediatamente,
 * efectivamente cerrando la sesión del usuario.
 * 
 * No recibe parámetros porque solo necesita limpiar la cookie existente
 * Devuelve: Los headers HTTP necesarios para eliminar la cookie
 */
export const clearAuthCookie = () => {
    return {
        'Set-Cookie': `token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
    };
};