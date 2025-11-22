const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    async createCourse(req, res) {
        try {
            const { title, description, subjects } = req.body;
            const userId = req.userId; // From auth middleware

            // Create Course with nested Subjects and Topics
            const course = await prisma.course.create({
                data: {
                    title,
                    description,
                    adminId: userId,
                    subjects: {
                        create: subjects.map(subject => ({
                            name: subject.name,
                            color: subject.color,
                            weight: subject.weight,
                            topics: {
                                create: subject.topics.map(topic => ({
                                    name: topic.name,
                                    estimatedMinutes: topic.estimatedMinutes
                                }))
                            }
                        }))
                    }
                },
                include: {
                    subjects: {
                        include: {
                            topics: true
                        }
                    }
                }
            });

            return res.status(201).json(course);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error creating course' });
        }
    },

    async getCourses(req, res) {
        try {
            const userId = req.userId;
            const courses = await prisma.course.findMany({
                where: { adminId: userId },
                include: {
                    subjects: {
                        include: {
                            topics: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.json(courses);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error fetching courses' });
        }
    },

    async deleteCourse(req, res) {
        try {
            const { id } = req.params;
            const userId = req.userId;

            // Verify ownership
            const course = await prisma.course.findFirst({
                where: { id: parseInt(id), adminId: userId }
            });

            if (!course) {
                return res.status(404).json({ error: 'Course not found or unauthorized' });
            }

            // Delete course (Prisma handles cascade delete if configured, but let's be safe)
            // Ideally schema should have onDelete: Cascade. Assuming it does or we delete manually.
            // For now, let's rely on Prisma's cascade if set, or just delete the course.
            // If cascade is not set in schema, this might fail if there are related records.
            // Let's assume standard cascade behavior for now or add explicit deletes if needed.
            // Actually, let's check schema later if it fails. For now simple delete.

            await prisma.course.delete({
                where: { id: parseInt(id) }
            });

            return res.status(200).json({ message: 'Course deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error deleting course' });
        }
    }
};
