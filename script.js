// רשימת המטבעות וצבעים
let cryptoList = [
    'BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'FTM', 'PYT', 'STX', 'TIA', 'ETC', 'ALGO', 'HBAR', 'AAVE', 'WLD', 'XRP',
    'MATIC', 'DOT', 'LINK', 'UNI', 'AVAX', 'ATOM', 'NEAR', 'ICP', 'APT', 'OP', 'ARB', 'INJ', 'SUI', 'SEI'
];

let customColors = {};
cryptoList.forEach((coin, index) => {
    customColors[coin] = `bg-${coin.toLowerCase()}`;
});

// מצב האפליקציה
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let priceAlerts = JSON.parse(localStorage.getItem('priceAlerts')) || {};
let currentPrices = {};

// קריאה ל-API של CoinGecko
async function fetchPrices() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,cardano,fantom,stacks,celestia,ethereum-classic,algorand,hedera-hashgraph,aave,worldcoin,ripple&vs_currencies=usd`);
        const data = await response.json();
        
        const mapping = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'BNB': 'binancecoin',
            'SOL': 'solana',
            'ADA': 'cardano',
            'FTM': 'fantom',
            'STX': 'stacks',
            'TIA': 'celestia',
            'ETC': 'ethereum-classic',
            'ALGO': 'algorand',
            'HBAR': 'hedera-hashgraph',
            'AAVE': 'aave',
            'WLD': 'worldcoin',
            'XRP': 'ripple'
        };

        cryptoList.forEach(symbol => {
            const geckoId = mapping[symbol];
            if (geckoId && data[geckoId]) {
                currentPrices[symbol] = data[geckoId].usd;
            }
        });

        checkPriceAlerts();
        updateSummaryTable();
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

// בדיקת התראות מחיר
function checkPriceAlerts() {
    Object.entries(priceAlerts).forEach(([coin, alerts]) => {
        const currentPrice = currentPrices[coin];
        if (!currentPrice) return;

        alerts.forEach(alert => {
            if (!alert.triggered && 
                ((alert.type === 'above' && currentPrice >= alert.price) ||
                 (alert.type === 'below' && currentPrice <= alert.price))) {
                showNotification(`${coin} הגיע למחיר היעד: $${alert.price}`);
                alert.triggered = true;
            }
        });
    });
    localStorage.setItem('priceAlerts', JSON.stringify(priceAlerts));
}

// הצגת התראה
function showNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification('התראת מחיר', { body: message });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('התראת מחיר', { body: message });
            }
        });
    }
}

// אתחול הטופס
function initializeForm() {
    const coinSelect = document.getElementById('coin');
    const alertCoinSelect = document.getElementById('alertCoin');
    
    [coinSelect, alertCoinSelect].forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">בחר מטבע</option>';
            cryptoList.forEach(coin => {
                const option = document.createElement('option');
                option.value = coin;
                option.textContent = coin;
                select.appendChild(option);
            });
        }
    });

    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
}

// ניהול טאבים
function setupTabs() {
    const triggers = document.querySelectorAll('.tab-trigger');
    const contents = document.querySelectorAll('.tab-content');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const tabId = trigger.getAttribute('data-tab');
            
            triggers.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            trigger.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            if (tabId === 'history') updateHistoryTable();
            if (tabId === 'summary') updateSummaryTable();
            if (tabId === 'alerts') updateAlertsTable();
        });
    });
}

// הוספת מטבע חדש
function handleNewCoin(e) {
    e.preventDefault();
    const symbol = document.getElementById('newCoinSymbol').value.toUpperCase();
    if (symbol && !cryptoList.includes(symbol)) {
        cryptoList.push(symbol);
        customColors[symbol] = 'bg-gray-100';
        localStorage.setItem('customCoins', JSON.stringify(cryptoList));
        initializeForm();
    }
    e.target.reset();
}

// הוספת התראת מחיר
function handlePriceAlert(e) {
    e.preventDefault();
    const coin = document.getElementById('alertCoin').value;
    const price = parseFloat(document.getElementById('alertPrice').value);
    const type = document.getElementById('alertType').value;

    if (!priceAlerts[coin]) priceAlerts[coin] = [];
    priceAlerts[coin].push({ price, type, triggered: false });
    localStorage.setItem('priceAlerts', JSON.stringify(priceAlerts));
    updateAlertsTable();
    e.target.reset();
}

// הוספת עסקה חדשה
function handleTransaction(e) {
    e.preventDefault();
    
    const formData = {
        type: document.getElementById('type').value,
        coin: document.getElementById('coin').value,
        amount: parseFloat(document.getElementById('amount').value),
        totalPrice: parseFloat(document.getElementById('totalPrice').value),
        date: document.getElementById('date').value,
        id: Date.now()
    };

    transactions.push(formData);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    e.target.reset();
    document.getElementById('date').valueAsDate = new Date();
    
    updateHistoryTable();
    updateSummaryTable();
}

// עדכון טבלת היסטוריה
function updateHistoryTable() {
    const tableBody = document.getElementById('history-table');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(transaction => {
            const row = document.createElement('tr');
            row.className = customColors[transaction.coin] || 'bg-gray-100';
            
            row.innerHTML = `
                <td class="p-2">${transaction.date}</td>
                <td class="p-2">${transaction.coin}</td>
                <td class="p-2">${transaction.type === 'buy' ? 'קנייה' : 'מכירה'}</td>
                <td class="p-2">${transaction.amount}</td>
                <td class="p-2">$${transaction.totalPrice}</td>
                <td class="p-2">$${(transaction.totalPrice / transaction.amount).toFixed(2)}</td>
                <td class="p-2">
                    <button onclick="deleteTransaction(${transaction.id})" class="btn-delete">
                        מחק
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
}

