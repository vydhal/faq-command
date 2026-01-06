<?php
require_once 'db.php';

try {
    // Categories Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT
    )");

    // Courses Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail TEXT,
        categoryId INTEGER,
        duration TEXT,
        lessonsCount INTEGER,
        progress INTEGER DEFAULT 0,
        status TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
    )");

    // Articles Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        excerpt TEXT,
        thumbnail TEXT,
        categoryId INTEGER,
        courseId INTEGER,
        readTime TEXT,
        isCompleted INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        FOREIGN KEY (courseId) REFERENCES courses(id)
    )");

    // FAQs Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT,
        category TEXT,
        order_index INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Lessons Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )");

    // Settings Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT
    )");

    // Lesson Completions Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS lesson_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        lesson_id INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_id),
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    )");

    // Article Completions Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS article_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        article_id INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, article_id),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    )");

    echo "Tables created successfully.<br>";

    // Check if categories exist, if not seed them
    $stmt = $pdo->query("SELECT COUNT(*) FROM categories");
    if ($stmt->fetchColumn() == 0) {
        $categories = [
            ['Desenvolvimento', 'Cursos de programação e desenvolvimento de software', 'Code', 'primary'],
            ['Marketing', 'Estratégias de marketing digital e vendas', 'TrendingUp', 'accent'],
            ['Design', 'UI/UX, design gráfico e criatividade', 'Palette', 'warning'],
            ['Liderança', 'Gestão de equipes e desenvolvimento pessoal', 'Users', 'success']
        ];

        $stmt = $pdo->prepare("INSERT INTO categories (name, description, icon, color) VALUES (?, ?, ?, ?)");
        foreach ($categories as $cat) {
            $stmt->execute($cat);
        }
        echo "Categories seeded.<br>";

        // Seed Courses
        $courses = [
            ['React do Zero ao Avançado', 'Aprenda React.js do básico ao avançado', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop', 1, '40h', 120, 75, 'published'],
            ['Marketing Digital Completo', 'Domine as estratégias de marketing', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop', 2, '25h', 80, 30, 'published'],
            ['UI/UX Design Masterclass', 'Crie interfaces incríveis', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop', 3, '30h', 95, 0, 'published']
        ];

        $stmt = $pdo->prepare("INSERT INTO courses (title, description, thumbnail, categoryId, duration, lessonsCount, progress, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($courses as $course) {
            $stmt->execute($course);
        }
        echo "Courses seeded.<br>";

        // Seed Articles
        $articles = [
            ['Introdução ao React Hooks', '<h2>O que são React Hooks?</h2><p>React Hooks são funções...</p>', 'Aprenda os fundamentos dos React Hooks', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop', 1, 1, '8 min', 1],
            ['SEO para Iniciantes', '<h2>O que é SEO?</h2><p>Search Engine Optimization...</p>', 'Descubra as técnicas essenciais de SEO', 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=450&fit=crop', 2, 2, '12 min', 0]
        ];

        $stmt = $pdo->prepare("INSERT INTO articles (title, content, excerpt, thumbnail, categoryId, courseId, readTime, isCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($articles as $article) {
            $stmt->execute($article);
        }
        echo "Articles seeded.<br>";

        // Seed FAQs
        $faqs = [
            ['Como acessar os cursos?', 'Após fazer login, vá até a seção "Meus Cursos".', 'Acesso'],
            ['Como obter certificado?', 'O certificado é gerado automaticamente após completar 100%.', 'Certificados']
        ];

        $stmt = $pdo->prepare("INSERT INTO faqs (question, answer, category) VALUES (?, ?, ?)");
        foreach ($faqs as $faq) {
            $stmt->execute($faq);
        }
        echo "FAQs seeded.<br>";
    }

    // Seed Settings (always check)
    $stmt = $pdo->query("SELECT COUNT(*) FROM settings");
    if ($stmt->fetchColumn() == 0) {
        $defaultSettings = [
            ['app_name', ''],
            ['primary_color', '#0f172a'],
            ['logo_url', ''],
            ['favicon_url', '']
        ];
        $stmt = $pdo->prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
        foreach ($defaultSettings as $setting) {
            $stmt->execute($setting);
        }
        echo "Settings seeded.<br>";
    }

    echo "Database setup complete.";

} catch (PDOException $e) {
    die("Error setup db: " . $e->getMessage());
}
?>