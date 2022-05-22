const Joi = require('@hapi/joi');

//register validation
const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(1).required()
    });
    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;