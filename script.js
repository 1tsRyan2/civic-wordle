// Civic Wordle Full JavaScript (script.js)

// Apply dark mode if enabled
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

const ALL_WORDS = [
  "civic", "voter", "court", "taxes", "judge", "legal", "trust", "unity",
  "freedom", "ballot", "justice", "rights", "policy", "senate", "liberty",
  "nation", "elect", "amend", "lawyer", "speech", "govern", "charter",
  "debate", "public", "protest", "citizen", "ruling", "statute",
  "rules", "voted", "state", "press", "order", "serve", "peace", "laws", "voice", "civil",
  "policy", "income", "border", "voting", "pledge", "system", "libert", "reform", "leader", "people",
  "majority", "equality", "campaign", "assembly", "congress", "decision", "amendment", "executive", "immigrant", "jurisdict"
];

const DEFINITIONS = {
  civic: "Relating to a city, citizen, or citizenship.",
  voter: "A person who casts a vote in an election.",
  court: "A tribunal where justice is administered.",
  taxes: "Mandatory contributions to government revenue.",
  judge: "An official appointed to decide cases in a court of law.",
  legal: "Permitted by law.",
  trust: "Firm belief in the reliability or truth of something or someone.",
  unity: "The state of being united or joined as a whole.",
  freedom: "The power or right to act, speak, or think without hindrance.",
  ballot: "A process of voting, typically in secret.",
  justice: "The quality of being fair and reasonable; the administration of law.",
  rights: "Legal, social, or ethical principles of freedom or entitlement.",
  policy: "A course of action adopted by a government or organization.",
  senate: "A legislative chamber in the government, often part of a bicameral system.",
  liberty: "The state of being free within society from oppressive restrictions.",
  nation: "A large body of people united by common descent, history, culture, or language.",
  elect: "To choose someone for a position by voting.",
  amend: "To make changes to a legal document or legislative bill.",
  lawyer: "A person who practices or studies law; an attorney or a counselor.",
  speech: "The expression of thoughts and feelings by articulate sounds.",
  govern: "To conduct the policy, actions, and affairs of a state or organization.",
  charter: "A written grant by a country’s legislative power or ruler.",
  debate: "A formal discussion on a particular matter in a public meeting.",
  public: "Concerning the people as a whole.",
  protest: "A statement or action expressing disapproval or objection.",
  citizen: "A legally recognized subject or national of a state.",
  ruling: "An authoritative decision or pronouncement.",
  statute: "A written law passed by a legislative body.",
  rules: "Prescribed guidelines for conduct or action.",
  voted: "Cast a vote in an election.",
  state: "A nation or territory considered as an organized political community.",
  press: "The media and news organizations.",
  order: "An authoritative command or direction.",
  serve: "To perform duties for others, especially in government.",
  peace: "Freedom from disturbance; tranquility.",
  laws: "The system of rules recognized by a country or community.",
  voice: "The expression of opinion or choice.",
  civil: "Relating to ordinary citizens and their concerns.",
  income: "Money received on a regular basis for work or investments.",
  border: "A line separating two political or geographical areas.",
  voting: "The act of expressing a choice in an election.",
  pledge: "A solemn promise or undertaking.",
  system: "A set of connected things forming a complex whole.",
  libert: "Variant of liberty, denoting freedom.",
  reform: "Make changes to improve something.",
  leader: "A person who leads or commands a group.",
  people: "Human beings in general or considered collectively.",
  majority: "The greater number or part.",
  equality: "The state of being equal, especially in status or rights.",
  campaign: "An organized effort to achieve a goal, often political.",
  assembly: "A group of people gathered together for a purpose.",
  congress: "A national legislative body.",
  decision: "A conclusion reached after consideration.",
  amendment: "A change or addition to a legal or statutory document.",
  executive: "Having the power to put plans or laws into effect.",
  immigrant: "A person who comes to live permanently in a foreign country.",
  jurisdict: "The official power to make legal decisions and judgments."
};

function getLevelFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("level");
}

function getWordListForLength(length) {
  return ALL_WORDS.filter(word => word.length === length);
}

function getDailyWord() {
  const allWords = [...ALL_WORDS].sort();
  const startDate = new Date("2025-01-01");
  const today = new Date();
  const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const index = daysSinceStart % allWords.length;
  return allWords[index].toLowerCase();
}

const level = getLevelFromURL();

let WORD = "";
let WORD_LIST = [];
let WORD_LENGTH = 5;

if (level === "daily") {
  WORD = getDailyWord();
  WORD_LENGTH = WORD.length;
  WORD_LIST = [WORD];
} else {
  const targetLength =
    level === "medium" ? 6 :
    level === "hard" ? 7 :
    level === "expert" ? 8 :
    level === "impossible" ? 9 : 5;

  WORD_LIST = getWordListForLength(targetLength);
  WORD = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toLowerCase();
  WORD_LENGTH = WORD.length;
}


const MAX_GUESSES = 6;
let currentGuess = "";
let guesses = [];
let hintUsed = false;
const keyStatus = {};

const game = document.getElementById("game");
const keyboard = document.getElementById("keyboard");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");
const hintBtn = document.getElementById("hintBtn");
const toggleBtn = document.getElementById("toggleLegendBtn");
const legendOverlay = document.getElementById("legendOverlay");

