import { asyncHandler } from "../utils/index.js";

const validation = (schema) => {
    return asyncHandler(
        async(req, res, next) => {
            const inputData = { ...req.body, ...req.params, ...req.query };
            const { error } = schema.validate(inputData, { abortEarly: false });
            if (error) {
                const message = error.details.map(detail => detail.message).join(', ');
                return next(new Error(message, { cause: 422 })); 
            }
            next();
        }
    );
};
export default validation