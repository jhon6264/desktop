  
const container = document.getElementById("floating-windows-container");
const CHATBOT_API_URL = "https://jcrpbot.spyam17.workers.dev/";
const CHATBOT_MAX_VISIBLE_MESSAGES = 10;
const CHATBOT_MESSAGES_STORAGE_KEY = "jcrp_chatbot_messages";
const CHATBOT_COOLDOWN_STORAGE_KEY = "jcrp_chatbot_cooldown_until";
const CHATBOT_COOLDOWN_MESSAGE_STORAGE_KEY = "jcrp_chatbot_cooldown_message";
const CHATBOT_LOCKED_STORAGE_KEY = "jcrp_chatbot_locked";
const CHATBOT_SENSITIVE_WARNING = "huyy bastos, ayaw ana part";
const CHATBOT_INPUT_PLACEHOLDER = "Ask something...";
const CONTACT_EMAIL = "jhoncristopherpotestas@gmail.com";
let chatbotConversationId = localStorage.getItem("jcrp_chatbot_conversation_id") || "";
let chatbotVisitorId = localStorage.getItem("jcrp_chatbot_visitor_id") || "";

if (!chatbotVisitorId) {
  chatbotVisitorId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem("jcrp_chatbot_visitor_id", chatbotVisitorId);
}

const ABOUT_PORTRAIT_IMAGE = "assets/icons/Profile.png";

function setAboutPortrait() {
  const portrait = document.querySelector(".about-portrait-img");
  if (!portrait) return;

  portrait.src = ABOUT_PORTRAIT_IMAGE;
}

window.setAboutPortrait = setAboutPortrait;

function centerFloatingWindow(modal) {
  const padding = 20;
  const modalWidth = modal.offsetWidth;
  const modalHeight = modal.offsetHeight;
  const maxLeft = window.innerWidth - modalWidth - padding;
  const maxTop = window.innerHeight - modalHeight - padding;
  const centeredLeft = (window.innerWidth - modalWidth) / 2;
  const centeredTop = (window.innerHeight - modalHeight) / 2;
  const homeWindow = document.getElementById("home-window");
  let left = centeredLeft;
  let top = centeredTop;

  if (window.innerWidth >= 800 && homeWindow) {
    const gap = 24;
    const homeRect = homeWindow.getBoundingClientRect();
    const rightSpace = window.innerWidth - homeRect.right - padding;
    const leftSpace = homeRect.left - padding;

    if (rightSpace >= modalWidth + gap) {
      left = homeRect.right + gap;
    } else if (leftSpace >= modalWidth + gap) {
      left = homeRect.left - modalWidth - gap;
    }
  }

  modal.style.left = `${Math.max(padding, Math.min(left, maxLeft))}px`;
  modal.style.top = `${Math.max(padding, Math.min(top, maxTop))}px`;
}

function runAnime(targets, params) {
  if (!targets || (targets.length !== undefined && targets.length === 0)) return null;

  if (window.anime?.animate) {
    return window.anime.animate(targets, params);
  }

  if (typeof window.anime === "function") {
    const legacyParams = { targets, ...params };
    if (params.ease && !params.easing) {
      legacyParams.easing = params.ease;
      delete legacyParams.ease;
    }
    return window.anime(legacyParams);
  }

  return null;
}

function getStaggerDelay(step = 45, start = 0) {
  if (window.anime?.stagger) {
    return window.anime.stagger(step, { start });
  }

  return (target, index) => start + index * step;
}

function animateFloatingWindow(modal) {
  if (!window.anime) return;

  modal.classList.remove("expand-in");
  runAnime(modal, {
    opacity: [0, 1],
    scale: [0.96, 1],
    duration: 380,
  });
}

function animateModalContent(modal, type) {
  if (!window.anime) return;

  const selectorsByType = {
    about: ".about-section, .about-info-row",
    tools: ".tools-modal-content h3, .tools-modal-content .tools-grid-item",
    projects: ".project-section-title, .project-item",
    links: ".icon-link, .link-warning",
    contact: ".contact-modal-content label, .contact-modal-content input, .contact-modal-content textarea, .contact-modal-content button",
    chatbot: ".chat-message, .chatbot-input-row",
  };

  const selector = selectorsByType[type] || ".modal-content > *";
  const targets = modal.querySelectorAll(selector);

  runAnime(targets, {
    opacity: [0, 1],
    translateY: [14, 0],
    duration: 420,
    delay: getStaggerDelay(45, 90),
  });

  // anime.js leaves an inline transform behind, which outranks CSS :hover
  // rules (e.g. the Links icons' hover scale). Clear it once the entrance
  // animation has finished so those hover effects work again.
  const settleDelay = 420 + 90 + targets.length * 45 + 120;
  setTimeout(() => {
    targets.forEach((target) => {
      target.style.transform = "";
    });
  }, settleDelay);
}

function animateHomeIcons() {
  if (!window.anime) return;

  runAnime(document.querySelectorAll(".icon-item"), {
    opacity: [0, 1],
    translateY: [18, 0],
    scale: [0.92, 1],
    duration: 520,
    delay: getStaggerDelay(70, 120),
  });
}

const CHATBOT_LINK_LABELS = {
  "jhon6264.github.io/portfolio": "First Online Portfolio",
  "poketalk.free.nf": "PokeTalk",
  "instagram.com": "Instagram",
  "facebook.com": "Facebook",
  "youtube.com": "YouTube",
  "t.me": "Telegram",
  "discord.com": "Discord",
};

const CHATBOT_URL_PATTERN = /\bhttps?:\/\/[^\s<>"')\]]+[^\s<>"')\].,!?]/gi;

// Mirrors the .project-item cards inside the "projects" floating window.
// `slug` must match that card's data-project attribute so we can scroll/highlight it.
const CHATBOT_PROJECTS = [
  {
    slug: "professional-portfolio",
    names: ["professional portfolio"],
    image: "assets/projects/Portfolio-second.png",
    action: { type: "link", href: "https://jhonpotestas.vercel.app/", label: "View Portfolio" },
  },
  {
    slug: "first-online-portfolio",
    names: ["first online portfolio", "online portfolio"],
    image: "assets/portfolio.png",
    action: { type: "link", href: "https://jhon6264.github.io/portfolio/", label: "View Portfolio" },
  },
  {
    slug: "domats",
    names: ["domats", "do-mats"],
    image: "assets/projects/DoMats.png",
    action: null,
  },
  {
    slug: "riderx",
    names: ["riderx", "rider x"],
    image: "assets/Riderx.png",
    action: null,
  },
  {
    slug: "poketalk",
    names: ["poketalk", "poke talk"],
    image: "assets/PokeTalk.png",
    action: { type: "link", href: "https://poketalk.free.nf/", label: "View Website" },
  },
  {
    slug: "swaggy-adventure",
    names: ["swaggy adventure", "swaggy"],
    image: "assets/swaggy.png",
    action: null,
  },
  {
    slug: "pakman-lite",
    names: ["pakman lite", "pakman"],
    image: "assets/pakman.png",
    action: null,
  },
  {
    slug: "owly",
    names: ["owly"],
    image: "assets/projects/Owly.jpg",
    action: null,
  },
  {
    slug: "codequiz",
    names: ["codequiz", "code quiz"],
    image: "assets/projects/Codequiz.jpg",
    action: {
      type: "link",
      href: "https://drive.google.com/drive/folders/1UpClqFDglTAjfJTgivVc_6Wo15eSL7Qc?usp=sharing",
      label: "Download App",
    },
  },
  {
    slug: "smartlock",
    names: ["smartlock", "smart lock"],
    image: "assets/SmartLock.jpg",
    action: { type: "download", href: "apk/SmartLock.apk", label: "Download App" },
  },
  {
    slug: "basketball-payment-tracker",
    names: ["basketball payment tracker", "payment tracker"],
    image: "assets/BasketballPaymentTracker.jpg",
    action: { type: "download", href: "apk/BasketballPaymentTracker.apk", label: "Download App" },
  },
  {
    slug: "pizza-de-uno",
    names: ["pizza de uno", "pizza de uno app"],
    image: "assets/pizzadeuno.png",
    action: null,
  },
  {
    slug: "registration-system",
    names: ["registration system"],
    image: "assets/registration.png",
    action: null,
  },
];

function getChatbotLinkLabel(url) {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.replace(/^www\./, "");
    const hostAndPath = `${host}${pathname}`.replace(/\/$/, "");

    for (const [match, label] of Object.entries(CHATBOT_LINK_LABELS)) {
      if (hostAndPath.includes(match)) return label;
    }

    return host;
  } catch {
    return url;
  }
}