function createGrid() {
  game.style.gridTemplateColumns = `repeat(${WORD_LENGTH}, 60px)`;
  for (let i = 0; i < MAX_GUESSES * WORD_LENGTH; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.id = `tile-${i}`;
    game.appendChild(tile);
  }
}

function showMessage(text, showRestart = false) {
  message.textContent = text;
  restartBtn.style.display = showRestart ? "inline-block" : "none";

  if (text.includes("win")) {
    const defPara = document.createElement("p");
    defPara.style.marginTop = "10px";
    defPara.style.fontStyle = "italic";
    defPara.style.maxWidth = "400px";
    defPara.style.marginInline = "auto";
    defPara.textContent = `Definition of \"${WORD}\": ${DEFINITIONS[WORD] || "Definition not found."}`;
    message.appendChild(defPara);

    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  }
}

function flipTiles(rowIndex, callback) {
  const guess = guesses[rowIndex];
  const delay = 300;

  for (let col = 0; col < WORD_LENGTH; col++) {
    const letter = guess[col];
    const index = rowIndex * WORD_LENGTH + col;
    const tile = document.getElementById(`tile-${index}`);

    setTimeout(() => {
      tile.classList.add("flip");

      setTimeout(() => {
        tile.classList.remove("flip");
        if (letter === WORD[col]) tile.classList.add("correct");
        else if (WORD.includes(letter)) tile.classList.add("present");
        else tile.classList.add("absent");

        tile.textContent = letter;
        updateKeyboardColor(letter, col);

        if (col === WORD_LENGTH - 1 && typeof callback === "function") {
          setTimeout(callback, 200);
        }
      }, 300);
    }, col * delay);
  }
}

function updateKeyboardColor(letter, index) {
  const key = document.querySelector(`.key[data-key="${letter}"]`);
  if (!key) return;

  if (letter === WORD[index]) keyStatus[letter] = "correct";
  else if (WORD.includes(letter) && keyStatus[letter] !== "correct") keyStatus[letter] = "present";
  else if (!keyStatus[letter]) keyStatus[letter] = "absent";

  key.classList.remove("correct", "present", "absent");
  key.classList.add(keyStatus[letter]);
}

function handleKey(key) {
  if (key === "Enter") {
    if (currentGuess.length !== WORD_LENGTH) {
      showMessage(`Word must be ${WORD_LENGTH} letters`, false);
      const row = guesses.length;
      for (let col = 0; col < currentGuess.length; col++) {
        const tileIndex = row * WORD_LENGTH + col;
        const tile = document.getElementById(`tile-${tileIndex}`);
        tile.classList.add("shake");
        setTimeout(() => tile.classList.remove("shake"), 300);
      }
      return;
    }

    guesses.push(currentGuess);
    const guessCopy = currentGuess;
    flipTiles(guesses.length - 1, () => {
      if (guessCopy === WORD) {
        showMessage("You win!", true);
        disableKeyboard();
      } else if (guesses.length === MAX_GUESSES) {
        showMessage(`Game over! Word was \"${WORD}\"`, true);
        disableKeyboard();
      }
      currentGuess = "";
    });
  } else if (key === "Backspace") {
    currentGuess = currentGuess.slice(0, -1);
    updateCurrentGuess();
  } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
    currentGuess += key.toLowerCase();
    updateCurrentGuess();
  }
}

function updateCurrentGuess() {
  const row = guesses.length;
  for (let col = 0; col < WORD_LENGTH; col++) {
    const tileIndex = row * WORD_LENGTH + col;
    const tile = document.getElementById(`tile-${tileIndex}`);
    tile.textContent = currentGuess[col] || "";
    tile.className = "tile";
  }
}

function disableKeyboard() {
  document.removeEventListener("keydown", keydownListener);
}

function keydownListener(e) {
  handleKey(e.key);
}

function createKeyboard() {
  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["Enter", "z", "x", "c", "v", "b", "n", "m", "Backspace"]
  ];

  rows.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach(key => {
      const btn = document.createElement("button");
      btn.textContent = key === "Backspace" ? "←" : key;
      btn.classList.add("key");
      btn.setAttribute("data-key", key);
      btn.addEventListener("click", () => handleKey(key));
      rowDiv.appendChild(btn);
    });

    keyboard.appendChild(rowDiv);
  });
}

function restartGame() {
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      legendOverlay.classList.toggle("hidden");
    });
  }
  

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      legendOverlay.classList.add("hidden");
    }
  });

  legendOverlay.addEventListener("click", (e) => {
    if (e.target === legendOverlay) {
      legendOverlay.classList.add("hidden");
    }
  });

  hintBtn.addEventListener("click", () => {
    if (hintUsed) return;
    const definition = DEFINITIONS[WORD] || "Definition not found.";
    showMessage(`Hint: ${definition}`);
    hintUsed = true;
    hintBtn.disabled = true;
  });

  if (level === "daily") {
    const label = document.createElement("p");
    label.textContent = "🗓️ Daily Word Challenge";
    label.style.fontWeight = "bold";
    label.style.marginTop = "10px";
    message.before(label);
  }

  createGrid();
  createKeyboard();
  document.addEventListener("keydown", keydownListener);
});

document.querySelectorAll("button, a").forEach(el => {
  el.addEventListener("mouseup", () => el.blur());
});
