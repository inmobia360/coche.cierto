<?php
declare(strict_types=1);

// Proxy same-origin para la API Node alojada en api.cochecierto.com.
// No guarda tokens ni datos: solo reenvía la petición al backend.
$route = $_GET['route'] ?? '';
if (!in_array($route, ['leads', 'verify-email', 'report.pdf', 'share-report', 'shared-report'], true)) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Ruta no encontrada']);
    exit;
}

$target = 'https://api.cochecierto.com/api/' . $route;
$query = $_SERVER['QUERY_STRING'] ?? '';
$query = preg_replace('/(?:^|&)route=[^&]*/', '', $query);
$target .= $query ? '?' . ltrim($query, '&') : '';

$ch = curl_init($target);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'] ?? 'GET',
    CURLOPT_POSTFIELDS => file_get_contents('php://input'),
    CURLOPT_HTTPHEADER => ['Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'application/json')],
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_TIMEOUT => 20,
]);
$body = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'application/json';
$error = curl_error($ch);
curl_close($ch);

if ($body === false || $error) {
    http_response_code(502);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'No se pudo conectar con el servicio de informes']);
    exit;
}
http_response_code($status ?: 502);
header('Content-Type: ' . $type);
echo $body;
