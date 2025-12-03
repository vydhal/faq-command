<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $courseId = $_GET['courseId'] ?? null;

            if (!$courseId) {
                http_response_code(400);
                echo json_encode(['error' => 'Course ID is required']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC");
            $stmt->execute([$courseId]);
            $lessons = $stmt->fetchAll();

            // Convert types
            foreach ($lessons as &$lesson) {
                $lesson['id'] = (string) $lesson['id'];
                $lesson['course_id'] = (string) $lesson['course_id'];
                $lesson['order_index'] = (int) $lesson['order_index'];
            }

            echo json_encode($lessons);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['course_id']) || !isset($data['title']) || !isset($data['type']) || !isset($data['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit;
            }

            $sql = "INSERT INTO lessons (course_id, title, type, content, order_index) VALUES (?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['course_id'],
                $data['title'],
                $data['type'],
                $data['content'],
                $data['order_index'] ?? 0
            ]);

            $id = $pdo->lastInsertId();
            $data['id'] = (string) $id;

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
                if ($key !== 'id' && $key !== 'course_id') { // Don't allow changing course_id via simple PUT
                    $fields[] = "$key = ?";
                    $values[] = $value;
                }
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                exit;
            }

            $values[] = $id;
            $sql = "UPDATE lessons SET " . implode(', ', $fields) . " WHERE id = ?";
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

            $stmt = $pdo->prepare("DELETE FROM lessons WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>