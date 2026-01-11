/* ===============================
   IMPORTS
================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  addDoc,
  collection,
  setDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  getDocs,
  getDoc,
  query,
  where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   FIREBASE INIT (THIS FIXES ERROR)
================================ */
const firebaseConfig = {
  apiKey: "AIzaSyCU1TXBS9i9gcgOWniTjop1iUKhFjgs07Q",
  authDomain: "registration-42a25.firebaseapp.com",
  projectId: "registration-42a25",
  storageBucket: "registration-42a25.firebasestorage.app",
  messagingSenderId: "610526207352",
  appId: "1:610526207352:web:957390860bc06b4bd33c8d"
};


/* ===============================
   INIT
================================ */
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

document.body.classList.remove("loading");

/* ===============================
   DOM ELEMENTS
================================ */
const containers = document.querySelectorAll(".container");

const teamBox = document.getElementById("teamBox");
const playersBox = document.getElementById("playersBox");

const verificationBox = document.getElementById("verificationBox");
const cardsBox = document.getElementById("cardsBox");
const selectedCardBox = document.getElementById("selectedCardBox");

const msg = document.getElementById("msg");
const playerMsg = document.getElementById("playerMsg");
const popupMsg = document.getElementById("popupMsg");

const buttons = document.querySelectorAll("#signupBtn");
const teamBtn = document.getElementById("teamBtn");
const playersBtn = document.getElementById("playersBtn");

const teamNameInput = document.getElementById("TeamName");
const branchSelect = document.getElementById("branch");
const courseSelect = document.getElementById("course");

/* ===============================
   POPUP MESSAGE
================================ */
function showPopup(message) {
  popupMsg.innerText = message;
  popupMsg.classList.remove("hidden");
  popupMsg.classList.add("show");

  setTimeout(() => {
    popupMsg.classList.remove("show");
    setTimeout(() => {
      popupMsg.classList.add("hidden");
    }, 300);
  }, 3000);
}

/* ===============================
   BUTTON STATE MANAGEMENT
================================ */
function checkFormValidity() {
  const teamName = teamNameInput.value.trim();
  const branch = branchSelect.value;
  const course = courseSelect.value;
  const isValid = teamName !== "" && branch !== "-- Select Branch --" && course !== "-- Select Course --";
  teamBtn.disabled = !isValid;
}

teamNameInput.addEventListener("input", checkFormValidity);
branchSelect.addEventListener("change", checkFormValidity);
courseSelect.addEventListener("change", checkFormValidity);

// Initial check
checkFormValidity();

/* ===============================
   INITIAL STATE
================================ */
emailjs.init("dS6lNBbXocy0MswKN"); // Initialize EmailJS with your user ID
teamBox.style.display = "block";
playersBox.style.display = "none";
verificationBox.style.display = "none";
cardsBox.style.display = "none";
selectedCardBox.style.display = "none";

let teamId = null;

/* ===============================
   STEP 1 — TEAM REGISTRATION
================================ */
teamBtn.addEventListener("click", async () => {
  const teamName = teamNameInput.value.trim();
  const branch = branchSelect.value;
  const course = courseSelect.value;

  try {
    const teamQuery = query(
      collection(db, "teams"),
      where("teamName", "==", teamName)
    );

    const teamSnap = await getDocs(teamQuery);

    if (!teamSnap.empty) {
      showPopup("❌ Team name already exists. Choose a different name.");
      return;
    }

    const teamRef = await addDoc(collection(db, "teams"), {
      teamName,
      branch,
      course,
      anyPlayerVerified: false,
      verificationOpen: true,
      verifiedBy: "",
      createdAt: serverTimestamp()
    });

    teamId = teamRef.id;

    teamBox.classList.add("hidden");
    teamBox.style.display = "none";
    playersBox.classList.remove("hidden");
    playersBox.style.display = "block";

    msg.innerText = "";

  } catch (err) {
    msg.innerText = err.message;
  }
});

