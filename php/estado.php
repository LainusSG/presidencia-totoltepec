<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare(
        'SELECT id, CHAR_LENGTH(intro_html) AS intro_length,
                CHAR_LENGTH(nodes_json) AS nodes_length,
                CHAR_LENGTH(pdfs_json) AS pdfs_length,
                schema_version, updated_at
         FROM transparencia_data
         WHERE id = 1
         LIMIT 1'
    );
    $stmt->execute();
    $row = $stmt->fetch();

    jsonResponse([
        'success' => true,
        'exists' => (bool) $row,
        'row' => $row ?: null,
    ]);
} catch (Throwable $error) {
    jsonResponse([
        'success' => false,
        'message' => 'No se pudo consultar la base de datos',
        'error' => $error->getMessage(),
    ], 500);
}
