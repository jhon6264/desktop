<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Vary: Origin");

require_once "config.php";

date_default_timezone_set("Asia/Shanghai");

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_SECONDS = 300;
const KNOWLEDGE_CACHE_SECONDS = 3600;
const CONVERSATION_TTL_SECONDS = 3600;
const MAX_HISTORY_MESSAGES = 10;
const MAX_OUTPUT_TOKENS = 220;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_FALLBACK_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
];

$allowedOrigins = [
    "https://jhon6264.github.io",
    "https://jhon6264.github.io/desktop",
    "https://jcrpbot.gt.tc",
    "https://www.jcrpbot.gt.tc",
    "http://localhost",
    "http://localhost:80",
    "http://localhost:8080",
    "http://localhost:5500",
    "http://127.0.0.1",
    "http://127.0.0.1:80",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5500",
];

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
} elseif ($origin) {
    http_response_code(403);
    echo json_encode(["error" => "This origin is not allowed"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if (!in_array($_SERVER["REQUEST_METHOD"], ["GET", "POST"], true)) {
    http_response_code(405);
    echo json_encode(["error" => "Only GET and POST requests are allowed"]);
    exit;
}

function ensureDirectory(string $path): void
{
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
    }
}

function getClientIp(): string
{
    if (!empty($_SERVER["HTTP_CF_CONNECTING_IP"])) {
        return $_SERVER["HTTP_CF_CONNECTING_IP"];
    }

    if (!empty($_SERVER["HTTP_X_FORWARDED_FOR"])) {
        return trim(explode(",", $_SERVER["HTTP_X_FORWARDED_FOR"])[0]);
    }

    return $_SERVER["REMOTE_ADDR"] ?? "unknown";
}

function enforceRateLimit(string $cacheDir): array
{
    ensureDirectory($cacheDir);

    $file = $cacheDir . "/rate-limit.json";
    $now = time();
    $clientKey = hash("sha256", getClientIp());
    $handle = fopen($file, "c+");

    if (!$handle) {
        http_response_code(500);
        echo json_encode(["error" => "Rate limit storage is unavailable"]);
        exit;
    }

    flock($handle, LOCK_EX);
    rewind($handle);
    $raw = stream_get_contents($handle);
    $data = json_decode($raw ?: "{}", true);
    if (!is_array($data)) {
        $data = [];
    }

    foreach ($data as $key => $timestamps) {
        $timestamps = is_array($timestamps) ? $timestamps : [];
        $data[$key] = array_values(array_filter($timestamps, function ($timestamp) use ($now) {
            return is_int($timestamp) && ($now - $timestamp) < RATE_LIMIT_WINDOW_SECONDS;
        }));

        if (!$data[$key]) {
            unset($data[$key]);
        }
    }

    $requests = $data[$clientKey] ?? [];
    if (count($requests) >= RATE_LIMIT_MAX_REQUESTS) {
        $oldest = min($requests);
        $retryAfter = max(1, RATE_LIMIT_WINDOW_SECONDS - ($now - $oldest));

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($data));
        fflush($handle);
        flock($handle, LOCK_UN);
        fclose($handle);

        http_response_code(429);
        header("Retry-After: " . $retryAfter);
        echo json_encode([
            "error" => "Too many messages. Please wait before sending another one.",
            "retry_after" => $retryAfter,
            "rate_limit" => [
                "used" => RATE_LIMIT_MAX_REQUESTS,
                "remaining" => 0,
                "max" => RATE_LIMIT_MAX_REQUESTS,
                "window_seconds" => RATE_LIMIT_WINDOW_SECONDS,
                "display" => "0/" . RATE_LIMIT_MAX_REQUESTS,
            ],
        ]);
        exit;
    }

    $requests[] = $now;
    $data[$clientKey] = $requests;
    $used = count($requests);

    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($data));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    return [
        "used" => $used,
        "remaining" => max(0, RATE_LIMIT_MAX_REQUESTS - $used),
        "max" => RATE_LIMIT_MAX_REQUESTS,
        "window_seconds" => RATE_LIMIT_WINDOW_SECONDS,
        "display" => max(0, RATE_LIMIT_MAX_REQUESTS - $used) . "/" . RATE_LIMIT_MAX_REQUESTS,
    ];
}

