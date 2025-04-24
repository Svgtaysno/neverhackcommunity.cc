const translations = {
    en: {
        "title": "NEVERHACK - Cheats for CS2 and CS:GO",
        "general": "General",
        "forum": "Forum",
        "market": "Market",
        "help": "Help",
        "rules": "Rules",
        "profile": "Profile",
        "settings": "Settings",
        "logout": "Logout",
        "registerBtn": "Register",
        "loginBtn": "Login",
        "username": "Username:",
        "password": "Password:",
        "email": "Email:",
        "close": "Close",
        "saveSuccess": "Success",
        "saveMessage": "Changes saved",
        "saveChanges": "Save",
        "changePhoto": "Change photo",
        "subscriptions": "Subscriptions",
        "renew": "Renew",
        "regTitle": "REGISTER",
        "loginTitle": "LOGIN",
        "supported": "SUPPORTED",
        "uniqueVisitors": "Unique visitors"
    },
    ru: {
        "title": "NEVERHACK - Читы для CS2 и CS:GO",
        "general": "Главная",
        "forum": "Форум",
        "market": "Маркет",
        "help": "Помощь",
        "rules": "Правила",
        "profile": "Профиль",
        "settings": "Настройки",
        "logout": "Выйти",
        "registerBtn": "Регистрация",
        "loginBtn": "Войти",
        "username": "Имя пользователя:",
        "password": "Пароль:",
        "email": "Email:",
        "close": "Закрыть",
        "saveSuccess": "Успешно",
        "saveMessage": "Изменения сохранены",
        "saveChanges": "Сохранить",
        "changePhoto": "Сменить фото",
        "subscriptions": "Подписки",
        "renew": "Продлить",
        "regTitle": "РЕГИСТРАЦИЯ",
        "loginTitle": "ВХОД",
        "supported": "ПОДДЕРЖИВАЕТСЯ",
        "uniqueVisitors": "Уникальных посетителей"
    }
};

async function getVisitorIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        'unknown-' + Math.random().toString(36).substr(2, 9)
    }
}

