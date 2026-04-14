const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#080808');

const SUPABASE_URL = "https://epayzwjglacworkdbkmh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYXl6d2pnbGFjd29ya2Ria21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTA0NjIsImV4cCI6MjA5MDA4NjQ2Mn0.22nlKvyVL_4nuECtFtiP3TZ3suBeFNWxMQhkvxKfmmo";
const SB_HEADERS = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Accept-Profile": "public",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
};

const botUsername = "Demons_moderation_bot";
let modalDataStorage = {};

const BACKGROUND_URLS = {
    custom: 'https://i.ibb.co/sdtYVVQy/2c6b0208a4ca4a574f8f0a88ab7fa050.jpg',
    rain: 'https://i.ibb.co/fYkkjF7s/5c4be6c13f5b1596f6da40eaaf6c1518.jpg',
    snow: 'https://i.ibb.co/kg0JfXMM/f3fa7b75c87277e7368e03b41b69911c.jpg',
    sun: 'https://i.ibb.co/WWXGyWGP/df79dd417c696e8c13597e1409af12e1.jpg'
};

// --- Данные пользователя ---
const user = tg.initDataUnsafe?.user;
if (user) {
    const fullName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    document.getElementById('user-name').innerText = fullName;
    document.getElementById('user-id').innerText = `ID: ${user.id}`;
    document.getElementById('user-avatar').innerText = fullName[0].toUpperCase();
}

// НОВАЯ ФУНКЦИЯ: Динамическое обновление счетчика
function updateProfileStats() {
    // Получаем ID заново прямо перед запросом
    const currentUser = window.Telegram.WebApp.initDataUnsafe?.user;
    
    if (!currentUser || !currentUser.id) {
        console.error("ID пользователя не найден в Telegram WebApp");
        return;
    }

    console.log("Запрос статистики для:", currentUser.id);

    fetch(`${SUPABASE_URL}/rest/v1/users?user_id=eq.${currentUser.id}&select=downloads`, { headers: SB_HEADERS })
        .then(res => res.json())
        .then(data => {
            console.log("Получены данные:", data);
            const countElement = document.getElementById('downloads-count');
            if (countElement) {
                countElement.innerText = (data[0] && data[0].downloads) ? data[0].downloads : 0;
            }
        })
        .catch(err => console.error("Ошибка при получении статистики:", err));
}

// Вызываем при клике на кнопки навигации
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.getAttribute('data-target') === 'view-profile') {
            updateProfileStats();
        }
    });
});

// Запрашиваем статистику при первом запуске
updateProfileStats();

// Обновляем статистику каждый раз, когда открываем вкладку "Профиль"
document.getElementById('bottom-profile-btn').addEventListener('click', updateProfileStats);
document.getElementById('top-profile-btn').addEventListener('click', updateProfileStats);

// Пасхалка на Админ-мод
let avatarClicks = 0;
document.getElementById('user-avatar').addEventListener('click', () => {
    avatarClicks++;
    if (avatarClicks === 5) {
        tg.HapticFeedback.notificationOccurred('success');
        document.body.classList.toggle('admin-mode');
        
        // Показываем/скрываем кнопки админа на всех карточках
        const adminBlocks = document.querySelectorAll('.admin-actions');
        adminBlocks.forEach(block => {
            block.style.display = document.body.classList.contains('admin-mode') ? 'flex' : 'none';
        });

        tg.showAlert(document.body.classList.contains('admin-mode') ? 'Режим модератора АКТИВИРОВАН.' : 'Режим модератора ВЫКЛЮЧЕН');
        avatarClicks = 0;
    }
});

// --- Навигация ---
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

// НОВАЯ ФУНКЦИЯ: Движение индикатора
function updateNavIndicator() {
    const activeBtn = document.querySelector('.bottom-nav .nav-btn.active');
    const indicator = document.querySelector('.nav-indicator');
    if (activeBtn && indicator) {
        indicator.style.width = `${activeBtn.offsetWidth}px`;
        indicator.style.left = `${activeBtn.offsetLeft}px`;
    }
}

function switchView(targetId) {
    navButtons.forEach(b => b.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    
    document.getElementById(targetId).classList.add('active');
    
    // Подсвечиваем кнопку в нижней панели, если она там есть
    const bottomBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
    if(bottomBtn) {
        bottomBtn.classList.add('active');
        updateNavIndicator(); // Двигаем полоску при клике
    }
}

navButtons.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.getAttribute('data-target')));
});