function getRateLimitStatus(string $cacheDir): array
{
    ensureDirectory($cacheDir);

    $file = $cacheDir . "/rate-limit.json";
    $now = time();
    $clientKey = hash("sha256", getClientIp());
    $handle = fopen($file, "c+");

    if (!$handle) {
        return [
            "used" => 0,
            "remaining" => RATE_LIMIT_MAX_REQUESTS,
            "max" => RATE_LIMIT_MAX_REQUESTS,
            "window_seconds" => RATE_LIMIT_WINDOW_SECONDS,
            "display" => RATE_LIMIT_MAX_REQUESTS . "/" . RATE_LIMIT_MAX_REQUESTS,
        ];
    }

    flock($handle, LOCK_EX);
    rewind($handle);
    $raw = stream_get_contents($handle);
    $data = json_decode($raw ?: "{}", true);
    if (!is_array($data)) {
        $data = [];
    }

    foreach ($data as $key => $timestamps) {
        $timestamps = is_array($timestamps) ? $timestamps : [];
        $data[$key] = array_values(array_filter($timestamps, function ($timestamp) use ($now) {
            return is_int($timestamp) && ($now - $timestamp) < RATE_LIMIT_WINDOW_SECONDS;
        }));

        if (!$data[$key]) {
            unset($data[$key]);
        }
    }

    $requests = $data[$clientKey] ?? [];
    $used = count($requests);

    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($data));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    return [
        "used" => $used,
        "remaining" => max(0, RATE_LIMIT_MAX_REQUESTS - $used),
        "max" => RATE_LIMIT_MAX_REQUESTS,
        "window_seconds" => RATE_LIMIT_WINDOW_SECONDS,
        "display" => max(0, RATE_LIMIT_MAX_REQUESTS - $used) . "/" . RATE_LIMIT_MAX_REQUESTS,
    ];
}

function parseMarkdownSections(string $markdown): array
{
    $sections = [];
    $currentTitle = "Overview";
    $currentContent = [];
    $lines = preg_split("/\r\n|\n|\r/", $markdown);

    foreach ($lines as $line) {
        if (preg_match("/^#{1,3}\s+(.+)$/", $line, $matches)) {
            if ($currentContent) {
                $sections[] = [
                    "title" => $currentTitle,
                    "content" => trim(implode("\n", $currentContent)),
                ];
            }

            $currentTitle = trim($matches[1]);
            $currentContent = [$line];
            continue;
        }

        $currentContent[] = $line;
    }

    if ($currentContent) {
        $sections[] = [
            "title" => $currentTitle,
            "content" => trim(implode("\n", $currentContent)),
        ];
    }

    return array_values(array_filter($sections, function ($section) {
        return $section["content"] !== "";
    }));
}

function getKnowledgeSections(string $knowledgePath, string $cacheDir): array
{
    ensureDirectory($cacheDir);

    $cachePath = $cacheDir . "/portfolio-knowledge.json";
    $sourceModifiedAt = file_exists($knowledgePath) ? filemtime($knowledgePath) : 0;

    if (file_exists($cachePath)) {
        $cached = json_decode(file_get_contents($cachePath), true);
        $cacheIsFresh = is_array($cached)
            && isset($cached["created_at"], $cached["source_modified_at"], $cached["sections"])
            && (time() - (int) $cached["created_at"]) < KNOWLEDGE_CACHE_SECONDS
            && (int) $cached["source_modified_at"] === $sourceModifiedAt;

        if ($cacheIsFresh) {
            return $cached["sections"];
        }
    }

    $markdown = file_exists($knowledgePath) ? file_get_contents($knowledgePath) : "";
    $sections = parseMarkdownSections($markdown);

    file_put_contents($cachePath, json_encode([
        "created_at" => time(),
        "source_modified_at" => $sourceModifiedAt,
        "sections" => $sections,
    ]), LOCK_EX);

    return $sections;
}

function getSectionContent(array $sections, string $title): string
{
    foreach ($sections as $section) {
        if (($section["title"] ?? "") === $title) {
            return $section["content"] ?? "";
        }
    }

    return "";
}

function parseMarkdownListItems(string $content): array
{
    $items = [];
    $lines = preg_split("/\r\n|\n|\r/", $content);

    foreach ($lines as $line) {
        if (preg_match("/^-\s+(.+)$/", trim($line), $matches)) {
            $items[] = $matches[1];
        }
    }

    return $items;
}

