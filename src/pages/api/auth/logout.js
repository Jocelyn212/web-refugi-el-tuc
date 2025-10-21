/**
 * Endpoint para cerrar sesión de usuarios
 * 
 * Este archivo maneja el cierre de sesión eliminando la cookie de autenticación
 * del navegador del usuario. Es un proceso simple pero importante para la seguridad.
 * 
 * Dependencias principales:
 * - utils/auth.js para limpiar las cookies de autenticación
 */

import { clearAuthCookie } from "../../../utils/auth.js";

/**
 * Función helper para enviar respuestas JSON desde la API
 * 
 * Esta función simplifica el envío de respuestas JSON al frontend,
 * permitiendo personalizar el código de estado y agregar headers cuando sea necesario.
 * 
 * Parámetros:
 * - data: Los datos que queremos enviar (objeto con la respuesta)
 * - status: Código de estado HTTP (200 = éxito, 400 = error del cliente, 500 = error del servidor)
 * - headers: Cabeceras adicionales opcionales
 * 
 * Devuelve: Un objeto Response que Astro puede enviar al navegador
 */
function json(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...headers
        }
    });
}

/**
 * Función que maneja el cierre de sesión de usuarios
 * 
 * Esta función se encarga de cerrar la sesión del usuario eliminando
 * la cookie de autenticación de su navegador. Es un proceso simple
 * pero esencial para la seguridad del sistema.
 * 
 * Proceso de logout:
 * 1. Llama a la función que limpia la cookie de autenticación
 * 2. Configura la cookie para que expire inmediatamente
 * 3. Envía una respuesta confirmando que la sesión se cerró
 * 
 * No recibe parámetros porque solo necesita limpiar la cookie
 * Devuelve: Respuesta JSON confirmando que la sesión se cerró correctamente
 */
export function GET() {
    // Obtener los headers para limpiar la cookie de autenticación
    const cookieHeaders = clearAuthCookie();

    return json(
        { success: true, message: "Sesión cerrada correctamente" },
        200,
        cookieHeaders
    );
}