const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_SECONDS = 300;
const CONVERSATION_TTL_SECONDS = 3600;
const MAX_HISTORY_MESSAGES = 10;
const MAX_OUTPUT_TOKENS = 220;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.0-flash"];
const GROQ_FALLBACK_MODELS = ["openai/gpt-oss-120b", "llama-3.3-70b-versatile", "qwen/qwen3-32b"];

const rateLimitStore = new Map();
const conversationStore = new Map();
let lastUsage = getDefaultUsageSummary();

const PORTFOLIO_MARKDOWN = String.raw`# Jhon Cristopher R. Potestas Portfolio Knowledge

This file is the source of truth for answers about Jhon's portfolio. Use this information when answering questions about Jhon, his background, skills, projects, and links. If a visitor asks for a specific detail about Jhon that is not covered here, answer naturally and say that detail is not available yet.

## Identity

- Full name: Jhon Cristopher R. Potestas
- Current role: BS Information Technology student
- Year level: 3rd year student
- Homepage tagline: Student, Pogi, Gwapo
- Main focus: Web Development, App Development, Game Development, UI Design, and System Development
- Location: Balnate, Magsaysay, Davao del Sur, Philippines
- Portfolio website: https://jhon6264.github.io/desktop/

## Short Bio

Jhon is an Information Technology student who enjoys building interactive websites, simple systems, and game-like experiences. He likes combining design, code, animation, and small interface details to make projects feel alive and personal.

## Focus Areas

- Web Development
- UI Design
- Game Development
- System Development
- App Development

## Currently Learning

- React
- Laravel
- Firebase
- UI/UX
- Godot

## Education

- Primary: Balnate Elementary School / AFPLC Elementary School
- Secondary: Magsaysay Academy Inc. / Padada National High School
- Tertiary: St. Mary's College of Bansalan Inc.
- Course: Bachelor of Science in Information Technology

## Academic Achievements And Leadership

- Jhon is an academic achiever.
- He was a Dean's Lister during his second year.
- He often serves as a project leader in group projects.
- He has also served as a research leader.
- His classmates call him the leader of Team Kialeg.

## Sports

- Jhon played basketball for his school team called DACS during his first year.
- He participated in basketball intramurals for 3 years.

## Interests

- Basketball
- Farm animals
- Online games
- Design
- Small projects

## Personal Life

- Jhon's girlfriend is April Schaine Bedico.
- Jhon and April have been together since September 1, 2021.
- Jhon courted April for 1 year and 8 months before they became a couple.
- Jhon owns an XRM 125 FI first generation.
- Jhon has a dog named Bella.

## Friends
- Jhon's close friends include Edrian, Van April, Kent, Yvan, Mark, Sabanal, Mark Daryll, and John Louie.
- Edrian is a gay friend who is also a BSIT student and a talented artist.
- Van April is a bisexual friend who is a BSIT student and a skilled programmer.
- Kent is a straight friend who is a BSIT student but he was under with his Girlfriend
- Mark Torres is a friend who have many girls

## Family

- Jhon has 9 siblings.
- His siblings include 6 men and 3 women.
- One of Jhon's brothers is a police officer.
- One of Jhon's brothers is in Australia.
- Some of Jhon's other siblings are in Davao.

## Languages

- Cebuano
- Tagalog
- English
- Basic Japanese

## Development Stack

- HTML
- CSS
- JavaScript
- PHP
- Python

## Frontend Tools

- Bootstrap 5
- Tailwind CSS
- React
- Next.js

## Backend And Programming Tools

- Laravel
- Java
- C++
- MySQL
- XAMPP

## Storage And Hosting

- GitHub
- InfinityFree
- Firebase
- Hostinger

## Design Tools

- Figma
- Photoshop
- Blender
- Canva

## Mobile Development

- Flutter
- React Native Expo
- Expo Go

## Game Development

- Godot
- GDScript
- Blender

## Favorite Libraries And Assets

- anime.js
- Flaticon
- Google Fonts
- DaisyUI
- Dafont
- icon-icons
- Iconape
- React Icons

## Software And Utilities

- Visual Studio Code
- Visual Studio
- Dev C++
- Apache NetBeans
- Godot
- Cisco Packet Tracer
- XAMPP
- Postman
- Arduino IDE
- Git
- Proton VPN
- Expo Orbit
- Microsoft Word
- Microsoft PowerPoint
- Microsoft Excel

## AI Tools

- ChatGPT
- Claude
- DeepSeek
- Gemini
- Cursor

## Video Tools

- CapCut
- Adobe Premiere

## Projects

### Professional Portfolio

Jhon's professional portfolio, inspired by Bryl's portfolio design. It's static and simple, but clean, informative, and professional.

- Type: Website
- Technologies: HTML, CSS, JavaScript, Tailwind CSS
- Link: https://jhonpotestas.vercel.app/

### First Online Portfolio

Jhon's first static web portfolio. It includes personal information such as name, education, achievements, and links to social media platforms. It was created during his second year as a midterm project.

- Type: Website
- Technologies: HTML, CSS, JavaScript, Bootstrap 5, EmailJS
- Link: https://jhon6264.github.io/portfolio/

### DoMATS

An ongoing capstone project — a document management and tracking system for St. Mary's College of Bansalan, Inc. It streamlines multi-signatory document signing, cuts manual errands, and helps organize and secure records.

- Type: Web platform (capstone project)
- Technologies: React, Laravel, TypeScript, JavaScript, Tailwind CSS, MySQL, WebSocket, OCR Tesseract

### RiderX

A web-based motorcycle rider platform concept with a Laravel backend and a modern React interface. It focuses on structured rider data, clean navigation, and a dashboard-style experience.

- Type: Web platform concept
- Technologies: HTML, CSS, JavaScript, Blade, React, Laravel, Tailwind CSS, anime.js, MySQL

### PokeTalk

A Pokemon-themed web app that uses PokeAPI data to show Pokemon information in a simple hosted PHP project. It was built as a lightweight API practice project and deployed through InfinityFree.

- Type: Website / API practice project
- Technologies: PHP, PokeAPI, InfinityFree
- Link: https://poketalk.free.nf/

### Swaggy Adventure

An interactive 2D pixel game created for a second-year, second-semester project. The assets came from itch.io, Pixabay, and Freesound because Jhon was still a beginner at creating game assets. It was a useful beginner game development experience.

- Type: Game development project
- Technologies: Godot / GDScript, C++, C, itch.io assets, Freesound, Pixabay

### Pakman Lite

An interactive 3D Minecraft-style game where the player is chased by ball enemies, collects coins and potions, survives as long as possible, and tries to set a high score. It was made during the second-year, second-semester final project.

- Type: Game development project
- Technologies: Godot Engine, Blender, ElevenLabs, Figma

### Owly

A personal companion mobile app for managing notes, friendships, and important dates in one place. It integrates the Gemma 4 E2B IT AI model so users can chat with an AI assistant fully offline, keeping interactions accessible and private.

- Type: Mobile app
- Technologies: React, React Native, TypeScript, Huggingface
- Availability: The app download is not available yet.

### CodeQuiz

A mobile learning app that helps IT freshmen learn and practice programming through interactive lessons and quizzes. It covers beginner topics like HTML, CSS, and JavaScript, with quizzes that scale from basic to more challenging questions.

- Type: Mobile learning app
- Technologies: React, Expo, TypeScript
- Link: https://drive.google.com/drive/folders/1UpClqFDglTAjfJTgivVc_6Wo15eSL7Qc?usp=sharing

### SmartLock

A mobile app prototype for controlling and monitoring a smart lock experience. It was built with React Native Expo and tested through Expo Go for fast mobile development.

- Type: Mobile app prototype
- Technologies: React Native Expo, Expo Go

### Basketball Payment Tracker

A mobile tracker for managing basketball payment records and keeping contribution details organized. It was built with React Native Expo and prepared as an installable Android app.

- Type: Mobile app
- Technologies: React Native Expo, Expo Go

### Pizza de Uno

A food-ordering mobile app concept focused on pizza menu browsing and a simple ordering flow. It was created with Flutter as a practice project for mobile UI and app navigation.

- Type: Mobile app concept
- Technologies: Flutter

### Registration System

Jhon's first functional system. It was created during the first-semester final project. He used Visual Studio 2022 as the IDE, Figma for layout and color design, Photoshop and Flaticon for visual assets, and localhost MySQL through XAMPP for the database.

- Type: Application / system project
- Technologies: VB.NET, Figma, Photoshop, Flaticon, MySQL, XAMPP

## Social And Contact Links

- Instagram: https://www.instagram.com/jhoncrispotestas/
- Facebook: https://www.facebook.com/jhoncristopher.relativopotestas.7/
- YouTube: https://www.youtube.com/@rizeertales
- Telegram: https://t.me/jcrp6264
- Discord: https://discord.com/users/supremooo0126_91732

## Chatbot Behavior

- The assistant should answer questions about Jhon directly without introducing itself as a chatbot.
- The assistant should use Gemini's natural reasoning and conversational ability, but answer what the visitor is asking.
- The assistant should answer in a friendly, helpful, casual tone.
- The assistant should avoid robotic FAQ-style answers.
- The assistant should reply in the same language or language mix used by the visitor when possible.
- If the visitor uses Bisaya/Cebuano, the assistant should reply in natural Bisaya/Cebuano.
- If the visitor uses Tagalog/Filipino, the assistant should reply in natural Tagalog/Filipino.
- If the visitor uses English, the assistant should reply in English.
- If the visitor mixes languages, the assistant may also mix languages naturally.
- The assistant should be concise unless the visitor asks for details, examples, comparisons, or a list.
- The assistant should avoid bullet lists unless the visitor asks for a list, all projects, all skills, details, or examples.
- The assistant should recommend relevant projects when visitors ask about Jhon's skills.
- The assistant should not invent private information, work experience, certifications, awards, grades, phone numbers, or email addresses.
- If a visitor asks about hiring or collaboration, the assistant can direct them to the portfolio contact section or social links.
- If a question is unrelated to Jhon, the assistant may answer it and only connect back to Jhon's portfolio when it feels useful.`;

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders();

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (!["GET", "POST"].includes(request.method)) {
      return jsonResponse({ error: "Only GET and POST requests are allowed" }, 405, corsHeaders);
    }

    const knowledgeSections = parseMarkdownSections(PORTFOLIO_MARKDOWN);

    if (request.method === "GET") {
      return jsonResponse({
        status: "ok",
        api_url: request.url,
        model: GEMINI_MODEL,
        current_datetime: getCurrentDateTimeContext(),
        max_message_length: MAX_MESSAGE_LENGTH,
        rate_limit: await getRateLimitStatus(request, env),
        usage: await loadLastUsage(env),
        portfolio: buildPortfolioData(knowledgeSections),
      }, 200, corsHeaders);
    }

    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: "Missing GEMINI_API_KEY secret in Cloudflare Worker settings" }, 500, corsHeaders);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON request" }, 400, corsHeaders);
    }

    const userMessage = String(data?.message || "").trim();
    const conversationId = normalizeConversationId(data?.conversation_id);
    const visitorId = normalizeVisitorId(data?.visitor_id);
    const rateLimit = await enforceRateLimit(request, env, visitorId);

    if (rateLimit.blocked) {
      return jsonResponse({
        error: "Too many messages. Please wait before sending another one.",
        retry_after: rateLimit.retry_after,
        rate_limit: rateLimit.rate_limit,
      }, 429, { ...corsHeaders, "Retry-After": String(rateLimit.retry_after) });
    }

    if (!userMessage) {
      return jsonResponse({ error: "No message provided" }, 400, corsHeaders);
    }

    if ([...userMessage].length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({
        error: `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
      }, 400, corsHeaders);
    }

    const approvedKnowledge = await getApprovedKnowledge(env);
    const portfolioKnowledge = [
      selectRelevantKnowledge(knowledgeSections, userMessage),
      approvedKnowledge ? `## Approved Learned Knowledge\n\n${approvedKnowledge}` : "",
    ].filter(Boolean).join("\n\n");
    const history = await loadConversation(env, conversationId);
    const systemPrompt = buildSystemPrompt(portfolioKnowledge);
    const contents = history
      .filter((message) => ["user", "model"].includes(message.role) && String(message.text || "").trim())
      .map((message) => ({
        role: message.role,
        parts: [{ text: String(message.text).trim() }],
      }));

    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.65,
      },
    };

    const aiResult = await callAiWithFallback(payload, env, {
      systemPrompt,
      contents,
    });

    if (!aiResult.ok) {
      const reply = createFallbackReply(userMessage, knowledgeSections, approvedKnowledge);
      const usage = await loadLastUsage(env);

      history.push({ role: "user", text: userMessage });
      history.push({ role: "model", text: reply });
      await saveConversation(env, conversationId, history);
      await saveAutoApprovedLearning(env, userMessage);

      return jsonResponse({
        reply,
        conversation_id: conversationId,
        model: "local-fallback",
        rate_limit: rateLimit.rate_limit,
        usage,
        fallback: true,
        tried_models: aiResult.tried_models,
      }, 200, corsHeaders);
    }

    const reply = cleanReply(aiResult.reply || "Sorry, I could not generate a response.");
    const usage = aiResult.usage || getDefaultUsageSummary();
    await saveLastUsage(env, usage);

    history.push({ role: "user", text: userMessage });
    history.push({ role: "model", text: reply });
    await saveConversation(env, conversationId, history);
    await saveAutoApprovedLearning(env, userMessage);

    if (shouldStoreLearningCandidate(reply)) {
      await saveLearningCandidate(env, {
        question: userMessage,
        reply,
        conversation_id: conversationId,
        created_at: new Date().toISOString(),
      });
    }

    return jsonResponse({
      reply,
      conversation_id: conversationId,
      model: aiResult.model,
      provider: aiResult.provider,
      rate_limit: rateLimit.rate_limit,
      usage,
    }, 200, corsHeaders);
  },
};

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