function extractChatbotLinks(text) {
  const matches = String(text || "").match(CHATBOT_URL_PATTERN) || [];
  const seen = new Set();
  const links = [];

  matches.forEach((url) => {
    if (seen.has(url)) return;
    seen.add(url);
    links.push({ url, label: getChatbotLinkLabel(url) });
  });

  return links;
}

// About-window sections and Tools-window categories the chatbot can jump to.
// Links/social icons are intentionally excluded: those already have their own
// direct redirect button and don't need an in-app "View in Portfolio" jump.
const CHATBOT_ABOUT_TOPICS = [
  { anchor: "location", names: ["balnate", "magsaysay", "davao del sur", "where does jhon live", "jhon's location"], label: "Location" },
  { anchor: "focus", names: ["focus areas", "main focus", "ui/ux design"], label: "Focus" },
  { anchor: "currently-learning", names: ["currently learning", "learning react", "learning laravel", "learning godot"], label: "Currently Learning" },
  { anchor: "education", names: ["education", "elementary school", "high school", "college", "st. mary's college", "magsaysay academy", "padada national"], label: "Education" },
  { anchor: "interests", names: ["interests", "farm animals", "video editing"], label: "Interests" },
  { anchor: "languages", names: ["languages", "cebuano", "bisaya", "tagalog", "basic japanese"], label: "Languages" },
];

const CHATBOT_TOOLS = [
  { category: "development-stack", categoryLabel: "Development Stack", names: ["html", "css", "javascript", "php", "python", "development stack"] },
  { category: "frontend", categoryLabel: "Frontend", names: ["bootstrap", "tailwind", "react", "next.js", "nextjs", "frontend tools", "frontend"] },
  { category: "backend", categoryLabel: "Backend", names: ["laravel", "java", "c++", "backend tools", "backend"] },
  { category: "storage", categoryLabel: "Storage & Hosting", names: ["github", "infinityfree", "firebase", "hostinger", "cloudflare", "storage and hosting", "hosting"] },
  { category: "design", categoryLabel: "Design Tools", names: ["figma", "photoshop", "blender", "canva", "design tools"] },
  { category: "mobile-dev", categoryLabel: "Mobile Development", names: ["flutter", "react native expo", "mobile development"] },
  { category: "game-dev", categoryLabel: "Game Development", names: ["godot", "gdscript", "gd script", "game development"] },
  { category: "favorite-libraries", categoryLabel: "Favorite Libraries", names: ["anime.js", "flaticon", "google fonts", "daisyui", "dafont", "iconape", "react icons", "favorite libraries"] },
  { category: "software", categoryLabel: "Software", names: ["visual studio", "netbeans", "cisco packet tracer", "xampp", "postman", "arduino", "proton vpn", "expo orbit"] },
  { category: "artificial-intelligence", categoryLabel: "AI Tools", names: ["chatgpt", "claude", "deepseek", "gemini", "cursor", "ai tools"] },
  { category: "video", categoryLabel: "Video Tools", names: ["capcut", "adobe premiere", "video tools"] },
  { category: "others", categoryLabel: "Other Tools", names: ["microsoft word", "powerpoint", "excel"] },
];

// Raw URLs are surfaced as buttons under the reply, so strip them out of the
// displayed text. Matching/lookup still runs against the original string.
function stripUrlsForDisplay(text) {
  // Remove the URL plus any wrapping parens/angle brackets, and any dangling
  // connector left in front of it ("live at <url>" -> "live"), so the sentence
  // still reads once the link becomes a button.
  // [ \t]* (not \s*) so newlines are preserved and lines never get glued.
  // Replaced with a single space; stray spaces before punctuation are cleaned
  // up per-line below.
  const withoutUrls = String(text || "").replace(
    /(?:[ \t]+(?:at|on|via|from|to))?[ \t]*[(<[]?[ \t]*https?:\/\/[^\s<>"')\]]+[^\s<>"')\].,!?][ \t]*[)>\]]?/gi,
    " "
  );

  return withoutUrls
    .split("\n")
    // Drop bullets/lines that held nothing but the URL.
    .filter((line) => /[a-z0-9]/i.test(line))
    .map((line) =>
      line
        .replace(/\s{2,}/g, " ")
        // Collapse punctuation stranded by the removal (" ." / " ,").
        .replace(/\s+([.,!?;:])/g, "$1")
        .trimEnd()
    )
    .join("\n")
    .trim();
}

function textMentionsPhrase(lowerText, phrase) {
  // Word-boundary match so short/substring names (e.g. "java" vs "javascript",
  // "css" vs "success") don't false-positive inside unrelated words.
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, "i").test(lowerText);
}

function findMentionedProjects(text) {
  const lowerText = String(text || "").toLowerCase();
  return CHATBOT_PROJECTS.filter((project) =>
    project.names.some((name) => textMentionsPhrase(lowerText, name))
  );
}

function findMentionedAboutTopics(text) {
  const lowerText = String(text || "").toLowerCase();
  return CHATBOT_ABOUT_TOPICS.filter((topic) =>
    topic.names.some((name) => textMentionsPhrase(lowerText, name))
  );
}

function findMentionedToolCategories(text) {
  const lowerText = String(text || "").toLowerCase();
  return CHATBOT_TOOLS.filter((tool) =>
    tool.names.some((name) => textMentionsPhrase(lowerText, name))
  );
}

// Opens a floating window, scrolls to a matching element inside it, and flashes a highlight.
function navigateToPortfolioTarget(windowType, selector, highlightClass = "project-item-highlight") {
  createFloatingWindow(windowType, null);

  requestAnimationFrame(() => {
    const modal = container.querySelector(`.floating-window[data-type="${windowType}"]`);
    const targets = modal ? [...modal.querySelectorAll(selector)] : [];
    if (!modal || !targets.length) return;

    modal.style.zIndex = ++zIndexCounter;

    setTimeout(() => {
      targets[0].scrollIntoView({ behavior: "smooth", block: "center" });
      targets.forEach((target) => {
        target.classList.remove(highlightClass);
        // Force reflow so the animation restarts if triggered again on the same element.
        void target.offsetWidth;
        target.classList.add(highlightClass);
        target.addEventListener("animationend", () => {
          target.classList.remove(highlightClass);
        }, { once: true });
      });
    }, 260);
  });
}

function navigateToProject(slug) {
  navigateToPortfolioTarget("projects", `.project-item[data-project="${slug}"]`);
}

function navigateToAboutTopic(anchor) {
  navigateToPortfolioTarget("about", `[data-about-section="${anchor}"]`);
}

function navigateToToolCategory(category) {
  navigateToPortfolioTarget("tools", `[data-tools-category="${category}"]`, "tools-category-highlight");
}

// --- Lightweight markdown rendering for chat bubbles -------------------------
// Deliberately built from DOM nodes (never innerHTML) so model output can't
// inject markup. Supports the small subset Gemini actually emits: **bold**,
// *italic*, `code`, bullet lists, and line breaks.

function appendInlineMarkdown(parent, text) {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;

  for (const match of String(text).matchAll(pattern)) {
    if (match.index > lastIndex) {
      parent.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const token = match[0];
    let node;

    if (token.startsWith("**")) {
      node = document.createElement("strong");
      node.textContent = token.slice(2, -2);
    } else if (token.startsWith("`")) {
      node = document.createElement("code");
      node.textContent = token.slice(1, -1);
    } else {
      node = document.createElement("em");
      node.textContent = token.slice(1, -1);
    }

    parent.appendChild(node);
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parent.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function renderMarkdownInto(container, text) {
  container.textContent = "";

  const lines = String(text || "").split(/\r\n|\n|\r/);
  let paragraph = null;
  let list = null;

  const closeParagraph = () => { paragraph = null; };
  const closeList = () => { list = null; };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      closeParagraph();
      closeList();
      return;
    }

    const bullet = line.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      closeParagraph();
      if (!list) {
        list = document.createElement("ul");
        list.className = "chat-md-list";
        container.appendChild(list);
      }
      const item = document.createElement("li");
      appendInlineMarkdown(item, bullet[1]);
      list.appendChild(item);
      return;
    }

    closeList();

    if (!paragraph) {
      paragraph = document.createElement("p");
      container.appendChild(paragraph);
    } else {
      paragraph.appendChild(document.createElement("br"));
    }

    appendInlineMarkdown(paragraph, line);
  });

  // Guarantee at least one <p> so existing selectors (e.g. saveChatMessages,
  // which reads .chat-bubble p) keep working on empty or whitespace replies.
  if (!container.querySelector("p, ul")) {
    const fallback = document.createElement("p");
    fallback.textContent = String(text || "");
    container.appendChild(fallback);
  }
}

// Reveals a bot reply word-by-word, then runs `onComplete` to attach the
// project cards / link buttons that depend on the full text.
function typeOutMarkdown(container, text, onComplete, scrollTarget) {
  const words = String(text || "").split(/(\s+)/).filter(Boolean);
  let index = 0;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    renderMarkdownInto(container, text);
    container.closest(".chat-message")?.classList.remove("is-writing");
    onComplete?.();
    if (scrollTarget) scrollChatToBottom(scrollTarget);
  };

  container.closest(".chat-message")?.classList.add("is-writing");

  const timer = setInterval(() => {
    if (index >= words.length) {
      finish();
      return;
    }

    index += 1;
    renderMarkdownInto(container, words.slice(0, index).join(""));
    if (scrollTarget) scrollChatToBottom(scrollTarget);
  }, 25);

  return finish;
}