function parseKeyValueList(string $content): array
{
    $data = [];

    foreach (parseMarkdownListItems($content) as $item) {
        $parts = explode(":", $item, 2);
        if (count($parts) === 2) {
            $key = strtolower(trim($parts[0]));
            $key = preg_replace("/[^a-z0-9]+/", "_", $key);
            $data[trim($key, "_")] = trim($parts[1]);
        }
    }

    return $data;
}

function parseSectionParagraph(string $content): string
{
    $lines = preg_split("/\r\n|\n|\r/", $content);
    $paragraph = [];

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === "" || preg_match("/^#{1,3}\s+/", $line) || strpos($line, "- ") === 0) {
            continue;
        }

        $paragraph[] = $line;
    }

    return trim(implode(" ", $paragraph));
}

function parseContactLinks(string $content): array
{
    $links = [];

    foreach (parseMarkdownListItems($content) as $item) {
        $parts = explode(":", $item, 2);
        if (count($parts) === 2) {
            $links[] = [
                "label" => trim($parts[0]),
                "url" => trim($parts[1]),
            ];
        }
    }

    return $links;
}

function parseProjectSection(array $section): array
{
    $content = $section["content"] ?? "";
    $lines = preg_split("/\r\n|\n|\r/", $content);
    $description = [];
    $details = [];

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === "" || preg_match("/^#{1,3}\s+/", $line)) {
            continue;
        }

        if (preg_match("/^-\s+([^:]+):\s*(.+)$/", $line, $matches)) {
            $key = strtolower(trim($matches[1]));
            $key = preg_replace("/[^a-z0-9]+/", "_", $key);
            $details[trim($key, "_")] = trim($matches[2]);
            continue;
        }

        if (strpos($line, "- ") !== 0) {
            $description[] = $line;
        }
    }

    return array_merge([
        "name" => $section["title"] ?? "",
        "description" => trim(implode(" ", $description)),
    ], $details);
}

function buildPortfolioData(array $sections): array
{
    $projectTitles = [
        "First Online Portfolio",
        "PokeTalk",
        "RiderX",
        "Swaggy Adventure",
        "Pakman Lite",
        "SmartLock",
        "Basketball Payment Tracker",
        "Pizza de Uno",
        "Registration System",
    ];

    $projects = [];
    foreach ($sections as $section) {
        if (in_array($section["title"] ?? "", $projectTitles, true)) {
            $projects[] = parseProjectSection($section);
        }
    }

    return [
        "identity" => parseKeyValueList(getSectionContent($sections, "Identity")),
        "short_bio" => parseSectionParagraph(getSectionContent($sections, "Short Bio")),
        "focus_areas" => parseMarkdownListItems(getSectionContent($sections, "Focus Areas")),
        "currently_learning" => parseMarkdownListItems(getSectionContent($sections, "Currently Learning")),
        "education" => parseMarkdownListItems(getSectionContent($sections, "Education")),
        "achievements" => parseMarkdownListItems(getSectionContent($sections, "Academic Achievements And Leadership")),
        "languages" => parseMarkdownListItems(getSectionContent($sections, "Languages")),
        "development_stack" => parseMarkdownListItems(getSectionContent($sections, "Development Stack")),
        "frontend_tools" => parseMarkdownListItems(getSectionContent($sections, "Frontend Tools")),
        "backend_tools" => parseMarkdownListItems(getSectionContent($sections, "Backend And Programming Tools")),
        "storage_and_hosting" => parseMarkdownListItems(getSectionContent($sections, "Storage And Hosting")),
        "mobile_development" => parseMarkdownListItems(getSectionContent($sections, "Mobile Development")),
        "game_development" => parseMarkdownListItems(getSectionContent($sections, "Game Development")),
        "projects" => $projects,
        "contacts" => parseContactLinks(getSectionContent($sections, "Social And Contact Links")),
    ];
}

function sectionMatchesQuestion(array $section, string $question): bool
{
    $haystack = strtolower($section["title"] . "\n" . $section["content"]);
    $question = strtolower($question);
    $words = preg_split("/[^a-z0-9+#.]+/i", $question);
    $words = array_values(array_unique(array_filter($words, function ($word) {
        return strlen($word) >= 3;
    })));

    foreach ($words as $word) {
        if (strpos($haystack, $word) !== false) {
            return true;
        }
    }

    return false;
}

