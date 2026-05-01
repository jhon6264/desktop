const productionEndpoint = "https://jcrpbot.gt.tc/api/bot.php";
const localHosts = ["localhost", "127.0.0.1"];
const endpoint = localHosts.includes(window.location.hostname)
  ? new URL("api/bot.php", window.location.href).toString()
  : productionEndpoint;
let conversationId = "";

const messageInput = document.getElementById("message");
const replyBox = document.getElementById("reply");
const sendButton = document.getElementById("sendButton");
const statusText = document.getElementById("status");
const rateLimitText = document.getElementById("rateLimit");
const tokenUsageText = document.getElementById("tokenUsage");
const totalTokensText = document.getElementById("totalTokens");
const modelNameText = document.getElementById("modelName");
const copyUrlButton = document.getElementById("copyUrl");
const apiUrlText = document.getElementById("apiUrl");
const productionLink = document.getElementById("productionLink");
const profileNameText = document.getElementById("profileName");
const profileBioText = document.getElementById("profileBio");
const apiStatusValue = document.getElementById("apiStatusValue");
const apiUrlValue = document.getElementById("apiUrlValue");
const apiDateTime = document.getElementById("apiDateTime");
const maxMessageLength = document.getElementById("maxMessageLength");
const identityData = document.getElementById("identityData");
const focusAreas = document.getElementById("focusAreas");
const skillData = document.getElementById("skillData");
const contactLinks = document.getElementById("contactLinks");
const projectList = document.getElementById("projectList");

async function copyApiUrl() {
  await navigator.clipboard.writeText(apiUrlText.innerText);
  copyUrlButton.innerText = "Copied";
  setTimeout(() => {
    copyUrlButton.innerText = "Copy";
  }, 1400);
}

function updateStats(data) {
  if (data.status) {
    apiStatusValue.innerText = data.status;
  }

  if (data.rate_limit?.display) {
    rateLimitText.innerText = data.rate_limit.display;
  }

  if (data.usage?.output_display) {
    tokenUsageText.innerText = data.usage.output_display;
  }

  if (typeof data.usage?.total_tokens === "number") {
    totalTokensText.innerText = String(data.usage.total_tokens);
  }

  if (data.model) {
    modelNameText.innerText = data.model.replace("gemini-", "");
  }

  if (data.api_url) {
    apiUrlText.innerText = data.api_url;
    apiUrlValue.innerText = data.api_url;
    productionLink.href = data.api_url;
  }

  if (data.current_datetime) {
    apiDateTime.innerText = data.current_datetime;
  }

  if (typeof data.max_message_length === "number") {
    maxMessageLength.innerText = `${data.max_message_length} characters`;
  }

  if (data.portfolio) {
    updatePortfolio(data.portfolio);
  }
}

function formatLabel(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function setDataList(container, entries) {
  container.innerHTML = "";

  entries
    .filter((entry) => entry.value)
    .forEach((entry) => {
      const row = document.createElement("div");
      row.className = "data-item";

      const label = document.createElement("strong");
      label.innerText = entry.label;

      const value = document.createElement("span");
      value.innerText = Array.isArray(entry.value) ? entry.value.join(", ") : entry.value;

      row.append(label, value);
      container.appendChild(row);
    });
}

function setChips(container, items) {
  container.innerHTML = "";

  items.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerText = item;
    container.appendChild(chip);
  });
}

function updatePortfolio(portfolio) {
  const identity = portfolio.identity || {};

  if (identity.full_name) {
    profileNameText.innerText = identity.full_name;
  }

  if (portfolio.short_bio) {
    profileBioText.innerText = portfolio.short_bio;
  }

  setDataList(identityData, Object.entries(identity).map(([key, value]) => ({
    label: formatLabel(key),
    value,
  })));

  setChips(focusAreas, portfolio.focus_areas || []);

  setDataList(skillData, [
    { label: "Currently Learning", value: portfolio.currently_learning || [] },
    { label: "Development Stack", value: portfolio.development_stack || [] },
    { label: "Frontend Tools", value: portfolio.frontend_tools || [] },
    { label: "Backend Tools", value: portfolio.backend_tools || [] },
    { label: "Mobile Development", value: portfolio.mobile_development || [] },
    { label: "Game Development", value: portfolio.game_development || [] },
    { label: "Languages", value: portfolio.languages || [] },
  ]);

  contactLinks.innerHTML = "";
  (portfolio.contacts || []).forEach((contact) => {
    const link = document.createElement("a");
    link.className = "contact-link";
    link.href = contact.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerText = contact.label;
    contactLinks.appendChild(link);
  });

  projectList.innerHTML = "";
  (portfolio.projects || []).forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const title = document.createElement("h3");
    title.innerText = project.name;

    const description = document.createElement("p");
    description.innerText = project.description;

    const meta = document.createElement("div");
    meta.className = "project-meta";
    meta.innerText = [project.type, project.technologies].filter(Boolean).join(" | ");

    card.append(title, description, meta);

    if (project.link) {
      const link = document.createElement("a");
      link.className = "contact-link";
      link.href = project.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerText = project.link;
      card.appendChild(link);
    }

    projectList.appendChild(card);
  });
}

async function loadApiStatus() {
  statusText.innerText = "Checking";

  try {
    const response = await fetch(endpoint);
    const data = await readJsonResponse(response);
    updateStats(data);
    statusText.innerText = response.ok ? "Ready" : "Error";
  } catch (error) {
    statusText.innerText = "Offline";
    replyBox.innerText = error.message || `API status check failed at ${endpoint}`;
  }
}

async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(`API returned ${response.status} ${response.statusText || "response"} instead of JSON at ${endpoint}`);
  }

  return response.json();
}

async function sendMessage() {
  const message = messageInput.value.trim();

  if (!message) {
    replyBox.innerText = "Please type a message first.";
    return;
  }

  sendButton.disabled = true;
  statusText.innerText = "Sending";
  replyBox.innerText = "Thinking...";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    });

    const data = await readJsonResponse(response);
    updateStats(data);

    if (data.conversation_id) {
      conversationId = data.conversation_id;
    }

    replyBox.innerText = data.reply || data.error || `Request failed with status ${response.status}.`;
    statusText.innerText = response.ok ? "Ready" : "Error";
  } catch (error) {
    replyBox.innerText = error.message || `Unable to reach the API at ${endpoint}`;
    statusText.innerText = "Offline";
  } finally {
    sendButton.disabled = false;
  }
}

sendButton.addEventListener("click", sendMessage);
copyUrlButton.addEventListener("click", copyApiUrl);
loadApiStatus();

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    sendMessage();
  }
});
