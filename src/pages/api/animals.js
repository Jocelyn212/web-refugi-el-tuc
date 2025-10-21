
/**
 * API para gestionar información de animales del refugio
 * 
 * Este archivo maneja todas las operaciones relacionadas con los animales:
 * buscar, listar, crear, actualizar y eliminar registros de animales.
 * Incluye filtros de búsqueda y validaciones para mantener la integridad de los datos.
 * 
 * Dependencias principales:
 * - Mongoose para interactuar con la base de datos MongoDB
 * - Animal model para la estructura de datos de animales
 * - Conexión a base de datos para acceso a MongoDB Atlas
 */

import { connectDB } from "./db.js";
import Animal from "./models/Animal.js";

/**
 * Función helper para enviar respuestas JSON desde la API
 * 
 * Esta función simplifica el envío de respuestas JSON al frontend,
 * permitiendo personalizar el código de estado según el resultado de la operación.
 * 
 * Parámetros:
 * - data: Los datos que queremos enviar (información de animales, mensajes, etc.)
 * - status: Código de estado HTTP (200 = éxito, 404 = no encontrado, 400 = error)
 * 
 * Devuelve: Un objeto Response que Astro puede enviar al navegador
 */
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// =======================================
// SECCIÓN: OPERACIONES DE CONSULTA
// =======================================

/**
 * Función para obtener información de animales del refugio
 * 
 * Esta función maneja dos tipos de consultas:
 * 1. Obtener un animal específico por su ID
 * 2. Listar todos los animales con filtros opcionales
 * 
 * Filtros disponibles:
 * - species: Tipo de animal (perro, gato, conejo, etc.)
 * - status: Estado del animal (en adopción, adoptado, etc.)
 * - gender: Género del animal (macho, hembra)
 * - id: ID específico para obtener un solo animal
 * 
 * Ejemplos de uso:
 * - GET /api/animals → Todos los animales
 * - GET /api/animals?species=perro → Solo perros
 * - GET /api/animals?id=123 → Animal específico
 * 
 * Recibe: URL con parámetros de consulta opcionales
 * Devuelve: Lista de animales o información de un animal específico
 */
export async function GET({ url }) {
  try {
    await connectDB();

    // Extraer filtros opcionales de la URL (query parameters)
    const searchParams = new URL(url).searchParams;
    const species = searchParams.get('species');
    const status = searchParams.get('status');
    const gender = searchParams.get('gender');
    const id = searchParams.get('id');

    // Si se solicita un animal específico por ID, devolverlo directamente
    if (id) {
      const animal = await Animal.findById(id);

      if (!animal) {
        return json({ success: false, error: 'Animal no encontrado' }, 404);
      }

      return json({ success: true, data: animal });
    }

    // Si no hay ID específico, preparar filtros para el listado completo
    let filter = {};
    if (species) filter.species = species;
    if (status) filter.status = status;
    if (gender) filter.gender = gender;

    // Buscar animales aplicando filtros y ordenar por más recientes primero
    const animals = await Animal.find(filter).sort({ createdAt: -1 });

    return json({
      success: true,
      data: animals,
      total: animals.length
    });
  } catch (error) {
    console.error('Error obteniendo animales:', error);
    return json({ success: false, error: error.message }, 500);
  }
}

// =======================================
// SECCIÓN: OPERACIONES DE CREACIÓN
// =======================================

/**
 * Función para registrar un nuevo animal en el refugio
 * 
 * Esta función permite al personal del refugio agregar información de
 * nuevos animales que lleguen al centro. Valida que los campos obligatorios
 * estén completos antes de guardar en la base de datos.
 * 
 * Campos requeridos:
 * - name: Nombre del animal
 * - species: Tipo de animal (perro, gato, conejo, etc.)
 * 
 * Campos opcionales:
 * - age: Edad del animal
 * - gender: Género (macho, hembra)
 * - breed: Raza específica
 * - description: Descripción y características del animal
 * - photoUrl: URL de la foto del animal
 * - status: Estado (por defecto "en adopción")
 * 
 * Recibe: Datos del animal en formato JSON
 * Devuelve: Información del animal creado o mensaje de error
 */
