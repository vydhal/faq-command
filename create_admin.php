<?php
require_once 'api/db.php';

$email = 'vydhal@gmail.com';
$password = 'Vydhal@112358';
$name = 'Vidal';
$role = 'admin';
$avatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=vidal';

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $existing = $stmt->fetch();

    if ($existing) {
        // Update existing user to be admin and set password
        $stmt = $pdo->prepare("UPDATE users SET password = ?, role = ?, name = ? WHERE email = ?");
        $stmt->execute([$password, $role, $name, $email]);
        echo "User updated successfully. ID: " . $existing['id'] . "\n";
    } else {
        // Create new user
        $id = uniqid();
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $name, $email, $password, $role, $avatar]);
        echo "Admin user created successfully. ID: " . $id . "\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>