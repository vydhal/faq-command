<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            // Get categories with course count
            $sql = "SELECT c.*, (SELECT COUNT(*) FROM courses co WHERE co.categoryId = c.id) as coursesCount 
                    FROM categories c";
            $stmt = $pdo->query($sql);
            $categories = $stmt->fetchAll();

            // Convert IDs to strings to match frontend types
            foreach ($categories as &$cat) {
                $cat['id'] = (string) $cat['id'];
            }

            echo json_encode($categories);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Name is required']);
                exit;
            }

            $sql = "INSERT INTO categories (name, description, icon, color) VALUES (?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['name'],
                $data['description'] ?? '',
                $data['icon'] ?? 'Code',
                $data['color'] ?? 'primary'
            ]);

            $id = $pdo->lastInsertId();

            echo json_encode([
                'id' => (string) $id,
                'name' => $data['name'],
                'description' => $data['description'] ?? '',
                'icon' => $data['icon'] ?? 'Code',
                'color' => $data['color'] ?? 'primary',
                'coursesCount' => 0
            ]);
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

            $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true]);
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

            if (isset($data['name'])) {
                $fields[] = "name = ?";
                $values[] = $data['name'];
            }
            if (isset($data['description'])) {
                $fields[] = "description = ?";
                $values[] = $data['description'];
            }
            if (isset($data['icon'])) {
                $fields[] = "icon = ?";
                $values[] = $data['icon'];
            }
            if (isset($data['color'])) {
                $fields[] = "color = ?";
                $values[] = $data['color'];
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                exit;
            }

            $values[] = $id;
            $sql = "UPDATE categories SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>