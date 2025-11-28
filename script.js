// ===== PAGE NAVIGATION =====
const pages = Array.from(document.querySelectorAll(".page"));
const stageIndicator = document.getElementById("stageIndicator");

// page index: 0 = password, 1..9 real content
let currentIndex = 0;

// stage pages (cover..letter) = 9
const stagePages = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// typing flags
let prologueTyped = false;
let letterTyped = false;
let typingTimer = null;

// background music
const bgMusic = document.getElementById("bgMusic");

// show page by index
function showPage(index) {
  currentIndex = index;

  pages.forEach((page, i) => {
    if (i === index) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }
  });

  // stage indicator (only for non-password)
  const stagePosition = stagePages.indexOf(index);
  if (stagePosition !== -1) {
    stageIndicator.textContent = `Page ${stagePosition + 1} / ${stagePages.length}`;
  } else {
    stageIndicator.textContent = "";
  }

  // handle typing triggers
  const pageId = pages[index].id;
  if (pageId === "page-prologue") {
    startTypingOnce("prologueTyping", "prologueSource", 22, "prologue");
  }
  if (pageId === "page-letter") {
    startTypingOnce("letterTyping", "letterSource", 55, "letter"); // lebih pelan
  }
}

// ===== TYPING EFFECT =====

function getSourceText(sourceId) {
  const el = document.getElementById(sourceId);
  if (!el) return "";
  const paragraphs = Array.from(el.querySelectorAll("p"));
  return paragraphs.map((p) => p.textContent.trim()).join("\n\n");
}

function startTypingOnce(targetId, sourceId, speed, flag) {
  const target = document.getElementById(targetId);
  if (!target) return;

  // if already typed once, just show full text
  if (flag === "prologue" && prologueTyped) {
    target.textContent = getSourceText(sourceId);
    return;
  }
  if (flag === "letter" && letterTyped) {
    target.textContent = getSourceText(sourceId);
    return;
  }

  // stop previous typing
  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }

  const fullText = getSourceText(sourceId);
  let index = 0;
  target.textContent = "";

  typingTimer = setInterval(() => {
    if (index >= fullText.length) {
      clearInterval(typingTimer);
      typingTimer = null;
      if (flag === "prologue") prologueTyped = true;
      if (flag === "letter") letterTyped = true;
      return;
    }
    target.textContent += fullText.charAt(index);
    index++;
  }, speed);
}

// ===== NAV BUTTONS (NEXT / PREV) =====
const navButtons = document.querySelectorAll(".nav-btn");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const dir = btn.dataset.nav;
    if (dir === "next") {
      if (currentIndex < pages.length - 1) {
        showPage(currentIndex + 1);
      }
    } else if (dir === "prev") {
      if (currentIndex > 0) {
        showPage(currentIndex - 1);
      }
    }
  });
});

// ===== PASSWORD GATE 1 =====
const passwordBtn = document.getElementById("passwordBtn");
const passwordInput = document.getElementById("passwordInput");
const passwordError = document.getElementById("passwordError");
const passwordCard = document.querySelector(".password-card");

// password benar: "170823"
const CORRECT_PASSWORD = "170823";

function handlePasswordCheck() {
  const val = (passwordInput.value || "").trim();

  if (val === CORRECT_PASSWORD) {
    passwordError.textContent = "";
    // mulai musik
    if (bgMusic) {
      bgMusic.play().catch(() => {});
    }
    showPage(1); // masuk ke cover
  } else {
    passwordError.textContent = "coba lg ya botto sayang";
    if (passwordCard) {
      passwordCard.classList.remove("shake");
      void passwordCard.offsetWidth; // force reflow
      passwordCard.classList.add("shake");
    }
  }
}

if (passwordBtn && passwordInput) {
  passwordBtn.addEventListener("click", handlePasswordCheck);
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handlePasswordCheck();
    }
  });
}

// ===== PASSWORD GATE 2 (PAGE 25) =====
const gate25Btn = document.getElementById("gate25Btn");
const gate25Input = document.getElementById("gate25Input");
const gate25Error = document.getElementById("gate25Error");
const GATE25_PASSWORD = "25";

function handleGate25Check() {
  const val = (gate25Input.value || "").trim();
  if (val === GATE25_PASSWORD) {
    gate25Error.textContent = "";
    // langsung ke page reasons (index 6)
    showPage(6);
  } else {
    gate25Error.textContent = "pelan2 botto, coba lg ya sayangku";
  }
}

if (gate25Btn && gate25Input) {
  gate25Btn.addEventListener("click", handleGate25Check);
  gate25Input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleGate25Check();
    }
  });
}

// ===== TRIVIA CROSSWORD SETUP — INTERAKTIF =====

const crosswordBoxes = document.querySelectorAll(".crossword-boxes");

// bikin kotak sesuai jumlah huruf
crosswordBoxes.forEach((container) => {
  const answer = (container.dataset.answer || "").toUpperCase();
  container.innerHTML = "";

  for (let ch of answer) {
    const span = document.createElement("span");
    if (ch === " ") {
      span.className = "cross-box space";
    } else {
      span.className = "cross-box";
      span.textContent = ""; // diisi kalau jawaban benar
      span.dataset.letter = ch;
    }
    container.appendChild(span);
  }
});

const crosswordItems = document.querySelectorAll(".crossword-item");
const triviaNextBtn = document.getElementById("triviaNext");

function checkAllTriviaSolved() {
  const allSolved = Array.from(crosswordItems).every((item) =>
    item.classList.contains("solved")
  );
  if (allSolved && triviaNextBtn) {
    triviaNextBtn.disabled = false;
  }
}

crosswordItems.forEach((item) => {
  const container = item.querySelector(".crossword-boxes");
  const input = item.querySelector(".crossword-input");
  const button = item.querySelector(".crossword-submit");
  const boxes = item.querySelectorAll(".cross-box");

  if (!container || !input || !button) return;

  const rawAnswer = (container.dataset.answer || "").toUpperCase();
  const normalizedAnswer = rawAnswer.replace(/\s+/g, ""); // buang spasi

  button.addEventListener("click", () => {
    const userRaw = (input.value || "").toUpperCase();
    const userNormalized = userRaw.replace(/\s+/g, "");

    if (userNormalized === normalizedAnswer) {
      // isi huruf ke kotak + animasi fade
      boxes.forEach((box) => {
        const letter = box.dataset.letter;
        if (letter) {
          box.textContent = letter;
          box.classList.add("filled");
        }
      });

      item.classList.add("solved");
      input.disabled = true;
      button.disabled = true;
      input.classList.remove("error-input");
      item.classList.remove("shake");

      checkAllTriviaSolved();
    } else {
      // jawaban salah → shake + warna error
      input.classList.add("error-input");
      item.classList.remove("shake");
      void item.offsetWidth; // reset animasi
      item.classList.add("shake");
    }
  });

  // Enter key untuk submit
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      button.click();
    }
  });

  // kalau dia mulai ngetik lagi, hilangin merahnya
  input.addEventListener("input", () => {
    input.classList.remove("error-input");
  });
});

// ===== 25 THINGS ACCORDION =====
const reasonCards = document.querySelectorAll(".reason-card");

reasonCards.forEach((card) => {
  card.addEventListener("click", () => {
    // bisa multiple open, atau kalau mau single open uncomment logic di bawah
    // reasonCards.forEach((c) => {
    //   if (c !== card) c.classList.remove("open");
    // });
    card.classList.toggle("open");
  });
});

// ===== AWAL: TAMPILKAN PAGE PASSWORD =====
showPage(0);
