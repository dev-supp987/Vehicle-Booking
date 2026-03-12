const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });
            if (!req.user) {
                return res.status(401).json({ message: 'User no longer exists' });
            }
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        // Super Admin bypasses all role checks
        if (req.user.isSuperAdmin) {
            return next();
        }

        // Check for specific granular permissions if defined in roles array
        // We can pass permissions as roles string like 'perm:canManageBookings'
        const requiredPermissions = roles.filter(r => r.startsWith('perm:'));
        const requiredRoles = roles.filter(r => !r.startsWith('perm:'));

        // Check standard roles
        const hasRole = requiredRoles.length === 0 || requiredRoles.includes(req.user.role);

        // Check granular permissions
        // If multiple permissions are required, user needs ALL of them (or ANY? Let's go with ANY for now to match role behavior)
        // If roles AND permissions are provided, user needs (Role OR Permission) usually, or strict check.
        // Let's implement: If SuperAdmin -> Pass. Else -> Must have Role OR (if Granular Permission passed, have that permission).

        let hasPermission = false;
        if (req.user.permissions) {
            hasPermission = requiredPermissions.some(p => {
                const permKey = p.split(':')[1];
                return req.user.permissions[permKey] === true;
            });
        }

        if (!hasRole && !hasPermission && requiredPermissions.length > 0) {
            return res.status(403).json({
                message: `User does not have necessary permissions`
            });
        }

        if (!hasRole && requiredRoles.length > 0 && requiredPermissions.length === 0) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized`
            });
        }

        next();
    };
};

module.exports = { protect, authorize };
