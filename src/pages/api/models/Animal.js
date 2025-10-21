import mongoose from "mongoose";

const animalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },     // nombre del animal
    species: { type: String, required: true },  // perro, gato, conejo... libre
    breed: String,                              // raza
    age: Number,                                // edad
    gender: String,                             // macho, hembra, desconocido
    status: { type: String, default: "en adopción" }, // estado
    description: String,                        // descripción libre
    photoUrl: String,                           // URL de la foto
  },
  { timestamps: true } // guarda createdAt y updatedAt
);

export default mongoose.models.Animal || mongoose.model("Animal", animalSchema);
