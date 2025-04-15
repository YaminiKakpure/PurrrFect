import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './SpDone.css';

const EndPage = () => {
    const navigate = useNavigate();

    const handleRegistration = () => {
        navigate('/DashBoard'); // Navigate to the home page
    };

    return (
        <motion.div
            className="endPageContainer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="endPageContent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* Checkmark Icon */}
                <motion.div
                    className="checkmarkCircle"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <i className="fas fa-check"></i>
                </motion.div>

                {/* Success Message */}
                <motion.h1
                    className="successTitle"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    Purr-fect!
                </motion.h1>
                <motion.p
                    className="successMessage"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    Registraion Done Successfully!
                </motion.p>

                {/* Home Button */}
                <motion.button
                    className="homeButton"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    whileHover={{ scale: 1.05, backgroundColor: '#e0e0e0' }}
                    onClick={handleRegistration}
                >
                    <i className="fas fa-home"></i>
                </motion.button>

                {/* Back to Home Button */}
                <motion.button
                    className="backToHomeButton"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    whileHover={{ y: -2, backgroundColor: '#4CAF50', color: '#ffffff' }}
                    onClick={handleRegistration}
                >
                    GO TO DASHBOARD
                </motion.button>

            </motion.div>
        </motion.div>
    );
};

export default EndPage;