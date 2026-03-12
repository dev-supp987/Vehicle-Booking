const express = require('express');
const router = express.Router();
const {
    register,
    login,
    loginwithtoken,
    getAllUsers,
    toggleUserStatus,
    updateProfile,
    updateUser,
    updatePermissions,
    resetUserPassword
} = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/loginwithtoken', loginwithtoken);
router.put('/profile', protect, updateProfile);

// Admin/HR Protected Routes
// Allow Security to view users as well (for gate operations)
router.get('/users', protect, authorize('HR', 'Security'), getAllUsers);
router.post('/users', protect, authorize('HR'), register);
router.put('/users/:id', protect, authorize('HR'), updateUser);
router.put('/users/:id/status', protect, authorize('HR'), toggleUserStatus);

// Developer / Super Admin Routes
// authorize('SuperAdminOnly') works because SuperAdmin bypasses the check, 
// and no one else has the role 'SuperAdminOnly'.
router.put('/users/:id/permissions', protect, authorize('SuperAdminOnly'), updatePermissions);
router.put('/users/:id/reset-password', protect, authorize('SuperAdminOnly'), resetUserPassword);

module.exports = router;