function selectRelevantKnowledge(array $sections, string $question): string
{
    $alwaysInclude = [
        "Jhon Cristopher R. Potestas Portfolio Knowledge",
        "Identity",
        "Short Bio",
        "Chatbot Behavior",
    ];

    $selected = [];

    foreach ($sections as $section) {
        if (in_array($section["title"], $alwaysInclude, true) || sectionMatchesQuestion($section, $question)) {
            $selected[$section["title"]] = $section["content"];
        }
    }

    $questionLower = strtolower($question);
    $projectTitles = [
        "First Online Portfolio",
        "PokeTalk",
        "RiderX",
        "Swaggy Adventure",
        "Pakman Lite",
        "SmartLock",
        "Basketball Payment Tracker",
        "Pizza de Uno",
        "Registration System",
    ];

    $categoryMap = [
        "project" => array_merge(["Projects"], $projectTitles),
        "portfolio" => array_merge(["Projects", "Social And Contact Links"], $projectTitles),
        "skill" => ["Development Stack", "Frontend Tools", "Backend And Programming Tools", "Design Tools", "Mobile Development", "Game Development"],
        "tool" => ["Development Stack", "Frontend Tools", "Backend And Programming Tools", "Design Tools", "Software And Utilities", "AI Tools", "Video Tools"],
        "contact" => ["Social And Contact Links"],
        "link" => ["Social And Contact Links"],
        "hire" => array_merge(["Social And Contact Links", "Projects"], $projectTitles),
        "education" => ["Education", "Academic Achievements And Leadership"],
        "school" => ["Education", "Academic Achievements And Leadership", "Sports"],
        "academic" => ["Academic Achievements And Leadership"],
        "achievement" => ["Academic Achievements And Leadership"],
        "achiever" => ["Academic Achievements And Leadership"],
        "dean" => ["Academic Achievements And Leadership"],
        "leader" => ["Academic Achievements And Leadership"],
        "research" => ["Academic Achievements And Leadership"],
        "kialeg" => ["Academic Achievements And Leadership"],
        "basketball" => ["Sports", "Interests"],
        "intramural" => ["Sports"],
        "language" => ["Languages"],
        "interest" => ["Interests"],
        "girlfriend" => ["Personal Life"],
        "april" => ["Personal Life"],
        "relationship" => ["Personal Life"],
        "courted" => ["Personal Life"],
        "dog" => ["Personal Life"],
        "bella" => ["Personal Life"],
        "motorcycle" => ["Personal Life"],
        "xrm" => ["Personal Life"],
        "family" => ["Family"],
        "sibling" => ["Family"],
        "brother" => ["Family"],
        "police" => ["Family"],
        "australia" => ["Family"],
        "davao" => ["Family"],
        "game" => ["Game Development", "Swaggy Adventure", "Pakman Lite"],
        "mobile" => ["Mobile Development", "SmartLock", "Basketball Payment Tracker", "Pizza de Uno"],
        "app" => ["Mobile Development", "SmartLock", "Basketball Payment Tracker", "Pizza de Uno"],
    ];

    foreach ($categoryMap as $keyword => $titles) {
        if (strpos($questionLower, $keyword) === false) {
            continue;
        }

        foreach ($sections as $section) {
            if (in_array($section["title"], $titles, true)) {
                $selected[$section["title"]] = $section["content"];
            }
        }
    }

    if (count($selected) <= count($alwaysInclude)) {
        foreach ($sections as $section) {
            if (in_array($section["title"], array_merge(["Focus Areas", "Projects", "Social And Contact Links"], $projectTitles), true)) {
                $selected[$section["title"]] = $section["content"];
            }
        }
    }

    return implode("\n\n", array_values($selected));
}

function getMessageLength(string $message): int
{
    if (function_exists("mb_strlen")) {
        return mb_strlen($message, "UTF-8");
    }

    return strlen($message);
}

function createConversationId(): string
{
    try {
        return bin2hex(random_bytes(16));
    } catch (Exception $exception) {
        return hash("sha256", uniqid("", true) . mt_rand());
    }
}

function normalizeConversationId($conversationId): string
{
    $conversationId = is_string($conversationId) ? $conversationId : "";

    if (preg_match("/^[a-f0-9]{32,64}$/", $conversationId)) {
        return $conversationId;
    }

    return createConversationId();
}

