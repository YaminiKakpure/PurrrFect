const Pet = require('../models/Pet');
const fs = require('fs').promises;
const path = require('path');

// File upload helper
const handleFileUpload = async (file, folder) => {
  if (!file) return null;
  
  const uploadDir = path.join(__dirname, `../../uploads/${folder}`);
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filename = `${Date.now()}-${file.originalname}`;
  const filepath = path.join(uploadDir, filename);
  
  await fs.writeFile(filepath, file.buffer);
  return `/uploads/${folder}/${filename}`;
};

exports.createPet = async (req, res) => {
  try {
    const { body, files } = req;
    
    const petData = {
      name: body.name,
      age: body.age,
      species: body.species,
      breed: body.breed,
      gender: body.gender,
      weight: body.weight,
      medicalHistory: body.medicalHistory,
      profileImage: files?.profileImage 
        ? await handleFileUpload(files.profileImage[0], 'profile_images')
        : null,
      feedingSchedule: body.feedingSchedule,
      exercisePreference: body.exercisePreference,
      sleepSchedule: body.sleepSchedule,
      medicalAllergies: body.medicalAllergies,
      specialInstructions: body.specialInstructions,
      prescription: files?.prescription 
        ? await handleFileUpload(files.prescription[0], 'prescriptions')
        : null
    };

    const petId = await Pet.create(petData);
    const newPet = await Pet.findById(petId);
    
    res.status(201).json({
      success: true,
      pet: newPet
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.findAll();
    res.json({ 
      success: true,
      pets 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.getPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ 
        success: false,
        error: 'Pet not found' 
      });
    }
    
    res.json({ 
      success: true,
      pet 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const { body, files, params } = req;
    
    const existingPet = await Pet.findById(params.id);
    if (!existingPet) {
      return res.status(404).json({ 
        success: false,
        error: 'Pet not found' 
      });
    }

    const petData = {
      name: body.name || existingPet.name,
      age: body.age || existingPet.age,
      species: body.species || existingPet.species,
      breed: body.breed || existingPet.breed,
      gender: body.gender || existingPet.gender,
      weight: body.weight || existingPet.weight,
      medicalHistory: body.medicalHistory || existingPet.medical_history,
      profileImage: files?.profileImage 
        ? await handleFileUpload(files.profileImage[0], 'profile_images')
        : existingPet.profile_image,
      feedingSchedule: body.feedingSchedule || existingPet.feeding_schedule,
      exercisePreference: body.exercisePreference || existingPet.exercise_preference,
      sleepSchedule: body.sleepSchedule || existingPet.sleep_schedule,
      medicalAllergies: body.medicalAllergies || existingPet.medical_allergies,
      specialInstructions: body.specialInstructions || existingPet.special_instructions,
      prescription: files?.prescription 
        ? await handleFileUpload(files.prescription[0], 'prescriptions')
        : existingPet.prescription
    };

    const updatedPet = await Pet.update(params.id, petData);
    
    res.json({ 
      success: true,
      pet: updatedPet 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ 
        success: false,
        error: 'Pet not found' 
      });
    }

    await Pet.delete(req.params.id);
    res.json({ 
      success: true,
      message: 'Pet deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};