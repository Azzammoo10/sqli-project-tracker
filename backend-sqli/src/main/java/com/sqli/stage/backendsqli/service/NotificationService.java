package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.NotificationDTO.NotificationResponse;

import java.util.List;

public interface NotificationService {
    void notifyTaskAssigned(int userId, int taskId);
    void notifyTaskBlocked(int projectManagerId, int taskId);
    List<NotificationResponse> getNotificationsForCurrentUser();
    void markNotificationAsRead(int notificationId);
}
