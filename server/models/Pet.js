const db = require('../config/db');

const Pet = {
  // Create new pet
  create: async (petData) => {
    const query = `
      INSERT INTO pets 
      (name, age, species, breed, gender, weight, medical_history, 
       profile_image, feeding_schedule, exercise_preference, 
       sleep_schedule, medical_allergies, special_instructions, prescription)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      petData.name,
      petData.age,
      petData.species,
      petData.breed,
      petData.gender,
      petData.weight,
      petData.medicalHistory,
      petData.profileImage,
      petData.feedingSchedule,
      petData.exercisePreference,
      petData.sleepSchedule,
      petData.medicalAllergies,
      petData.specialInstructions,
      petData.prescription
    ];

    const [result] = await db.query(query, values);
    return result.insertId;
  },

  // Get all pets
  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM pets');
    return rows;
  },

  // Get single pet by ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM pets WHERE id = ?', [id]);
    return rows[0];
  },

  // Update pet
  update: async (id, petData) => {
    const query = `
      UPDATE pets SET 
        name = ?, age = ?, species = ?, breed = ?, gender = ?, 
        weight = ?, medical_history = ?, profile_image = ?, 
        feeding_schedule = ?, exercise_preference = ?, 
        sleep_schedule = ?, medical_allergies = ?, 
        special_instructions = ?, prescription = ?
      WHERE id = ?
    `;
    
    const values = [
      petData.name,
      petData.age,
      petData.species,
      petData.breed,
      petData.gender,
      petData.weight,
      petData.medicalHistory,
      petData.profileImage,
      petData.feedingSchedule,
      petData.exercisePreference,
      petData.sleepSchedule,
      petData.medicalAllergies,
      petData.specialInstructions,
      petData.prescription,
      id
    ];

    await db.query(query, values);
    return Pet.findById(id);
  },

  // Delete pet
  delete: async (id) => {
    await db.query('DELETE FROM pets WHERE id = ?', [id]);
    return true;
  }
};

module.exports = Pet;