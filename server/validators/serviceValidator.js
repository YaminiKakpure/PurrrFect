const Joi = require('joi');

// In serviceValidator.js
const serviceItemSchema = Joi.object({
    service_name: Joi.string().required(),
    name: Joi.string(), // alias
    price: Joi.number().required().min(0),
    duration: Joi.number().integer().min(1).default(30),
    description: Joi.string().allow('')
});

const serviceSchema = Joi.object({
    service_title: Joi.string().required().max(100),
    service_type: Joi.string().valid('vet', 'grooming', 'training', 'hostelling', 'shop').required(),
    service_description: Joi.string().required(),
    location: Joi.string().required(),
    phone: Joi.string().required(),
    whatsapp: Joi.string().allow(''),
    service_availability: Joi.string().valid('24/7', 'only week days', 'Custom hours').default('24/7'),
    opening_time: Joi.string().when('service_availability', {
        is: 'Custom hours',
        then: Joi.string().required(),
        otherwise: Joi.string().allow('')
    }),
    closing_time: Joi.string().when('service_availability', {
        is: 'Custom hours',
        then: Joi.string().required(),
        otherwise: Joi.string().allow('')
    }),
    home_service: Joi.boolean().default(false),
    emergency_service: Joi.boolean().default(false),
    accept_advanced_bookings: Joi.boolean().default(false),
    services: Joi.array().items(serviceItemSchema).min(1).required(),
    service_photos: Joi.any(), // handled separately
    service_video: Joi.any() // handled separately
});

exports.validateServiceData = (data) => {
    const { error } = serviceSchema.validate(data, { abortEarly: false });
    return {
        valid: !error,
        errors: error ? error.details.map(e => e.message) : null
    };
};