async function updateUniqueVisitors() {
    const currentIP = await getVisitorIP();
    
    const storedIPs = JSON.parse(localStorage.getItem('uniqueVisitorsIPs') || '[]');
    
    if (!storedIPs.includes(currentIP)) {
        storedIPs.push(currentIP);
        localStorage.setItem('uniqueVisitorsIPs', JSON.stringify(storedIPs));

        const countElement = document.getElementById('unique-visitors-count');
        if (countElement) {
            countElement.textContent = storedIPs.length;
        }
    }
    
    const countElement = document.getElementById('unique-visitors-count');
    if (countElement) {
        countElement.textContent = storedIPs.length;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateUniqueVisitors();
    let currentLanguage = localStorage.getItem('language') || 'ru';
    document.getElementById('language-select').value = currentLanguage;
    

    function translatePage(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        document.title = translations[lang]['title'];
    }
    
    document.getElementById('language-select').addEventListener('change', function() {
        currentLanguage = this.value;
        localStorage.setItem('language', currentLanguage);
        translatePage(currentLanguage);
    });

    translatePage(currentLanguage);

    const dialogs = {
        reg: document.getElementById('dialog-reg'),
        login: document.getElementById('dialog-login'),
        subs: document.getElementById('subscriptions-dialog'),
        profile: document.getElementById('profile-settings')
    };
    
    const buttons = {
        reg: document.querySelector('.registerbutton'),
        login: document.querySelector('.loginbutton'),
        closeReg: document.getElementById('close-reg'),
        closeLogin: document.getElementById('close-login'),
        closeSubs: document.getElementById('close-subs'),
        closeProfile: document.getElementById('close-profile')
    };
    
    buttons.reg.addEventListener('click', () => dialogs.reg.showModal());
    buttons.login.addEventListener('click', () => dialogs.login.showModal());
    buttons.closeReg.addEventListener('click', () => dialogs.reg.close());
    buttons.closeLogin.addEventListener('click', () => dialogs.login.close());
    buttons.closeSubs.addEventListener('click', () => dialogs.subs.close());
    buttons.closeProfile.addEventListener('click', () => dialogs.profile.close());
   
    const profileContainer = document.getElementById('profile-container');
    const profilePic = document.getElementById('profile-pic');
    const profileDropdown = document.getElementById('profile-dropdown');

    function showProfile() {
        document.querySelector('.auth-buttons').style.display = 'none';
        profileContainer.style.display = 'block';
    }

    function showProfile(userData = null) {
        if (userData) {
            document.getElementById('profile-username').value = userData.username;
            document.getElementById('profile-email').value = userData.email;
            document.querySelector('.profile-pic').alt = userData.username;
        }
        document.querySelector('.auth-buttons').style.display = 'none';
        document.getElementById('profile-container').style.display = 'block';
    }

    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const email = document.getElementById('reg-email').value;
        
        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, email }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showToast(translations[currentLanguage]['saveSuccess'], 'Account created!');
                dialogs.reg.close();
                showProfile(data);
            } else {
                showToast('Error', data.error || 'Registration failed');
            }
        } catch (error) {
            showToast('Error', 'Failed to connect to server');
        }
    });

    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showToast(translations[currentLanguage]['saveSuccess'], 'Logged in successfully');
                dialogs.login.close();
                
                localStorage.setItem('currentUserId', data.id);
                
                const userResponse = await fetch(`http://localhost:3000/api/user/${data.id}`);
                const userData = await userResponse.json();
                
                showProfile(userData);
            } else {
                showToast('Error', data.error || 'Login failed');
            }
        } catch (error) {
            showToast('Error', 'Failed to connect to server');
        }
    });

    document.querySelector('.profile-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userId = localStorage.getItem('currentUserId');
        if (!userId) {
            showToast('Error', 'User not logged in');
            return;
        }
        
        const username = document.getElementById('profile-username').value;
        const email = document.getElementById('profile-email').value;
        const password = document.getElementById('profile-password').value || undefined;
        
        try {
            const response = await fetch(`http://localhost:3000/api/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showToast(translations[currentLanguage]['saveSuccess'], translations[currentLanguage]['saveMessage']);
                dialogs.profile.close();
                showProfile(data);
            } else {
                showToast('Error', data.error || 'Update failed');
            }
        } catch (error) {
            showToast('Error', 'Failed to connect to server');
        }
    });
    
    async function checkAuth() {
        const userId = localStorage.getItem('currentUserId');
        if (userId) {
            try {
                const response = await fetch(`http://localhost:3000/api/user/${userId}`);
                if (response.ok) {
                    const userData = await response.json();
                    showProfile(userData);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        }
    }
    
    profilePic.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
    });
    
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-i18n');
            
            if (action === 'settings') {
                dialogs.profile.showModal();
            } else if (action === 'subscriptions') {
                dialogs.subs.showModal();
            } else if (action === 'logout') {
                profileContainer.style.display = 'none';
                document.querySelector('.auth-buttons').style.display = 'flex';
            }
        });
    });
    
    document.getElementById('profile-upload').addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                profilePic.src = event.target.result;
                document.getElementById('profile-preview').src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    const toast = document.querySelector('.savesettings');
    const toastClose = toast.querySelector('.close');
    
    function showToast(title, message) {
        toast.querySelector('.text-1').textContent = title;
        toast.querySelector('.text-2').textContent = message;
        toast.classList.add('active');
        
        setTimeout(() => {
            toast.classList.remove('active');
        }, 5000);
    }
    
    toastClose.addEventListener('click', () => {
        toast.classList.remove('active');
    });
    
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        showToast(translations[currentLanguage]['saveSuccess'], 'Account created!');
        dialogs.reg.close();
        showProfile();
    });
    
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        showToast(translations[currentLanguage]['saveSuccess'], 'Logged in successfully');
        dialogs.login.close();
        showProfile();
    });
    
    document.querySelector('.profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        showToast(translations[currentLanguage]['saveSuccess'], translations[currentLanguage]['saveMessage']);
        dialogs.profile.close();
    });
    
    document.querySelectorAll('.renew-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showToast(translations[currentLanguage]['saveSuccess'], 'Subscription renewed');
        });
    });
    
    checkAuth()
});