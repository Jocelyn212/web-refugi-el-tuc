/**
 * Utilidad para conectar a la base de datos MongoDB Atlas del refugio
 * 
 * Este archivo maneja la conexión simple y directa a MongoDB Atlas.
 * Se encarga de establecer una conexión reutilizable y manejar errores
 * de conexión de forma elegante. Conexión optimizada para Vercel.
 * 
 * Dependencias principales:
 * - Mongoose para la conexión y manejo de MongoDB
 * - Variables de entorno para la URI de conexión segura
 */

import mongoose from "mongoose";

// Variable para controlar el estado de la conexión
let isConnected = false;

/**
 * Función para conectar a la base de datos MongoDB Atlas
 * 
 * Esta función establece una conexión reutilizable a MongoDB Atlas.
 * Si ya existe una conexión activa, la reutiliza para evitar múltiples
 * conexiones innecesarias. Ideal para entornos serverless como Vercel.
 * 
 * Características importantes:
 * - Reutiliza la conexión existente cuando es posible
 * - Optimizada para entornos serverless (Vercel)
 * - Maneja errores de conexión de forma segura
 * - Usa variables de entorno para la URI de conexión
 * 
 * No recibe parámetros, siempre conecta a la base de datos principal
 * Devuelve: Una promesa que se resuelve cuando la conexión está lista
 */
export async function connectDB() {
  try {
    // Si ya tenemos una conexión activa, no necesitamos conectar de nuevo
    if (isConnected) {
      return;
    }

    // Obtener la URI de conexión desde las variables de entorno
    const uri = process.env.MONGODB_URI || import.meta.env.MONGODB_URI;

    if (!uri) {
      console.error("MONGODB_URI no encontrada. Variables disponibles:", Object.keys(process.env).filter(key => key.includes('MONGO')));
      throw new Error("MONGODB_URI no encontrada en las variables de entorno");
    }

    // Establecer conexión con configuración optimizada para Vercel
    await mongoose.connect(uri, {
      bufferCommands: false,  // Desactivar buffer para mejor rendimiento en serverless
    });

    isConnected = true;
    console.log("✅ Conectado exitosamente a MongoDB Atlas");

  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    throw error;
  }
}