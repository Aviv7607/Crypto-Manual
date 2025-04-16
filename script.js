// מערך לשמירת השחקנים
let players = [];
const MAX_SCORE = 24;

// טעינת נתונים מקומיים בעת טעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    loadPlayers();
    renderPlayers();
    updateTopPlayers();
    setupSearch();
});

// טעינת נתוני השחקנים מ-localStorage
function loadPlayers() {
    const savedPlayers = localStorage.getItem('players');
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
    } else {
        // שחקנים לדוגמה אם אין נתונים שמורים
        players = [
            { name: "שחקן 1", score: 0 },
            { name: "שחקן 2", score: 0 },
            { name: "שחקן 3", score: 0 }
        ];
        savePlayers();
    }
}

// שמירת נתוני השחקנים ל-localStorage
function savePlayers() {
    localStorage.setItem('players', JSON.stringify(players));
}

// הצגת השחקנים בטבלה
function renderPlayers(filteredPlayers = null) {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';

    const playersToRender = filteredPlayers || players;

    playersToRender.forEach((player, index) => {
        // חישוב האינדקס המקורי במערך השחקנים
        const originalIndex = filteredPlayers ? players.findIndex(p => p.name === player.name) : index;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.name}</td>
            <td class="${player.score >= MAX_SCORE ? 'max-score' : ''}">${player.score}</td>
            <td>
                <button class="score-btn add-btn" onclick="updateScore(${originalIndex}, 1)">+</button>
                <button class="score-btn subtract-btn" onclick="updateScore(${originalIndex}, -1)">-</button>
                <button class="remove-btn" onclick="removePlayer(${originalIndex})">הסר</button>
            </td>
        `;
        playersList.appendChild(row);
    });
}

// עדכון ניקוד של שחקן
function updateScore(index, amount) {
    const newScore = players[index].score + amount;
    // וידוא שהניקוד אינו שלילי ואינו מעל 24
    if (newScore >= 0 && newScore <= MAX_SCORE) {
        players[index].score = newScore;
        savePlayers();
        renderPlayers();
        updateTopPlayers();
    }
}

// הסרת שחקן
function removePlayer(index) {
    if (confirm(`האם אתה בטוח שברצונך להסיר את השחקן "${players[index].name}"?`)) {
        players.splice(index, 1);
        savePlayers();
        renderPlayers();
        updateTopPlayers();
    }
}

// עדכון רשימת המובילים
function updateTopPlayers() {
    const topPlayersList = document.getElementById('top-players-list');
    topPlayersList.innerHTML = '';

    // מיון השחקנים לפי ניקוד
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    // הצגת ה-TOP 15 בלבד
    const topPlayers = sortedPlayers.slice(0, 15);
    
    topPlayers.forEach((player, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'top-player';
        
        const rankSpan = document.createElement('span');
        rankSpan.className = 'top-player-rank';
        
        // הוספת קלאס למקומות 1-3
        if (index === 0) {
            rankSpan.classList.add('rank-1'); // זהב
        } else if (index === 1) {
            rankSpan.classList.add('rank-2'); // כסף
        } else if (index === 2) {
            rankSpan.classList.add('rank-3'); // ארד
        }
        
        rankSpan.textContent = index + 1;
        
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'top-player-score';
        scoreSpan.textContent = player.score;
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = player.name;
        
        playerElement.appendChild(rankSpan);
        playerElement.appendChild(nameSpan);
        playerElement.appendChild(scoreSpan);
        
        topPlayersList.appendChild(playerElement);
    });
}

// הגדרת פונקציונליות חיפוש
function setupSearch() {
    const searchInput = document.getElementById('player-search');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            renderPlayers(); // הצג את כל השחקנים אם תיבת החיפוש ריקה
        } else {
            // סנן את השחקנים לפי מונח החיפוש
            const filteredPlayers = players.filter(player => 
                player.name.toLowerCase().includes(searchTerm)
            );
            renderPlayers(filteredPlayers);
        }
    });
}

// הוספת שחקן חדש
document.getElementById('add-player-btn').addEventListener('click', function() {
    const nameInput = document.getElementById('new-player-name');
    const name = nameInput.value.trim();
    
    if (name) {
        players.push({ name: name, score: 0 });
        savePlayers();
        renderPlayers();
        updateTopPlayers();
        nameInput.value = '';
    }
});

// איפוס הטבלה
document.getElementById('reset-btn').addEventListener('click', function() {
    if (confirm('האם אתה בטוח שברצונך לאפס את כל הניקוד? פעולה זו לא ניתנת לביטול.')) {
        // אפס את הניקוד אך שמור את השמות
        players.forEach(player => {
            player.score = 0;
        });
        savePlayers();
        renderPlayers();
        updateTopPlayers();
    }
});