<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dbHost = 'localhost';
$dbName = 'u738236458_Presidencia_tr';
$dbUser = 'u738236458_Admin';
$dbPass = 'Pr3s1d3nc1a2026?*';

function getConnection(): PDO
{
    global $dbHost, $dbName, $dbUser, $dbPass;

    $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";

    return new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

function jsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
