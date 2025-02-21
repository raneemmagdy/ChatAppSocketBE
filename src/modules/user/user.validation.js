import Joi from "joi";
import { Decrypt, generalRules } from "../../utils/index.js";
import { genderOptions, providerOptions, userModel } from "../../DB/models/index.js";
import { roleOptions } from "../../middleware/authorization.js";

export const signInWithGmailSchema=Joi.object({
    idToken:Joi.string().required()
}).required()


export const signUpSchema=Joi.object({
    name: Joi.string().min(3).max(30).messages({
        'string.min': 'Name must be more than 3 characters.',
        'string.max': 'Name must be less than 30 characters.',
        'any.required': 'Name is required.'
    }).required(),
    email: generalRules.email.required(),
    password: generalRules.password.required(),
    cPassword: generalRules.password.valid(Joi.ref('password')).messages({
        'any.only': 'Confirm password must match the password.',
        'any.required': 'Confirm password is required.'
    }).required(),
    phone: Joi.string().regex(/^01[0125][0-9]{8}$/).messages({
        'string.pattern.base': 'Phone number must be an Egyptian number and start with 010, 011, 012, or 015 followed by 8 digits.',
        'any.required': 'Phone number is required.'
    }).required(),
    gender: Joi.string().valid(genderOptions.female,genderOptions.male).messages({
        'any.only': 'Gender must be either male or female.',
        'any.required': 'Gender is required.'
    }).required(),
    role: Joi.string().valid(roleOptions.user,roleOptions.admin).default(roleOptions.user).messages({
        'any.only': 'Role must be either user or admin.',
    }),
    provider: Joi.string().valid(providerOptions.application,providerOptions.google).default(providerOptions.application).messages({
        'any.only': 'Provider must be application or google.'
    }),
    profileImage: Joi.object({
        public_id: Joi.string().required(),
        secure_url: Joi.string().uri().required(),
      }).optional(),
    coverImages: Joi.array()
        .items(
          Joi.object({
            public_id: Joi.string().required(),
            secure_url: Joi.string().uri().required(),
          })
        )
        .optional(),
    
}).required()


export const confirmSchema=Joi.object({
    email: generalRules.email.required(),
    otp: Joi.string().length(4).required().messages({
        'any.required': 'otp is required.',
        'string.length': 'OTP must be exactly 4 characters long.'
    })
    
}).required()




export const signInSchema = Joi.object({
    email:  generalRules.email,
    phone: Joi.string().regex(/^01[0125][0-9]{8}$/).messages({
       'string.pattern.base': 'Phone number must be an Egyptian number starting with 010, 011, 012, or 015 followed by 8 digits.'
    }),
    password:generalRules.password.required(),
    idToken: Joi.string().optional().messages({
      'string.empty': 'idToken cannot be empty.',
    }),
}).oxor('email', 'phone', 'idToken') 
.messages({
      'object.oxor': 'You must provide either email and password, phone and password, or idToken.',
});
  
export const refreshTokenSchema=Joi.object({ 
    authorization:Joi.string().required(),
}).required()


export const emailSchema=Joi.object({ 
    email:  generalRules.email.required(),
   
})




export const resetPasswordSchema=Joi.object({ 
    email: generalRules.email.required(),
    otp: Joi.string().length(4).required().messages({
        'any.required': 'otp is required.',
        'string.length': 'OTP must be exactly 4 characters long.'
    }),
    newPassword: generalRules.password.required(),
    cNewPassword: generalRules.password.valid(Joi.ref('newPassword')).messages({
        'any.only': 'Confirm password must match the password.',
        'any.required': 'Confirm password is required.'
    }).required(),
}).required()

export const updatePasswordSchema=Joi.object({ 
    oldPassword:generalRules.password.required(),
    newPassword: generalRules.password.required(),
    cNewPassword: generalRules.password.valid(Joi.ref('newPassword')).messages({
        'any.only': 'Confirm password must match the password.',
        'any.required': 'Confirm password is required.'
    }).required(),
}).required()
