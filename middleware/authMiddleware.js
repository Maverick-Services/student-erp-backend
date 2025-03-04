const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success:false,
             message: "Access Denied! No Token Provided." 
            });
    }

    // Extract token from Bearer format
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        console.log(req.user)
        // Ensure user has admin role
        // if (req.user.role !== "admin") {
        //     return res.status(403).json({ message: "Access Denied! Only Admins Can Perform This Action." });
        // }

        next();
    } catch (error) {
        return res.status(401).json({ 
            success:false,
            message: "Invalid Token" 
        });
    }
};

exports.isAdmin = (req,res)=>{
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success:false,
                 message: "Access Denied! Only Admins Can Perform This Action." 
                });
        }
        next()
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"This is the protected route for Admin's"})
    }
}
