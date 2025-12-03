<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $category = $_GET['category'] ?? null;

            $sql = "SELECT * FROM faqs";
            $params = [];

            if ($category) {
                $sql .= " WHERE category = ?";
                $params[] = $category;
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $faqs = $stmt->fetchAll();

            foreach ($faqs as &$faq) {
                $faq['id'] = (string) $faq['id'];
            }

            echo json_encode($faqs);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['question']) || !isset($data['answer'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Question and Answer are required']);
                exit;
            }

            $sql = "INSERT INTO faqs (question, answer, category) VALUES (?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['question'],
                $data['answer'],
                $data['category'] ?? 'Geral'
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
            $sql = "UPDATE faqs SET " . implode(', ', $fields) . " WHERE id = ?";
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

            $stmt = $pdo->prepare("DELETE FROM faqs WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>