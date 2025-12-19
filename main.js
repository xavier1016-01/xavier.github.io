/**
 * 传讯聊天应用 - 主要JavaScript文件
 * 提供核心应用功能
 */

// 全局命名空间
window.ChuanxunApp = window.ChuanxunApp || {};

// 应用核心模块
window.ChuanxunApp.Core = (function() {
    'use strict';

    // 应用配置
    const config = {
        APP_NAME: '传讯',
        VERSION: '2.0.0',
        SESSION_KEY: 'chuanxun_session',
        HISTORY_BATCH_SIZE: 50,
        MAX_MESSAGE_LENGTH: 2000,
        MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
        ANIMATION_DURATION: 300,
        NOTIFICATION_DURATION: 3000
    };

    // 应用状态
    let state = {
        initialized: false,
        currentTheme: 'light',
        currentColorTheme: 'gold',
        messages: [],
        displayedMessageCount: config.HISTORY_BATCH_SIZE,
        isLoadingHistory: false,
        settings: {},
        partner: {
            name: '聊天对象',
            avatar: null,
            status: '在线'
        },
        user: {
            name: '我',
            avatar: null,
            status: '在线'
        }
    };

    // DOM元素缓存
    let elements = {};

    /**
     * 初始化应用
     */
    function init() {
        try {
            console.log(`${config.APP_NAME} v${config.VERSION} 启动中...`);
            
            // 初始化DOM元素
            initializeElements();
            
            // 初始化存储
            initializeStorage();
            
            // 加载用户数据
            loadUserData();
            
            // 绑定事件
            bindEvents();
            
            // 初始化UI
            initializeUI();
            
            // 启动欢迎动画
            startWelcomeAnimation();
            
            // 标记为已初始化
            state.initialized = true;
            
            console.log(`${config.APP_NAME} 初始化完成`);
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化DOM元素缓存
     */
    function initializeElements() {
        elements = {
            // 应用容器
            app: document.getElementById('app'),
            welcomePage: document.getElementById('welcome-page'),
            mainApp: document.getElementById('main-app'),
            
            // 头部元素
            menuBtn: document.getElementById('menu-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            moreBtn: document.getElementById('more-btn'),
            partnerName: document.getElementById('partner-name'),
            partnerStatus: document.getElementById('partner-status'),
            partnerAvatar: document.getElementById('partner-avatar'),
            
            // 聊天区域
            chatContainer: document.getElementById('chat-container'),
            chatMessages: document.getElementById('chat-messages'),
            historyLoader: document.getElementById('history-loader'),
            typingIndicator: document.getElementById('typing-indicator'),
            
            // 输入区域
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            emojiBtn: document.getElementById('emoji-btn'),
            imageBtn: document.getElementById('image-btn'),
            voiceBtn: document.getElementById('voice-btn'),
            moreToolsBtn: document.getElementById('more-tools-btn'),
            
            // 面板
            settingsPanel: document.getElementById('settings-panel'),
            menuPanel: document.getElementById('menu-panel'),
            modalContainer: document.getElementById('modal-container'),
            
            // 用户信息
            myName: document.getElementById('my-name'),
            myStatus: document.getElementById('my-status'),
            myAvatar: document.getElementById('my-avatar'),
            
            // 加载条
            loaderBar: document.getElementById('loader-tech-bar'),
            
            // 关闭按钮
            closeSettings: document.getElementById('close-settings')
        };
    }

    /**
     * 初始化存储
     */
    function initializeStorage() {
        // 初始化sessionStorage
        if (!sessionStorage.getItem(config.SESSION_KEY)) {
            sessionStorage.setItem(config.SESSION_KEY, generateSessionId());
        }
    }

    /**
     * 生成会话ID
     */
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 加载用户数据
     */
    function loadUserData() {
        try {
            // 加载设置
            const savedSettings = ChuanxunApp.Storage.get('settings');
            if (savedSettings) {
                state.settings = { ...getDefaultSettings(), ...JSON.parse(savedSettings) };
            } else {
                state.settings = getDefaultSettings();
            }

            // 加载主题
            state.currentTheme = state.settings.isDarkMode ? 'dark' : 'light';
            state.currentColorTheme = state.settings.colorTheme || 'gold';
            
            // 应用主题
            applyTheme(state.currentTheme, state.currentColorTheme);

            // 加载消息
            const savedMessages = ChuanxunApp.Storage.get('messages');
            if (savedMessages) {
                state.messages = JSON.parse(savedMessages).map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            }

            // 加载用户信息
            const savedPartner = ChuanxunApp.Storage.get('partner');
            if (savedPartner) {
                state.partner = { ...state.partner, ...JSON.parse(savedPartner) };
            }

            const savedUser = ChuanxunApp.Storage.get('user');
            if (savedUser) {
                state.user = { ...state.user, ...JSON.parse(savedUser) };
            }

        } catch (error) {
            console.error('加载用户数据失败:', error);
            // 使用默认值
            state.settings = getDefaultSettings();
        }
    }

    /**
     * 获取默认设置
     */
    function getDefaultSettings() {
        return {
            isDarkMode: false,
            colorTheme: 'gold',
            bubbleStyle: 'standard',
            fontFamily: 'default',
            messageSound: true,
            notificationSound: true,
            vibrationFeedback: true,
            autoSave: true,
            showTimestamp: true,
            showTypingIndicator: true
        };
    }

    /**
     * 应用主题
     */
    function applyTheme(theme, colorTheme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-color-theme', colorTheme);
        state.currentTheme = theme;
        state.currentColorTheme = colorTheme;
    }

    /**
     * 绑定事件监听器
     */
    function bindEvents() {
        // 消息发送
        if (elements.sendBtn) {
            elements.sendBtn.addEventListener('click', sendMessage);
        }

        if (elements.messageInput) {
            elements.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // 自动调整输入框高度
            elements.messageInput.addEventListener('input', autoResizeTextarea);
        }

        // 头部按钮
        if (elements.menuBtn) {
            elements.menuBtn.addEventListener('click', toggleMenu);
        }

        if (elements.settingsBtn) {
            elements.settingsBtn.addEventListener('click', toggleSettings);
        }

        // 面板关闭
        if (elements.closeSettings) {
            elements.closeSettings.addEventListener('click', closeAllPanels);
        }

        // 聊天滚动监听
        if (elements.chatContainer) {
            elements.chatContainer.addEventListener('scroll', handleScroll);
        }

        // 工具栏按钮
        if (elements.emojiBtn) {
            elements.emojiBtn.addEventListener('click', showEmojiPicker);
        }

        if (elements.imageBtn) {
            elements.imageBtn.addEventListener('click', showImageUpload);
        }

        // 键盘快捷键
        document.addEventListener('keydown', handleKeyboardShortcuts);

        // 窗口大小改变
        window.addEventListener('resize', handleResize);

        // 在线状态监听
        window.addEventListener('online', () => {
            showNotification('网络连接已恢复', 'success');
        });

        window.addEventListener('offline', () => {
            showNotification('网络连接已断开', 'warning');
        });
    }

    /**
     * 发送消息
     */
    function sendMessage() {
        const input = elements.messageInput;
        const messageText = input.value.trim();

        if (!messageText) return;

        // 创建消息对象
        const message = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: messageText,
            timestamp: new Date(),
            type: 'sent',
            status: 'sent'
        };

        // 添加到消息列表
        state.messages.push(message);

        // 清空输入框
        input.value = '';
        autoResizeTextarea();

        // 更新UI
        renderMessage(message);
        saveMessages();
        scrollToBottom();

        // 播放音效
        if (state.settings.messageSound) {
            playMessageSound();
        }

        // 模拟对方回复
        if (Math.random() > 0.7) {
            setTimeout(() => simulateReply(), 1000 + Math.random() * 2000);
        }
    }

    /**
     * 渲染消息
     */
    function renderMessage(message) {
        const messageElement = createMessageElement(message);
        elements.chatMessages.appendChild(messageElement);
        return messageElement;
    }

    /**
     * 创建消息元素
     */
    function createMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message ${message.type}`;
        div.setAttribute('data-message-id', message.id);

        // 头像
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        if (message.type === 'sent') {
            avatar.innerHTML = state.user.avatar ? 
                `<img src="${state.user.avatar}" alt="我">` : 
                '<i class="fas fa-user"></i>';
        } else {
            avatar.innerHTML = state.partner.avatar ? 
                `<img src="${state.partner.avatar}" alt="${state.partner.name}">` : 
                '<i class="fas fa-user"></i>';
        }

        // 消息内容
        const content = document.createElement('div');
        content.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = message.text;

        // 时间戳
        if (state.settings.showTimestamp) {
            const time = document.createElement('div');
            time.className = 'message-time';
            time.textContent = formatTime(message.timestamp);
            content.appendChild(time);
        }

        content.appendChild(bubble);
        div.appendChild(avatar);
        div.appendChild(content);

        return div;
    }

    /**
     * 格式化时间
     */
    function formatTime(date) {
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return Math.floor(diff / 60000) + '分钟前';
        } else if (diff < 86400000) { // 24小时内
            return Math.floor(diff / 3600000) + '小时前';
        } else {
            return date.toLocaleDateString('zh-CN') + ' ' + 
                   date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        }
    }

    /**
     * 自动调整文本框高度
     */
    function autoResizeTextarea() {
        const textarea = elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    /**
     * 滚动到底部
     */
    function scrollToBottom() {
        elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
    }

    /**
     * 处理滚动事件
     */
    function handleScroll() {
        const container = elements.chatContainer;
        const scrollTop = container.scrollTop;

        // 检查是否需要加载历史消息
        if (scrollTop < 50 && 
            !state.isLoadingHistory && 
            state.messages.length > state.displayedMessageCount) {
            loadHistoryMessages();
        }
    }

    /**
     * 加载历史消息
     */
    function loadHistoryMessages() {
        state.isLoadingHistory = true;
        elements.historyLoader.classList.add('visible');

        // 模拟加载延迟
        setTimeout(() => {
            const newCount = Math.min(
                state.displayedMessageCount + config.HISTORY_BATCH_SIZE,
                state.messages.length
            );

            // 渲染新加载的消息
            for (let i = state.displayedMessageCount; i < newCount; i++) {
                const message = state.messages[i];
                const messageElement = createMessageElement(message);
                elements.chatMessages.insertBefore(messageElement, elements.chatMessages.firstChild);
            }

            state.displayedMessageCount = newCount;
            state.isLoadingHistory = false;
            elements.historyLoader.classList.remove('visible');

            // 滚动到新加载消息的位置
            const firstMessage = elements.chatMessages.firstChild;
            if (firstMessage) {
                firstMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 800);
    }

    /**
     * 模拟对方回复
     */
    function simulateReply() {
        const replies = [
            '好的，我知道了！',
            '这个想法很不错',
            '让我想想...',
            '同意你的观点',
            '哈哈哈，有趣！',
            '👍 很棒！',
            '我也是这么想的',
            '谢谢分享！'
        ];

        const replyText = replies[Math.floor(Math.random() * replies.length)];
        
        // 显示打字指示器
        if (state.settings.showTypingIndicator) {
            showTypingIndicator();
        }

        setTimeout(() => {
            hideTypingIndicator();

            const message = {
                id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                text: replyText,
                timestamp: new Date(),
                type: 'received',
                status: 'delivered'
            };

            state.messages.push(message);
            renderMessage(message);
            saveMessages();
            scrollToBottom();

            if (state.settings.messageSound) {
                playMessageSound();
            }
        }, 1000 + Math.random() * 2000);
    }

    /**
     * 显示打字指示器
     */
    function showTypingIndicator() {
        elements.typingIndicator.style.display = 'flex';
        scrollToBottom();
    }

    /**
     * 隐藏打字指示器
     */
    function hideTypingIndicator() {
        elements.typingIndicator.style.display = 'none';
    }

    /**
     * 切换菜单
     */
    function toggleMenu() {
        closeAllPanels();
        elements.menuPanel.classList.toggle('show');
    }

    /**
     * 切换设置
     */
    function toggleSettings() {
        closeAllPanels();
        elements.settingsPanel.classList.toggle('show');
        if (elements.settingsPanel.classList.contains('show')) {
            renderSettings();
        }
    }

    /**
     * 关闭所有面板
     */
    function closeAllPanels() {
        elements.settingsPanel.classList.remove('show');
        elements.menuPanel.classList.remove('show');
    }

    /**
     * 显示表情选择器
     */
    function showEmojiPicker() {
        ChuanxunApp.Modal.show('emoji-picker', {
            onSelect: (emoji) => {
                elements.messageInput.value += emoji;
                elements.messageInput.focus();
            }
        });
    }

    /**
     * 显示图片上传
     */
    function showImageUpload() {
        ChuanxunApp.Modal.show('image-upload', {
            onUpload: (imageData) => {
                const message = {
                    id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    image: imageData,
                    timestamp: new Date(),
                    type: 'sent',
                    status: 'sent'
                };

                state.messages.push(message);
                renderMessage(message);
                saveMessages();
                scrollToBottom();
            }
        });
    }

    /**
     * 处理键盘快捷键
     */
    function handleKeyboardShortcuts(e) {
        // ESC关闭面板
        if (e.key === 'Escape') {
            closeAllPanels();
        }

        // Ctrl+K 清空输入框
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            elements.messageInput.value = '';
            elements.messageInput.focus();
        }

        // Ctrl+/ 聚焦到输入框
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            elements.messageInput.focus();
        }
    }

    /**
     * 处理窗口大小改变
     */
    function handleResize() {
        // 重新调整输入框高度
        autoResizeTextarea();
        
        // 确保聊天区域高度正确
        if (elements.chatContainer) {
            elements.chatContainer.style.height = 'auto';
        }
    }

    /**
     * 播放消息音效
     */
    function playMessageSound() {
        // 创建简单的音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    /**
     * 显示通知
     */
    function showNotification(message, type = 'info', duration = config.NOTIFICATION_DURATION) {
        if (!ChuanxunApp.UI) return;

        ChuanxunApp.UI.showNotification(message, type, duration);
    }

    /**
     * 保存消息
     */
    function saveMessages() {
        if (state.settings.autoSave) {
            ChuanxunApp.Storage.set('messages', JSON.stringify(state.messages));
        }
    }

    /**
     * 渲染设置面板
     */
    function renderSettings() {
        // 这里会在UI模块中实现
        if (ChuanxunApp.Settings) {
            ChuanxunApp.Settings.render(state.settings);
        }
    }

    /**
     * 启动欢迎动画
     */
    function startWelcomeAnimation() {
        const loaderBar = elements.loaderBar;
        if (!loaderBar) return;

        loaderBar.style.width = '0%';
        setTimeout(() => loaderBar.style.width = '30%', 100);
        setTimeout(() => loaderBar.style.width = '55%', 800);
        setTimeout(() => loaderBar.style.width = '85%', 1800);
        setTimeout(() => {
            loaderBar.style.width = '100%';
            setTimeout(() => {
                showMainApp();
            }, 300);
        }, 2600);
    }

    /**
     * 显示主应用界面
     */
    function showMainApp() {
        elements.welcomePage.style.display = 'none';
        elements.mainApp.style.display = 'flex';
        
        // 渲染历史消息
        renderInitialMessages();
        
        // 更新用户信息
        updateUserInfo();
        
        // 滚动到底部
        scrollToBottom();
    }

    /**
     * 渲染初始消息
     */
    function renderInitialMessages() {
        const messagesToRender = state.messages.slice(-state.displayedMessageCount);
        messagesToRender.forEach(message => {
            renderMessage(message);
        });
    }

    /**
     * 更新用户信息
     */
    function updateUserInfo() {
        // 更新伙伴信息
        if (elements.partnerName) {
            elements.partnerName.textContent = state.partner.name;
        }
        if (elements.partnerStatus) {
            elements.partnerStatus.textContent = state.partner.status;
        }
        if (elements.partnerAvatar && state.partner.avatar) {
            elements.partnerAvatar.innerHTML = `<img src="${state.partner.avatar}" alt="${state.partner.name}">`;
        }

        // 更新用户信息
        if (elements.myName) {
            elements.myName.textContent = state.user.name;
        }
        if (elements.myStatus) {
            elements.myStatus.textContent = state.user.status;
        }
        if (elements.myAvatar && state.user.avatar) {
            elements.myAvatar.innerHTML = `<img src="${state.user.avatar}" alt="${state.user.name}">`;
        }
    }

    // 公开API
    return {
        init,
        config,
        state,
        elements,
        sendMessage,
        showNotification,
        applyTheme,
        saveMessages,
        closeAllPanels
    };
})();

// 应用初始化函数
window.ChuanxunApp.init = function() {
    return window.ChuanxunApp.Core.init();
};