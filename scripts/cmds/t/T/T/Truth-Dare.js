const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "td_scores.json");

// Load or initialize score file
let scores = {};
if (fs.existsSync(dataFile)) {
  scores = JSON.parse(fs.readFileSync(dataFile));
}

module.exports = {
  config: {
    name: "truthdare",
    aliases: ["td"],
    version: "5.0",
    author: "tamu",
    role: 0,
    shortDescription: "Truth or Dare with timer & score",
    longDescription: "Truth or Dare game with scores, punishment, adult/clean mode, and time limit",
    category: "game",
    guide: {
      en: "{pn} truth/dare @user | {pn} mode adult/clean | {pn} score | {pn} timer <seconds>"
    }
  },

  onStart: async function ({ message, args, event }) {

    // ---------- Timer ----------
    let timeLimit = 30; // default 30 seconds
    if (args[0] && args[0].toLowerCase() === "timer" && args[1]) {
      const t = parseInt(args[1]);
      if (!isNaN(t) && t > 0 && t <= 300) { // max 5 min
        timeLimit = t;
        return message.reply(`⏱️ Time limit set to ${timeLimit} seconds per answer`);
      }
    }

    // ---------- Mode Switch ----------
    let mode = "clean"; // default
    if (args[0] && ["adult", "clean"].includes(args[0].toLowerCase())) {
      mode = args[0].toLowerCase();
      return message.reply(`✅ Truth & Dare mode switched to: ${mode.toUpperCase()}`);
    }

    // ---------- Check score command ----------
    if (args[0] && args[0].toLowerCase() === "score") {
      const userID = event.senderID;
      const userScore = scores[userID] || 0;
      return message.reply(`🏆 Your current score: ${userScore}`);
    }

    // ---------- Question Lists ----------
    const truthsClean = [
      "তোমার সবচেয়ে বড় ভয় কী? 😳",
      "এখন কার উপর crush আছে? 😏",
      "শেষ কবে মিথ্যা বলেছিলে? 🤥",
      "এই গ্রুপে কাকে সবচেয়ে trust করো? 🤝",
      "সবচেয়ে embarrassing moment কী ছিল? 😅"
    ];

    const truthsAdult = [
      "কোন crush এর জন্য blush করেছো? 😳",
      "সবচেয়ে হট secret কী? 🔥"
    ];

    const daresClean = [
      "গ্রুপে 😂 পাঠাও",
      "নিজের নাম উল্টো করে লেখো",
      "কাউকে tag করে ‘Boss’ লেখো 😎"
    ];

    const daresAdult = [
      "পরের মেসেজে crush এর নাম লেখো 😏",
      "পরের মেসেজে romantic emoji পাঠাও 💖"
    ];

    const truths = mode === "adult" ? truthsClean.concat(truthsAdult) : truthsClean;
    const dares = mode === "adult" ? daresClean.concat(daresAdult) : daresClean;

    // ---------- Mention detect ----------
    const mentionIDs = Object.keys(event.mentions || {});
    let targetName = "You";
    let targetID = event.senderID;

    if (mentionIDs.length > 0) {
      targetName = event.mentions[mentionIDs[0]];
      targetID = mentionIDs[0];
    }

    // ---------- Random choice ----------
    let choice = args[0]?.toLowerCase();
    if (!["truth", "dare"].includes(choice)) {
      choice = Math.random() < 0.5 ? "truth" : "dare";
    }

    let question = choice === "truth" ? truths[Math.floor(Math.random() * truths.length)] : dares[Math.floor(Math.random() * dares.length)];

    // ---------- Update score ----------
    if (!scores[targetID]) scores[targetID] = 0;
    scores[targetID] += 10;
    fs.writeFileSync(dataFile, JSON.stringify(scores, null, 2));

    // ---------- Punishment ----------
    let punishment = "";
    if (Math.random() < 0.2) punishment = "\n⚠️ Punishment: Next message, tag someone and say 'I lost 😆'";

    // ---------- Send question + timer ----------
    message.reply(`🎲 ${choice.toUpperCase()} for ${targetName}:\n${question}${punishment}\n🏆 Current Score: ${scores[targetID]}\n⏱️ You have ${timeLimit} seconds to answer!`);

    // Timer tracking (optional, just for info)
    setTimeout(() => {
      message.reply(`⏰ Time's up for ${targetName}! Next turn starts now.`);
    }, timeLimit * 1000);

  }
};
