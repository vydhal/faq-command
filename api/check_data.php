<?php
require_once 'db.php';

try {
    $tables = ['users', 'courses', 'categories', 'articles', 'lessons', 'announcements', 'settings'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
            echo "$table: " . $stmt->fetchColumn() . "<br>";
        } catch (Exception $e) {
            echo "$table: Error - " . $e->getMessage() . "<br>";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>