const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const multer = require('multer');
const upload = multer();

router.post('/', 
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'prescription', maxCount: 1 }
  ]),
  petController.createPet
);

router.get('/', petController.getAllPets);
router.get('/:id', petController.getPet);

router.put('/:id', 
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'prescription', maxCount: 1 }
  ]),
  petController.updatePet
);

router.delete('/:id', petController.deletePet);

module.exports = router;