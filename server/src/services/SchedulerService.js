const { PrismaClient } = require('@prisma/client');
const { addDays, getDay, format, startOfDay, isBefore } = require('date-fns');

const prisma = new PrismaClient();

class SchedulerService {
    /**
     * Distributes pending tasks for a user starting from a given date.
     * @param {number} userId
     * @param {Date} startDate
     */
    async distributeTasks(userId, startDate = new Date()) {
        // 1. Get User Availability
        const availabilities = await prisma.availability.findMany({
            where: { userId }
        });
        console.log('Availabilities found:', availabilities.length);

        if (availabilities.length === 0) {
            throw new Error('User has no availability set.');
        }

        // Map availability by day of week (0-6)
        const availabilityMap = {};
        availabilities.forEach(a => {
            availabilityMap[a.weekDay] = a.hoursPerDay * 60; // Convert to minutes
        });

        // 2. Get Pending Tasks (ordered by original order)
        // We need to join with Topic to get estimatedMinutes and orderIndex
        const pendingTasks = await prisma.studentTask.findMany({
            where: {
                userId,
                status: 'pending'
            },
            include: {
                topic: true
            },
            orderBy: {
                topic: {
                    orderIndex: 'asc'
                }
            }
        });
        console.log('Pending tasks found:', pendingTasks.length);

        if (pendingTasks.length === 0) {
            return; // Nothing to schedule
        }

        // 3. Distribute Tasks
        let currentDate = startOfDay(startDate);
        let currentTaskIndex = 0;

        // Safety break to avoid infinite loops if availability is weird or too many tasks
        let daysProcessed = 0;
        const MAX_DAYS = 365 * 2; // Schedule up to 2 years ahead

        while (currentTaskIndex < pendingTasks.length && daysProcessed < MAX_DAYS) {
            const dayOfWeek = getDay(currentDate);
            const dailyMinutesAvailable = availabilityMap[dayOfWeek] || 0;

            if (dailyMinutesAvailable > 0) {
                let minutesUsedToday = 0;

                // Try to fit tasks into today
                while (currentTaskIndex < pendingTasks.length) {
                    const task = pendingTasks[currentTaskIndex];
                    const taskDuration = task.topic.estimatedMinutes;

                    if (minutesUsedToday + taskDuration <= dailyMinutesAvailable) {
                        // Schedule this task for today
                        await prisma.studentTask.update({
                            where: { id: task.id },
                            data: { scheduledDate: currentDate }
                        });

                        minutesUsedToday += taskDuration;
                        currentTaskIndex++;
                    } else {
                        // If the task is huge (bigger than daily availability), we schedule it alone on this day
                        // OR if we just ran out of space, we stop for today.
                        // For simplicity: if it doesn't fit, move to next day.
                        // EXCEPT if it's the FIRST task of the day and it doesn't fit, we must schedule it or we loop forever.
                        if (minutesUsedToday === 0) {
                            // Task is larger than daily capacity. Schedule it anyway to avoid blocking.
                            await prisma.studentTask.update({
                                where: { id: task.id },
                                data: { scheduledDate: currentDate }
                            });
                            currentTaskIndex++;
                        }
                        break; // Move to next day
                    }
                }
            }

            currentDate = addDays(currentDate, 1);
            daysProcessed++;
        }
    }

    /**
     * Recalculates schedule for delayed tasks.
     * @param {number} userId
     */
    async recalculateSchedule(userId) {
        const today = startOfDay(new Date());

        // Find all pending tasks that were scheduled in the past (overdue)
        // OR tasks that are pending and have no date yet (just in case)
        // Actually, the requirement is: "Detecta itens em StudentTasks onde scheduled_date < HOJE e redistribui tudo a partir de hoje"

        // We will simply take ALL 'pending' tasks and reschedule them starting from today.
        // This overwrites future scheduled dates too, which keeps the queue consistent.

        await this.distributeTasks(userId, today);
    }
}

module.exports = new SchedulerService();
