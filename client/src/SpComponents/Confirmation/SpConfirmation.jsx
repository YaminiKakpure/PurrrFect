import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./SpConfirmation.css";
import { ChevronLeft } from 'lucide-react';

const SpConfirmation = () => {
  const navigate = useNavigate();
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState({
    page: true,
    payment: false
  });
  const [error, setError] = useState(null);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const razorpayScriptRef = useRef(null);

  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setRazorpayReady(true);
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          setRazorpayReady(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay SDK');
          setError('Failed to load payment system. Please refresh the page.');
          resolve(false);
        };
        
        document.body.appendChild(script);
        razorpayScriptRef.current = script; // Store reference to the script
      });
    };

    const loadDraft = () => {
      try {
        const draft = JSON.parse(localStorage.getItem('draft_service'));
        if (!draft) {
          setError('No draft data found. Please start over.');
          return;
        }
        setServiceDetails(draft);
      } catch (err) {
        setError('Failed to load draft data');
      } finally {
        setLoading(prev => ({ ...prev, page: false }));
      }
    };

    const initialize = async () => {
      try {
        await Promise.all([loadRazorpay(), loadDraft()]);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize. Please try again.');
      }
    };

    initialize();

    return () => {
      // Cleanup - only remove if the script is still in the DOM
      if (razorpayScriptRef.current && document.body.contains(razorpayScriptRef.current)) {
        document.body.removeChild(razorpayScriptRef.current);
      }
      if (window.Razorpay) {
        window.Razorpay = undefined;
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayReady) {
      toast.error("Payment system is still loading. Please wait...");
      return;
    }

    setLoading(prev => ({ ...prev, payment: true }));
  
    try {
      const orderResponse = await fetch('http://localhost:3000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: 499 })
      });
  
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }
  
      const orderData = await orderResponse.json();

      const options = {
        key: 'rzp_test_zvUvHBloF8oAEy',
        amount: orderData.order.amount,
        currency: "INR",
        name: "Purrfect Love",
        description: "Service Registration Fee",
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const verification = await fetch('http://localhost:3000/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            const verificationData = await verification.json();
            
            if (verificationData.success) {
              await saveServiceDetails();
              navigate("/SpDone");
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error(error.message);
          }
        },
        prefill: {
          email: JSON.parse(localStorage.getItem("provider"))?.email || "",
          contact: serviceDetails?.phone || ""
        },
        theme: {
          color: "#4CAF50"
        },
        modal: {
          ondismiss: () => {
            setLoading(prev => ({ ...prev, payment: false }));
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed: " + error.message);
    } finally {
      setLoading(prev => ({ ...prev, payment: false }));
    }
  };

  const saveServiceDetails = async () => {
    try {
      const sp_id = localStorage.getItem("sp_id");
      const token = localStorage.getItem("token");
      const draft = JSON.parse(localStorage.getItem('draft_service'));
  
      const formData = new FormData();
      
      // Add all non-file fields first
      const { services, service_photos, service_video, ...otherFields } = draft;
      Object.entries(otherFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
  
      // Add services as JSON string
      formData.append('services', JSON.stringify(services));
  
      // Add files
      if (service_photos) {
        service_photos.forEach(photo => {
          const blob = base64ToBlob(photo);
          formData.append('service_photos', blob, `photo-${Date.now()}.jpg`);
        });
      }
  
      if (service_video) {
        const blob = base64ToBlob(service_video);
        formData.append('service_video', blob, `video-${Date.now()}.mp4`);
      }
  
      const response = await fetch(
        `http://localhost:3000/api/providers/${sp_id}/complete-registration`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save service details');
      }
  
      localStorage.removeItem('draft_service');
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
  };

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  };

  const retryPayment = async () => {
    setError(null);
    await handlePayment();
  };

  if (loading.page) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>Loading your details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-overlay">
        <div className="error-icon">!</div>
        <h3>Error Loading Page</h3>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={retryPayment}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!serviceDetails) {
    return (
      <div className="confirmationContainer">
        <div className="error-message">Service information not found</div>
        <button onClick={() => navigate('/SpServiceDetails')}>Back to Service Details</button>
      </div>
    );
  }

  return (
    <div className="sp-confirmation-page">
      {/* Header Section */}
      <div className="sp-confirmation-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} /> 
        </button>
        <h1>Confirm Your Details</h1>
        <p className="subtitle">Please review your information before proceeding</p>
      </div>

      {/* Service Details Section */}
      <div className="sp-details-section">
        <h2>Service Information</h2>
        
        <div className="detail-row">
          <span className="detail-label">Service Title:</span>
          <span className="detail-value">{serviceDetails?.service_title || 'Not provided'}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Service Type:</span>
          <span className="detail-value">{serviceDetails?.service_type || 'Not provided'}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Description:</span>
          <span className="detail-value">{serviceDetails?.service_description || 'Not provided'}</span>
        </div>
        
        {serviceDetails?.services?.length > 0 && (
          <>
            <h3>Services Offered</h3>
            {serviceDetails.services.map((service, index) => (
              <div key={index} className="service-offering">
                 <span className="service-name">{service.name || service.service_name}:</span>
                <span>₹{service.price} ({service.duration} mins)</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Contact Information Section */}
      <div className="sp-contact-section">
        <h2>Contact Details</h2>
        
        <div className="detail-row">
          <span className="detail-label">Location:</span>
          <span className="detail-value">{serviceDetails?.location || 'Not provided'}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Phone:</span>
          <span className="detail-value">{serviceDetails?.phone || 'Not provided'}</span>
        </div>
        
        {serviceDetails?.whatsapp && (
          <div className="detail-row">
            <span className="detail-label">WhatsApp:</span>
            <span className="detail-value">{serviceDetails.whatsapp}</span>
          </div>
        )}
      </div>

      {/* Payment Confirmation */}
      <div className="sp-payment-notice">
        <p>By confirming, you agree to a one-time registration fee of ₹499.</p>
      </div>

      {/* Action Buttons */}
      <div className="sp-confirmation-actions">
        <button 
          className="cancel-button"
          onClick={() => navigate(-1)}
          disabled={loading.payment}
        >
          Back to Edit
        </button>
        <button 
          className="confirm-button"
          onClick={handlePayment}
          disabled={!razorpayReady || loading.payment}
        >
          {loading.payment ? "Processing..." : "Confirm & Pay"}
        </button>
      </div>
    </div>
  );
};

export default SpConfirmation;