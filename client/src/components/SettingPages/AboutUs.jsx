import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutUs.css';
import { ChevronLeft } from 'lucide-react';

const AboutUs = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <div className="aboutUsContainer">
            <div className="aboutUsHeader">
                <button className="backButton" onClick={handleBack}>
                    <ChevronLeft size={24} />
                </button>
                <h1>About Us!</h1>
                <p>Creating Happy, Healthy Pets</p>
            </div>

            <div className="aboutUsContent">
                <h2>Our Story</h2>
                <p>
                    Purrfect Love started in 2025 with a simple mission: to provide the best care and products for your beloved pets. We believe that pets are family, and they deserve nothing but the finest attention, care, and love.
                </p>
                <p>
                    At Purrfect Love, our dedicated team of pet lovers works tirelessly to ensure that every pet that walks through our doors receives personalized care and attention. From premium pet food and stylish accessories to expert grooming and vet consultations, we are your one-stop destination for everything your pet needs.
                </p>

                <div className="servicesSection">
                    <h3>Our Services</h3>
                    <div className="servicesGrid">
                        <div className="serviceCard">HealthCare</div>
                        <div className="serviceCard">Grooming</div>
                        <div className="serviceCard">Training</div>
                        <div className="serviceCard">Boarding</div>
                        <div className="serviceCard">Pet-Friendly Stays</div>
                    </div>
                </div>

                <div className="contactSection">
                    <h3>Contact Us</h3>
                    <p>📞 Call Us: +91 8208015819</p>
                    <p>📧 Email Us: support@purrfectlove.com</p>
                    <p>🌐 Website: www.purrfectlove.com</p>
                    <p>🔗 Follow Us: [Instagram]</p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;