/**
 * Endpoint de autenticación para login de usuarios
 * 
 * Este archivo maneja el inicio de sesión de usuarios verificando credenciales,
 * generando tokens JWT y estableciendo cookies de autenticación seguras.
 * 
 * Dependencias principales:
 * - Mongoose para consultas de usuario
 * - bcryptjs para verificación de contraseñas
 * - jsonwebtoken para autenticación stateless
 */

import { connectDB } from "../db.js";
import User from "../models/User.js";
import { comparePassword, generateToken, setAuthCookie } from "../../../utils/auth.js";

/**
 * Función helper para enviar respuestas JSON desde la API
 * 
 * Esta función simplifica el envío de respuestas JSON al frontend,
 * permitiendo personalizar el código de estado (200, 400, 500, etc.)
 * y agregar headers adicionales si son necesarios.
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
 * Función principal que maneja el login de usuarios
 * 
 * Cuando un usuario intenta iniciar sesión desde el frontend,
 * esta función se encarga de verificar si sus credenciales son correctas.
 * 
 * Pasos que sigue:
 * 1. Recibe el username y password del formulario
 * 2. Verifica que ambos campos estén completos
 * 3. Busca al usuario en la base de datos MongoDB
 * 4. Compara la contraseña ingresada con la contraseña guardada (usando bcrypt para seguridad)
 * 5. Si todo está correcto, crea un token JWT para mantener la sesión
 * 6. Guarda el token en una cookie segura que solo el servidor puede leer
 * 
 * Recibe: Los datos del formulario de login (username y password)
 * Devuelve: Respuesta JSON indicando si el login fue exitoso o no
 */
export async function POST({ request }) {
    try {
        const body = await request.json();

        // Validación básica de campos requeridos
        if (!body.username?.trim() || !body.password?.trim()) {
            return json(
                { success: false, message: "El nombre de usuario y la contraseña son obligatorios" },
                400
            );
        }

        await connectDB();

        // Buscar el usuario en la base de datos por username
        const user = await User.findOne({ username: body.username });
        if (!user) {
            return json(
                { success: false, message: "Credenciales inválidas" },
                401
            );
        }

        // Verificar contraseña usando bcrypt para comparar hash
        const isPasswordValid = await comparePassword(body.password, user.password);
        if (!isPasswordValid) {
            return json(
                { success: false, message: "Credenciales inválidas" },
                401
            );
        }

        // Generar token JWT con información esencial del usuario
        const token = generateToken({
            id: user._id.toString(),
            username: user.username,
            role: user.role
        });

        // Configurar cookie HttpOnly con el token para mayor seguridad
        const cookieHeaders = setAuthCookie(token);

        return json(
            {
                success: true,
                message: "Login exitoso",
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                }
            },
            200,
            cookieHeaders
        );
    } catch (error) {
        console.error("Error en login:", error);
        return json(
            { success: false, message: "Error al iniciar sesión", error: error.message },
            500
        );
    }
}