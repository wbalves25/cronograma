const { PrismaClient } = require('@prisma/client');
const SchedulerService = require('../services/SchedulerService');

const prisma = new PrismaClient();

module.exports = {
    async enroll(req, res) {
        try {
            const { userId, courseId } = req.body;

            // 1. Create Enrollment
            const enrollment = await prisma.enrollment.create({
                data: {
                    userId,
                    courseId
                }
            });

            // 2. Copy Topics to StudentTasks
            const topics = await prisma.topic.findMany({
                where: {
                    subject: {
                        courseId: courseId
                    }
                },
                orderBy: {
                    orderIndex: 'asc'
                }
            });

            const tasksData = topics.map(topic => ({
                userId,
                topicId: topic.id,
                status: 'pending'
            }));

            await prisma.studentTask.createMany({
                data: tasksData
            });

            return res.status(201).json({ enrollment, tasksCreated: tasksData.length });
        } catch (error) {
            console.error('Error enrolling student:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async setAvailability(req, res) {
        try {
            const { userId, availabilities } = req.body; // Expects array of { weekDay, hoursPerDay }

            // Clear existing availability
            await prisma.availability.deleteMany({
                where: { userId }
            });

            // Create new availability
            await prisma.availability.createMany({
                data: availabilities.map(a => ({
                    userId,
                    weekDay: a.weekDay,
                    hoursPerDay: a.hoursPerDay
                }))
            });

            return res.status(200).json({ message: 'Availability updated' });
        } catch (error) {
            console.error('Error setting availability:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async generateSchedule(req, res) {
        try {
            const { userId } = req.body;
            console.log('Generating schedule for user:', userId);
            await SchedulerService.distributeTasks(userId);
            return res.status(200).json({ message: 'Schedule generated successfully' });
        } catch (error) {
            console.error('Error generating schedule:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async recalculate(req, res) {
        try {
            const { userId } = req.body;
            await SchedulerService.recalculateSchedule(userId);
            return res.status(200).json({ message: 'Schedule recalculated successfully' });
        } catch (error) {
            console.error('Error recalculating schedule:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async completeTask(req, res) {
        try {
            const { taskId } = req.body;
            await prisma.studentTask.update({
                where: { id: taskId },
                data: {
                    status: 'done',
                    completedAt: new Date()
                }
            });
            return res.status(200).json({ message: 'Task completed' });
        } catch (error) {
            console.error('Error completing task:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getTasks(req, res) {
        try {
            const { userId } = req.params;
            const tasks = await prisma.studentTask.findMany({
                where: { userId: parseInt(userId) },
                include: {
                    topic: {
                        include: {
                            subject: true
                        }
                    }
                },
                orderBy: {
                    scheduledDate: 'asc'
                }
            });
            return res.json(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
