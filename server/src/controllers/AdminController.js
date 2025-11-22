const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    async createCourse(req, res) {
        try {
            const { title, description, subjects } = req.body;

            // Validate input
            if (!title || !subjects || !Array.isArray(subjects)) {
                return res.status(400).json({ error: 'Invalid input format' });
            }

            // Create Course with nested Subjects and Topics
            const course = await prisma.course.create({
                data: {
                    title,
                    description,
                    subjects: {
                        create: subjects.map(subject => ({
                            name: subject.name,
                            color: subject.color,
                            weight: subject.weight,
                            topics: {
                                create: subject.topics.map((topic, index) => ({
                                    name: topic.name,
                                    estimatedMinutes: topic.estimatedMinutes,
                                    orderIndex: index // Automatically assign order based on array position
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
            console.error('Error creating course:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