function getConversationPath(string $cacheDir, string $conversationId): string
{
    $conversationDir = $cacheDir . "/conversations";
    ensureDirectory($conversationDir);

    return $conversationDir . "/" . $conversationId . ".json";
}

function loadConversation(string $cacheDir, string $conversationId): array
{
    $path = getConversationPath($cacheDir, $conversationId);

    if (!file_exists($path)) {
        return [];
    }

    $conversation = json_decode(file_get_contents($path), true);
    if (!is_array($conversation) || !isset($conversation["updated_at"], $conversation["messages"])) {
        return [];
    }

    if ((time() - (int) $conversation["updated_at"]) > CONVERSATION_TTL_SECONDS) {
        @unlink($path);
        return [];
    }

    $messages = is_array($conversation["messages"]) ? $conversation["messages"] : [];
    foreach ($messages as &$message) {
        if (($message["role"] ?? "") === "model" && isset($message["text"]) && is_string($message["text"])) {
            $message["text"] = cleanReply($message["text"]);
        }
    }
    unset($message);

    return $messages;
}

function saveConversation(string $cacheDir, string $conversationId, array $messages): void
{
    $path = getConversationPath($cacheDir, $conversationId);
    $messages = array_slice($messages, -MAX_HISTORY_MESSAGES);

    file_put_contents($path, json_encode([
        "updated_at" => time(),
        "messages" => $messages,
    ]), LOCK_EX);
}

function cleanupExpiredConversations(string $cacheDir): void
{
    $conversationDir = $cacheDir . "/conversations";
    if (!is_dir($conversationDir) || mt_rand(1, 20) !== 1) {
        return;
    }

    foreach (glob($conversationDir . "/*.json") ?: [] as $file) {
        $raw = file_get_contents($file);
        $conversation = json_decode($raw ?: "{}", true);
        $updatedAt = is_array($conversation) ? (int) ($conversation["updated_at"] ?? 0) : 0;

        if (!$updatedAt || (time() - $updatedAt) > CONVERSATION_TTL_SECONDS) {
            @unlink($file);
        }
    }
}

function getGeminiRetryAfter(array $result): int
{
    $details = $result["error"]["details"] ?? [];
    if (!is_array($details)) {
        return 30;
    }

    foreach ($details as $detail) {
        $retryDelay = $detail["retryDelay"] ?? "";
        if (is_string($retryDelay) && preg_match("/^(\d+)s$/", $retryDelay, $matches)) {
            return max(1, (int) $matches[1]);
        }
    }

    return 30;
}

function getGeminiModels(): array
{
    return array_values(array_unique(array_merge([GEMINI_MODEL], GEMINI_FALLBACK_MODELS)));
}

function shouldTryNextGeminiModel(int $statusCode, string $geminiStatus): bool
{
    return $statusCode === 429
        || $statusCode === 503
        || in_array($geminiStatus, ["RESOURCE_EXHAUSTED", "UNAVAILABLE"], true);
}

function callGeminiModel(string $model, array $payload, string $apiKey): array
{
    $url = "https://generativelanguage.googleapis.com/v1beta/models/" . $model . ":generateContent";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "x-goog-api-key: " . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_errno($ch) ? curl_error($ch) : "";

    curl_close($ch);

    return [
        "model" => $model,
        "response" => $response,
        "status_code" => $statusCode,
        "curl_error" => $curlError,
        "result" => json_decode($response ?: "{}", true),
    ];
}

function cleanReply(string $reply): string
{
    $reply = trim($reply);
    $introPatterns = [
        "/^hi\s+there!\s+i'm\s+jhon's\s+ai\s+portfolio\s+chatbot\.\s*/i",
        "/^hello!\s+i'm\s+jhon's\s+ai\s+portfolio\s+chatbot\.\s*/i",
        "/^i'm\s+jhon's\s+ai\s+portfolio\s+chatbot\.\s*/i",
    ];

    return trim(preg_replace($introPatterns, "", $reply));
}

function buildUsageSummary(array $usageMetadata): array
{
    $outputTokensUsed = (int) ($usageMetadata["candidatesTokenCount"] ?? 0);

    return [
        "prompt_tokens" => (int) ($usageMetadata["promptTokenCount"] ?? 0),
        "output_tokens" => $outputTokensUsed,
        "total_tokens" => (int) ($usageMetadata["totalTokenCount"] ?? 0),
        "max_output_tokens" => MAX_OUTPUT_TOKENS,
        "output_display" => $outputTokensUsed . "/" . MAX_OUTPUT_TOKENS,
    ];
}

