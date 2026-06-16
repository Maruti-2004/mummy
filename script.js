const GIFTS = [
  { letter: "S", word: "Sweetest", emoji: "🍬", imageBases: ["./images/01-s-sweetest", "./01-s-sweetest"] },
  { letter: "N", word: "Nurturing", emoji: "🤗", imageBases: ["./images/02-n-nurturing", "./02-n-nurturing"] },
  { letter: "E", word: "Elegant", emoji: "👑", imageBases: ["./images/03-e-elegant", "./03-e-elegant"] },
  { letter: "H", word: "Heartwarming", emoji: "💖", imageBases: ["./images/04-h-heartwarming", "./04-h-heartwarming"] },
  { letter: "A", word: "Awesome", emoji: "🌟", imageBases: ["./images/05-a-awesome", "./05-a-awesome"] },
  { letter: "L", word: "Lovely", emoji: "🌸", imageBases: ["./images/06-l-lovely", "./06-l-lovely"] },
  { letter: "A", word: "Adorable", emoji: "🥰", imageBases: ["./images/07-a-adorable", "./07-a-adorable"] },
  { letter: "T", word: "Talented", emoji: "✨", imageBases: ["./images/08-t-talented", "./08-t-talented"] },
  { letter: "H", word: "Helpful", emoji: "🫶", imageBases: ["./images/09-h-helpful", "./09-h-helpful"] },
  {
    letter: "A",
    word: "Always there",
    emoji: "🏡",
    imageBases: [
      "./images/10-a-always-there",
      "./images/10-a-always_there",
      "./10-a-always-there",
      "./10-a-always_there",
    ],
  },
];

const introScreen = document.getElementById("introScreen");
const giftScreen = document.getElementById("giftScreen");
const laughModal = document.getElementById("laughModal");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const revealModal = document.getElementById("revealModal");
const revealLetter = document.getElementById("revealLetter");
const revealWord = document.getElementById("revealWord");
const balloonGrid = document.getElementById("balloonGrid");
const finalModal = document.getElementById("finalModal");
const giftMusic = document.getElementById("giftMusic");
const finallyBtn = document.getElementById("finallyBtn");
const giftActions = document.getElementById("giftActions");

function confettiBurst() {
  if (typeof window.confetti !== "function") return;
  window.confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
  });
}

function showGiftScreen() {
  introScreen.classList.remove("screen--active");
  introScreen.hidden = true;
  giftScreen.hidden = false;
  giftScreen.classList.add("screen--active");
  confettiBurst();
  // Start music on the date-click gesture (reliably allowed by browsers).
  if (giftMusic) {
    giftMusic.volume = 0.8;
    giftMusic.play().catch(() => {
      // If a browser still blocks it, user can click anywhere once more and it will work.
    });
  }
}

function candidateImagePaths(imageBases) {
  const exts = [".jpg", ".jpeg", ".png", ".webp"];
  return imageBases.flatMap((base) => exts.map((ext) => `${base}${ext}`));
}

function setImageWithFallbacks(img, paths, onAllFail) {
  let idx = 0;
  const tryNext = () => {
    if (idx >= paths.length) {
      onAllFail?.();
      return;
    }
    img.src = paths[idx];
    idx += 1;
  };
  img.onerror = tryNext;
  tryNext();
}

document.querySelectorAll(".dateBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.date === "correct") {
      showGiftScreen();
      return;
    }
    laughModal.showModal();
  });
});

tryAgainBtn.addEventListener("click", () => {
  laughModal.close();
});

function buildBalloons() {
  let burstCount = 0;
  let allBurst = false;

  balloonGrid.innerHTML = GIFTS.map((gift, i) => {
    const colorClass = `b${(i % 5) + 1}`;
    return `
      <button class="balloon ${colorClass}" type="button" data-index="${i}" aria-label="Burst balloon ${gift.letter}">
        <div class="balloon__body">${gift.letter}<span class="balloon__emoji" aria-hidden="true">${gift.emoji}</span></div>
        <div class="balloon__string"></div>
      </button>
    `;
  }).join("");

  balloonGrid.querySelectorAll(".balloon").forEach((balloon) => {
    balloon.addEventListener("click", () => {
      if (balloon.classList.contains("burst")) return;

      const index = Number(balloon.dataset.index);
      const gift = GIFTS[index];
      balloon.classList.add("burst");
      confettiBurst();
      burstCount += 1;
      if (burstCount === GIFTS.length) allBurst = true;

      window.setTimeout(() => {
        revealLetter.textContent = gift.letter;
        revealWord.textContent = gift.word;
        const wrap = document.querySelector(".revealImgWrap");
        if (!wrap) return;
        wrap.classList.remove("is-missing");
        wrap.innerHTML = `<img id="revealImg" alt="${gift.letter} - ${gift.word}" />`;
        const img = document.getElementById("revealImg");
        const candidates = candidateImagePaths(gift.imageBases);
        setImageWithFallbacks(img, candidates, () => {
          const expected = candidates.map((p) => p.split("/").pop()).join(" / ");
          wrap.classList.add("is-missing");
          wrap.innerHTML = `<p>Photo missing.<br>Save it as <strong>${expected}</strong> in the images folder.</p>`;
        });
        revealModal.showModal();
      }, 320);
    });
  });

  // After ALL balloons are burst: show "Finally!" button ONLY after user closes the last reveal popup.
  revealModal.addEventListener(
    "close",
    () => {
      if (allBurst && finallyBtn) {
        finallyBtn.hidden = false;
        if (giftActions) giftActions.classList.add("is-finally");
      }
    },
    { once: false }
  );
}

revealModal.addEventListener("close", () => {
  const wrap = document.querySelector(".revealImgWrap");
  if (wrap) {
    wrap.classList.remove("is-missing");
    wrap.innerHTML = `<img id="revealImg" alt="Birthday memory" />`;
  }
});

buildBalloons();

// Finally button opens the last message + stops music
(() => {
  if (!finallyBtn || !finalModal) return;
  finallyBtn.addEventListener("click", () => {
    confettiBurst();
    confettiBurst();
    finalModal.showModal();
  });
})();