// Вызываем при загрузке страницы и при изменении размера экрана
window.addEventListener('DOMContentLoaded', updateNavIndicator);
window.addEventListener('resize', updateNavIndicator);

// КЛИК ПО ИКОНКЕ ПРОФИЛЯ СЛЕВА ВВЕРХУ (Требование 1)
document.getElementById('top-profile-btn').addEventListener('click', () => {
    tg.HapticFeedback.impactOccurred('light');
    switchView('view-profile');
});


// --- Темы и Анимация частиц (Требование 3) ---
const particlesContainer = document.getElementById('particles');

function createParticles(theme) {
    const particlesContainer = document.getElementById('particles');
    particlesContainer.innerHTML = ''; 
    if (theme === 'none' || theme === 'sun') return;

    const count = theme === 'rain' ? 40 : 25; 
    
    for (let i = 0; i < count; i++) {
        let p = document.createElement('div');
        p.className = theme === 'rain' ? 'raindrop' : 'snowflake';
        
        // Рандомная позиция по горизонтали
        p.style.left = Math.random() * 100 + 'vw';
        
        if (theme === 'rain') {
            // Дождь: падает быстро
            p.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's'; 
            p.style.animationDelay = (Math.random() * 2) + 's';
        } else {
            // Снег: падает медленно, снежинки разного размера
            const size = Math.random() * 2.5 + 1.5; 
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.animationDuration = (Math.random() * 4 + 6) + 's'; 
            p.style.animationDelay = (Math.random() * 5) + 's';
            p.style.opacity = Math.random() * 0.4 + 0.2; 
        }
        
        particlesContainer.appendChild(p);
    }
}

document.querySelectorAll('input[name="theme"]').forEach(option => {
    option.addEventListener('change', (e) => {
        const theme = e.target.value;

        document.body.className = '';
        document.body.classList.remove('light-bg');

        if (theme === 'custom') {
            document.body.classList.add('theme-custom');
            document.body.style.setProperty('--custom-bg', `url('${BACKGROUND_URLS.custom}')`);
            createParticles('none');
        } else if (theme === 'rain') {
            document.body.classList.add('theme-rain', 'light-bg');
            document.body.style.setProperty('--rain-bg', `url('${BACKGROUND_URLS.rain}')`);
            createParticles('rain');
        } else if (theme === 'snow') {
            document.body.classList.add('theme-snow', 'light-bg');
            document.body.style.setProperty('--snow-bg', `url('${BACKGROUND_URLS.snow}')`);
            createParticles('snow');
        } else if (theme === 'sun') {
            document.body.classList.add('theme-sun', 'light-bg');
            document.body.style.setProperty('--sun-bg', `url('${BACKGROUND_URLS.sun}')`);
            createParticles('none');
        } else {
            document.body.classList.add(`theme-${theme}`);
            createParticles(theme);
        }

        localStorage.setItem('selected-theme', theme);
    });
});

// Загружаем сохранённую тему при загрузке страницы
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('selected-theme') || 'custom';
    const themeInput = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
    if (themeInput) {
        themeInput.checked = true;
        themeInput.dispatchEvent(new Event('change'));
    } else {
        document.body.classList.add('theme-custom');
        document.body.style.setProperty('--custom-bg', `url('${BACKGROUND_URLS.custom}')`);
    }
}

// Скачивание с анимацией
window.downloadCheat = function(id) {
    tg.HapticFeedback.impactOccurred('light');
    
    // Показываем анимацию загрузки
    const loader = document.getElementById('loading-overlay');
    loader.classList.add('active');
    
    // Имитируем задержку для красоты анимации (например, 2 секунды)
    setTimeout(() => {
        const link = `https://t.me/${botUsername}?start=dl_${id}`;
        tg.openTelegramLink(link);
        
        // Скрываем загрузку через некоторое время
        setTimeout(() => {
            loader.classList.remove('active');
        }, 500);
    }, 1500);
};

// Админ: Смена файла
window.editCheatFile = function(id) {
    tg.HapticFeedback.impactOccurred('medium');
    // Открываем бот с командой edit_ через deep link
    const editUrl = `https://t.me/${botUsername}?start=edit_${id}`;
    tg.openTelegramLink(editUrl);
};

// --- Фильтр ---
document.getElementById('filter-toggle').addEventListener('click', () => {
    const cont = document.getElementById('categories-container');
    cont.style.display = (cont.style.display === 'none' || cont.style.display === '') ? 'flex' : 'none';
});

