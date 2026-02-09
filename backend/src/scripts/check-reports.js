const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Intern = require('../models/Intern');
const User = require('../models/User');

const checkReports = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const interns = await Intern.find().populate('userId', 'email').lean();

        console.log(`Count: ${interns.length}`);

        for (let i = 0; i < interns.length; i++) {
            const intern = interns[i];
            const email = intern.userId?.email || 'No Email';
            const weekly = intern.academicWork?.weeklyProgressReport?.length || 0;
            console.log(`[${i}] ${email} - Weekly: ${weekly}`);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkReports();
