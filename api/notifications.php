<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_GET['userId'] ?? null;

switch ($method) {
    case 'GET':
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            exit;
        }

        try {
            // Get notifications:
            // 1. Targeted specifically to the user
            // 2. Global notifications (user_id IS NULL) that haven't been read by this user
            $sql = "
                SELECT n.*, 
                       CASE 
                           WHEN n.user_id IS NOT NULL THEN n.is_read 
                           ELSE (SELECT COUNT(*) FROM notification_reads nr WHERE nr.notification_id = n.id AND nr.user_id = ?)
                       END as is_read_status
                FROM notifications n
                WHERE (n.user_id = ? OR n.user_id IS NULL)
                ORDER BY n.created_at DESC
                LIMIT 50
            ";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([$userId, $userId]);
            $notifications = $stmt->fetchAll();

            // Filter out read global notifications if you only want unread or handle it in frontend
            // For now returning all, frontend can filter

            foreach ($notifications as &$notification) {
                $notification['id'] = (string) $notification['id'];
                $notification['is_read'] = (bool) $notification['is_read_status'];
                unset($notification['is_read_status']);
            }

            echo json_encode($notifications);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            // Mark as read
            if (isset($data['action']) && $data['action'] === 'mark_read') {
                if (!$userId || !isset($data['notificationId'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'User ID and Notification ID required']);
                    exit;
                }

                // Check if it's a personal or global notification
                $stmt = $pdo->prepare("SELECT user_id FROM notifications WHERE id = ?");
                $stmt->execute([$data['notificationId']]);
                $notif = $stmt->fetch();

                if ($notif) {
                    if ($notif['user_id']) {
                        // Personal: Update directly
                        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
                        $stmt->execute([$data['notificationId'], $userId]);
                    } else {
                        // Global: Insert into notification_reads
                        $stmt = $pdo->prepare("INSERT OR IGNORE INTO notification_reads (user_id, notification_id) VALUES (?, ?)");
                        $stmt->execute([$userId, $data['notificationId']]);
                    }
                    echo json_encode(['success' => true]);
                    exit;
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Notification not found']);
                    exit;
                }
            }

            // Mark ALL as read
            if (isset($data['action']) && $data['action'] === 'mark_all_read') {
                if (!$userId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'User ID required']);
                    exit;
                }

                // 1. Mark personal notifications
                $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
                $stmt->execute([$userId]);

                // 2. Mark global notifications (insert into reads for all unread globals)
                $sql = "
                    INSERT OR IGNORE INTO notification_reads (user_id, notification_id)
                    SELECT ?, id FROM notifications WHERE user_id IS NULL
                ";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$userId]);

                echo json_encode(['success' => true]);
                exit;
            }

            // Create Notification (Internal use mostly, but exposed for admin testing)
            // In a real app, you'd protect this with admin check
            if (!isset($data['title']) || !isset($data['message'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title and Message are required']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['userId'] ?? null, // Null for global
                $data['title'],
                $data['message'],
                $data['type'] ?? 'system',
                $data['link'] ?? null
            ]);

            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>