function jsonResponse(data, status = 200, headers = getCorsHeaders()) {
  return new Response(JSON.stringify(data), { status, headers });
}

function getClientKey(request) {
  return request.headers.get("CF-Connecting-IP")
    || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim()
    || "unknown";
}

function normalizeVisitorId(visitorId) {
  const value = typeof visitorId === "string" ? visitorId.trim() : "";
  return /^[a-zA-Z0-9_.:-]{8,80}$/.test(value) ? value : "";
}

function getRateLimitKey(request, visitorId = "") {
  return visitorId ? `visitor:${visitorId}` : `ip:${getClientKey(request)}`;
}

function hasKV(env) {
  return Boolean(env?.JCRPBOT_KV);
}

async function getJsonFromKV(env, key, fallback) {
  if (!hasKV(env)) return fallback;

  try {
    const value = await env.JCRPBOT_KV.get(key, "json");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

async function putJsonToKV(env, key, value, options = {}) {
  if (!hasKV(env)) return;
  await env.JCRPBOT_KV.put(key, JSON.stringify(value), options);
}

function cleanupRateLimit(now) {
  for (const [key, timestamps] of rateLimitStore.entries()) {
    const fresh = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_SECONDS * 1000);
    if (fresh.length) {
      rateLimitStore.set(key, fresh);
    } else {
      rateLimitStore.delete(key);
    }
  }
}

async function getRateLimitStatus(request, env) {
  const now = Date.now();
  const key = getRateLimitKey(request);
  let requests;

  if (hasKV(env)) {
    requests = await getJsonFromKV(env, `rate-limit:${key}`, []);
    requests = Array.isArray(requests) ? requests : [];
    requests = requests.filter((timestamp) => Number.isInteger(timestamp) && now - timestamp < RATE_LIMIT_WINDOW_SECONDS * 1000);
    await putJsonToKV(env, `rate-limit:${key}`, requests, { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  } else {
    cleanupRateLimit(now);
    requests = rateLimitStore.get(key) || [];
  }

  const used = requests.length;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - used);

  return {
    used,
    remaining,
    max: RATE_LIMIT_MAX_REQUESTS,
    window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    display: `${remaining}/${RATE_LIMIT_MAX_REQUESTS}`,
  };
}

async function enforceRateLimit(request, env, visitorId = "") {
  const now = Date.now();
  const key = getRateLimitKey(request, visitorId);
  const kvKey = `rate-limit:${key}`;
  let requests;

  if (hasKV(env)) {
    requests = await getJsonFromKV(env, kvKey, []);
    requests = Array.isArray(requests) ? requests : [];
    requests = requests.filter((timestamp) => Number.isInteger(timestamp) && now - timestamp < RATE_LIMIT_WINDOW_SECONDS * 1000);
  } else {
    cleanupRateLimit(now);
    requests = rateLimitStore.get(key) || [];
  }

  if (requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = Math.min(...requests);
    const retryAfter = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_SECONDS * 1000 - (now - oldest)) / 1000));

    if (hasKV(env)) {
      await putJsonToKV(env, kvKey, requests, { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
    }

    return {
      blocked: true,
      retry_after: retryAfter,
      rate_limit: {
        used: RATE_LIMIT_MAX_REQUESTS,
        remaining: 0,
        max: RATE_LIMIT_MAX_REQUESTS,
        window_seconds: RATE_LIMIT_WINDOW_SECONDS,
        display: `0/${RATE_LIMIT_MAX_REQUESTS}`,
      },
    };
  }

  requests.push(now);
  if (hasKV(env)) {
    await putJsonToKV(env, kvKey, requests, { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  } else {
    rateLimitStore.set(key, requests);
  }

  const used = requests.length;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - used);

  return {
    blocked: false,
    rate_limit: {
      used,
      remaining,
      max: RATE_LIMIT_MAX_REQUESTS,
      window_seconds: RATE_LIMIT_WINDOW_SECONDS,
      display: `${remaining}/${RATE_LIMIT_MAX_REQUESTS}`,
    },
  };
}

function parseMarkdownSections(markdown) {
  const sections = [];
  let currentTitle = "Overview";
  let currentContent = [];

  for (const line of markdown.split(/\r\n|\n|\r/)) {
    const match = line.match(/^#{1,3}\s+(.+)$/);
    if (match) {
      if (currentContent.length) {
        sections.push({
          title: currentTitle,
          content: currentContent.join("\n").trim(),
        });
      }

      currentTitle = match[1].trim();
      currentContent = [line];
      continue;
    }

    currentContent.push(line);
  }

  if (currentContent.length) {
    sections.push({
      title: currentTitle,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections.filter((section) => section.content !== "");
}

function getSectionContent(sections, title) {
  return sections.find((section) => section.title === title)?.content || "";
}

function parseMarkdownListItems(content) {
  return content
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim().match(/^-\s+(.+)$/)?.[1])
    .filter(Boolean);
}

function parseKeyValueList(content) {
  const data = {};

  for (const item of parseMarkdownListItems(content)) {
    const index = item.indexOf(":");
    if (index === -1) continue;

    const key = item
      .slice(0, index)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    data[key] = item.slice(index + 1).trim();
  }

  return data;
}

function parseSectionParagraph(content) {
  return content
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter((line) => line && !/^#{1,3}\s+/.test(line) && !line.startsWith("- "))
    .join(" ")
    .trim();
}

function parseContactLinks(content) {
  return parseMarkdownListItems(content)
    .map((item) => {
      const index = item.indexOf(":");
      if (index === -1) return null;

      return {
        label: item.slice(0, index).trim(),
        url: item.slice(index + 1).trim(),
      };
    })
    .filter(Boolean);
}

function parseProjectSection(section) {
  const description = [];
  const details = {};

  for (const rawLine of String(section.content || "").split(/\r\n|\n|\r/)) {
    const line = rawLine.trim();
    if (!line || /^#{1,3}\s+/.test(line)) continue;

    const match = line.match(/^-\s+([^:]+):\s*(.+)$/);
    if (match) {
      const key = match[1]
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      details[key] = match[2].trim();
      continue;
    }

    if (!line.startsWith("- ")) {
      description.push(line);
    }
  }

  return {
    name: section.title || "",
    description: description.join(" ").trim(),
    ...details,
  };
}

function buildPortfolioData(sections) {
  const projectTitles = [
    "Professional Portfolio",
    "First Online Portfolio",
    "DoMATS",
    "RiderX",
    "PokeTalk",
    "Swaggy Adventure",
    "Pakman Lite",
    "Owly",
    "CodeQuiz",
    "SmartLock",
    "Basketball Payment Tracker",
    "Pizza de Uno",
    "Registration System",
  ];

  return {
    identity: parseKeyValueList(getSectionContent(sections, "Identity")),
    short_bio: parseSectionParagraph(getSectionContent(sections, "Short Bio")),
    focus_areas: parseMarkdownListItems(getSectionContent(sections, "Focus Areas")),
    currently_learning: parseMarkdownListItems(getSectionContent(sections, "Currently Learning")),
    education: parseMarkdownListItems(getSectionContent(sections, "Education")),
    achievements: parseMarkdownListItems(getSectionContent(sections, "Academic Achievements And Leadership")),
    languages: parseMarkdownListItems(getSectionContent(sections, "Languages")),
    development_stack: parseMarkdownListItems(getSectionContent(sections, "Development Stack")),
    frontend_tools: parseMarkdownListItems(getSectionContent(sections, "Frontend Tools")),
    backend_tools: parseMarkdownListItems(getSectionContent(sections, "Backend And Programming Tools")),
    storage_and_hosting: parseMarkdownListItems(getSectionContent(sections, "Storage And Hosting")),
    mobile_development: parseMarkdownListItems(getSectionContent(sections, "Mobile Development")),
    game_development: parseMarkdownListItems(getSectionContent(sections, "Game Development")),
    projects: sections
      .filter((section) => projectTitles.includes(section.title))
      .map(parseProjectSection),
    contacts: parseContactLinks(getSectionContent(sections, "Social And Contact Links")),
  };
}

function createFallbackReply(question, sections, approvedKnowledge = "") {
  const portfolio = buildPortfolioData(sections);
  const questionText = String(question || "").toLowerCase();
  const learnedMatch = findLearnedKnowledgeMatch(questionText, approvedKnowledge);

  if (learnedMatch) {
    return learnedMatch;
  }

  if (matchesAny(questionText, ["who is", "about jhon", "jhon", "bio", "background"])) {
    return `${portfolio.identity.full_name || "Jhon Cristopher R. Potestas"} is a ${portfolio.identity.year_level || "BS Information Technology student"} focused on ${portfolio.identity.main_focus || "web, app, game, UI, and system development"}. ${portfolio.short_bio || ""}`.trim();
  }

  if (matchesAny(questionText, ["location", "where", "live", "from", "address"])) {
    return `Jhon is from ${portfolio.identity.location || "Balnate, Magsaysay, Davao del Sur, Philippines"}.`;
  }

  if (matchesAny(questionText, ["skill", "stack", "tool", "technology", "tech", "frontend", "backend", "storage", "hosting", "mobile", "game"])) {
    const skills = [
      ...(portfolio.development_stack || []),
      ...(portfolio.frontend_tools || []),
      ...(portfolio.backend_tools || []),
      ...(portfolio.storage_and_hosting || []),
      ...(portfolio.mobile_development || []),
      ...(portfolio.game_development || []),
    ];

    return `Jhon works with ${dedupe(skills).slice(0, 18).join(", ")}.`;
  }

  if (matchesAny(questionText, ["project", "portfolio", "poketalk", "riderx", "smartlock", "pizza", "basketball", "pakman", "swaggy", "registration"])) {
    const matchedProject = findProjectMatch(questionText, portfolio.projects || []);
    if (matchedProject) {
      return `${matchedProject.name}: ${matchedProject.description}${matchedProject.technologies ? ` Tools used: ${matchedProject.technologies}.` : ""}${matchedProject.link ? ` Link: ${matchedProject.link}` : ""}`;
    }

    return `Jhon's projects include ${(portfolio.projects || []).map((project) => project.name).join(", ")}.`;
  }

  if (matchesAny(questionText, ["contact", "social", "facebook", "instagram", "youtube", "telegram", "discord", "hire"])) {
    const contacts = (portfolio.contacts || []).map((contact) => `${contact.label}: ${contact.url}`);
    return contacts.length ? `You can contact or follow Jhon here: ${contacts.join(" | ")}` : "Jhon's contact links are available in the portfolio contact section.";
  }

  if (matchesAny(questionText, ["school", "education", "college", "course", "study"])) {
    return `Jhon's education: ${(portfolio.education || []).join("; ")}.`;
  }

  if (matchesAny(questionText, ["achievement", "dean", "leader", "academic", "research"])) {
    return `Jhon's achievements and leadership: ${(portfolio.achievements || []).join(" ")}`;
  }

  if (matchesAny(questionText, ["language", "speak"])) {
    return `Jhon speaks ${(portfolio.languages || []).join(", ")}.`;
  }

  if (matchesAny(questionText, ["learning", "currently learning"])) {
    return `Jhon is currently learning ${(portfolio.currently_learning || []).join(", ")}.`;
  }

  return "Gemini is busy right now, but I can still answer basic questions about Jhon's portfolio, skills, projects, education, location, and contact links.";
}

function matchesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function dedupe(items) {
  return [...new Set(items.filter(Boolean))];
}

function findProjectMatch(questionText, projects) {
  return projects.find((project) => {
    const name = String(project.name || "").toLowerCase();
    return name && questionText.includes(name);
  }) || projects.find((project) => {
    const compactName = String(project.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const compactQuestion = questionText.replace(/[^a-z0-9]+/g, "");
    return compactName && compactQuestion.includes(compactName);
  });
}

function findLearnedKnowledgeMatch(questionText, approvedKnowledge) {
  const lines = String(approvedKnowledge || "")
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").replace(/^Visitor-provided note:\s*/i, "").trim())
    .filter(Boolean);

  const questionWords = new Set(
    questionText
      .split(/[^a-z0-9]+/i)
      .filter((word) => word.length >= 4)
  );

  for (const line of lines.slice().reverse()) {
    const lineWords = line.toLowerCase().split(/[^a-z0-9]+/i);
    const hasMatch = lineWords.some((word) => questionWords.has(word));
    if (hasMatch) return line;
  }

  return "";
}

function sectionMatchesQuestion(section, question) {
  const haystack = `${section.title}\n${section.content}`.toLowerCase();
  const words = [...new Set(String(question).toLowerCase().split(/[^a-z0-9+#.]+/i).filter((word) => word.length >= 3))];
  return words.some((word) => haystack.includes(word));
}

function selectRelevantKnowledge(sections, question) {
  const alwaysInclude = [
    "Jhon Cristopher R. Potestas Portfolio Knowledge",
    "Identity",
    "Short Bio",
    "Chatbot Behavior",
  ];
  const selected = new Map();

  for (const section of sections) {
    if (alwaysInclude.includes(section.title) || sectionMatchesQuestion(section, question)) {
      selected.set(section.title, section.content);
    }
  }

  const questionLower = String(question).toLowerCase();
  const projectTitles = [
    "Professional Portfolio",
    "First Online Portfolio",
    "DoMATS",
    "RiderX",
    "PokeTalk",
    "Swaggy Adventure",
    "Pakman Lite",
    "Owly",
    "CodeQuiz",
    "SmartLock",
    "Basketball Payment Tracker",
    "Pizza de Uno",
    "Registration System",
  ];

  const categoryMap = {
    project: ["Projects", ...projectTitles],
    portfolio: ["Projects", "Social And Contact Links", ...projectTitles],
    skill: ["Development Stack", "Frontend Tools", "Backend And Programming Tools", "Design Tools", "Mobile Development", "Game Development"],
    tool: ["Development Stack", "Frontend Tools", "Backend And Programming Tools", "Design Tools", "Software And Utilities", "AI Tools", "Video Tools"],
    contact: ["Social And Contact Links"],
    link: ["Social And Contact Links"],
    hire: ["Social And Contact Links", "Projects", ...projectTitles],
    education: ["Education", "Academic Achievements And Leadership"],
    school: ["Education", "Academic Achievements And Leadership", "Sports"],
    academic: ["Academic Achievements And Leadership"],
    achievement: ["Academic Achievements And Leadership"],
    achiever: ["Academic Achievements And Leadership"],
    dean: ["Academic Achievements And Leadership"],
    leader: ["Academic Achievements And Leadership"],
    research: ["Academic Achievements And Leadership"],
    kialeg: ["Academic Achievements And Leadership"],
    basketball: ["Sports", "Interests"],
    intramural: ["Sports"],
    language: ["Languages"],
    interest: ["Interests"],
    girlfriend: ["Personal Life"],
    april: ["Personal Life"],
    relationship: ["Personal Life"],
    courted: ["Personal Life"],
    dog: ["Personal Life"],
    bella: ["Personal Life"],
    motorcycle: ["Personal Life"],
    xrm: ["Personal Life"],
    family: ["Family"],
    sibling: ["Family"],
    brother: ["Family"],
    police: ["Family"],
    australia: ["Family"],
    davao: ["Family"],
    game: ["Game Development", "Swaggy Adventure", "Pakman Lite"],
    mobile: ["Mobile Development", "Owly", "CodeQuiz", "SmartLock", "Basketball Payment Tracker", "Pizza de Uno"],
    app: ["Mobile Development", "Owly", "CodeQuiz", "SmartLock", "Basketball Payment Tracker", "Pizza de Uno"],
  };

  for (const [keyword, titles] of Object.entries(categoryMap)) {
    if (!questionLower.includes(keyword)) continue;

    for (const section of sections) {
      if (titles.includes(section.title)) {
        selected.set(section.title, section.content);
      }
    }
  }

  if (selected.size <= alwaysInclude.length) {
    const fallbackTitles = ["Focus Areas", "Projects", "Social And Contact Links", ...projectTitles];
    for (const section of sections) {
      if (fallbackTitles.includes(section.title)) {
        selected.set(section.title, section.content);
      }
    }
  }

  return [...selected.values()].join("\n\n");
}

function createConversationId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeConversationId(conversationId) {
  const value = typeof conversationId === "string" ? conversationId : "";
  return /^[a-f0-9]{32,64}$/.test(value) ? value : createConversationId();
}

function cleanupExpiredConversations() {
  const now = Date.now();
  for (const [conversationId, conversation] of conversationStore.entries()) {
    if (!conversation?.updated_at || now - conversation.updated_at > CONVERSATION_TTL_SECONDS * 1000) {
      conversationStore.delete(conversationId);
    }
  }
}

async function loadConversation(env, conversationId) {
  let conversation;

  if (hasKV(env)) {
    conversation = await getJsonFromKV(env, `conversation:${conversationId}`, null);
  } else {
    cleanupExpiredConversations();
    conversation = conversationStore.get(conversationId);
  }

  if (!conversation) return [];

  if (conversation.updated_at && Date.now() - conversation.updated_at > CONVERSATION_TTL_SECONDS * 1000) {
    if (hasKV(env)) {
      await env.JCRPBOT_KV.delete(`conversation:${conversationId}`);
    } else {
      conversationStore.delete(conversationId);
    }
    return [];
  }

  return (conversation.messages || []).map((message) => {
    if (message.role === "model" && typeof message.text === "string") {
      return { ...message, text: cleanReply(message.text) };
    }
    return message;
  });
}

async function saveConversation(env, conversationId, messages) {
  const conversation = {
    updated_at: Date.now(),
    messages: messages.slice(-MAX_HISTORY_MESSAGES),
  };

  if (hasKV(env)) {
    await putJsonToKV(env, `conversation:${conversationId}`, conversation, {
      expirationTtl: CONVERSATION_TTL_SECONDS,
    });
  } else {
    conversationStore.set(conversationId, conversation);
  }
}

async function loadLastUsage(env) {
  if (!hasKV(env)) return lastUsage;

  const stats = await getJsonFromKV(env, "stats:last-usage", null);
  if (!stats || typeof stats !== "object") return getDefaultUsageSummary();

  return {
    ...getDefaultUsageSummary(),
    ...stats,
  };
}

async function saveLastUsage(env, usage) {
  lastUsage = usage;

  if (hasKV(env)) {
    await putJsonToKV(env, "stats:last-usage", usage);
  }
}

async function getApprovedKnowledge(env) {
  if (!hasKV(env)) return "";

  const value = await env.JCRPBOT_KV.get("learning:approved");
  return typeof value === "string" ? value.trim() : "";
}

function compactLearningText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 180);
}

function shouldAutoLearnMessage(message) {
  const text = compactLearningText(message);
  if (text.length < 8) return false;

  const lowerText = text.toLowerCase();
  const ignoredMessages = [
    "hi",
    "hello",
    "hey",
    "thanks",
    "thank you",
    "ok",
    "okay",
  ];

  return !ignoredMessages.includes(lowerText);
}

async function saveAutoApprovedLearning(env, message) {
  if (!hasKV(env) || !shouldAutoLearnMessage(message)) return;

  const compactMessage = compactLearningText(message);
  const currentKnowledge = await getApprovedKnowledge(env);
  const existingLines = currentKnowledge
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const newLine = `- Visitor-provided note: ${compactMessage}`;

  if (existingLines.some((line) => line.toLowerCase() === newLine.toLowerCase())) {
    return;
  }

  const updatedLines = [...existingLines, newLine].slice(-80);
  await env.JCRPBOT_KV.put("learning:approved", updatedLines.join("\n"));
}

function shouldStoreLearningCandidate(reply) {
  const normalizedReply = String(reply || "").toLowerCase();
  return [
    "do not have that detail",
    "don't have that detail",
    "not available yet",
    "i do not have",
    "i don't have",
    "wala pa",
    "di ko pa",
    "hindi ko pa",
  ].some((pattern) => normalizedReply.includes(pattern));
}

async function saveLearningCandidate(env, candidate) {
  if (!hasKV(env)) return;

  const key = "learning:pending";
  const pending = await getJsonFromKV(env, key, []);
  const entries = Array.isArray(pending) ? pending : [];
  entries.push(candidate);

  await putJsonToKV(env, key, entries.slice(-100));
}

function getGeminiModels() {
  return [...new Set([GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS])];
}

function shouldTryNextGeminiModel(statusCode, geminiStatus) {
  return statusCode === 429 || statusCode === 503 || ["RESOURCE_EXHAUSTED", "UNAVAILABLE"].includes(geminiStatus);
}

function getGeminiRetryAfter(result) {
  const details = result?.error?.details;
  if (!Array.isArray(details)) return 30;

  for (const detail of details) {
    const retryDelay = detail?.retryDelay || "";
    const match = typeof retryDelay === "string" ? retryDelay.match(/^(\d+)s$/) : null;
    if (match) return Math.max(1, Number(match[1]));
  }

  return 30;
}

async function callGeminiModel(model, payload, apiKey) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  return {
    model,
    status: response.status,
    result,
  };
}

async function getDynamicGeminiModels(apiKey) {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
      headers: {
        "x-goog-api-key": apiKey,
      },
    });
    const result = await response.json();
    const models = Array.isArray(result?.models) ? result.models : [];

    return models
      .filter((model) => Array.isArray(model.supportedGenerationMethods) && model.supportedGenerationMethods.includes("generateContent"))
      .map((model) => String(model.name || "").replace(/^models\//, ""))
      .filter((model) => model.startsWith("gemini-"));
  } catch {
    return [];
  }
}

async function callGeminiWithFallback(payload, apiKey) {
  let lastAttempt = null;
  const models = [...new Set([...getGeminiModels(), ...(await getDynamicGeminiModels(apiKey))])];

  for (const model of models) {
    const attempt = await callGeminiModel(model, payload, apiKey);
    lastAttempt = attempt;

    if (attempt.status < 400) {
      return {
        ok: true,
        provider: "gemini",
        model: attempt.model,
        reply: attempt.result?.candidates?.[0]?.content?.parts?.[0]?.text || "",
        usage: buildUsageSummary(attempt.result?.usageMetadata || {}),
        tried_models: [model],
      };
    }

    const geminiStatus = attempt.result?.error?.status || "";
    if (!shouldTryNextGeminiModel(attempt.status, geminiStatus)) {
      break;
    }
  }

  const geminiStatus = lastAttempt?.result?.error?.status || "";
  return {
    ok: false,
    retryable: shouldTryNextGeminiModel(lastAttempt?.status || 0, geminiStatus),
    retryAfter: getGeminiRetryAfter(lastAttempt?.result || {}),
    tried_models: models.map((model) => `gemini:${model}`),
  };
}

function geminiToOpenAiMessages(systemPrompt, contents) {
  const messages = [{ role: "system", content: systemPrompt }];

  for (const item of contents) {
    const text = (item.parts || []).map((part) => part.text || "").join("\n").trim();
    if (!text) continue;

    messages.push({
      role: item.role === "model" ? "assistant" : "user",
      content: text,
    });
  }

  return messages;
}

async function getDynamicGroqModels(apiKey) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const result = await response.json();
    const models = Array.isArray(result?.data) ? result.data : [];

    return models
      .map((model) => model.id)
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function callGroqModel(model, messages, apiKey) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.65,
    }),
  });

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  return {
    model,
    status: response.status,
    result,
  };
}

async function callGroqWithFallback(systemPrompt, contents, apiKey) {
  const messages = geminiToOpenAiMessages(systemPrompt, contents);
  const models = [...new Set(GROQ_FALLBACK_MODELS)];
  const triedModels = [];

  for (const model of models) {
    triedModels.push(`groq:${model}`);
    const attempt = await callGroqModel(model, messages, apiKey);

    if (attempt.status < 400) {
      const usage = attempt.result?.usage || {};
      const outputTokens = Number(usage.completion_tokens || 0);
      return {
        ok: true,
        provider: "groq",
        model: attempt.model,
        reply: attempt.result?.choices?.[0]?.message?.content || "",
        usage: {
          prompt_tokens: Number(usage.prompt_tokens || 0),
          output_tokens: outputTokens,
          total_tokens: Number(usage.total_tokens || 0),
          max_output_tokens: MAX_OUTPUT_TOKENS,
          output_display: `${outputTokens}/${MAX_OUTPUT_TOKENS}`,
        },
        tried_models: triedModels,
      };
    }
  }

  return {
    ok: false,
    tried_models: triedModels,
  };
}

async function callAiWithFallback(geminiPayload, env, groqContext) {
  const triedModels = [];

  if (env.GEMINI_API_KEY) {
    const geminiResult = await callGeminiWithFallback(geminiPayload, env.GEMINI_API_KEY);
    triedModels.push(...(geminiResult.tried_models || []));
    if (geminiResult.ok) return { ...geminiResult, tried_models: triedModels };
  }

  if (env.GROQ_API_KEY) {
    const groqResult = await callGroqWithFallback(groqContext.systemPrompt, groqContext.contents, env.GROQ_API_KEY);
    triedModels.push(...(groqResult.tried_models || []));
    if (groqResult.ok) return { ...groqResult, tried_models: triedModels };
  }

  return {
    ok: false,
    tried_models: triedModels,
  };
}

function cleanReply(reply) {
  return String(reply || "")
    .trim()
    .replace(/^hi\s+there!\s+i'm\s+jhon's\s+ai\s+portfolio\s+chatbot\.\s*/i, "")
    .replace(/^hello!\s+i'm\s+jhon's\s+ai\s+portfolio\s+chatbot\.\s*/i, "")
    .replace(/^i'm\s+jhon's\s+ai\s+portfolio\s+chatbot\.\s*/i, "")
    .trim();
}

function buildUsageSummary(usageMetadata) {
  const outputTokensUsed = Number(usageMetadata?.candidatesTokenCount || 0);

  return {
    prompt_tokens: Number(usageMetadata?.promptTokenCount || 0),
    output_tokens: outputTokensUsed,
    total_tokens: Number(usageMetadata?.totalTokenCount || 0),
    max_output_tokens: MAX_OUTPUT_TOKENS,
    output_display: `${outputTokensUsed}/${MAX_OUTPUT_TOKENS}`,
  };
}

function getDefaultUsageSummary() {
  return buildUsageSummary({});
}

function getCurrentDateTimeContext() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return formatter.format(new Date());
}

function buildSystemPrompt(portfolioKnowledge) {
  return `
You answer questions about Jhon Cristopher R. Potestas for his portfolio.

Current date and time: ${getCurrentDateTimeContext()}.

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
${portfolioKnowledge}
`;
}
