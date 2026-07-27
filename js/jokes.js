const APIs = {
    'programming': 'https://official-joke-api.appspot.com/jokes/programming/random',
    'knock-knock': 'https://official-joke-api.appspot.com/jokes/knock-knock/random',
    'general': 'https://official-joke-api.appspot.com/random_joke',
    'any': 'https://official-joke-api.appspot.com/random_joke'
};

const jokeBox = document.getElementById('jokeBox');
const getJokeBtn = document.getElementById('getJokeBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const categorySelect = document.getElementById('categorySelect');
const jokeType = document.getElementById('jokeType');
const jokeCategory = document.getElementById('jokeCategory');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

let currentJoke = null;
let jokeHistory = [];

function loadHistory() {
    const saved = localStorage.getItem('jokeHistory');
    if (saved) {
        jokeHistory = JSON.parse(saved);
        displayHistory();
    }
}

function saveHistory() {
    localStorage.setItem('jokeHistory', JSON.stringify(jokeHistory.slice(0, 10)));
}

function displayHistory() {
    if (jokeHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-message">No jokes yet. Get started!</p>';
        return;
    }

    historyList.innerHTML = jokeHistory
        .map((joke, index) => `
            <div class="history-item" onclick="loadFromHistory(${index})">
                <strong>#${index + 1}</strong> ${joke.text}
            </div>
        `)
        .join('');
}

function loadFromHistory(index) {
    currentJoke = jokeHistory[index];
    displayJoke(currentJoke);
}

async function getJoke() {
    const category = categorySelect.value;
    const apiUrl = APIs[category];

    try {
        getJokeBtn.classList.add('loading');
        getJokeBtn.disabled = true;

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch joke');
        }

        const data = await response.json();
        let joke = Array.isArray(data) ? data[0] : data;
        
        currentJoke = {
            setup: joke.setup || '',
            delivery: joke.delivery || joke.punchline || '',
            type: joke.type || 'single',
            category: joke.category || 'general',
            id: joke.id || Math.random()
        };

        const jokeText = currentJoke.setup 
            ? `${currentJoke.setup} ${currentJoke.delivery}`
            : currentJoke.delivery;
        
        jokeHistory.unshift({
            text: jokeText,
            ...currentJoke
        });
        
        saveHistory();
        displayHistory();
        displayJoke(currentJoke);
        showNotification('Joke loaded successfully!');

    } catch (error) {
        console.error('Error:', error);
        jokeBox.innerHTML = '<p class="loading">Failed to load joke. Please try again!</p>';
        showNotification('Error loading joke. Please try again!', 'error');
    } finally {
        getJokeBtn.classList.remove('loading');
        getJokeBtn.disabled = false;
    }
}

function displayJoke(joke) {
    let jokeText = '';
    
    if (joke.setup && joke.delivery) {
        jokeText = `${joke.setup}<br><br>${joke.delivery}`;
    } else {
        jokeText = joke.delivery || 'No joke text available';
    }

    jokeBox.innerHTML = jokeText;
    jokeType.textContent = `Type: ${joke.type || 'unknown'}`;
    jokeCategory.textContent = `Category: ${joke.category || 'unknown'}`;
}

function copyJoke() {
    if (!currentJoke) {
        showNotification('No joke to copy!', 'error');
        return;
    }

    const jokeText = currentJoke.setup 
        ? `${currentJoke.setup}\n${currentJoke.delivery}`
        : currentJoke.delivery;

    navigator.clipboard.writeText(jokeText).then(() => {
        showNotification('Joke copied to clipboard!');
    }).catch(() => {
        showNotification('Failed to copy joke', 'error');
    });
}

function shareJoke() {
    if (!currentJoke) {
        showNotification('No joke to share!', 'error');
        return;
    }

    const jokeText = currentJoke.setup 
        ? `${currentJoke.setup}\n${currentJoke.delivery}`
        : currentJoke.delivery;

    if (navigator.share) {
        navigator.share({
            title: 'Check out this joke!',
            text: jokeText
        }).catch(error => console.log('Error sharing:', error));
    } else {
        navigator.clipboard.writeText(jokeText);
        showNotification('Joke copied to clipboard! Share it manually.');
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all jokes?')) {
        jokeHistory = [];
        saveHistory();
        displayHistory();
        showNotification('History cleared!');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

getJokeBtn.addEventListener('click', getJoke);
copyBtn.addEventListener('click', copyJoke);
shareBtn.addEventListener('click', shareJoke);
clearHistoryBtn.addEventListener('click', clearHistory);

window.addEventListener('load', loadHistory);