// Логика переключения активного тега и фильтрации карточек
window.filterCards = function(selectedTag) {
    // 1. Меняем активную кнопку
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('glass');
        if (btn.innerText === selectedTag || (selectedTag === 'all' && btn.innerText === 'Все')) {
            btn.classList.add('active');
            btn.classList.remove('glass');
        }
    });

    // 2. Скрываем/показываем карточки
    document.querySelectorAll('.card').forEach(card => {
        if (selectedTag === 'all') {
            card.style.display = 'block';
        } else {
            const cardTags = card.getAttribute('data-tags').split(',');
            if (cardTags.includes(selectedTag)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}


// --- ДИНАМИЧЕСКАЯ ЗАГРУЗКА И ТЕГИ ---
async function fetchCheats() {
    const container = document.getElementById('cards-container');
    container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 20px;">Загрузка файлов...</div>
    `;
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/cheats?select=*&order=id.desc`, { headers: SB_HEADERS });
        const cheats = await res.json();
        
        const container = document.getElementById('cards-container');
        container.innerHTML = '';

        if (!Array.isArray(cheats) || cheats.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:gray;">База пуста. Добавьте файлы через бота.</div>';
            return;
        }

        let allUniqueTags = new Set();

        cheats.forEach(cheat => {
            modalDataStorage[cheat.id] = {
                functions: cheat.functions,
                details: cheat.details
            };

            const rawTags = cheat.tags.split(',').map(t => t.trim()).filter(t => t !== '');
            rawTags.forEach(t => allUniqueTags.add(t));
            
            const tagsHtml = rawTags.map(t => `<span class="tag glass">${t}</span>`).join('');
            const dataTagsAttr = rawTags.join(',');

            const card = document.createElement('div');
            card.className = 'card glass';
            card.setAttribute('data-tags', dataTagsAttr);
            card.innerHTML = `
                <div class="card-img-wrapper loading">
                    <img src="${cheat.image_url}" alt="Preview" class="card-img" 
                         onload="this.classList.add('loaded'); this.parentElement.classList.remove('loading')" 
                         onerror="this.src='https://i.imgur.com/3q1Z3aO.jpeg'; this.classList.add('loaded'); this.parentElement.classList.remove('loading')">
                </div>
                <div class="card-info">
                    <h2>${cheat.name}</h2>
                    <p class="desc">${cheat.desc}</p>
                    <div class="tags">${tagsHtml}</div>
                    
                    <div class="card-expand-toggle" onclick="toggleCard(this)">
                        <span class="toggle-icon">⌄</span> 
                        <span class="toggle-text">Подробнее</span>
                    </div>
                    
                    <div class="card-actions">
                        <button class="outline-btn" onclick="openModal('Функции', ${cheat.id}, 'functions')">Функции</button>
                        <button class="outline-btn" onclick="openModal('Подробнее', ${cheat.id}, 'details')">Подробнее</button>
                    </div>

                    <button class="download-btn" onclick="downloadCheat(${cheat.id})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Скачать
                    </button>
                    
                    <button class="subscribe-btn" onclick="toggleSubscription(${cheat.id}, '${cheat.name.replace(/'/g, "\\'")}')" id="sub-btn-${cheat.id}" data-subscribed="false">
                        🔔 Подписаться на обновления
                    </button>
                    
                    <div class="admin-actions" style="display: ${document.body.classList.contains('admin-mode') ? 'flex' : 'none'}; margin-top: 15px; gap: 10px;">
                        <button class="edit-btn" style="flex: 1; background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 10px; border-radius: 12px; font-size: 13px; cursor: pointer;" onclick="editCheatFile(${cheat.id})">Сменить файл</button>
                        <button class="delete-btn" style="flex: 1; background: rgba(255,0,0,0.1); color: #ff4444; border: 1px solid rgba(255,0,0,0.2); padding: 10px; border-radius: 12px; font-size: 13px; cursor: pointer;" onclick="deleteCheat(${cheat.id})">Удалить пост</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Генерируем кнопки тегов
        const catContainer = document.getElementById('categories-container');
        catContainer.innerHTML = `<button class="cat-btn active" onclick="filterCards('all')">Все</button>`;

        allUniqueTags.forEach(tag => {
            catContainer.innerHTML += `<button class="cat-btn glass" onclick="filterCards('${tag}')">${tag}</button>`;
        });

        // Загружаем подписки пользователя и обновляем кнопки
        loadUserSubscriptions();

    } catch (e) {
        console.error(e);
        document.getElementById('cards-container').innerHTML = '<div style="text-align:center; color:red;">Ошибка загрузки</div>';
    }
}

async function loadUserSubscriptions() {
    const currentUser = window.Telegram.WebApp.initDataUnsafe?.user;
    if (!currentUser || !currentUser.id) return;

    const userId = String(currentUser.id);

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${userId}&select=cheat_id`, { headers: SB_HEADERS });
        const subs = await res.json();

        if (Array.isArray(subs)) {
            subs.forEach(sub => {
                const btn = document.getElementById(`sub-btn-${sub.cheat_id}`);
                if (btn) {
                    const card = btn.closest('.card');
                    const cheatName = card ? card.querySelector('h2')?.textContent || 'чита' : 'чита';
                    btn.dataset.subscribed = 'true';
                    btn.textContent = 'Отписаться от ' + cheatName;
                    btn.style.background = 'rgba(255, 82, 82, 0.15)';
                    btn.style.borderColor = 'rgba(255, 82, 82, 0.3)';
                }
            });
        }
    } catch (e) {
        console.error('Ошибка загрузки подписок:', e);
    }
}

// Логика карточки (свернуть/развернуть)
window.toggleCard = function(element) {
    const actions = element.nextElementSibling;
    const isFlex = actions.style.display === 'flex';
    actions.style.display = isFlex ? 'none' : 'flex';
    element.querySelector('.toggle-text').innerText = isFlex ? 'Подробнее' : 'Свернуть';
    element.querySelector('.toggle-icon').innerText = isFlex ? '⌄' : '⌃';
};

// Модалки
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

window.openModal = function(title, id, type) {
    modalTitle.innerText = title;
    modalBody.innerHTML = `<p>${modalDataStorage[id][type]}</p>`;
    modalOverlay.classList.add('active');
};

const closeModal = () => modalOverlay.classList.remove('active');
document.querySelectorAll('.modal-close-icon, .modal-close-btn').forEach(b => b.addEventListener('click', closeModal));
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

window.deleteCheat = async function(id) {
    tg.HapticFeedback.impactOccurred('warning');
    try {
        const confirmed = await new Promise((resolve) => {
            tg.showConfirm('Точно удалить этот чит?', (result) => resolve(result));
        });
        if (confirmed) {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/cheats?id=eq.${id}`, {
                method: 'DELETE',
                headers: SB_HEADERS
            });
            if (res.ok) {
                tg.HapticFeedback.notificationOccurred('success');
                fetchCheats();
            } else {
                tg.showAlert('Ошибка при удалении');
            }
        }
    } catch (err) {
        console.error('Ошибка удаления:', err);
        tg.showAlert('Ошибка при удалении');
    }
};

window.toggleSubscription = async function(id, name) {
    tg.HapticFeedback.impactOccurred('light');
    const btn = document.getElementById(`sub-btn-${id}`);
    if (btn) {
        btn.textContent = '⏳ Ожидание...';
        btn.disabled = true;
    }
    tg.openTelegramLink(`https://t.me/${botUsername}?start=sub_${id}`);
    setTimeout(async () => {
        const currentUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (currentUser && currentUser.id) {
            const userId = String(currentUser.id);
            try {
                const res = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?cheat_id=eq.${id}&user_id=eq.${userId}&select=cheat_id`, { headers: SB_HEADERS });
                const data = await res.json();
                const isSubscribed = Array.isArray(data) && data.length > 0;
                if (btn) {
                    btn.dataset.subscribed = isSubscribed ? 'true' : 'false';
                    if (isSubscribed) {
                        btn.textContent = 'Отписаться от ' + name;
                        btn.style.background = 'rgba(255, 82, 82, 0.15)';
                        btn.style.borderColor = 'rgba(255, 82, 82, 0.3)';
                    } else {
                        btn.textContent = '🔔 Подписаться на обновления';
                        btn.style.background = '';
                        btn.style.borderColor = '';
                    }
                    btn.disabled = false;
                }
            } catch (e) {
                console.error('Ошибка проверки подписки:', e);
                if (btn) {
                    btn.textContent = '🔔 Подписаться на обновления';
                    btn.disabled = false;
                }
            }
        } else if (btn) {
            btn.textContent = '🔔 Подписаться на обновления';
            btn.disabled = false;
        }
    }, 1500);
};

// Поиск (локальный по названиям читов)
document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
        const title = card.querySelector('h2').innerText.toLowerCase();
        card.style.display = title.includes(query) ? 'block' : 'none';
    });
});

tg.ready();
loadSavedTheme(); // Загружаем сохранённую тему
fetchCheats();
createParticles('rain');