// חישוב סטטיסטיקות
function calculateStats() {
    const stats = {};
    
    cryptoList.forEach(coin => {
        const coinTransactions = transactions.filter(t => t.coin === coin);
        const buys = coinTransactions.filter(t => t.type === 'buy');
        const sells = coinTransactions.filter(t => t.type === 'sell');
        
        const totalBuyAmount = buys.reduce((acc, curr) => acc + curr.amount, 0);
        const totalBuyPrice = buys.reduce((acc, curr) => acc + curr.totalPrice, 0);
        
        stats[coin] = {
            avgBuy: totalBuyAmount ? totalBuyPrice / totalBuyAmount : 0,
            avgSell: sells.length ? sells.reduce((acc, curr) => acc + curr.totalPrice/curr.amount, 0) / sells.length : 0,
            totalCoins: totalBuyAmount - sells.reduce((acc, curr) => acc + curr.amount, 0),
            profitLoss: sells.reduce((acc, curr) => acc + curr.totalPrice, 0) - 
                       sells.reduce((acc, curr) => acc + (curr.amount * (totalBuyAmount ? totalBuyPrice / totalBuyAmount : 0)), 0)
        };
    });
    
    return stats;
}

// עדכון טבלת סיכום
function updateSummaryTable() {
    const tableBody = document.getElementById('summary-table');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const stats = calculateStats();
    
    Object.entries(stats).forEach(([coin, stat]) => {
        if (stat.totalCoins === 0 && stat.profitLoss === 0) return;
        
        const currentPrice = currentPrices[coin] || 0;
        const currentValue = stat.totalCoins * currentPrice;
        const totalInvestment = stat.avgBuy * stat.totalCoins;
        const unrealizedPL = currentValue - totalInvestment;
        
        const row = document.createElement('tr');
        row.className = customColors[coin] || 'bg-gray-100';
        
        row.innerHTML = `
            <td class="p-2">${coin}</td>
            <td class="p-2">$${stat.avgBuy.toFixed(2)}</td>
            <td class="p-2">$${stat.avgSell.toFixed(2)}</td>
            <td class="p-2">${stat.totalCoins.toFixed(4)}</td>
            <td class="p-2">$${currentPrice.toFixed(2)}</td>
            <td class="p-2 ${unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}">
                $${unrealizedPL.toFixed(2)}
            </td>
            <td class="p-2 ${stat.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}">
                $${stat.profitLoss.toFixed(2)}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// עדכון טבלת התראות
function updateAlertsTable() {
    const tableBody = document.getElementById('alerts-table');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    Object.entries(priceAlerts).forEach(([coin, alerts]) => {
        alerts.forEach((alert, index) => {
            const row = document.createElement('tr');
            row.className = customColors[coin] || 'bg-gray-100';
            
            row.innerHTML = `
                <td class="p-2">${coin}</td>
                <td class="p-2">$${alert.price}</td>
                <td class="p-2">${alert.type === 'above' ? 'מעל' : 'מתחת'}</td>
                <td class="p-2">
                    <button onclick="removeAlert('${coin}', ${index})" class="btn-delete">
                        מחק
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    });
}

// מחיקת התראת מחיר
function removeAlert(coin, index) {
    if (priceAlerts[coin]) {
        priceAlerts[coin].splice(index, 1);
        if (priceAlerts[coin].length === 0) {
            delete priceAlerts[coin];
        }
        localStorage.setItem('priceAlerts', JSON.stringify(priceAlerts));
        updateAlertsTable();
    }
}

// מחיקת עסקה
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateHistoryTable();
    updateSummaryTable();
}

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', () => {
    // אתחול טפסים וטאבים
    initializeForm();
    setupTabs();
    
    // הוספת מאזינים לטפסים
    const transactionForm = document.getElementById('transaction-form');
    const newCoinForm = document.getElementById('new-coin-form');
    const priceAlertForm = document.getElementById('price-alert-form');
    
    if (transactionForm) transactionForm.addEventListener('submit', handleTransaction);
    if (newCoinForm) newCoinForm.addEventListener('submit', handleNewCoin);
    if (priceAlertForm) priceAlertForm.addEventListener('submit', handlePriceAlert);
    
    // עדכון טבלאות
    updateHistoryTable();
    updateSummaryTable();
    updateAlertsTable();
    
    // התחלת מעקב מחירים
    fetchPrices();
    setInterval(fetchPrices, 60000); // עדכון כל דקה
    
    // בקשת הרשאה להתראות
    Notification.requestPermission();
    
    // טעינת מטבעות מותאמים אישית
    const savedCoins = localStorage.getItem('customCoins');
    if (savedCoins) {
        cryptoList = JSON.parse(savedCoins);
    }
});