export async function POST({ request }) {
  try {
    await connectDB();

    // Obtener los datos del animal desde el cuerpo de la petición
    const data = await request.json();

    // Validaciones básicas antes de guardar (además de las validaciones de Mongoose)
    if (!data.name?.trim()) {
      return json({ success: false, error: 'El nombre del animal es obligatorio' }, 400);
    }

    if (!data.species?.trim()) {
      return json({ success: false, error: 'La especie del animal es obligatoria' }, 400);
    }

    // Crear el nuevo animal en la base de datos
    const animal = await Animal.create(data);

    return json({
      success: true,
      data: animal,
      message: 'Animal registrado exitosamente'
    }, 201);
  } catch (err) {
    console.error('Error creando animal:', err);
    return json({ success: false, error: err.message }, 400);
  }
}

// =======================================
// SECCIÓN: OPERACIONES DE ACTUALIZACIÓN
// =======================================

/**
 * Función para actualizar información de un animal existente
 * 
 * Esta función permite modificar los datos de un animal que ya está
 * registrado en el sistema. Es útil para actualizar el estado de adopción,
 * corregir información o agregar detalles adicionales.
 * 
 * Proceso de actualización:
 * 1. Verifica que se proporcione un ID válido
 * 2. Busca el animal en la base de datos
 * 3. Actualiza solo los campos proporcionados
 * 4. Devuelve la información actualizada
 * 
 * Se debe enviar el ID del animal como parámetro en la URL:
 * PUT /api/animals?id=123456789
 * 
 * Recibe: ID del animal en la URL y datos a actualizar en JSON
 * Devuelve: Información actualizada del animal o mensaje de error
 */
export async function PUT({ request }) {
  try {
    await connectDB();

    // Extraer el ID del animal desde los parámetros de la URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return json({ success: false, error: "ID del animal es requerido para actualizar" }, 400);
    }

    // Obtener los datos a actualizar desde el cuerpo de la petición
    const data = await request.json();

    // Actualizar el animal en la base de datos con validaciones activas
    const updated = await Animal.findByIdAndUpdate(id, data, {
      new: true,           // Devolver el documento actualizado
      runValidators: true, // Ejecutar validaciones del schema
    });

    if (!updated) {
      return json({ success: false, error: "Animal no encontrado" }, 404);
    }

    return json({
      success: true,
      data: updated,
      message: 'Animal actualizado exitosamente'
    });
  } catch (err) {
    console.error('Error actualizando animal:', err);
    return json({ success: false, error: err.message }, 400);
  }
}

// =======================================
// SECCIÓN: OPERACIONES DE ELIMINACIÓN
// =======================================

/**
 * Función para eliminar un animal del sistema
 * 
 * Esta función permite eliminar permanentemente el registro de un animal
 * de la base de datos. Se debe usar con precaución ya que la eliminación
 * es irreversible. Típicamente se usa cuando un animal ha sido adoptado
 * o en casos excepcionales donde el registro no es válido.
 * 
 * IMPORTANTE: La eliminación es permanente y no se puede deshacer.
 * 
 * Proceso de eliminación:
 * 1. Verifica que se proporcione un ID válido
 * 2. Busca el animal en la base de datos
 * 3. Elimina el registro permanentemente
 * 4. Confirma la eliminación
 * 
 * Se debe enviar el ID del animal como parámetro en la URL:
 * DELETE /api/animals?id=123456789
 * 
 * Recibe: ID del animal en la URL
 * Devuelve: Confirmación de eliminación o mensaje de error
 */
export async function DELETE({ request }) {
  try {
    await connectDB();

    // Extraer el ID del animal desde los parámetros de la URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return json({ success: false, error: "ID del animal es requerido para eliminar" }, 400);
    }

    // Buscar y eliminar el animal de la base de datos
    const deleted = await Animal.findByIdAndDelete(id);

    if (!deleted) {
      return json({ success: false, error: "Animal no encontrado" }, 404);
    }

    return json({
      success: true,
      message: `${deleted.name} ha sido eliminado exitosamente del refugio`,
      data: deleted
    });
  } catch (err) {
    console.error('Error eliminando animal:', err);
    return json({ success: false, error: err.message }, 400);
  }
}