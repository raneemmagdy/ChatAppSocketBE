import { Types } from "mongoose"
import Joi from "joi"
const customId=(value,helper)=>{
    const data =Types.ObjectId.isValid(value)
    return data?data:helper.message('Invalid ID !')
}


export const generalRules={
    ObjectId:Joi.custom(customId),


    email: Joi.string().email().regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).messages({
        'string.email': 'Invalid email format.',
        'string.pattern.base': 'Email does not match the required format.',
        'any.required': 'Email is required.'
    }),


    password: Joi.string()
         .pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/))
         .messages({
            'string.pattern.base': 'Password must be at least 8 characters, Password must contain at least one letter, one number, and one special character.',
            'any.required': 'Password is required.'
    }),


    headers:Joi.object({
        authorization: Joi.string().required(),
        'cache-control': Joi.string(),
        'content-type': Joi.string(),
        accept: Joi.string(),
        host: Joi.string(),
        'user-agent': Joi.string(),
        connection: Joi.string(),
        'accept-encoding': Joi.string(),
        'content-length': Joi.string(),
        'postman-token': Joi.string(),
        'x-vercel-id': Joi.string(),
        'x-vercel-internal-ingress-bucket': Joi.string(),
        'forwarded': Joi.string(),
        'x-vercel-ip-country': Joi.string(),
        'x-vercel-ip-timezone': Joi.string(),
        'x-vercel-ip-country-region': Joi.string(),
        'x-vercel-proxy-signature-ts': Joi.string(),
        'x-forwarded-host': Joi.string(),
        'x-vercel-ja4-digest': Joi.string(),
        'x-vercel-proxied-for': Joi.string(),
        'x-vercel-ip-city': Joi.string(),
        'x-vercel-proxy-signature': Joi.string(),
        'x-vercel-ip-as-number': Joi.string(),
        'x-vercel-ip-latitude': Joi.string(),
        'x-real-ip': Joi.string(),
        'x-vercel-deployment-url': Joi.string(),
        'x-forwarded-for': Joi.string(),
        'x-vercel-ip-continent': Joi.string(),
        'x-forwarded-proto': Joi.string(),
        'x-vercel-ip-longitude': Joi.string(),
        'x-vercel-forwarded-for': Joi.string(),
  
    }).required()
}