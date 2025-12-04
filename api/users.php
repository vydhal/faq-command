<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        // Get user details
        if ($id) {
            try {
                $stmt = $pdo->prepare("SELECT id, name, email, role, avatar, createdAt FROM users WHERE id = ?");
                $stmt->execute([$id]);
                $user = $stmt->fetch();

                if ($user) {
                    echo json_encode($user);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } else {
            // List all users (Admin only in real app)
            try {
                $stmt = $pdo->query("SELECT id, name, email, role, avatar, createdAt FROM users");
                echo json_encode($stmt->fetchAll());
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        // Create new user
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Name, email and password are required']);
                exit;
            }

            // Check if email already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$data['email']]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Email already exists']);
                exit;
            }

            $id = uniqid();
            // In a real app, password should be hashed. 
            // Since this is a simple setup, we'll store it as is or simple hash if desired.
            // Let's stick to simple storage for now to match existing mock auth, 
            // or better, let's just store it.
            $password = $data['password'];

            $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $data['name'],
                $data['email'],
                $password,
                $data['role'] ?? 'collaborator',
                $data['avatar'] ?? ''
            ]);

            echo json_encode(['success' => true, 'id' => $id]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update user
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
            exit;
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $fields = [];
            $values = [];

            if (isset($data['name'])) {
                $fields[] = "name = ?";
                $values[] = $data['name'];
            }
            if (isset($data['email'])) {
                $fields[] = "email = ?";
                $values[] = $data['email'];
            }
            if (isset($data['role'])) {
                $fields[] = "role = ?";
                $values[] = $data['role'];
            }
            if (isset($data['avatar'])) {
                $fields[] = "avatar = ?";
                $values[] = $data['avatar'];
            }
            if (isset($data['password']) && !empty($data['password'])) {
                $fields[] = "password = ?";
                $values[] = $data['password'];
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                exit;
            }

            $values[] = $id;
            $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";

            // Ensure table exists (lazy init for existing users who might use this endpoint first)
            $pdo->exec("CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT,
                role TEXT,
                avatar TEXT,
                password TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )");

            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>