function getDefaultUsageSummary(): array
{
    return buildUsageSummary([]);
}

function getStatsPath(string $cacheDir): string
{
    ensureDirectory($cacheDir);

    return $cacheDir . "/api-stats.json";
}

function loadLastUsage(string $cacheDir): array
{
    $path = getStatsPath($cacheDir);
    if (!file_exists($path)) {
        return getDefaultUsageSummary();
    }

    $stats = json_decode(file_get_contents($path), true);
    if (!is_array($stats) || !is_array($stats["last_usage"] ?? null)) {
        return getDefaultUsageSummary();
    }

    return array_merge(getDefaultUsageSummary(), $stats["last_usage"]);
}

function saveLastUsage(string $cacheDir, array $usage): void
{
    file_put_contents(getStatsPath($cacheDir), json_encode([
        "updated_at" => time(),
        "last_usage" => $usage,
    ]), LOCK_EX);
}

function getCurrentApiUrl(): string
{
    $host = $_SERVER["HTTP_HOST"] ?? "";
    if (!$host) {
        return "http://localhost/AICHAT/api/chat.php";
    }

    $isHttps = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off")
        || (($_SERVER["SERVER_PORT"] ?? "") === "443");
    $scheme = $isHttps ? "https" : "http";
    $path = strtok($_SERVER["REQUEST_URI"] ?? "/api/chat.php", "?");

    return $scheme . "://" . $host . $path;
}

function getCurrentDateTimeContext(): string
{
    return date("l, F j, Y g:i A T");
}

$cacheDir = __DIR__ . "/cache";
$knowledgePath = __DIR__ . "/knowledge/jhon-profile.md";
$knowledgeSections = getKnowledgeSections($knowledgePath, $cacheDir);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    echo json_encode([
        "status" => "ok",
        "api_url" => getCurrentApiUrl(),
        "model" => GEMINI_MODEL,
        "current_datetime" => getCurrentDateTimeContext(),
        "max_message_length" => MAX_MESSAGE_LENGTH,
        "rate_limit" => getRateLimitStatus($cacheDir),
        "usage" => loadLastUsage($cacheDir),
        "portfolio" => buildPortfolioData($knowledgeSections),
    ]);
    exit;
}

$rateLimit = enforceRateLimit($cacheDir);

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON request"]);
    exit;
}

$userMessage = trim($data["message"] ?? "");
$conversationId = normalizeConversationId($data["conversation_id"] ?? "");

if ($userMessage === "") {
    http_response_code(400);
    echo json_encode(["error" => "No message provided"]);
    exit;
}

if (getMessageLength($userMessage) > MAX_MESSAGE_LENGTH) {
    http_response_code(400);
    echo json_encode([
        "error" => "Message is too long. Please keep it under " . MAX_MESSAGE_LENGTH . " characters.",
    ]);
    exit;
}

$portfolioKnowledge = selectRelevantKnowledge($knowledgeSections, $userMessage);
$history = loadConversation($cacheDir, $conversationId);

$systemPrompt = "
You answer questions about Jhon Cristopher R. Potestas for his portfolio.

Current date and time: " . getCurrentDateTimeContext() . ".

Your job is to chat naturally with visitors and help them understand Jhon Cristopher R. Potestas, his skills, projects, background, and contact links when those topics come up.

Rules:
- Use Gemini's natural reasoning and conversational ability.
- Use the current date and time above when the visitor asks about today, current time, dates, durations, or how long something has been.
- Use the portfolio knowledge below as the source of truth for questions about Jhon.
- Use the conversation history to understand follow-up questions and continue naturally.
- Answer directly and briefly by default: 1 to 3 short sentences is enough.
- Do not introduce yourself as Jhon's AI portfolio chatbot.
- When asked who Jhon is, start directly with who he is.
- Give longer answers only when the visitor asks for details, examples, comparisons, or a list.
- Avoid bullet lists unless the visitor asks for a list, all projects, all skills, details, or examples.
- Avoid repeating the same greeting every message.
- Avoid robotic FAQ-style answers.
- Reply in the same language or language mix used by the visitor when possible.
- If the visitor uses Bisaya/Cebuano, reply in natural Bisaya/Cebuano.
- If the visitor uses Tagalog/Filipino, reply in natural Tagalog/Filipino.
- If the visitor uses English, reply in English.
- If the visitor mixes languages, you may also mix languages naturally.
- Do not invent Jhon's private details, achievements, work experience, contact details, or credentials if they are not in the portfolio knowledge.
- If a visitor asks for a specific missing detail about Jhon, say naturally that you do not have that detail yet.
- If the visitor asks a general question not about Jhon, you may answer normally, then gently connect back to Jhon's portfolio only if it feels useful.
- Keep replies friendly, casual, clear, and concise.
- You may suggest relevant projects or links from Jhon's portfolio when helpful.