function createViewInPortfolioButton(label, onClick) {
  const viewBtn = document.createElement("button");
  viewBtn.type = "button";
  viewBtn.className = "chat-link-btn chat-link-btn-outline";
  viewBtn.innerHTML = `<span>${label}</span><i class="bi bi-search"></i>`;
  viewBtn.addEventListener("click", onClick);
  return viewBtn;
}

function createProjectCard(project) {
  const card = document.createElement("div");
  card.className = "chat-project-card";

  const image = document.createElement("img");
  image.src = project.image;
  image.alt = project.slug;
  image.loading = "lazy";
  card.appendChild(image);

  const actions = document.createElement("div");
  actions.className = "chat-project-actions";

  if (project.action) {
    const actionBtn = document.createElement("a");
    actionBtn.className = "chat-link-btn";
    actionBtn.href = project.action.href;
    if (project.action.type === "download") {
      actionBtn.setAttribute("download", "");
    } else {
      actionBtn.target = "_blank";
      actionBtn.rel = "noopener noreferrer";
    }
    const icon = project.action.type === "download" ? "bi-download" : "bi-box-arrow-up-right";
    actionBtn.innerHTML = `<span>${project.action.label}</span><i class="bi ${icon}"></i>`;
    actions.appendChild(actionBtn);
  }

  actions.appendChild(createViewInPortfolioButton("View in Portfolio", () => navigateToProject(project.slug)));

  card.appendChild(actions);
  return card;
}

function createChatMessage(role, text, isTyping = false, options = {}) {
  const { shouldType = false, scrollTarget = null } = options;
  const message = document.createElement("div");
  message.className = `chat-message ${role === "user" ? "user-message" : "bot-message"}`;
  message.classList.toggle("is-typing", isTyping);

  if (role !== "user") {
    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";

    const avatarImage = document.createElement("img");
    avatarImage.src = "assets/icons/Profile.png";
    avatarImage.alt = "Jhon assistant";

    avatar.appendChild(avatarImage);
    message.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";

  if (isTyping) {
    bubble.classList.add("typing-bubble");
    bubble.innerHTML = `
      <span class="typing-dots" aria-label="Bot is thinking">
        <span></span>
        <span></span>
        <span></span>
      </span>
    `;
  } else {
    const body = document.createElement("div");
    body.className = "chat-bubble-body";
    bubble.appendChild(body);

    if (role === "user") {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      body.appendChild(paragraph);
    } else {
      // Extras are matched against the original text (URLs help identify
      // projects), but the displayed copy drops the raw links.
      const displayText = stripUrlsForDisplay(text);
      const attachExtras = () => appendChatExtras(bubble, text);

      if (shouldType) {
        const finishTyping = typeOutMarkdown(body, displayText, attachExtras, scrollTarget);
        // Clicking a message that is still typing reveals it immediately.
        message.addEventListener("click", finishTyping, { once: true });
      } else {
        renderMarkdownInto(body, displayText);
        attachExtras();
      }
    }
  }

  message.appendChild(bubble);
  return message;
}

// Project cards, About/Tools jump buttons, and raw link buttons that follow a
// bot reply. Split out of createChatMessage so it can run after the typing
// animation completes.
function appendChatExtras(bubble, text) {
  const mentionedProjects = findMentionedProjects(text);

  mentionedProjects.forEach((project) => {
    bubble.appendChild(createProjectCard(project));
  });

  const mentionedAboutTopics = findMentionedAboutTopics(text);
  const mentionedToolCategories = findMentionedToolCategories(text);

  if (mentionedAboutTopics.length || mentionedToolCategories.length) {
    const topicRow = document.createElement("div");
    topicRow.className = "chat-bubble-links";

    mentionedAboutTopics.forEach((topic) => {
      topicRow.appendChild(
        createViewInPortfolioButton(topic.label, () => navigateToAboutTopic(topic.anchor))
      );
    });

    mentionedToolCategories.forEach((tool) => {
      topicRow.appendChild(
        createViewInPortfolioButton(tool.categoryLabel, () => navigateToToolCategory(tool.category))
      );
    });

    bubble.appendChild(topicRow);
  }

  const links = extractChatbotLinks(text).filter((link) => {
    // Skip links already surfaced as a project card's action button.
    return !mentionedProjects.some((project) => project.action?.href === link.url);
  });

  if (links.length) {
    const linkRow = document.createElement("div");
    linkRow.className = "chat-bubble-links";

    links.forEach(({ url, label }) => {
      const linkButton = document.createElement("a");
      linkButton.className = "chat-link-btn";
      linkButton.href = url;
      linkButton.target = "_blank";
      linkButton.rel = "noopener noreferrer";
      linkButton.innerHTML = `<span>${label}</span><i class="bi bi-box-arrow-up-right"></i>`;
      linkRow.appendChild(linkButton);
    });

    bubble.appendChild(linkRow);
  }
}

function trimChatMessages(messages) {
  const visibleMessages = [...messages.querySelectorAll(".chat-message:not(.is-typing)")];
  const excessCount = visibleMessages.length - CHATBOT_MAX_VISIBLE_MESSAGES;

  if (excessCount <= 0) return;

  visibleMessages.slice(0, excessCount).forEach((message) => message.remove());
}

function getStoredChatMessages() {
  try {
    const storedMessages = JSON.parse(localStorage.getItem(CHATBOT_MESSAGES_STORAGE_KEY) || "[]");
    if (!Array.isArray(storedMessages)) return [];

    return storedMessages
      .filter((message) => ["user", "bot"].includes(message.role) && typeof message.text === "string")
      .slice(-CHATBOT_MAX_VISIBLE_MESSAGES);
  } catch {
    return [];
  }
}

function saveChatMessages(messages) {
  const chatMessages = [...messages.querySelectorAll(".chat-message:not(.is-typing)")].map((message) => ({
    role: message.classList.contains("user-message") ? "user" : "bot",
    // dataset.fullText holds the complete reply while it is still typing out;
    // fall back to the rendered text for user messages and restored history.
    text: message.dataset.fullText
      || message.querySelector(".chat-bubble-body")?.textContent
      || message.querySelector(".chat-bubble p")?.textContent
      || "",
  })).filter((message) => message.text);

  localStorage.setItem(
    CHATBOT_MESSAGES_STORAGE_KEY,
    JSON.stringify(chatMessages.slice(-CHATBOT_MAX_VISIBLE_MESSAGES))
  );
}

function restoreChatMessages(messages) {
  const storedMessages = getStoredChatMessages();

  if (!storedMessages.length) return;

  messages.innerHTML = "";
  storedMessages.forEach((message) => {
    messages.appendChild(createChatMessage(message.role, message.text));
  });
  trimChatMessages(messages);
  scrollChatToBottom(messages);
}

function scrollChatToBottom(messages) {
  messages.scrollTop = messages.scrollHeight;
}

function formatChatbotCooldown(seconds) {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
  }

  return `${seconds}s`;
}

function getChatbotCooldownSeconds() {
  const cooldownUntil = Number(localStorage.getItem(CHATBOT_COOLDOWN_STORAGE_KEY) || 0);
  return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
}

function showChatbotLimitAlert(modal, message) {
  const alert = modal.querySelector(".chatbot-limit-alert");
  if (!alert) return;

  alert.textContent = message;
  alert.hidden = false;
}

