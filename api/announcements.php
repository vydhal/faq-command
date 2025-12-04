<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_GET['userId'] ?? null;

switch ($method) {
    case 'GET':
        try {
            if ($userId) {
                // Get announcements for a user (including read status)
                $sql = "
                    SELECT a.*, 
                           CASE WHEN ar.read_at IS NOT NULL THEN 1 ELSE 0 END as is_read
                    FROM announcements a
                    LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = ?
                    ORDER BY a.created_at DESC
                ";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$userId]);
                $announcements = $stmt->fetchAll();

                // Convert types
                foreach ($announcements as &$announcement) {
                    $announcement['id'] = (string) $announcement['id'];
                    $announcement['is_read'] = (bool) $announcement['is_read'];
                }
                echo json_encode($announcements);
            } else {
                // Admin: List all announcements
                $stmt = $pdo->query("SELECT * FROM announcements ORDER BY created_at DESC");
                $announcements = $stmt->fetchAll();
                foreach ($announcements as &$announcement) {
                    $announcement['id'] = (string) $announcement['id'];
                }
                echo json_encode($announcements);
            }
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
                $uid = $userId ?? $data['userId'] ?? null;

                if (!$uid || !isset($data['announcementId'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'User ID and Announcement ID required']);
                    exit;
                }

                $stmt = $pdo->prepare("INSERT OR IGNORE INTO announcement_reads (user_id, announcement_id) VALUES (?, ?)");
                $stmt->execute([$uid, $data['announcementId']]);
                echo json_encode(['success' => true]);
                exit;
            }

            // Create Announcement (Admin)
            if (!isset($data['title']) || !isset($data['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title and Content are required']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO announcements (title, content, priority) VALUES (?, ?, ?)");
            $stmt->execute([
                $data['title'],
                $data['content'],
                $data['priority'] ?? 'normal'
            ]);

            $id = $pdo->lastInsertId();
            $data['id'] = (string) $id;
            $data['created_at'] = date('Y-m-d H:i:s');

            echo json_encode($data);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit;
            }

            $fields = [];
            $values = [];

            foreach ($data as $key => $value) {
                if ($key !== 'id' && $key !== 'created_at') {
                    $fields[] = "$key = ?";
                    $values[] = $value;
                }
            }
            $fields[] = "updated_at = CURRENT_TIMESTAMP";

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                exit;
            }

            $values[] = $id;
            $sql = "UPDATE announcements SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>