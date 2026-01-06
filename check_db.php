<?php
require_once 'api/db.php';

echo "Tables in database:\n";
$tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
print_r($tables);

echo "\nUsers count: " . $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn() . "\n";
if (in_array('lessons', $tables)) {
    echo "Lessons count: " . $pdo->query("SELECT COUNT(*) FROM lessons")->fetchColumn() . "\n";
} else {
    echo "Lessons table does NOT exist.\n";
}

if (in_array('lesson_completions', $tables)) {
    echo "Lesson completions count: " . $pdo->query("SELECT COUNT(*) FROM lesson_completions")->fetchColumn() . "\n";
    echo "Sample completions:\n";
    print_r($pdo->query("SELECT * FROM lesson_completions LIMIT 5")->fetchAll(PDO::FETCH_ASSOC));
} else {
    echo "Lesson completions table does NOT exist.\n";
}
?>