function hideChatbotLimitAlert(modal) {
  const alert = modal.querySelector(".chatbot-limit-alert");
  if (!alert) return;

  alert.hidden = true;
  alert.textContent = "";
}

function setChatbotCooldown(retryAfter, message = "Message limit reached for now. Please wait {time} before sending again.") {
  const seconds = Math.max(1, Number(retryAfter) || 300);
  localStorage.setItem(CHATBOT_COOLDOWN_STORAGE_KEY, String(Date.now() + seconds * 1000));
  localStorage.setItem(CHATBOT_COOLDOWN_MESSAGE_STORAGE_KEY, message);
}

function updateChatbotCooldownState(modal) {
  const form = modal.querySelector(".chatbot-input-row");
  const input = form?.querySelector("input");
  const button = form?.querySelector("button");
  const remainingSeconds = getChatbotCooldownSeconds();
  const isLocked = localStorage.getItem(CHATBOT_LOCKED_STORAGE_KEY) === "true";

  if (!form || !input || !button) return false;

  if (remainingSeconds > 0) {
    const waitLabel = formatChatbotCooldown(remainingSeconds);
    const cooldownMessage = localStorage.getItem(CHATBOT_COOLDOWN_MESSAGE_STORAGE_KEY)
      || "Please wait {time} before sending again.";
    showChatbotLimitAlert(
      modal,
      cooldownMessage.replace("{time}", waitLabel)
    );
    input.disabled = true;
    input.placeholder = `Please wait ${waitLabel}`;
    button.disabled = true;
    form.classList.add("is-cooling-down");
    return true;
  }

  hideChatbotLimitAlert(modal);
  localStorage.removeItem(CHATBOT_COOLDOWN_MESSAGE_STORAGE_KEY);
  form.classList.remove("is-cooling-down");
  input.disabled = isLocked;
  button.disabled = isLocked;

  if (!isLocked) {
    input.placeholder = CHATBOT_INPUT_PLACEHOLDER;
  }

  return false;
}

function startChatbotCooldownTimer(modal) {
  if (modal.chatbotCooldownTimer) {
    clearInterval(modal.chatbotCooldownTimer);
  }

  updateChatbotCooldownState(modal);

  modal.chatbotCooldownTimer = setInterval(() => {
    const isCoolingDown = updateChatbotCooldownState(modal);
    if (!isCoolingDown) {
      clearInterval(modal.chatbotCooldownTimer);
      modal.chatbotCooldownTimer = null;
    }
  }, 1000);
}

function setChatbotPending(form, isPending) {
  const input = form.querySelector("input");
  const button = form.querySelector("button");
  const modal = form.closest(".floating-window");
  const isCoolingDown = modal ? getChatbotCooldownSeconds() > 0 : false;
  const isLocked = localStorage.getItem(CHATBOT_LOCKED_STORAGE_KEY) === "true";

  input.disabled = isPending || isCoolingDown || isLocked;
  button.disabled = isPending || isCoolingDown || isLocked;
  form.classList.toggle("is-pending", isPending);
}

function lockChatbotInput(modal) {
  const form = modal.querySelector(".chatbot-input-row");
  const input = form.querySelector("input");
  const button = form.querySelector("button");

  localStorage.setItem(CHATBOT_LOCKED_STORAGE_KEY, "true");
  input.value = "";
  input.placeholder = "Chat locked";
  input.disabled = true;
  button.disabled = true;
  form.classList.add("is-locked");
}

function restoreChatbotLock(modal) {
  if (localStorage.getItem(CHATBOT_LOCKED_STORAGE_KEY) === "true") {
    lockChatbotInput(modal);
  }
}

