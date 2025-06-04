const fs = require("fs");
const path = require("path");

// Load contacts dari contacts.json
function loadContacts() {
  try {
    const contactsRaw = fs.readFileSync(
      path.join(__dirname, "..", "contacts.json"),
      "utf-8"
    );
    return JSON.parse(contactsRaw);
  } catch (err) {
    console.error("[Sender] Gagal membaca contacts.json:", err);
    return [];
  }
}

// Load template pesan dari message_template.txt
function loadMessageTemplate() {
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "message_template.txt"
    );
    return fs.readFileSync(templatePath, "utf-8");
  } catch (err) {
    logger.error(`[Sender] Gagal membaca message_template.txt: ${err}`);
    return null;
  }
}

// Quotes array (bisa ambil dari file quotes.js nanti)
const quotes = require("../utils/quotes").quotes;
function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Kirim pesan ke satu nomor dengan format nama dan quote
 * @param {object} client - WhatsApp client instance
 * @param {string} number - nomor tujuan, contoh: '6281234567890'
 * @param {string} name - nama kontak untuk personalisasi
 */
async function sendMessageToNumber(client, number, name) {
  try {
    let template = loadMessageTemplate();
    const quote = getRandomQuote();
    const message = template.replace("{name}", name).replace("{quote}", quote);

    const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
    await client.sendMessage(chatId, message);
    console.log(`[Sender] Pesan berhasil dikirim ke ${name} (${number})`);
  } catch (err) {
    console.error(`[Sender] Gagal mengirim pesan ke ${name} (${number}):`, err);
  }
}

/**
 * Kirim pesan ke semua kontak di contacts.json
 * @param {object} client - WhatsApp client instance
 */
async function sendMessagesToAll(client) {
  const contacts = loadContacts();
  if (contacts.length === 0) {
    console.log("[Sender] Tidak ada kontak untuk dikirimi pesan.");
    return;
  }

  for (const contact of contacts) {
    await sendMessageToNumber(client, contact.number, contact.name);
    await delay(1500); // jeda 1.5 detik antar pesan agar tidak spam
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { sendMessagesToAll, sendMessageToNumber };
