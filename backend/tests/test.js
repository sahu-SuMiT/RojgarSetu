const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const CollegeStudent = require('../models/collegeStudent.model');

const main = async () => {
    await mongoose.connect(`${process.env.MONGO_URI}`, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    });
    console.log(`Connected to ${process.env.MONGO_URI}`);
};

const updateAllCampusScores = async () => {
    try {
        console.log('Starting campus score updates...');
        
        // Get all students (only necessary fields to reduce memory usage)
        const students = await CollegeStudent.find({}).select('_id');
        
        console.log(`Found ${students.length} students to update`);
        
        let updatedCount = 0;
        let errors = 0;
        
        // Process in batches to avoid memory issues
        const batchSize = 100;
        for (let i = 0; i < students.length; i += batchSize) {
            const batch = students.slice(i, i + batchSize);
            
            await Promise.all(batch.map(async (student) => {
                try {
                    // This will trigger the pre-save hook
                    const updatedStudent = await CollegeStudent.findByIdAndUpdate(
                        student._id,
                        { $set: { lastUpdated: new Date() } }, // Trigger update with dummy field
                        { new: true }
                    );
                    
                    // Alternative if you want to use save() directly:
                    // const studentDoc = await CollegeStudent.findById(student._id);
                    // await studentDoc.save();
                    
                    updatedCount++;
                    if (updatedCount % 100 === 0) {
                        console.log(`Updated ${updatedCount} students...`);
                    }
                } catch (err) {
                    console.error(`Error updating student ${student._id}:`, err.message);
                    errors++;
                }
            }));
        }
        
        console.log(`\nUpdate complete!`);
        console.log(`Successfully updated: ${updatedCount}`);
        console.log(`Errors encountered: ${errors}`);
        
    } catch (err) {
        console.error('Error in update process:', err);
    } finally {
        mongoose.disconnect();
    }
};

// Run the script
main()
    .then(updateAllCampusScores)
    .catch(err => {
        console.error('Script failed:', err);
        mongoose.disconnect();
    });