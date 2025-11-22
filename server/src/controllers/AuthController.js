const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

module.exports = {
    async register(req, res) {
        try {
            const { name, email, password, role } = req.body;

            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role || 'student'
                }
            });

            // Don't return the password
            const { password: _, ...userWithoutPassword } = user;

            return res.status(201).json(userWithoutPassword);
        } catch (error) {
            console.error('Error registering user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '7d' }
            );

            const { password: _, ...userWithoutPassword } = user;

            return res.json({ user: userWithoutPassword, token });
        } catch (error) {
            console.error('Error logging in:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
