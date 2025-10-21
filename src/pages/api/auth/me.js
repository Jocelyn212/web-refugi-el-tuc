/**
 * Endpoint para verificar la información del usuario actual
 * 
 * Este archivo maneja las peticiones para obtener información del usuario
 * que está actualmente autenticado. Es útil para verificar si una sesión
 * sigue siendo válida y obtener datos actualizados del perfil.
 * 
 * Dependencias principales:
 * - Mongoose para consultar información del usuario en MongoDB
 * - jsonwebtoken para verificar que el token de sesión sea válido
 * - utils/auth.js para extraer y verificar tokens JWT
 */

import { connectDB } from "../db.js";
import User from "../models/User.js";
import { verifyToken, extractTokenFromRequest } from "../../../utils/auth.js";

/**
 * Función helper para enviar respuestas JSON desde la API
 * 
 * Esta función simplifica el envío de respuestas JSON al frontend,
 * permitiendo personalizar el código de estado según el resultado.
 * 
 * Parámetros:
 * - data: Los datos que queremos enviar (objeto con la respuesta)
 * - status: Código de estado HTTP (200 = éxito, 401 = no autorizado, 404 = no encontrado)
 * 
 * Devuelve: Un objeto Response que Astro puede enviar al navegador
 */
function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" }
    });
}

/**
 * Función que verifica y devuelve información del usuario autenticado
 * 
 * Esta función es muy importante para el frontend porque le permite verificar
 * si el usuario sigue teniendo una sesión válida y obtener sus datos actualizados.
 * Se usa típicamente al cargar la aplicación o al navegar a páginas protegidas.
 * 
 * Proceso de verificación:
 * 1. Extrae el token JWT de la cookie o header de autorización
 * 2. Verifica que el token sea válido y no haya expirado
 * 3. Busca al usuario en la base de datos usando el ID del token
 * 4. Devuelve la información del usuario (sin la contraseña por seguridad)
 * 
 * Recibe: La petición HTTP con el token en cookies o headers
 * Devuelve: Información del usuario actual o mensaje de error si no está autenticado
 */
export async function GET({ request }) {
    try {
        // Extraer el token JWT de la petición (cookies o header Authorization)
        const token = extractTokenFromRequest(request);
        if (!token) {
            return json({ success: false, message: "No autorizado - Token no proporcionado" }, 401);
        }

        // Verificar que el token sea válido y no haya expirado
        const decoded = verifyToken(token);
        if (!decoded) {
            return json({ success: false, message: "No autorizado - Token inválido" }, 401);
        }

        // Conectar a la base de datos y buscar al usuario por su ID
        await connectDB();
        // Excluimos la contraseña por seguridad usando select('-password')
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return json({ success: false, message: "Usuario no encontrado" }, 404);
        }

        return json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error en verificación de usuario:", error);
        return json(
            { success: false, message: "Error al verificar el usuario", error: error.message },
            500
        );
    }
}