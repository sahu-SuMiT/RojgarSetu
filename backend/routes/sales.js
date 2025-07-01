const express = require('express');
const router = express.Router();
const { addStudent, addCollege, addCompany,getCollegesBySales,getStudentsBySales, getCompaniesBySales} = require('../controllers/sales/salesController');
const auth = require('../middleware/auth'); // Your JWT middleware

const controller = require('../controllers/sales/salesController');
// console.log(controller);
// console.log({ addStudent, addCollege, addCompany });

router.post('/student' ,addStudent);
router.post('/college', addCollege);
router.post('/company', addCompany);

router.get('/students', getStudentsBySales);
router.get('/colleges', getCollegesBySales);
router.get('/companies', getCompaniesBySales);

module.exports = router;