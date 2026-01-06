<?php
function createNotification($pdo, $userId, $title, $message, $type, $link = null)
{
    try {
        $stmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $title, $message, $type, $link]);
    } catch (PDOException $e) {
        // Silently fail or log error, don't break the main request
        error_log("Failed to create notification: " . $e->getMessage());
    }
}
?>