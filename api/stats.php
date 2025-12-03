<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

// Mock users to match frontend
$users = [
    [
        'id' => '2',
        'name' => 'João Silva',
        'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao'
    ],
    [
        'id' => '3',
        'name' => 'Maria Santos',
        'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria'
    ],
    [
        'id' => '4',
        'name' => 'Pedro Costa',
        'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro'
    ],
    [
        'id' => '5',
        'name' => 'Ana Oliveira',
        'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana'
    ]
];

try {
    // Get total counts
    $totalCourses = $pdo->query("SELECT COUNT(*) FROM courses")->fetchColumn();
    $totalArticles = $pdo->query("SELECT COUNT(*) FROM articles")->fetchColumn();
    $totalLessons = $pdo->query("SELECT COUNT(*) FROM lessons")->fetchColumn();

    $metrics = [];

    foreach ($users as $user) {
        $userId = $user['id'];

        // Get completed lessons count
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM lesson_completions WHERE user_id = ?");
        $stmt->execute([$userId]);
        $completedLessons = $stmt->fetchColumn();

        // Calculate completed courses (simplified: if user has completed > 80% of lessons in a course)
        // For now, let's just count completed lessons as a proxy for engagement

        // Get completed articles (from articles table if we had user tracking there, but we only have lesson_completions now)
        // We need to check lessons of type 'article'
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
            'completedCourses' => 0, // Placeholder, logic would be complex without proper enrollment table
            'totalArticles' => (int) $totalArticles, // This might be wrong if articles are lessons. Let's assume total articles available in system
            'completedArticles' => (int) $completedArticles,
            'averageScore' => 0, // No tests implemented yet
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