Portfolio knowledge from jhon-profile.md:
{$portfolioKnowledge}
";

$contents = [];
foreach ($history as $message) {
    $role = $message["role"] ?? "";
    $text = $message["text"] ?? "";

    if (!in_array($role, ["user", "model"], true) || !is_string($text) || trim($text) === "") {
        continue;
    }

    $contents[] = [
        "role" => $role,
        "parts" => [
            ["text" => trim($text)]
        ],
    ];
}

$contents[] = [
    "role" => "user",
    "parts" => [
        ["text" => $userMessage]
    ],
];

$payload = [
    "systemInstruction" => [
        "parts" => [
            ["text" => $systemPrompt]
        ]
    ],
    "contents" => $contents,
    "generationConfig" => [
        "maxOutputTokens" => MAX_OUTPUT_TOKENS,
        "temperature" => 0.65,
    ],
];

$geminiResponse = null;
$lastGeminiError = null;

foreach (getGeminiModels() as $model) {
    $attempt = callGeminiModel($model, $payload, $GEMINI_API_KEY);
    $result = is_array($attempt["result"]) ? $attempt["result"] : [];
    $statusCode = (int) $attempt["status_code"];

    if ($attempt["curl_error"] !== "") {
        $lastGeminiError = $attempt;
        break;
    }

    if ($statusCode < 400) {
        $geminiResponse = $attempt;
        break;
    }

    $geminiStatus = $result["error"]["status"] ?? "";
    $lastGeminiError = $attempt;

    if (!shouldTryNextGeminiModel($statusCode, $geminiStatus)) {
        break;
    }

    error_log("Gemini model fallback from " . $model . " after " . $statusCode . " " . $geminiStatus);
}

if ($geminiResponse === null) {
    $statusCode = (int) ($lastGeminiError["status_code"] ?? 0);
    $result = is_array($lastGeminiError["result"] ?? null) ? $lastGeminiError["result"] : [];
    $geminiStatus = $result["error"]["status"] ?? "";

    if (($lastGeminiError["curl_error"] ?? "") !== "") {
        http_response_code(502);
        echo json_encode(["error" => $lastGeminiError["curl_error"]]);
        exit;
    }

    if (shouldTryNextGeminiModel($statusCode, $geminiStatus)) {
        $retryAfter = getGeminiRetryAfter($result);
        http_response_code(429);
        header("Retry-After: " . $retryAfter);
        echo json_encode([
            "error" => "Gemini is temporarily busy or the API quota was reached. Please try again shortly.",
            "retry_after" => $retryAfter,
            "tried_models" => getGeminiModels(),
        ]);
        exit;
    }

    error_log("Gemini API error " . $statusCode . ": " . ($lastGeminiError["response"] ?? ""));
    http_response_code(502);
    echo json_encode(["error" => "Gemini could not answer right now. Please try again later."]);
    exit;
}

$result = is_array($geminiResponse["result"]) ? $geminiResponse["result"] : [];
$usedModel = $geminiResponse["model"];

$reply = cleanReply($result["candidates"][0]["content"]["parts"][0]["text"] ?? "Sorry, I could not generate a response.");
$usageMetadata = is_array($result["usageMetadata"] ?? null) ? $result["usageMetadata"] : [];
$usage = buildUsageSummary($usageMetadata);
saveLastUsage($cacheDir, $usage);

$history[] = ["role" => "user", "text" => $userMessage];
$history[] = ["role" => "model", "text" => $reply];
saveConversation($cacheDir, $conversationId, $history);
cleanupExpiredConversations($cacheDir);

echo json_encode([
    "reply" => $reply,
    "conversation_id" => $conversationId,
    "model" => $usedModel,
    "rate_limit" => $rateLimit,
    "usage" => $usage,
]);
