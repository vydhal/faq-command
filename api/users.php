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

    case 'PUT':
        // Update user (e.g., avatar)
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
            exit;
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $fields = [];
            $values = [];

            if (isset($data['avatar'])) {
                $fields[] = "avatar = ?";
                $values[] = $data['avatar'];
            }

            if (isset($data['name'])) {
                $fields[] = "name = ?";
                $values[] = $data['name'];
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                exit;
            }

            $values[] = $id;
            $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";

            // Note: In this mock setup, we don't have a real users table in SQLite for auth, 
            // but we might need one for profile updates if we want persistence.
            // However, AuthContext uses mockUsers array. 
            // To make this work with the current setup, we might need to store user profiles in a table 
            // or just update the session/local storage on frontend.
            // But the requirement says "user can change photo".

            // Let's assume we create a users table if it doesn't exist, or we just store "profiles" 
            // linked to the mock IDs.

            // Check if users table exists, if not create it (lazy init)
            $pdo->exec("CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT,
                role TEXT,
                avatar TEXT,
                password TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )");

            // Check if user exists in DB, if not insert from mock data (conceptually)
            // For now, let's just try update, if 0 rows affected, insert.

            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            if ($stmt->rowCount() == 0) {
                // User might not exist in DB yet (since they are mock). Insert them.
                // This is a bit hacky for a mock auth system but works for the requirement.
                if (isset($data['avatar'])) {
                    $stmt = $pdo->prepare("INSERT OR IGNORE INTO users (id, avatar, name, email, role) VALUES (?, ?, ?, ?, ?)");
                    // We don't have all data here, so this is tricky.
                    // Better approach: Frontend sends all user data on first update?
                    // Or we just update the specific field and assume row exists?

                    // Let's just return success and let frontend handle localStorage update for now, 
                    // but for persistence we need a table.

                    // Simplified: Just update/insert into a 'user_profiles' table?
                    // Or just use the 'users' table and require it to be seeded.

                    $stmt = $pdo->prepare("INSERT INTO users (id, avatar, name) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET avatar = excluded.avatar, name = COALESCE(excluded.name, users.name)");
                    $stmt->execute([$id, $data['avatar'], $data['name'] ?? 'User']);
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