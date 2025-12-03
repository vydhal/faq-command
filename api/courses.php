<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $categoryId = $_GET['categoryId'] ?? null;
            $userId = $_GET['userId'] ?? null;

            $sql = "SELECT * FROM courses";
            $params = [];

            if ($categoryId) {
                $sql .= " WHERE categoryId = ?";
                $params[] = $categoryId;
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $courses = $stmt->fetchAll();

            // Convert types to match frontend
            foreach ($courses as &$course) {
                $course['id'] = (string) $course['id'];
                $course['categoryId'] = (string) $course['categoryId'];
                $course['lessonsCount'] = (int) $course['lessonsCount'];

                // Calculate progress if user is logged in
                if ($userId) {
                    $stmt = $pdo->prepare("
                        SELECT COUNT(DISTINCT l.id) 
                        FROM lessons l
                        JOIN lesson_completions lc ON l.id = lc.lesson_id
                        WHERE l.course_id = ? AND lc.user_id = ?
                    ");
                    $stmt->execute([$course['id'], $userId]);
                    $completedCount = $stmt->fetchColumn();

                    if ($course['lessonsCount'] > 0) {
                        $course['progress'] = round(($completedCount / $course['lessonsCount']) * 100);
                    } else {
                        $course['progress'] = 0;
                    }
                } else {
                    $course['progress'] = (int) $course['progress'];
                }
            }

            echo json_encode($courses);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['title']) || !isset($data['categoryId'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title and Category ID are required']);
                exit;
            }

            $sql = "INSERT INTO courses (title, description, thumbnail, categoryId, duration, lessonsCount, progress, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['title'],
                $data['description'] ?? '',
                $data['thumbnail'] ?? '',
                $data['categoryId'],
                $data['duration'] ?? '0h',
                $data['lessonsCount'] ?? 0,
                $data['progress'] ?? 0,
                $data['status'] ?? 'draft'
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

            // Allow updating any field
            foreach ($data as $key => $value) {
                if ($key !== 'id') {
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
            $sql = "UPDATE courses SET " . implode(', ', $fields) . " WHERE id = ?";
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

            $stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>