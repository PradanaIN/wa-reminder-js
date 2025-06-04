const fs = require("fs");
const path = require("path");
const { quotes } = require("../utils/quotes");
const { resetHeartbeat } = require("../utils/heartbeat");
const { loadContactsFromSheets } = require("../utils/contacts");

// Load contacts
async function loadContacts() {
  try {
    const contacts = await loadContactsFromSheets();
    if (!Array.isArray(contacts) || contacts.length === 0) {
      console.log("[Message] Tidak ada kontak yang ditemukan.");
      return [];
    }
    return contacts;
  } catch (err) {
    console.error("[Message] Gagal baca kontak:", err);
    return [];
  }
}

// Load template
function loadMessageTemplate() {
  try {
    return fs.readFileSync(
      path.join(__dirname, "..", "templates", "message_template.txt"),
      "utf-8"
    );
  } catch (err) {
    console.error("[Message] Gagal baca template:", err);
    return null;
  }
}

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

async function sendMessage(number, message, client) {
  const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
  await client.sendMessage(chatId, message);
}

async function sendMessageToNumber(client, number, name, addLog = console.log) {
  try {
    const template = loadMessageTemplate();
    const quote = getRandomQuote();
    const message = template.replace("{name}", name).replace("{quote}", quote);

    const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
    await client.sendMessage(chatId, message);
    addLog(`[Message] ✅ Pesan berhasil dikirim ke ${name} (${number})`);
  } catch (err) {
    addLog(`[Message] ❌ Gagal kirim ke ${name} (${number}): ${err.message}`);
  }
}

async function sendMessagesToAll(client, addLog = console.log) {
  const contacts = await loadContacts();
  if (!Array.isArray(contacts) || contacts.length === 0) {
    addLog("[Message] Tidak ada kontak yang ditemukan.");
    return;
  }

  for (const contact of contacts) {
    await sendMessageToNumber(client, contact.number, contact.name, addLog);
    await delay(1500);
  }

  resetHeartbeat();
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

module.exports = {
  sendMessage,
  sendMessagesToAll,
  sendMessageToNumber,
  loadContacts,
};
