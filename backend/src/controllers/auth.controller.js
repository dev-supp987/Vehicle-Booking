const { User, AuditTrail } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, department, mobileNumber, employeeId } = req.body;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        if (employeeId) {
            const idExists = await User.findOne({ where: { employeeId } });
            if (idExists) {
                return res.status(400).json({ message: `Employee ID ${employeeId} is already registered` });
            }
        }


        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            department,
            mobileNumber,
            employeeId
        });

        await AuditTrail.create({
            action: 'USER_REGISTERED',
            details: `User ${email} registered as ${role}`,
            userId: user.id
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isSuperAdmin: user.isSuperAdmin,
            permissions: user.permissions,
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isActive) {
                return res.status(403).json({ message: 'Your account has been deactivated. Please contact HR.' });
            }

            await AuditTrail.create({
                action: 'USER_LOGIN',
                details: `User ${email} logged in`,
                userId: user.id
            });

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin,
                permissions: user.permissions,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.loginwithtoken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);  
        
        console.log('Decoded token:', decoded); // Debugging line
		
        const user = await User.findOne({ where: { employeeId: decoded.emp_code } });

        if (user) {
            if (!user.isActive) {
                return res.status(403).json({ message: 'Your account has been deactivated. Please contact HR.' });
            }

            await AuditTrail.create({
                action: 'USER_LOGIN',
                details: `User ${user.name} logged in`,
                userId: user.id
            });

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin,
                permissions: user.permissions,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (parseInt(user.id) === parseInt(req.user.id)) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ message: `User status updated to ${user.isActive ? 'Active' : 'Inactive'}`, isActive: user.isActive });
    } catch (error) {
        console.error('SIMPLE TOGGLE ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, mobileNumber } = req.body;

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ where: { email } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (mobileNumber) user.mobileNumber = mobileNumber;

        await user.save();

        const token = generateToken(user.id);

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            mobileNumber: user.mobileNumber,
            employeeId: user.employeeId,
            isSuperAdmin: user.isSuperAdmin,
            permissions: user.permissions,
            token: token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, role, department, mobileNumber, employeeId } = req.body;

        // Check for email conflict
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ where: { email } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Check for Employee ID conflict
        if (employeeId && employeeId !== user.employeeId) {
            const idExists = await User.findOne({ where: { employeeId } });
            if (idExists) {
                return res.status(400).json({ message: `Employee ID ${employeeId} is already in use` });
            }
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (department) user.department = department;
        if (mobileNumber) user.mobileNumber = mobileNumber;
        if (employeeId) user.employeeId = employeeId;

        await user.save();

        await AuditTrail.create({
            action: 'USER_UPDATED',
            details: `User ${user.email} updated by ${req.user.email}`,
            userId: req.user.id
        });

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            mobileNumber: user.mobileNumber,
            employeeId: user.employeeId,
            isSuperAdmin: user.isSuperAdmin,
            permissions: user.permissions,
            isActive: user.isActive
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { isSuperAdmin, permissions } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (isSuperAdmin !== undefined) user.isSuperAdmin = isSuperAdmin;
        if (permissions !== undefined) user.permissions = permissions;

        await user.save();

        await AuditTrail.create({
            action: 'PERMISSIONS_UPDATED',
            details: `User ${user.email} permissions updated by SuperAdmin ${req.user.name}`,
            userId: req.user.id
        });

        res.json({
            message: 'Permissions updated successfully',
            user: {
                id: user.id,
                email: user.email,
                isSuperAdmin: user.isSuperAdmin,
                permissions: user.permissions
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        await AuditTrail.create({
            action: 'ADMIN_PASSWORD_RESET',
            details: `Password for ${user.email} reset by SuperAdmin ${req.user.name}`,
            userId: req.user.id
        });

        res.json({ message: `Password for ${user.email} has been reset successfully` });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
