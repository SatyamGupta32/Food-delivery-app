import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }
        
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        next();

    } catch (error) {
        error.statusCode = 401;    
        next(error);               
    }
}

export const isAdmin = (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    if (user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Only admin can access this route",
        });
    }

    next();
};