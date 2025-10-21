/**
 * Endpoint de registro para crear nuevos usuarios administradores
 * 
 * Este archivo maneja la creación de nuevas cuentas de usuario para el sistema
 * de administración del refugio. Incluye verificación de códigos secretos,
 * encriptación segura de contraseñas y configuración automática de sesión.
 * 
 * Dependencias principales:
 * - Mongoose para guardar usuarios en MongoDB
 * - bcryptjs para encriptar contraseñas de forma segura
 * - jsonwebtoken para crear sesiones automáticas después del registro
 */

import { connectDB } from "../db.js";
import User from "../models/User.js";
import { hashPassword, generateToken, setAuthCookie } from "../../../utils/auth.js";

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

// Obtener el código secreto desde las variables de entorno
// Este código previene que cualquier persona pueda crear cuentas de administrador
const REGISTRO_SECRETO = process.env.REGISTRO_SECRETO || import.meta.env.REGISTRO_SECRETO;

// Verificar que la variable de entorno existe para evitar problemas de seguridad
if (!REGISTRO_SECRETO) {
    console.error('Error crítico: REGISTRO_SECRETO no está definido en las variables de entorno');
}

/**
 * Función principal que maneja el registro de nuevos usuarios
 * 
 * Esta función se encarga de crear nuevas cuentas de usuario para el sistema
 * de administración. Solo permite registros con un código secreto válido para
 * mantener la seguridad del sistema.
 * 
 * Pasos que sigue:
 * 1. Recibe los datos del formulario (username, password, registrationCode)
 * 2. Verifica que todos los campos estén completos
 * 3. Valida el código secreto para prevenir registros no autorizados
 * 4. Verifica que el nombre de usuario no esté ya en uso
 * 5. Encripta la contraseña usando bcrypt para seguridad
 * 6. Guarda el nuevo usuario en la base de datos
 * 7. Crea automáticamente una sesión para el usuario recién registrado
 * 
 * Recibe: Los datos del formulario de registro (username, password, código secreto)
 * Devuelve: Respuesta JSON indicando si el registro fue exitoso o no
 */
export async function POST({ request }) {
    try {
        const body = await request.json();

        // Validación básica
        if (!body.username?.trim() || !body.password?.trim()) {
            return json(
                { success: false, message: "El nombre de usuario y la contraseña son obligatorios" },
                400
            );
        }

        // Validación del código secreto
        if (body.registrationCode !== REGISTRO_SECRETO) {
            return json(
                { success: false, message: "Código de registro no válido" },
                403
            );
        }

        await connectDB();

        // Verificar si el nombre de usuario ya está en uso en la base de datos
        const existingUser = await User.findOne({ username: body.username });
        if (existingUser) {
            return json(
                { success: false, message: "El nombre de usuario ya está en uso" },
                400
            );
        }

        // Encriptar la contraseña usando bcrypt antes de guardarla
        // Nunca guardamos contraseñas en texto plano por seguridad
        const hashedPassword = await hashPassword(body.password);

        // Crear el nuevo usuario en la base de datos
        const user = await User.create({
            username: body.username,
            password: hashedPassword,
            role: body.role || 'editor'  // Por defecto asignar rol de editor
        });

        // Generar token JWT para crear automáticamente la sesión del usuario
        const token = generateToken({
            id: user._id.toString(),
            username: user.username,
            role: user.role
        });

        // Configurar cookie HttpOnly con el token para que el usuario quede logueado
        const cookieHeaders = setAuthCookie(token);

        return json(
            {
                success: true,
                message: "Usuario registrado correctamente",
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                }
            },
            201,
            cookieHeaders
        );
    } catch (error) {
        console.error("Error en registro:", error);
        return json(
            { success: false, message: "Error al registrar usuario", error: error.message },
            500
        );
    }
}