async function sendChatbotMessage(modal) {
  const form = modal.querySelector(".chatbot-input-row");
  const input = form.querySelector("input");
  const messages = modal.querySelector(".chatbot-messages");
  const userMessage = input.value.trim();

  if (updateChatbotCooldownState(modal)) return;
  if (!userMessage || form.classList.contains("is-pending")) return;

  input.value = "";
  messages.appendChild(createChatMessage("user", userMessage));
  trimChatMessages(messages);
  saveChatMessages(messages);
  const typingMessage = createChatMessage("bot", "", true);
  messages.appendChild(typingMessage);
  scrollChatToBottom(messages);
  setChatbotPending(form, true);

  try {
    const response = await fetch(CHATBOT_API_URL, {
      method: "POST",
      body: JSON.stringify({
        message: userMessage,
        conversation_id: chatbotConversationId,
        visitor_id: chatbotVisitorId,
      }),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("The chatbot endpoint returned HTML instead of JSON. The host may be showing a browser verification page.");
    }

    const data = await response.json();
    if (response.status === 429 || response.status === 503) {
      const retryAfter = data.retry_after || response.headers.get("Retry-After") || 300;
      const isVisitorLimit = Boolean(data.rate_limit);
      const cooldownTemplate = isVisitorLimit
        ? "Message limit reached for now. Please wait {time} before sending again."
        : "Gemini is busy or the API quota was reached. Please wait {time} before trying again.";
      setChatbotCooldown(retryAfter, cooldownTemplate);
      startChatbotCooldownTimer(modal);
      throw new Error(cooldownTemplate.replace("{time}", formatChatbotCooldown(Number(retryAfter) || 300)));
    }

    if (!response.ok) {
      throw new Error(data.error || "The chatbot could not answer right now.");
    }

    if (data.conversation_id) {
      chatbotConversationId = data.conversation_id;
      localStorage.setItem("jcrp_chatbot_conversation_id", chatbotConversationId);
    }

    const botReply = data.reply || "I could not generate a reply.";
    const botMessage = createChatMessage("bot", botReply, false, {
      shouldType: true,
      scrollTarget: messages,
    });
    // Keep the full reply available to saveChatMessages while it types out.
    botMessage.dataset.fullText = botReply;
    typingMessage.replaceWith(botMessage);
    trimChatMessages(messages);
    saveChatMessages(messages);

    if (botReply.trim().toLowerCase() === CHATBOT_SENSITIVE_WARNING) {
      lockChatbotInput(modal);
    }
  } catch (error) {
    typingMessage.replaceWith(createChatMessage("bot", error.message || "Connection failed. Please try again later."));
    trimChatMessages(messages);
    saveChatMessages(messages);
  } finally {
    setChatbotPending(form, false);
    if (!input.disabled) {
      input.focus();
    }
    scrollChatToBottom(messages);
  }
}

function createFloatingWindow(type, anchorElement) {
  // Prevent duplicate windows
  const existing = container.querySelector(`.floating-window[data-type="${type}"]`);
  if (existing) {
    existing.style.zIndex = ++zIndexCounter;
    return;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const modal = document.createElement("div");
  modal.className = `floating-window modal-box expand-in absolute pointer-events-auto`;
  modal.dataset.type = type;

const maxModalWidth = type === "tools" ? Math.min(950, Math.max(340, vw * 0.88)) : 720;
const maxModalHeight = type === "tools" ? Math.min(760, vh * 0.82) : 400;

const paddingX = 20; // 💡 horizontal space from left/right edge
const paddingY = 20; // 💡 vertical space from top/bottom edge


// 📌 Center Y
let centerY = (vh - maxModalHeight) / 2;

// 🌀 Random horizontal offset
let randomOffsetX = 0;

// 💡 Add random X offset to centered position
let centerX = (vw - maxModalWidth) / 2 + randomOffsetX;

// 🛡 Clamp X and Y so it stays within the viewport + padding
centerX = Math.max(paddingX, Math.min(centerX, vw - maxModalWidth - paddingX));
centerY = Math.max(paddingY, Math.min(centerY, vh - maxModalHeight - paddingY));

// 🎯 Apply to modal
modal.style.left = `${centerX}px`;
modal.style.top = `${centerY}px`;
modal.style.zIndex = ++zIndexCounter;


  // Modal content
  let modalContent = `
    <p>This is the content of the <strong>${type}</strong> window. You can customize it here.</p>
  `;

if (type === "about") {
  modalContent = `
<div class="about-modal-content">
  <div class="about-header">
    <div class="about-portrait">
      <img class="about-portrait-img" src="assets/icons/Profile.png" alt="Jhon Cristopher Potestas" />
    </div>
    <div class="about-text">
      <div class="name">Jhon Cristopher R. Potestas</div>
      <div class="degree">BS in Information Technology</div>
      <div class="year">4th Year Student</div>
      <div class="about-role">Junior Full-Stack Developer</div>
    </div>
  </div>

  <div class="about-scrollable">
    <section class="about-section about-bio" data-about-section="bio">
      <p>I’m an Information Technology student who enjoys building interactive websites, simple systems, and game-like experiences. I like combining design, code, and small details to make projects feel alive and personal.</p>
    </section>

    <section class="about-section" data-about-section="location">
      <a class="about-location-link" href="https://www.google.com/maps/search/?api=1&query=Balnate%2C%20Magsaysay%2C%20Davao%20del%20Sur%2C%20Philippines" target="_blank">
        <i class="bi bi-geo-alt-fill"></i>
        <span>Balnate, Magsaysay, Davao del Sur, Philippines</span>
      </a>
    </section>

    <section class="about-section" data-about-section="focus">
      <h3>Focus</h3>
      <div class="about-chip-list">
        <span>Web Development</span>
        <span>App Development</span>
        <span>Game Development</span>
        <span>UI/UX Design</span>
      </div>
    </section>

    <section class="about-section" data-about-section="currently-learning">
      <h3>Currently Learning</h3>
      <div class="about-learning-icons" aria-label="React, Laravel, Firebase, UI/UX, Godot">
        <img src="assets/icons/react.png" alt="React">
        <i class="devicon-laravel-original colored" aria-label="Laravel"></i>
        <img src="assets/icons/firebase.png" alt="Firebase">
        <i class="bi bi-bezier2" aria-label="UI/UX"></i>
        <i class="devicon-godot-plain colored" aria-label="Godot"></i>
      </div>
    </section>

    <section class="about-section education-section" data-about-section="education">
      <h3>Education</h3>
      <div class="about-info-row">
        <span>Primary</span>
        <p>Balnate Elementary School / AFPLC Elementary School</p>
      </div>
      <div class="about-info-row">
        <span>Secondary</span>
        <p>Magsaysay Academy Inc. / Padada National High School</p>
      </div>
      <div class="about-info-row">
        <span>Tertiary</span>
        <p>St. Mary's College of Bansalan Inc.</p>
      </div>
    </section>

    <section class="about-section interest-section" data-about-section="interests">
      <h3>Interests</h3>
      <ul class="about-interest-list">
        <li>Development </li>
        <li>Build Projects</li>
        <li>Video Editing</li>
        <li>Design</li>
        <li>Farm Animals</li>
      </ul>
    </section>

    <section class="about-section language-section" data-about-section="languages">
      <h3>Languages</h3>
      <p>Cebuano, Tagalog, English, and Basic Japanese</p>
    </section>
  </div>
</div>

  `;
}

if (type === "tools") {
  modalContent = `
    <div class="tools-modal-content tools-box">
  <h3 data-tools-category="development-stack">Development Stack</h3>
  <div class="tools-grid" data-tools-category="development-stack">
    <div class="tools-grid-item">
      <i class="devicon-html5-plain colored tool-icon"></i>
      <span>HTML</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-css3-plain colored tool-icon"></i>
      <span>CSS</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-javascript-plain colored tool-icon"></i>
      <span>JavaScript</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-php-plain colored tool-icon"></i>
      <span>PHP</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/python.png" alt="Python" class="tool-icon">
      <span>Python</span>
    </div>
  </div>

  <h3 data-tools-category="frontend">Frontend</h3>
  <div class="tools-grid" data-tools-category="frontend">
    <div class="tools-grid-item">
      <i class="devicon-bootstrap-plain colored tool-icon"></i>
      <span>Bootstrap 5</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-tailwindcss-original colored tool-icon"></i>
      <span>Tailwind CSS</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/react.png" alt="React" class="tool-icon">
      <span>React</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/nextjs.svg" alt="Next.js" class="tool-icon">
      <span>Next.js</span>
    </div>
  </div>

  <h3 data-tools-category="backend">Backend</h3>
  <div class="tools-grid" data-tools-category="backend">
    <div class="tools-grid-item">
      <i class="devicon-laravel-original colored tool-icon"></i>
      <span>Laravel</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-java-plain colored tool-icon"></i>
      <span>Java</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-cplusplus-plain colored tool-icon"></i>
      <span>C++</span>
    </div>
  </div>

  <h3 data-tools-category="storage">Storage</h3>
  <div class="tools-grid" data-tools-category="storage">
    <div class="tools-grid-item">
      <img src="assets/icons/github.png" alt="GitHub" class="tool-icon">
      <span>GitHub</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/infinityfree.png" alt="InfinityFree" class="tool-icon">
      <span>InfinityFree</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/firebase.png" alt="Firebase" class="tool-icon">
      <span>Firebase</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/hostinger.png" alt="Hostinger" class="tool-icon">
      <span>Hostinger</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-cloudflare-plain colored tool-icon"></i>
      <span>Cloudflare Workers</span>
    </div>
  </div>

  <h3 data-tools-category="design">Design</h3>
  <div class="tools-grid" data-tools-category="design">
    <div class="tools-grid-item">
      <img src="assets/icons/figma.png" alt="Figma" class="tool-icon">
      <span>Figma</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-photoshop-plain colored tool-icon"></i>
      <span>Photoshop</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-blender-original colored tool-icon"></i>
      <span>Blender</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-canva-original colored tool-icon"></i>
      <span>Canva</span>
    </div>
  </div>

  <h3 data-tools-category="mobile-dev">Mobile Dev</h3>
  <div class="tools-grid" data-tools-category="mobile-dev">
    <div class="tools-grid-item">
      <i class="devicon-flutter-plain colored tool-icon"></i>
      <span>Flutter</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/react-native-expo.png" alt="React Native Expo" class="tool-icon">
      <span>React Native Expo</span>
    </div>
  </div>

  <h3 data-tools-category="game-dev">Game Dev</h3>
  <div class="tools-grid" data-tools-category="game-dev">
    <div class="tools-grid-item">
      <i class="devicon-godot-plain colored tool-icon"></i>
      <span>Godot / GD Script</span>
    </div>
  </div>

  <h3 data-tools-category="favorite-libraries">Favorite Libraries</h3>
  <div class="tools-grid" data-tools-category="favorite-libraries">
    <div class="tools-grid-item">
      <img src="assets/icons/anime-js.png" alt="anime.js" class="tool-icon">
      <span>anime.js</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/flaticon.png" alt="Flaticon" class="tool-icon">
      <span>Flaticons</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/google-font.png" alt="Google Fonts" class="tool-icon">
      <span>Google Fonts</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/daisyUI.png" alt="DaisyUI" class="tool-icon">
      <span>DaisyUI</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/dafont.png" alt="Dafont" class="tool-icon">
      <span>Dafont</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/icon-icon.png" alt="icon-icons" class="tool-icon">
      <span>icon-icon</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/iconape.png" alt="Iconape" class="tool-icon">
      <span>Iconape</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/reacticons.svg" alt="React Icons" class="tool-icon">
      <span>React Icons</span>
    </div>
  </div>

  <h3 data-tools-category="software">Software</h3>
  <div class="tools-grid" data-tools-category="software">
    <div class="tools-grid-item">
      <i class="devicon-vscode-plain colored tool-icon"></i>
      <span>Visual Studio Code</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-visualstudio-plain colored tool-icon"></i>
      <span>Visual Studio</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-cplusplus-plain colored tool-icon"></i>
      <span>Dev C++</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/netbeans.png" alt="Apache NetBeans" class="tool-icon">
      <span>Apache NetBeans</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-godot-plain colored tool-icon"></i>
      <span>Godot</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/cisco.png" alt="Cisco Packet Tracer" class="tool-icon">
      <span>Cisco Packet Tracer</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/xampp.png" alt="XAMPP" class="tool-icon">
      <span>XAMPP</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-postman-plain colored tool-icon"></i>
      <span>Postman</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-arduino-plain colored tool-icon"></i>
      <span>Arduino IDE</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-git-plain colored tool-icon"></i>
      <span>Git</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/protonvpn.jpg" alt="Proton VPN" class="tool-icon">
      <span>Proton VPN</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/expororbit.jpg" alt="Expo Orbit" class="tool-icon">
      <span>Expo Orbit</span>
    </div>
  </div>

  <h3 data-tools-category="artificial-intelligence">Artificial Intelligence</h3>
  <div class="tools-grid" data-tools-category="artificial-intelligence">
    <div class="tools-grid-item">
      <img src="assets/icons/chatgpt.png" alt="ChatGPT" class="tool-icon">
      <span>ChatGPT</span>
    </div>
    <div class="tools-grid-item">
      <i class="bi bi-braces-asterisk tool-icon"></i>
      <span>Claude</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/deepseek.png" alt="DeepSeek" class="tool-icon">
      <span>DeepSeek</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/gemini.png" alt="Gemini" class="tool-icon">
      <span>Gemini</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/cursor.png" alt="Cursor" class="tool-icon">
      <span>Cursor</span>
    </div>
  </div>

  <h3 data-tools-category="video">Video</h3>
  <div class="tools-grid" data-tools-category="video">
    <div class="tools-grid-item">
      <img src="assets/icons/capcut.jpg" alt="CapCut" class="tool-icon">
      <span>CapCut</span>
    </div>
    <div class="tools-grid-item">
      <i class="devicon-premierepro-plain colored tool-icon"></i>
      <span>Adobe Premiere</span>
    </div>
  </div>

  <h3 data-tools-category="others">Others</h3>
  <div class="tools-grid" data-tools-category="others">
    <div class="tools-grid-item">
      <img src="assets/icons/word.png" alt="Microsoft Word" class="tool-icon">
      <span>Microsoft Word</span>
    </div>
    <div class="tools-grid-item">
      <img src="assets/icons/powerpoint.png" alt="Microsoft PowerPoint" class="tool-icon">
      <span>Microsoft PowerPoint</span>
    </div>
    <div class="tools-grid-item">
      <i class="bi bi-file-earmark-spreadsheet-fill tool-icon"></i>
      <span>Excel</span>
    </div>
  </div>
</div>

  `;
}


if (type === "projects") {
  modalContent = `
    <div class="projects-modal-content projects-box">

      <!-- Portfolio -->
      <h3 class="project-section-title">Portfolio</h3>
      <div class="project-item" data-project="professional-portfolio">
        <img src="assets/projects/Portfolio-second.png" alt="Professional Portfolio">
        <div class="project-text">
          <div class="project-title">Professional Portfolio</div>
          <p class="project-description">My Professional Portfolio, inspired by Bryl's portfolio design. It's static and simple, but clean, informative, and professional.</p>
              <div class="project-tech-list">
  <span class="project-tech-item"><i class="devicon-html5-plain colored"></i><span>HTML</span></span>
  <span class="project-tech-item"><i class="devicon-css3-plain colored"></i><span>CSS</span></span>
  <span class="project-tech-item"><i class="devicon-javascript-plain colored"></i><span>JS</span></span>
  <span class="project-tech-item"><i class="devicon-tailwindcss-original colored"></i><span>Tailwind CSS</span></span>
              </div>
          <a href="https://jhonpotestas.vercel.app/" target="_blank" class="view-project-btn">
            <span class="anchor">View Portfolio</span>
          </a>
        </div>
      </div>
      <div class="project-item" data-project="first-online-portfolio">
        <img src="assets/portfolio.png" alt="Portfolio Project">
        <div class="project-text">
          <div class="project-title">First Online Portfolio</div>
          <p class="project-description">My first static web portfolio, which includes a variety of my information.  Examples include name, education, achievement, and links to social media platforms.  
          It was created in my second year as a midterm project.</p>
              <div class="project-tech-list">
  <span class="project-tech-item"><i class="devicon-html5-plain colored"></i><span>HTML</span></span>
  <span class="project-tech-item"><i class="devicon-css3-plain colored"></i><span>CSS</span></span>
  <span class="project-tech-item"><i class="devicon-javascript-plain colored"></i><span>JS</span></span>
  <span class="project-tech-item"><i class="devicon-bootstrap-plain colored"></i><span>Bootstrap 5</span></span>
  <span class="project-tech-item"><i class="bi bi-envelope-at-fill"></i><span>Email.js</span></span>
              </div>
          <a href="https://jhon6264.github.io/portfolio/" target="_blank" class="view-project-btn">
            <span class="anchor">View Portfolio</span>
          </a>
        </div>
      </div>
      <hr class="project-separator" />

      <!-- Website -->
      <h3 class="project-section-title">Website</h3>
      <div class="project-item" data-project="domats">
        <img src="assets/projects/DoMats.png" alt="DoMATS">
        <div class="project-text">
          <div class="project-title">DoMATS</div>
          <p class="project-description">An ongoing capstone project &mdash; a document management and tracking system for St. Mary's College of Bansalan, Inc. It streamlines multi-signatory document signing, cuts manual errands, and helps organize and secure records.</p>
          <div class="project-tech-list">
            <span class="project-tech-item"><img src="assets/icons/react.png" alt=""><span>React</span></span>
            <span class="project-tech-item"><i class="devicon-laravel-original colored"></i><span>Laravel</span></span>
            <span class="project-tech-item"><i class="devicon-typescript-plain colored"></i><span>TypeScript</span></span>
            <span class="project-tech-item"><i class="devicon-javascript-plain colored"></i><span>JavaScript</span></span>
            <span class="project-tech-item"><i class="devicon-tailwindcss-original colored"></i><span>Tailwind CSS</span></span>
            <span class="project-tech-item"><i class="devicon-mysql-plain colored"></i><span>MySQL</span></span>
            <span class="project-tech-item"><i class="bi bi-broadcast-pin"></i><span>WebSocket</span></span>
            <span class="project-tech-item"><i class="bi bi-eye-fill"></i><span>OCR Tesseract</span></span>
          </div>
        </div>
      </div>
      <div class="project-item" data-project="riderx">
        <img src="assets/Riderx.png" alt="RiderX">
        <div class="project-text">
          <div class="project-title">RiderX</div>
          <p class="project-description">A web-based motorcycle rider platform concept with a Laravel backend and a modern React interface. It focuses on structured rider data, clean navigation, and a dashboard-style experience.</p>
          <div class="project-tech-list">
            <span class="project-tech-item"><i class="devicon-html5-plain colored"></i><span>HTML</span></span>
            <span class="project-tech-item"><i class="devicon-css3-plain colored"></i><span>CSS</span></span>
            <span class="project-tech-item"><i class="devicon-javascript-plain colored"></i><span>JS</span></span>
            <span class="project-tech-item"><i class="devicon-laravel-original colored"></i><span>Blade</span></span>
            <span class="project-tech-item"><img src="assets/icons/react.png" alt=""><span>React</span></span>
            <span class="project-tech-item"><i class="devicon-laravel-original colored"></i><span>Laravel</span></span>
            <span class="project-tech-item"><i class="devicon-tailwindcss-original colored"></i><span>Tailwind CSS</span></span>
            <span class="project-tech-item"><img src="assets/icons/anime-js.png" alt=""><span>Anime.js</span></span>
            <span class="project-tech-item"><i class="devicon-mysql-plain colored"></i><span>MySQL</span></span>
          </div>
        </div>
      </div>
      <div class="project-item" data-project="poketalk">
        <img src="assets/PokeTalk.png" alt="PokeTalk">
        <div class="project-text">
          <div class="project-title">PokeTalk</div>
          <p class="project-description">A Pokemon-themed web app that uses PokeAPI data to show Pokemon information in a simple hosted PHP project. It was built as a lightweight API practice project and deployed through InfinityFree.</p>
          <div class="project-tech-list">
            <span class="project-tech-item"><i class="devicon-php-plain colored"></i><span>PHP</span></span>
            <span class="project-tech-item"><i class="bi bi-database-fill"></i><span>PokeAPI</span></span>
            <span class="project-tech-item"><img src="assets/icons/infinityfree.png" alt=""><span>InfinityFree</span></span>
          </div>
          <a href="https://poketalk.free.nf/" target="_blank" class="view-project-btn">
            <span class="anchor">View Website</span>
          </a>
        </div>
      </div>

      <hr class="project-separator" />

      <!-- Game Development -->
      <h3 class="project-section-title">Game Development</h3>
      <div class="project-item" data-project="swaggy-adventure">
        <img src="assets/swaggy.png" alt="Swaggy Adventure">
        <div class="project-text">
          <div class="project-title">Swaggy Adventure</div>
          <p class="project-description">An interactive 2D pixel game created for our 2nd semester project in my second year. All of the assets were downloaded from itch.io,
           pixabay, and freesound because I didn't know how to make them. But overall, 
          it was a good experience as a beginner.</p>
<div class="project-tech-list">
  <span class="project-tech-item"><i class="devicon-godot-plain colored"></i><span>GD Script</span></span>
  <span class="project-tech-item"><i class="devicon-cplusplus-plain colored"></i><span>C++</span></span>
  <span class="project-tech-item"><i class="devicon-c-plain colored"></i><span>C</span></span>
  <span class="project-tech-item"><i class="bi bi-controller"></i><span>Itch.io Assets</span></span>
  <span class="project-tech-item"><i class="bi bi-volume-up-fill"></i><span>Freesound</span></span>
  <span class="project-tech-item"><i class="bi bi-image-fill"></i><span>Pixabay</span></span>
</div>

        </div>
      </div>
      <div class="project-item" data-project="pakman-lite">
        <img src="assets/pakman.png" alt="Pakman Lite">
        <div class="project-text">
          <div class="project-title">Pakman Lite</div>
          <p class="project-description">An interactive 3d game-like  minecraft style, where the player
          were chase by the balls(enemy), collecting coins and potions to enable the player to survive
          and set highest score. It was made during our second semester Final.
          </p>
<div class="project-tech-list">
  <span class="project-tech-item"><i class="devicon-godot-plain colored"></i><span>Godot Engine</span></span>
  <span class="project-tech-item"><i class="devicon-blender-original colored"></i><span>Blender</span></span>
  <span class="project-tech-item"><i class="bi bi-soundwave"></i><span>ElevenLabs</span></span>
  <span class="project-tech-item"><img src="assets/icons/figma.png" alt=""><span>Figma</span></span>
</div>

        </div>
      </div>

      <hr class="project-separator" />

      <!-- Mobile Development -->
      <h3 class="project-section-title">Mobile Development</h3>
      <div class="project-item" data-project="owly">
        <img class="mobile-project-preview" src="assets/projects/Owly.jpg" alt="Owly">
        <div class="project-text">
          <div class="project-title">Owly</div>
          <p class="project-description">A personal companion mobile app for managing notes, friendships, and important dates in one place. It integrates the Gemma 4 E2B IT AI model so users can chat with an AI assistant fully offline, keeping interactions accessible and private.</p>
          <div class="project-tech-list">
            <span class="project-tech-item"><img src="assets/icons/react.png" alt=""><span>React</span></span>
            <span class="project-tech-item"><img src="assets/icons/react.png" alt=""><span>React Native</span></span>
            <span class="project-tech-item"><i class="devicon-typescript-plain colored"></i><span>TypeScript</span></span>
            <span class="project-tech-item"><i class="bi bi-robot"></i><span>Huggingface</span></span>
          </div>
          <span class="view-project-btn is-disabled" aria-disabled="true">
            <span class="anchor">Unavailable</span>
          </span>
        </div>
      </div>
      <div class="project-item" data-project="codequiz">
        <img class="mobile-project-preview" src="assets/projects/Codequiz.jpg" alt="CodeQuiz">
        <div class="project-text">
          <div class="project-title">CodeQuiz</div>
          <p class="project-description">A mobile learning app that helps IT freshmen learn and practice programming through interactive lessons and quizzes. It covers beginner topics like HTML, CSS, and JavaScript, with quizzes that scale from basic to more challenging questions.</p>
          <div class="project-tech-list">
            <span class="project-tech-item"><img src="assets/icons/react.png" alt=""><span>React</span></span>
            <span class="project-tech-item"><img src="assets/icons/react-native-expo.png" alt=""><span>Expo</span></span>
            <span class="project-tech-item"><i class="devicon-typescript-plain colored"></i><span>TypeScript</span></span>
          </div>
          <a href="https://drive.google.com/drive/folders/1UpClqFDglTAjfJTgivVc_6Wo15eSL7Qc?usp=sharing" target="_blank" rel="noopener noreferrer" class="view-project-btn">
            <span class="anchor">Download App</span>
          </a>
        </div>
      </div>
      <div class="project-item" data-project="smartlock">
        <img class="mobile-project-preview" src="assets/SmartLock.jpg" alt="SmartLock">
        <div class="project-text">
          <div class="project-title">SmartLock</div>
          <p class="project-description">A mobile app prototype for controlling and monitoring a smart lock experience. It was built with React Native Expo and tested through Expo Go for fast mobile development.</p>
          <div class="project-tech-list">
            <span class="project-tech-item"><img src="assets/icons/react-native-expo.png" alt=""><span>React Native Expo</span></span>
            <span class="project-tech-item"><img src="assets/icons/expororbit.jpg" alt=""><span>Expo Go</span></span>
          </div>
          <a href="apk/SmartLock.apk" download class="view-project-btn">
            <span class="anchor">Download App</span>
          </a>
        </div>
      </div>
      <div class="project-item" data-project="basketball-payment-tracker">
        <img class="mobile-project-preview" src="assets/BasketballPaymentTracker.jpg" alt="Basketball Payment Tracker">
        <div class="project-text">
          <div class="project-title">Basketball Payment Tracker</div>
          <p class="project-description">A mobile tracker for managing basketball payment records and keeping contribution details organized. It was built with React Native Expo and prepared as an installable Android app.</p>
          <div class="project-tech-list">
            <span class="project-tech-item"><img src="assets/icons/react-native-expo.png" alt=""><span>React Native Expo</span></span>
            <span class="project-tech-item"><img src="assets/icons/expororbit.jpg" alt=""><span>Expo Go</span></span>
          </div>
          <a href="apk/BasketballPaymentTracker.apk" download class="view-project-btn">
            <span class="anchor">Download App</span>
          </a>
        </div>
      </div>
      <div class="project-item" data-project="pizza-de-uno">
        <img class="mobile-project-preview" src="assets/pizzadeuno.png" alt="Pizza de Uno">
        <div class="project-text">
          <div class="project-title">Pizza de Uno</div>
          <p class="project-description">A food-ordering mobile app concept focused on pizza menu browsing and simple ordering flow. It was created with Flutter as a practice project for mobile UI and app navigation.</p>
          <div class="project-tech-list">
            <span class="project-tech-item"><i class="devicon-flutter-plain colored"></i><span>Flutter</span></span>
          </div>
        </div>
      </div>

      <hr class="project-separator" />

      <!-- Application -->
      <h3 class="project-section-title">Application</h3>
      <div class="project-item" data-project="registration-system">
        <img src="assets/registration.png" alt="Registration System">
        <div class="project-text">
          <div class="project-title">Registration System</div>
          <p class="project-description">This system was my first "functional system." It was created during our first semester final. 
          I used Visual Studio 2022 as an IDE and Figma to 
          design the layouts, colors, and so on. For the database, I used localhost MySQL with the XAMPP management panel.
          </p>
<div class="project-tech-list">
  <span class="project-tech-item"><i class="devicon-visualbasic-plain colored"></i><span>VB.net</span></span>
  <span class="project-tech-item"><img src="assets/icons/figma.png" alt=""><span>Figma</span></span>
  <span class="project-tech-item"><i class="devicon-photoshop-plain colored"></i><span>Photoshop</span></span>
  <span class="project-tech-item"><img src="assets/icons/flaticon.png" alt=""><span>Flaticon</span></span>
  <span class="project-tech-item"><i class="devicon-mysql-plain colored"></i><span>MySQL</span></span>
  <span class="project-tech-item"><img src="assets/icons/xampp.png" alt=""><span>XAMPP</span></span>
</div>

        </div>
      </div>

    </div>
  `;
}



if (type === "links") {
  modalContent = `
    <div class="links-modal-content links-box">
      <div class="icon-grid-wrapper">

        <div class="icon-row">
          <a href="https://www.instagram.com/jhoncrispotestas/" target="_blank" class="icon-link">
            <i class="bi bi-instagram"></i>
            <span class="label">Instagram</span>
          </a>
          <a href="https://www.facebook.com/jhoncristopher.relativopotestas.7/" target="_blank" class="icon-link">
            <i class="bi bi-facebook"></i>
            <span class="label">Facebook</span>
          </a>
          <a href="https://www.youtube.com/@Rizeeer" target="_blank" class="icon-link">
            <i class="bi bi-youtube"></i>
            <span class="label">Youtube</span>
          </a>
        </div>

        <div class="icon-row">
          <a href="https://t.me/jcrp6264" target="_blank" class="icon-link">
            <i class="bi bi-telegram"></i>
            <span class="label">Telegram</span>
          </a>
          <a href="https://discord.com/users/supremooo0126_91732" target="_blank" class="icon-link">
            <i class="bi bi-discord"></i>
            <span class="label">Discord</span>
          </a>
        </div>
        <p class="link-warning">If you click a link, it will open a new tab!</p>
      </div>
    </div>
  `;
}

if (type === "contact") {
  modalContent = `
    <div class="contact-disabled-wrapper">
      <form id="contact-form" class="contact-modal-content is-disabled" aria-hidden="true" inert>
        <label for="from_email">Your Email</label>
        <input type="email" name="from_email" id="from_email" placeholder="example@email.com" tabindex="-1" />

        <label for="from_name">Your Name</label>
        <input type="text" name="from_name" id="from_name" placeholder="Jhon Cristopher Potestas" tabindex="-1" />

        <label for="message">Enter your message</label>
        <textarea name="message" id="message" rows="4" placeholder="Type your message here..." tabindex="-1"></textarea>

        <button type="button" class="send-btn" tabindex="-1">Send</button>
      </form>

      <div class="contact-unavailable-overlay">
        <div class="contact-unavailable-card">
          <h3 class="contact-unavailable-title">Contact is Unavailable :(</h3>
          <p class="contact-unavailable-text">However, you can email me at:</p>

          <div class="contact-email-row">
            <span class="contact-email">${CONTACT_EMAIL}</span>
            <button type="button" class="contact-copy-btn" aria-label="Copy email address" title="Copy email address">
              <i class="bi bi-clipboard"></i>
            </button>
          </div>

          <div class="contact-or-divider"><span>or</span></div>

          <p class="contact-unavailable-text">You can chat with my assistant</p>
          <button type="button" class="contact-chatbot-btn">
            <i class="bi bi-robot"></i>
            <span>Open Chatbot</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

if (type === "chatbot") {
  modalContent = `
    <div class="chatbot-modal-content">
      <div class="chatbot-status">
        <span class="chatbot-pulse"></span>
      </div>
      <div class="chatbot-limit-alert" hidden></div>

      <div class="chatbot-messages" aria-live="polite">
        <div class="chat-message bot-message">
          <div class="chat-avatar">
            <img src="assets/icons/Profile.png" alt="Jhon assistant">
          </div>
          <div class="chat-bubble">
            <p>Hi, I’m Jhon’s assistant. Ask me anything about his skills, projects, or background.</p>
          </div>
        </div>
      </div>

      <form class="chatbot-input-row">
        <input type="text" placeholder="${CHATBOT_INPUT_PLACEHOLDER}" aria-label="Ask the chatbot" />
        <button type="submit" aria-label="Send message">
          <i class="bi bi-send-fill"></i>
        </button>
      </form>
    </div>
  `;
}



  modal.innerHTML = `
    <div class="modal-header relative">
      <div class="modal-title capitalize">${type}</div>
      <i class="bi bi-x text-[clamp(1.5rem,4vw,1.7rem)] absolute top-2 right-4 cursor-pointer hover:scale-110 transition-transform close-btn"></i>
    </div>
    <div class="modal-divider"></div>
    <div class="modal-content">
      ${modalContent}
    </div>
  `;

  // Dragging setup
  let isDragging = false, startX = 0, startY = 0;
  const header = modal.querySelector('.modal-header');

  const onMove = (x, y) => {
    if (!isDragging) return;
    const newX = x - startX;
    const newY = y - startY;
    modal.style.left = `${newX}px`;
    modal.style.top = `${newY}px`;
  };

  const stopDragging = () => {
    isDragging = false;
    document.body.classList.remove("dragging");
    header.classList.remove("dragging");
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', stopDragging);
    document.removeEventListener('touchmove', touchMove);
    document.removeEventListener('touchend', stopDragging);
  };

  const mouseMove = (e) => onMove(e.clientX, e.clientY);
  const touchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    onMove(touch.clientX, touch.clientY);
  };

  // Mouse drag
  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - modal.offsetLeft;
    startY = e.clientY - modal.offsetTop;
    modal.style.zIndex = ++zIndexCounter;
    document.body.classList.add("dragging");
    header.classList.add("dragging");

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', stopDragging);
  });

  // Touch drag
  header.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    isDragging = true;
    startX = touch.clientX - modal.offsetLeft;
    startY = touch.clientY - modal.offsetTop;
    modal.style.zIndex = ++zIndexCounter;
    document.body.classList.add("dragging");
    header.classList.add("dragging");

    document.addEventListener('touchmove', touchMove, { passive: false });
    document.addEventListener('touchend', stopDragging);
  });

  //Close button
modal.querySelector(".close-btn").onclick = () => {
  playSound("audio/closeclick.mp3");
  modal.classList.remove('expand-in');
  modal.classList.add('expand-out');
  setTimeout(() => modal.remove(), 400); 
};



  // Append to DOM
  container.appendChild(modal);
  requestAnimationFrame(() => {
    centerFloatingWindow(modal);
    animateFloatingWindow(modal);
    animateModalContent(modal, type);
  });

  if (type === "about") {
    setAboutPortrait();
  }

  // Add sound for "View Portfolio" buttons
modal.querySelectorAll(".view-project-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
   playSound('audio/closeclick.mp3');
  });
});

// Add click sound to all icon links inside links modal
if (type === "links") {
  modal.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
    playSound('audio/closeclick.mp3');
    });
  });
}

if (type === "chatbot") {
  const chatbotMessages = modal.querySelector(".chatbot-messages");
  restoreChatMessages(chatbotMessages);
  startChatbotCooldownTimer(modal);

  modal.querySelector(".chatbot-input-row").addEventListener("submit", (e) => {
    e.preventDefault();
    sendChatbotMessage(modal);
  });
}

if (type === "contact") {
  const copyBtn = modal.querySelector(".contact-copy-btn");
  const chatbotBtn = modal.querySelector(".contact-chatbot-btn");

  copyBtn?.addEventListener("click", async () => {
    playSound("audio/closeclick.mp3");

    const icon = copyBtn.querySelector("i");
    const restoreIcon = () => {
      icon.className = "bi bi-clipboard";
      copyBtn.classList.remove("is-copied");
    };

    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      icon.className = "bi bi-check-lg";
      copyBtn.classList.add("is-copied");
      setTimeout(restoreIcon, 1500);
    } catch {
      icon.className = "bi bi-x-lg";
      setTimeout(restoreIcon, 1500);
    }
  });

  chatbotBtn?.addEventListener("click", () => {
    playSound("audio/closeclick.mp3");
    createFloatingWindow("chatbot", null);
  });
}

  // Bring to front on focus
  modal.addEventListener("mousedown", () => {
    modal.style.zIndex = ++zIndexCounter;
  });
  modal.addEventListener("touchstart", () => {
    modal.style.zIndex = ++zIndexCounter;
  });
}


// Modals are created dynamically when an icon is clicked:
document.querySelectorAll(".icon-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    const type = item.getAttribute("data-window");
    createFloatingWindow(type, e.currentTarget);
  });
});

// 2. Show the floating modal (success or error)
function showFloatingModal(success = true) {
  const modal = document.getElementById('floating-modal');
  const text = document.getElementById('floating-text');
  const icon = document.getElementById('floating-icon');

  if (success) {
    text.textContent = 'Message Sent Successfully!';
    icon.className = 'bi bi-envelope-check text-green-500';
  } else {
    text.textContent = 'Message Denied! Please Retry.';
    icon.className = 'bi bi-x text-red-500';
  }

  modal.classList.remove('hidden');
  modal.classList.add('show');

  setTimeout(() => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 400);
  }, 2000);
}

// 3. EmailJS config and submission logic
emailjs.init("JgALoWAfPc0J_yYxJ");

document.addEventListener("submit", function (e) {
  if (e.target && e.target.id === "contact-form") {
    e.preventDefault();

    // Contact form is currently disabled behind the "unavailable" overlay.
    if (e.target.classList.contains("is-disabled")) return;

    playSound('audio/closeclick.mp3');


    emailjs.sendForm("service_z4wckrd", "template_svzib4n", e.target)
      .then(function () {
        showFloatingModal(true);
        playSound('audio/message.mp3');  
        e.target.reset();
      }, function (error) {
        showFloatingModal(false); 
        console.error(error);
      });
  }
});


// Trigger from icons
document.querySelectorAll(".icon-item").forEach((item) => {
item.addEventListener("click", (e) => {
  const type = item.getAttribute("data-window");
    playSound('audio/click.mp3');
  createFloatingWindow(type, e.currentTarget); 
});
});

document.getElementById("chatbot-toggle-icon")?.addEventListener("click", (e) => {
  playSound('audio/click.mp3');
  createFloatingWindow("chatbot", e.currentTarget);
});

animateHomeIcons();
