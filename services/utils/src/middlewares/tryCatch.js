

export const TryCatch = (func) => {
    return async (req, res, next) => {
        return Promise.resolve(func(req, res, next)).catch(next);
    }
}