import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized, login again' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id) {
            req.userId = decoded.id; // Use req.userId instead of modifying req.body
            next();
        } else {
            return res.status(401).json({ success: false, message: 'Unauthorized, login again' });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

export default userAuth;