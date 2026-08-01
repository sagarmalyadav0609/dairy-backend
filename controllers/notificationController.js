import Notification from '../models/Notification.js';

// @desc    Get all notifications (unread first)
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ read: 1, createdAt: -1 }).limit(50);
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
