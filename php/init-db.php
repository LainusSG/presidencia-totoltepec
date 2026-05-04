<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

try {
    $pdo = getConnection();

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS transparencia_data (
            id INT NOT NULL AUTO_INCREMENT,
            intro_html LONGTEXT NULL,
            nodes_json LONGTEXT NOT NULL,
            pdfs_json LONGTEXT NOT NULL,
            schema_version VARCHAR(20) NOT NULL DEFAULT 'v3',
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $stmt = $pdo->query('SELECT COUNT(*) AS total FROM transparencia_data WHERE id = 1');
    $exists = (int) ($stmt->fetch()['total'] ?? 0) > 0;

    if (!$exists) {
        $insert = $pdo->prepare(
            "INSERT INTO transparencia_data (id, intro_html, nodes_json, pdfs_json, schema_version)
             VALUES (1, '', '[]', '[]', 'v3')"
        );
        $insert->execute();
    }

    jsonResponse([
        'success' => true,
        'message' => 'Base de datos lista',
    ]);
} catch (Throwable $error) {
    jsonResponse([
        'success' => false,
        'message' => 'No se pudo inicializar la base de datos',
        'error' => $error->getMessage(),
    ], 500);
}
