const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: Invalid token format" });
    }

    // jwt.verify(token, process.env.JWT_SECRET || 'e82d85c7-9179-45a8-a304-3eccbb85c620', (err, decoded) => {
    //     if (err) {
    //         return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
    //     }
    //     req.user = decoded; // Store user details in request
    //     next();
    // });


    console.log("Incoming token:", token);
    jwt.verify(token, process.env.JWT_SECRET || 'e82d85c7-9179-45a8-a304-3eccbb85c620', (err, decoded) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(403).json({ message: "Token verification failed" });
        }
        console.log("Decoded token:", decoded);
        req.user = decoded;
        next();
    });

    
};
