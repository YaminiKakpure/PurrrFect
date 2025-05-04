const Joi = require('joi');

const serviceSchema = Joi.object({
    service_title: Joi.string().required().max(100),
    service_type: Joi.string().valid('vet', 'grooming', 'training', 'hostelling', 'hotel', 'shop').required(),
    // Add validation for all other fields
});

exports.validateServiceData = (data) => {
    const { error } = serviceSchema.validate(data, { abortEarly: false });
    return {
        valid: !error,
        errors: error ? error.details.map(e => e.message) : null
    };
};