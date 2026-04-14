const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#080808');

const SUPABASE_URL = "https://epayzwjglacworkdbkmh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYXl6d2pnbGFjd29ya2Ria21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTA0NjIsImV4cCI6MjA5MDA4NjQ2Mn0.22nlKvyVL_4nuECtFtiP3TZ3suBeFNWxMQhkvxKfmmo";
const SB_HEADERS = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Accept-Profile": "public"
};

const botUsername = "Demons_moderation_bot";
let modalDataStorage = {};

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
        
        // Сбрасываем старые классы и фон
        document.body.className = ''; 
        document.body.style.removeProperty('--gif-bg'); 
        document.body.style.removeProperty('--custom-bg');
        
        // Проверяем, выбрал ли пользователь GIF-тему или кастомную
        if (theme.endsWith('.gif')) {
            document.body.classList.add('theme-gif');
            document.body.style.setProperty('--gif-bg', `url('${theme}')`);
            createParticles('none');
        } else if (theme === 'custom') {
            document.body.classList.add('theme-custom');
            // Путь к картинке на гитхабе/cloudflare (можно заменить на реальный)
            const bgUrl = 'https://i.ibb.co/7x9qnMJH/upscalemedia-transformed.jpg'; 
            document.body.style.setProperty('--custom-bg', `url('${bgUrl}')`);
            createParticles('none');
        } else {
            // Если это обычная тема (дождь, снег, солнце)
            if (theme !== 'none') document.body.classList.add(`theme-${theme}`);
            createParticles(theme);
        }
    });
});

// --- Скачивание с анимацией ---
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
                <div class="card-img-wrapper">
                    <img src="${cheat.image_url}" alt="Preview" class="card-img" onerror="this.src='https://i.imgur.com/3q1Z3aO.jpeg'">
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
                    
                    <button class="delete-btn" style="margin-top: 15px; background: rgba(255,0,0,0.1); color: #ff4444; border: none; padding: 10px; border-radius: 10px; width: 100%; font-size: 13px; display: none;" onclick="deleteCheat(${cheat.id})">Удалить пост (Админ)</button>
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

    } catch (e) {
        console.error(e);
        document.getElementById('cards-container').innerHTML = '<div style="text-align:center; color:red;">Ошибка загрузки</div>';
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
    tg.showConfirm('Точно удалить этот чит?', async (confirmed) => {
        if (confirmed) {
            await fetch(`${SUPABASE_URL}/rest/v1/cheats?id=eq.${id}`, {
                method: 'DELETE',
                headers: SB_HEADERS
            });
            fetchCheats();
        }
    });
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
fetchCheats();
// Запускаем дождь по умолчанию
document.body.classList.add('theme-rain');
createParticles('rain');