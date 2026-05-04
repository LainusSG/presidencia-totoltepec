<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse([
            'success' => false,
            'message' => 'Metodo no permitido',
        ], 405);
    }

    $payload = json_decode((string) file_get_contents('php://input'), true);

    if (!is_array($payload)) {
        jsonResponse([
            'success' => false,
            'message' => 'JSON invalido',
        ], 400);
    }

    $data = is_array($payload['data'] ?? null) ? $payload['data'] : [];
    $introHtml = is_string($data['introHtml'] ?? null) ? $data['introHtml'] : '';
    $nodes = is_array($data['nodes'] ?? null) ? $data['nodes'] : [];
    $pdfs = is_array($payload['pdfs'] ?? null) ? $payload['pdfs'] : [];

    $nodesJson = json_encode($nodes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $pdfsJson = json_encode($pdfs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($nodesJson === false || $pdfsJson === false) {
        jsonResponse([
            'success' => false,
            'message' => 'No se pudo codificar la informacion',
        ], 400);
    }

    $pdo = getConnection();
    $stmt = $pdo->prepare(
        "INSERT INTO transparencia_data (id, intro_html, nodes_json, pdfs_json, schema_version)
         VALUES (1, :intro_html, :nodes_json, :pdfs_json, 'v3')
         ON DUPLICATE KEY UPDATE
            intro_html = VALUES(intro_html),
            nodes_json = VALUES(nodes_json),
            pdfs_json = VALUES(pdfs_json),
            schema_version = VALUES(schema_version)"
    );
    $stmt->execute([
        ':intro_html' => $introHtml,
        ':nodes_json' => $nodesJson,
        ':pdfs_json' => $pdfsJson,
    ]);

    jsonResponse([
        'success' => true,
        'message' => 'Datos guardados',
    ]);
} catch (Throwable $error) {
    jsonResponse([
        'success' => false,
        'message' => 'No se pudieron guardar los datos',
        'error' => $error->getMessage(),
    ], 500);
}
