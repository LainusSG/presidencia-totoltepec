<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare(
        'SELECT intro_html, nodes_json, pdfs_json, schema_version, updated_at
         FROM transparencia_data
         WHERE id = 1
         LIMIT 1'
    );
    $stmt->execute();
    $row = $stmt->fetch();

    if (!$row) {
        jsonResponse([
            'success' => true,
            'data' => [
                'introHtml' => '',
                'nodes' => [],
            ],
            'pdfs' => [],
            'schemaVersion' => 'v3',
            'updatedAt' => null,
        ]);
    }

    $nodes = json_decode((string) $row['nodes_json'], true);
    $pdfs = json_decode((string) $row['pdfs_json'], true);

    jsonResponse([
        'success' => true,
        'data' => [
            'introHtml' => (string) ($row['intro_html'] ?? ''),
            'nodes' => is_array($nodes) ? $nodes : [],
        ],
        'pdfs' => is_array($pdfs) ? $pdfs : [],
        'schemaVersion' => (string) ($row['schema_version'] ?? 'v3'),
        'updatedAt' => $row['updated_at'] ?? null,
    ]);
} catch (Throwable $error) {
    jsonResponse([
        'success' => false,
        'message' => 'No se pudieron obtener los datos',
        'error' => $error->getMessage(),
    ], 500);
}
