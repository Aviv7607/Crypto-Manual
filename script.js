// רשימת המטבעות וצבעים
const cryptoList = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'FTM', 'PYT', 'STX', 'TIA', 'ETC', 'ALGO', 'HBAR', 'AAVE', 'WLD', 'XRP'];
const cryptoColors = {
    BTC: 'bg-btc', ETH: 'bg-eth', BNB: 'bg-bnb', SOL: 'bg-sol',
    ADA: 'bg-ada', FTM: 'bg-ftm', PYT: 'bg-pyt', STX: 'bg-stx',
    TIA: 'bg-tia', ETC: 'bg-etc', ALGO: 'bg-algo', HBAR: 'bg-hbar',
    AAVE: 'bg-aave', WLD: 'bg-wld', XRP: 'bg-xrp'
};

// מצב האפליקציה
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// אתחול הטופס
function initializeForm() {
    const coinSelect = document.getElementById('coin');
    cryptoList.forEach(coin => {
        const option = document.createElement('option');
        option.value = coin;
        option.textContent = coin;
        coinSelect.appendChild(option);
    });

    document.getElementById('date').valueAsDate = new Date();
}

// ניהול טאבים
function setupTabs() {
    const triggers = document.querySelectorAll('.tab-trigger');
    const contents = document.querySelectorAll('.tab-content');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const tab = trigger.dataset.tab;
            
            triggers.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            trigger.classList.add('active');
            document.getElementById(tab).classList.add('active');
            
            if (tab === 'history') updateHistoryTable();
            if (tab === 'summary') updateSummaryTable();
        });
    });
}

// הוספת עסקה חדשה
function handleSubmit(e) {
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
    tableBody.innerHTML = '';

    transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(transaction => {
            const row = document.createElement('tr');
            row.className = cryptoColors[transaction.coin];
            
            row.innerHTML = `
                <td class="p-2">${transaction.date}</td>
                <td class="p-2">${transaction.coin}</td>
                <td class="p-2">${transaction.type === 'buy' ? 'קנייה' : 'מכירה'}</td>
                <td class="p-2">${transaction.amount}</td>
                <td class="p-2">$${transaction.totalPrice}</td>
                <td class="p-2">$${(transaction.totalPrice / transaction.amount).toFixed(2)}</td>
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
        
        stats[coin] = {
            avgBuy: buys.length ? buys.reduce((acc, curr) => acc + curr.totalPrice/curr.amount, 0) / buys.length : 0,
            avgSell: sells.length ? sells.reduce((acc, curr) => acc + curr.totalPrice/curr.amount, 0) / sells.length : 0,
            totalCoins: buys.reduce((acc, curr) => acc + curr.amount, 0) - sells.reduce((acc, curr) => acc + curr.amount, 0),
            profitLoss: sells.reduce((acc, curr) => acc + curr.totalPrice, 0) - buys.reduce((acc, curr) => acc + curr.totalPrice, 0)
        };
    });
    
    return stats;
}

// עדכון טבלת סיכום
function updateSummaryTable() {
    const tableBody = document.getElementById('summary-table');
    tableBody.innerHTML = '';
    
    const stats = calculateStats();
    
    Object.entries(stats).forEach(([coin, stat]) => {
        const row = document.createElement('tr');
        row.className = cryptoColors[coin];
        
        row.innerHTML = `
            <td class="p-2">${coin}</td>
            <td class="p-2">$${stat.avgBuy.toFixed(2)}</td>
            <td class="p-2">$${stat.avgSell.toFixed(2)}</td>
            <td class="p-2">${stat.totalCoins.toFixed(4)}</td>
            <td class="p-2 ${stat.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}">
                $${stat.profitLoss.toFixed(2)}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupTabs();
    document.getElementById('transaction-form').addEventListener('submit', handleSubmit);
    updateHistoryTable();
    updateSummaryTable();
});
