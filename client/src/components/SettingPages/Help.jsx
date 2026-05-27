import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Help.css';
import { ChevronLeft } from 'lucide-react';

const Help = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(null);

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    const toggleDropdown = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqs = [
        {
            question: '1. How can I track my order?',
            answer: 'Go to ‘My Orders’ > Select your order > Click ‘Track Order’ to see real-time updates.',
        },
        {
            question: '2. What payment methods do you accept?',
            answer: 'We accept UPI, credit/debit cards, net banking, and cash on delivery (COD).',
        },
        {
            question: '3. How do I return a product?',
            answer: 'Go to ‘My Orders’ > Select the product > Click ‘Request Return’ and follow the instructions.',
        },
        {
            question: '4. When will I receive my refund?',
            answer: 'Refunds are processed within 5-7 business days after return approval.',
        },
        {
            question: '5. I forgot my password. How can I reset it?',
            answer: 'Click ‘Forgot Password’ on the login screen and follow the steps to reset your password.',
        },
        {
            question: '6. How can I contact customer support?',
            answer: 'You can contact us via Live Chat, Email (support@purrfectlove.com), or Call (+91 8208015819).',
        },
    ];

    return (
        <div className="helpContainer">
            <div className="helpHeader">
                <button className="backButton" onClick={handleBack}>
                <ChevronLeft size={24} />
                </button>
                <h1>Help and Support</h1>
                <p>How can we help you today?</p>
            </div>

            <div className="helpContent">
                <h2>FAQs</h2>
                <div className="faqSection">
                    {faqs.map((faq, index) => (
                        <div key={index} className="faqItem">
                            <div
                                className="faqQuestion"
                                onClick={() => toggleDropdown(index)}
                            >
                                <h3>{faq.question}</h3>
                                <i
                                    className={`fas ${
                                        activeIndex === index ? 'fa-chevron-up' : 'fa-chevron-down'
                                    }`}
                                ></i>
                            </div>
                            {activeIndex === index && (
                                <div className="faqAnswer">
                                    <p>{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
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

export default Help;