<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $courseId = $_GET['courseId'] ?? null;
            $categoryId = $_GET['categoryId'] ?? null;
            $userId = $_GET['userId'] ?? null;

            $sql = "SELECT * FROM articles";
            $params = [];
            $conditions = [];

            if ($courseId) {
                $conditions[] = "courseId = ?";
                $params[] = $courseId;
            }

            if ($categoryId) {
                $conditions[] = "categoryId = ?";
                $params[] = $categoryId;
            }

            if (!empty($conditions)) {
                $sql .= " WHERE " . implode(' AND ', $conditions);
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $articles = $stmt->fetchAll();

            // Convert types
            foreach ($articles as &$article) {
                $article['id'] = (string) $article['id'];
                $article['categoryId'] = (string) $article['categoryId'];
                $article['courseId'] = (string) $article['courseId'];

                if ($userId) {
                    $stmt = $pdo->prepare("SELECT COUNT(*) FROM article_completions WHERE user_id = ? AND article_id = ?");
                    $stmt->execute([$userId, $article['id']]);
                    $article['isCompleted'] = $stmt->fetchColumn() > 0;
                } else {
                    $article['isCompleted'] = (bool) $article['isCompleted'];
                }
            }

            echo json_encode($articles);
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

            $sql = "INSERT INTO articles (title, content, excerpt, thumbnail, categoryId, courseId, readTime, isCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['title'],
                $data['content'] ?? '',
                $data['excerpt'] ?? '',
                $data['thumbnail'] ?? '',
                $data['categoryId'],
                $data['courseId'] ?? null,
                $data['readTime'] ?? '5 min',
                $data['isCompleted'] ?? 0
            ]);

            $id = $pdo->lastInsertId();
            $data['id'] = (string) $id;

            // Create Notification
            require_once 'notification_helper.php';
            createNotification(
                $pdo,
                null, // Global notification
                'Novo Artigo: ' . $data['title'],
                'Leia o novo artigo disponível na biblioteca.',
                'article',
                '/articles'
            );

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
            $sql = "UPDATE articles SET " . implode(', ', $fields) . " WHERE id = ?";
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

            $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>