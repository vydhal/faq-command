<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    if ($user && $user['password'] === $data['password']) {
        // Password match (plain text for now as per previous setup)
        // Remove password from response
        unset($user['password']);

        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>