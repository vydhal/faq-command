<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

try {
    // Get total counts
    $totalCourses = $pdo->query("SELECT COUNT(*) FROM courses")->fetchColumn();
    $totalArticles = $pdo->query("SELECT COUNT(*) FROM articles")->fetchColumn();
    $totalLessons = $pdo->query("SELECT COUNT(*) FROM lessons")->fetchColumn();

    // Fetch real users (collaborators)
    $stmt = $pdo->prepare("SELECT id, name, avatar FROM users WHERE role = 'collaborator'");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $metrics = [];

    foreach ($users as $user) {
        $userId = $user['id'];

        // Get completed lessons count
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM lesson_completions WHERE user_id = ?");
        $stmt->execute([$userId]);
        $completedLessons = $stmt->fetchColumn();

        // Get completed articles
        // We check lessons of type 'article' that are completed
        $stmt = $pdo->prepare("
            SELECT COUNT(*) 
            FROM lesson_completions lc
            JOIN lessons l ON lc.lesson_id = l.id
            WHERE lc.user_id = ? AND l.type = 'article'
        ");
        $stmt->execute([$userId]);
        $completedArticles = $stmt->fetchColumn();

        $metrics[] = [
            'userId' => $userId,
            'userName' => $user['name'],
            'userAvatar' => $user['avatar'],
            'totalCourses' => (int) $totalCourses,
            'completedCourses' => 0, // Placeholder
            'totalArticles' => (int) $totalArticles,
            'completedArticles' => (int) $completedArticles,
            'averageScore' => 0,
            'lastActivity' => date('Y-m-d'), // Placeholder
            'totalCompletedLessons' => (int) $completedLessons,
            'totalLessons' => (int) $totalLessons
        ];
    }

    echo json_encode([
        'metrics' => $metrics,
        'totalUsers' => count($users),
        'totalCourses' => (int) $totalCourses,
        'totalArticles' => (int) $totalArticles
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>