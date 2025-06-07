/**
 * Calculates the campus score for a student based on their internship and interview performance
 * @param {Object} student - The student object containing internship and interview data
 * @returns {string} - The calculated campus score with one decimal place
 */
const calculateCampusScore = (student) => {
    if (!student) return '5.0';

    try {
        let totalScore = 0;
        let validScoresCount = 0;

        // Calculate internship scores
        if (student.internships && Array.isArray(student.internships)) {
            student.internships.forEach(internship => {
                const score = parseFloat(internship?.internshipScore);
                if (!isNaN(score) && score > 0) {
                    totalScore += score;
                    validScoresCount++;
                }
            });
        }

        // Calculate interview feedback scores
        if (student.interview_scheduled && Array.isArray(student.interview_scheduled)) {
            student.interview_scheduled.forEach(interview => {
                const score = parseFloat(interview?.feedback?.overallScore);
                if (!isNaN(score) && score > 0) {
                    totalScore += score;
                    validScoresCount++;
                }
            });
        }

        // If no valid scores found, return default score
        if (validScoresCount === 0) return '5.0';

        // Calculate average score
        const averageScore = totalScore / validScoresCount;
        
        // Ensure the score is between 5.0 and 10.0
        const finalScore = Math.max(5.0, Math.min(10.0, averageScore));
        
        return finalScore.toFixed(1);
    } catch (error) {
        console.error('Error calculating campus score:', error);
        return '5.0';
    }
};

export default calculateCampusScore; 