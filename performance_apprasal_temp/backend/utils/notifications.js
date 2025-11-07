import Notification from "../models/Notification.js";

export const createNotification = async (userId, type, message, relatedId = null) => {
    try {
        await Notification.create({
            userId,
            type,
            message,
            relatedId,
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};