let textData = [];

fetch("big_song_list.txt")
  .then((res) => res.text())
  .then((data) => {
    textData = data.split("\n");
  });

document.getElementById("searchInput").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (query.length > 0) {
    const filtered = textData.filter((line) =>
      line.toLowerCase().includes(query)
    );

    if (filtered.length > 0) {
      filtered.forEach((line) => {
        const div = document.createElement("div");
        div.className = "result";
        div.textContent = line;
        resultsDiv.appendChild(div);
      });
    } else {
      resultsDiv.innerHTML = "<p>Keine Treffer gefunden.</p>";
    }
  }
});

const results = document.getElementById("results");
const searchInput = document.getElementById("searchInput");

let allSongs = [];

fetch("big_song_list.txt")
  .then((response) => response.text())
  .then((text) => {
    allSongs = text.split("\n").filter((line) => line.trim() !== "");

    renderSongs(allSongs);
  });

function renderSongs(songs) {
  results.innerHTML = "";
  songs.forEach((songName, index) => {
    const songDiv = document.createElement("div");
    songDiv.classList.add("song");
    songDiv.dataset.id = index + 1;

    songDiv.innerHTML = `
      <h3>${songName}</h3>
      <div class="vote-stars">
        <span data-value="1">☆</span>
        <span data-value="2">☆</span>
        <span data-value="3">☆</span>
        <span data-value="4">☆</span>
        <span data-value="5">☆</span>
      </div>
      <p>Average: <span class="average-stars">☆☆☆☆☆</span></p>
    `;
    results.appendChild(songDiv);
  });

  initVoting();
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filteredSongs = allSongs.filter((song) =>
    song.toLowerCase().includes(query)
  );
  renderSongs(filteredSongs);
});

// Reset all votes and userVotes on page load
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".song").forEach((song) => {
    const songId = song.dataset.id;
    localStorage.removeItem("votes_" + songId);
    localStorage.removeItem("userVote_" + songId);
  });
});

function initVoting() {
  document.querySelectorAll(".song").forEach((song) => {
    const stars = song.querySelectorAll(".vote-stars span");
    const avgDisplay = song.querySelector(".average-stars");
    const songId = song.dataset.id;

    let votes = [];
    let userVote = JSON.parse(localStorage.getItem("userVote_" + songId)) || null;
    if (userVote !== null) {
      votes = [userVote];
    }

    updateAverage();
    if (userVote) {
      markStars(userVote);
    }

    stars.forEach((star) => {
      star.addEventListener("click", () => {
        userVote = parseInt(star.dataset.value);
        votes = [userVote];
        localStorage.setItem("votes_" + songId, JSON.stringify(votes));
        localStorage.setItem("userVote_" + songId, JSON.stringify(userVote));
        markStars(userVote);
        updateAverage();
      });
    });

    function markStars(vote) {
      stars.forEach((s) => {
        s.textContent = parseInt(s.dataset.value) <= vote ? "★" : "☆";
      });
    }

    function updateAverage() {
      if (votes.length === 0) {
        avgDisplay.textContent = "☆☆☆☆☆";
        return;
      }
      const avg = votes.reduce((a, b) => a + b, 0) / votes.length;
      avgDisplay.textContent = renderStars(avg);
    }

    function renderStars(avg) {
      let fullStars = Math.floor(avg);
      let halfStar = avg - fullStars >= 0.5 ? 1 : 0;
      let emptyStars = 5 - fullStars - halfStar;
      return (
        "★".repeat(fullStars) + (halfStar ? "⯪" : "") + "☆".repeat(emptyStars)
      );
    }
  });
}
