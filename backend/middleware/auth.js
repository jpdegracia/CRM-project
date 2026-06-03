import jwt from "jsonwebtoken"; // Make sure you have this import!

export const verifyToken = (req, res, next) => {
    // 1. Grab the full header, usually looks like: "Bearer eyJhbGci..."
    const authHeader = req.headers.authorization; 
    
    if (authHeader) {
        // 2. Safely extract just the token part
        const token = authHeader.split(" ")[1]; 
        
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: "Invalid token"
                });
            }
            
            // 3. Attach the decoded user payload to the request for the next route
            req.user = decoded; 
            next();
        });
    } else {
        return res.status(401).json({
            message: "No token provided"
        });
    }   
};