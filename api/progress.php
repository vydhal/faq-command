<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $userId = $_GET['userId'] ?? null;
        $lessonId = $_GET['lessonId'] ?? null;
        $articleId = $_GET['articleId'] ?? null;

        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            break;
        }

        try {
            if ($lessonId) {
                // Check specific lesson status
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM lesson_completions WHERE user_id = ? AND lesson_id = ?");
                $stmt->execute([$userId, $lessonId]);
                echo json_encode(['completed' => $stmt->fetchColumn() > 0]);
            } elseif ($articleId) {
                // Check specific article status
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM article_completions WHERE user_id = ? AND article_id = ?");
                $stmt->execute([$userId, $articleId]);
                echo json_encode(['completed' => $stmt->fetchColumn() > 0]);
            } else {
                // Get all completed lessons and articles for user
                $stmt = $pdo->prepare("SELECT lesson_id FROM lesson_completions WHERE user_id = ?");
                $stmt->execute([$userId]);
                $lessons = $stmt->fetchAll(PDO::FETCH_COLUMN);

                $stmt = $pdo->prepare("SELECT article_id FROM article_completions WHERE user_id = ?");
                $stmt->execute([$userId]);
                $articles = $stmt->fetchAll(PDO::FETCH_COLUMN);

                echo json_encode(['lessons' => $lessons, 'articles' => $articles]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $userId = $data['userId'] ?? null;
        $lessonId = $data['lessonId'] ?? null;
        $articleId = $data['articleId'] ?? null;
        $completed = $data['completed'] ?? true;

        if (!$userId || (!$lessonId && !$articleId)) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID and Lesson/Article ID are required']);
            break;
        }

        try {
            if ($lessonId) {
                if ($completed) {
                    $stmt = $pdo->prepare("INSERT OR IGNORE INTO lesson_completions (user_id, lesson_id) VALUES (?, ?)");
                    $stmt->execute([$userId, $lessonId]);
                } else {
                    $stmt = $pdo->prepare("DELETE FROM lesson_completions WHERE user_id = ? AND lesson_id = ?");
                    $stmt->execute([$userId, $lessonId]);
                }
            } elseif ($articleId) {
                if ($completed) {
                    $stmt = $pdo->prepare("INSERT OR IGNORE INTO article_completions (user_id, article_id) VALUES (?, ?)");
                    $stmt->execute([$userId, $articleId]);
                } else {
                    $stmt = $pdo->prepare("DELETE FROM article_completions WHERE user_id = ? AND article_id = ?");
                    $stmt->execute([$userId, $articleId]);
                }
            }
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>