/* ===============================
   STEP 2 — PLAYER REGISTRATION
================================ */
playersBtn.addEventListener("click", async () => {
  try {
    
    const players = [
      {
        name: document.getElementById("Player1Name").value.trim(),
        email: document.getElementById("player1mail").value.trim(),
        slot: 1
      },
      {
        name: document.getElementById("Player2Name").value.trim(),
        email: document.getElementById("player2mail").value.trim(),
        slot: 2
      },
      {
        name: document.getElementById("Player3Name").value.trim(),
        email: document.getElementById("player3mail").value.trim(),
        slot: 3
      },
      {
        name: document.getElementById("Player4Name").value.trim(),
        email: document.getElementById("player4mail").value.trim(),
        slot: 4
      }
    ];

    if (players.some(p => !p.name)) {
      showPopup("Fill all player names");
      return;
    }

    if (players.some(p => !p.email)) {
      showPopup("Fill all player emails");
      return;
    }

    // 🔒 Normalize emails
    const normalizedPlayers = players.map(p => ({
      ...p,
      email: p.email.toLowerCase().trim()
    }));

    // ❌ Prevent duplicate emails inside same team
    const emailSet = new Set(normalizedPlayers.map(p => p.email));
    if (emailSet.size !== normalizedPlayers.length) {
      showPopup("❌ Duplicate emails inside the team are not allowed");
      return;
    }

    // 🔍 Check email uniqueness globally
    for (let player of normalizedPlayers) {
      const emailRef = doc(db, "usedEmails", player.email);
      const emailSnap = await getDoc(emailRef);

      if (emailSnap.exists()) {
        showPopup(`❌ Email already used: ${player.email}`);
        return;
      }
    }

    playersBox.classList.add("hidden");
    playersBox.style.display = "none";
    verificationBox.classList.remove("hidden");
    verificationBox.style.display = "block";

    for (let player of players) {

    // define playerId FIRST
    const playerId = `player${player.slot}`;

    // save player in Firestore
    await setDoc(
      doc(db, "teams", teamId, "players", playerId),
      {
        name: player.name,
        email: player.email,
        slot: player.slot,
        verified: false,
        createdAt: serverTimestamp()
      }
    );

    await setDoc(doc(db, "usedEmails", player.email.toLowerCase()), {
      teamId,
      slot: player.slot,
      createdAt: serverTimestamp()
    });

    // build verification link
    const verificationLink =
    `https://keshav3506.github.io/Verification/?teamId=${teamId}&playerId=${playerId}`;

    // send verification email
    await emailjs.send(    
      "service_2snobuh",
      "template_qpjyxdg",
      {
        player_name: player.name,
        verification_link: verificationLink,
        to_email: player.email
      }
    );
  }

  waitForVerification();

  } catch (error) {
    console.error(error);
    showPopup(error.message);
  }
});

/* ===============================
   STEP 3 — WAIT FOR ANY VERIFICATION
================================ */
function waitForVerification() {
  const teamDocRef = doc(db, "teams", teamId);

  onSnapshot(teamDocRef, (snapshot) => {
    if (!snapshot.exists()) return;

    const data = snapshot.data();

    if (data.anyPlayerVerified === true) {
      verificationBox.classList.add("hidden");
      verificationBox.style.display = "none";
      cardsBox.classList.remove("hidden");
      cardsBox.style.display = "block";
      initializeCardSelection();
    }
  });
}

/* ===============================
   STEP 4 — CARD SELECTION
================================ */
let selectedCard = null;
let cardSelected = false;

async function initializeCardSelection() {
  const cardImages = document.querySelectorAll("#cardsGrid img");

  // Fetch taken cards from Firebase
  const takenCards = new Set();
  try {
    const teamsSnapshot = await getDocs(collection(db, "teams"));
    teamsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.selectedCard) {
        takenCards.add(data.selectedCard);
      }
    });
  } catch (error) {
    console.error("Error fetching taken cards:", error);
    showPopup("Error loading card availability");
  }

  // Apply "taken" class to already selected cards
  cardImages.forEach(img => {
    const cardName = img.src.split('/').pop();
    if (takenCards.has(cardName)) {
      img.classList.add("taken");
    }
  });

  cardImages.forEach(img => {
    img.addEventListener("click", async () => {
      if (cardSelected) return; // Prevent multiple selections

      const cardName = img.src.split('/').pop();

      // Check if card is already taken
      if (takenCards.has(cardName)) {
        showPopup("This card is already taken by another team");
        return;
      }

      // Remove selected class from all cards
      cardImages.forEach(card => card.classList.remove("selected"));

      // Add selected class to clicked card
      img.classList.add("selected");

      // Store selected card
      selectedCard = cardName;
      cardSelected = true;

      // Save selected card to Firebase
      try {
        await setDoc(doc(db, "teams", teamId), {
          selectedCard: selectedCard
        }, { merge: true });
      } catch (error) {
        console.error("Error saving selected card:", error);
        showPopup("Error saving card selection");
        cardSelected = false; // Allow retry on error
        return;
      }

      // Optional: Show message
      document.getElementById("cardMsg").innerText = `Selected: ${selectedCard.replace('_', ' ').replace('.png', '')}`;

      // Show selected card UI
      showSelectedCard();
    });
  });
}

/* ===============================
   STEP 5 — SHOW SELECTED CARD
================================ */
function showSelectedCard() {
  cardsBox.classList.add("hidden");
  cardsBox.style.display = "none";
  selectedCardBox.classList.remove("hidden");
  selectedCardBox.style.display = "block";

  // Set the selected card image
  const selectedCardImg = document.getElementById("selectedCardImg");
  selectedCardImg.src = `CARDS_DECK/${selectedCard}`;

  // Set the message
  const selectedCardMsg = document.getElementById("selectedCardMsg");
  selectedCardMsg.innerText = `Your selected card: ${selectedCard.replace('_', ' ').replace('.png', '')}`;
}
