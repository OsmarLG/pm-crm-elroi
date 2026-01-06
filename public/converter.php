<?php
// public/converter.php
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$inputTs  = __DIR__ . '/stores.ts';     // archivo TS original
$outputJs = __DIR__ . '/stores.json';   // JSON final
$debugTxt = __DIR__ . '/debug.txt';     // salida intermedia para debug

echo "🚀 Iniciando conversión TS -> JSON ...\n";

if (!is_file($inputTs)) {
    http_response_code(404);
    echo "❌ No existe stores.ts en: {$inputTs}\n";
    exit;
}

$src = file_get_contents($inputTs);
if ($src === false) {
    http_response_code(500);
    echo "❌ No pude leer stores.ts\n";
    exit;
}

/**
 * Extrae el primer array literal [...] respetando strings.
 */
function extractFirstArrayLiteral(string $s): string
{
    $len = strlen($s);
    $start = strpos($s, '[');
    if ($start === false) {
        throw new RuntimeException("No encontré '[' en el archivo.");
    }

    $out = '';
    $depth = 0;
    $inStr = false;
    $quote = '';
    $escaped = false;

    for ($i = $start; $i < $len; $i++) {
        $ch = $s[$i];
        $out .= $ch;

        if ($inStr) {
            if ($escaped) { $escaped = false; continue; }
            if ($ch === '\\') { $escaped = true; continue; }
            if ($ch === $quote) { $inStr = false; $quote = ''; }
            continue;
        }

        if ($ch === '"' || $ch === "'") {
            $inStr = true;
            $quote = $ch;
            continue;
        }

        if ($ch === '[') $depth++;
        if ($ch === ']') {
            $depth--;
            if ($depth === 0) return $out;
        }
    }

    throw new RuntimeException("No pude cerrar correctamente el array ']'.");
}

/**
 * Elimina comentarios // y /* */ /*respetando strings. */
function stripJsComments(string $s): string
{
    $len = strlen($s);
    $out = '';
    $inStr = false;
    $quote = '';
    $escaped = false;

    for ($i = 0; $i < $len; $i++) {
        $ch = $s[$i];
        $next = $i + 1 < $len ? $s[$i + 1] : '';

        if ($inStr) {
            $out .= $ch;
            if ($escaped) { $escaped = false; continue; }
            if ($ch === '\\') { $escaped = true; continue; }
            if ($ch === $quote) { $inStr = false; $quote = ''; }
            continue;
        }

        if ($ch === '"' || $ch === "'") {
            $inStr = true;
            $quote = $ch;
            $out .= $ch;
            continue;
        }

        if ($ch === '/' && $next === '/') {
            while ($i < $len && $s[$i] !== "\n") $i++;
            $out .= "\n";
            continue;
        }

        if ($ch === '/' && $next === '*') {
            $i += 2;
            while ($i + 1 < $len && !($s[$i] === '*' && $s[$i + 1] === '/')) $i++;
            $i++;
            continue;
        }

        $out .= $ch;
    }

    return $out;
}

/**
 * Elimina trailing commas ( , } y , ] )
 */
function removeTrailingCommas(string $s): string
{
    for ($i = 0; $i < 6; $i++) {
        $s2 = preg_replace('/,\s*([}\]])/', '$1', $s);
        if ($s2 === $s || $s2 === null) break;
        $s = $s2;
    }
    return $s;
}

/**
 * Convierte strings con '...' a "..."
 */
function singleQuotesToDoubleInStrings(string $s): string
{
    $len = strlen($s);
    $out = '';
    $inStr = false;
    $quote = '';
    $escaped = false;

    for ($i = 0; $i < $len; $i++) {
        $ch = $s[$i];

        if ($inStr) {
            if ($escaped) {
                $out .= $ch;
                $escaped = false;
                continue;
            }
            if ($ch === '\\') {
                $out .= $ch;
                $escaped = true;
                continue;
            }
            if ($ch === $quote) {
                $out .= '"';
                $inStr = false;
                $quote = '';
                continue;
            }
            if ($quote === "'" && $ch === '"') {
                $out .= '\\"';
                continue;
            }
            $out .= $ch;
            continue;
        }

        if ($ch === "'" || $ch === '"') {
            $inStr = true;
            $quote = $ch;
            $out .= '"';
            continue;
        }

        $out .= $ch;
    }

    return $out;
}

/**
 * AGREGA COMILLAS A KEYS NO COMILLADAS
 * thursday: -> "thursday":
 */
function quoteUnquotedObjectKeys(string $s): string
{
    return preg_replace(
        '/([{\s,])([A-Za-z_\$][A-Za-z0-9_\$]*)\s*:/',
        '$1"$2":',
        $s
    ) ?? $s;
}

try {
    $arrayLiteral = extractFirstArrayLiteral($src);

    $clean = stripJsComments($arrayLiteral);
    $clean = removeTrailingCommas($clean);
    $clean = singleQuotesToDoubleInStrings($clean);
    $clean = quoteUnquotedObjectKeys($clean);
    $clean = preg_replace('/\bundefined\b/', 'null', $clean) ?? $clean;

    file_put_contents($debugTxt, $clean);

    $data = json_decode($clean, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        echo "❌ Error JSON: " . json_last_error_msg() . " (ver debug.txt)\n";
        exit;
    }

    $json = json_encode(
        $data,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    file_put_contents($outputJs, $json);

    echo "✅ Conversión exitosa\n";
    echo "📄 Archivo generado: stores.json\n";
    echo "📦 Registros: " . count($data) . "\n";
    echo "🧪 Debug: debug.txt\n";

} catch (Throwable $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}