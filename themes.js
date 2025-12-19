/**
 * 传讯聊天应用 - 主题模块
 * 处理主题切换和自定义样式
 */

window.ChuanxunApp = window.ChuanxunApp || {};

window.ChuanxunApp.Themes = (function() {
    'use strict';

    // 预定义主题
    const themes = {
        light: {
            name: '浅色模式',
            icon: 'fas fa-sun',
            css: {
                '--primary-bg': '#f9f9f9',
                '--secondary-bg': '#ffffff',
                '--text-primary': '#1a1a1a',
                '--text-secondary': '#7a7a7a',
                '--border-color': '#ebebeb',
                '--primary-bg-rgb': '249, 249, 249',
                '--secondary-bg-rgb': '255, 255, 255'
            }
        },
        dark: {
            name: '深色模式',
            icon: 'fas fa-moon',
            css: {
                '--primary-bg': '#121212',
                '--secondary-bg': '#1e1e1e',
                '--text-primary': '#ffffff',
                '--text-secondary': '#b0b0b0',
                '--border-color': '#333333',
                '--primary-bg-rgb': '18, 18, 18',
                '--secondary-bg-rgb': '30, 30, 30'
            }
        }
    };

    // 颜色主题
    const colorThemes = {
        gold: {
            name: '金色',
            icon: 'fas fa-crown',
            colors: ['#c5a47e', '#d4af37', '#1976d2']
        },
        blue: {
            name: '蓝色',
            icon: 'fas fa-water',
            colors: ['#7FA6CD', '#7FA6CD', '#1976d2']
        },
        purple: {
            name: '紫色',
            icon: 'fas fa-sparkles',
            colors: ['#BB9EC7', '#BB9EC7', '#7b1fa2']
        },
        green: {
            name: '绿色',
            icon: 'fas fa-leaf',
            colors: ['#7BC8A4', '#7BC8A4', '#388e3c']
        },
        pink: {
            name: '粉色',
            icon: 'fas fa-heart',
            colors: ['#F4A6B3', '#F4A6B3', '#e91e63']
        },
        'black-white': {
            name: '黑白',
            icon: 'fas fa-adjust',
            colors: ['#333333', '#D6D6D6', '#424242']
        },
        pastel: {
            name: '马卡龙',
            icon: 'fas fa-palette',
            colors: ['#A8D8EA', '#AA96DA', '#81c784']
        },
        sunset: {
            name: '日落',
            icon: 'fas fa-cloud-sun',
            colors: ['#FF9A8B', '#FF6B6B', '#ff5722']
        },
        forest: {
            name: '森林',
            icon: 'fas fa-tree',
            colors: ['#7BA05B', '#556B2F', '#2e7d32']
        },
        ocean: {
            name: '海洋',
            icon: 'fas fa-waves',
            colors: ['#4A90E2', '#2E5B9A', '#0277bd']
        }
    };

    // 气泡样式
    const bubbleStyles = {
        standard: {
            name: '标准',
            className: 'bubble-standard'
        },
        modern: {
            name: '现代',
            className: 'bubble-modern',
            css: {
                '--radius': '20px',
                '--message-font-weight': '500'
            }
        },
        rounded: {
            name: '圆润',
            className: 'bubble-rounded',
            css: {
                '--radius': '25px',
                '--message-font-weight': '400'
            }
        },
        sharp: {
            name: '锐利',
            className: 'bubble-sharp',
            css: {
                '--radius': '8px',
                '--message-font-weight': '600'
            }
        }
    };

    // 当前主题状态
    let currentTheme = 'light';
    let currentColorTheme = 'gold';
    let currentBubbleStyle = 'standard';

    /**
     * 初始化主题系统
     */
    function init() {
        // 从存储加载主题设置
        const savedTheme = ChuanxunApp.Storage.get('theme') || 'light';
        const savedColorTheme = ChuanxunApp.Storage.get('colorTheme') || 'gold';
        const savedBubbleStyle = ChuanxunApp.Storage.get('bubbleStyle') || 'standard';

        setTheme(savedTheme);
        setColorTheme(savedColorTheme);
        setBubbleStyle(savedBubbleStyle);
    }

    /**
     * 设置主题
     */
    function setTheme(themeName) {
        if (!themes[themeName]) {
            console.error('主题不存在:', themeName);
            return false;
        }

        const theme = themes[themeName];
        
        // 应用CSS变量
        if (theme.css) {
            Object.entries(theme.css).forEach(([property, value]) => {
                document.documentElement.style.setProperty(property, value);
            });
        }

        // 设置data属性
        document.documentElement.setAttribute('data-theme', themeName);

        // 更新状态
        currentTheme = themeName;

        // 保存到存储
        ChuanxunApp.Storage.set('theme', themeName);

        return true;
    }

    /**
     * 设置颜色主题
     */
    function setColorTheme(colorThemeName) {
        if (!colorThemes[colorThemeName]) {
            console.error('颜色主题不存在:', colorThemeName);
            return false;
        }

        const colorTheme = colorThemes[colorThemeName];

        // 设置主色调
        document.documentElement.style.setProperty('--accent-color', colorTheme.colors[0]);
        document.documentElement.style.setProperty('--accent-color-dark', colorTheme.colors[1]);

        // 设置RGB值（用于透明度计算）
        const rgb = hexToRgb(colorTheme.colors[0]);
        if (rgb) {
            document.documentElement.style.setProperty('--accent-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }

        // 设置data属性
        document.documentElement.setAttribute('data-color-theme', colorThemeName);

        // 更新状态
        currentColorTheme = colorThemeName;

        // 保存到存储
        ChuanxunApp.Storage.set('colorTheme', colorThemeName);

        return true;
    }

    /**
     * 设置气泡样式
     */
    function setBubbleStyle(styleName) {
        if (!bubbleStyles[styleName]) {
            console.error('气泡样式不存在:', styleName);
            return false;
        }

        const style = bubbleStyles[styleName];

        // 移除旧的样式类
        document.body.classList.remove(...Object.values(bubbleStyles).map(s => s.className));

        // 添加新的样式类
        if (style.className) {
            document.body.classList.add(style.className);
        }

        // 应用CSS变量
        if (style.css) {
            Object.entries(style.css).forEach(([property, value]) => {
                document.documentElement.style.setProperty(property, value);
            });
        }

        // 设置data属性
        document.documentElement.setAttribute('data-bubble-style', styleName);

        // 更新状态
        currentBubbleStyle = styleName;

        // 保存到存储
        ChuanxunApp.Storage.set('bubbleStyle', styleName);

        return true;
    }

    /**
     * HEX转RGB
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * 切换明暗模式
     */
    function toggleDarkMode() {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        return setTheme(newTheme);
    }

    /**
     * 创建主题选择器
     */
    function createThemeSelector() {
        const container = document.createElement('div');
        container.className = 'theme-selector';

        // 明暗模式选择
        const themeSection = document.createElement('div');
        themeSection.className = 'theme-section';
        themeSection.innerHTML = '<h4>主题模式</h4>';

        const themeButtons = document.createElement('div');
        themeButtons.className = 'theme-buttons';

        Object.entries(themes).forEach(([key, theme]) => {
            const button = document.createElement('button');
            button.className = `theme-btn ${currentTheme === key ? 'active' : ''}`;
            button.innerHTML = `<i class="${theme.icon}"></i> ${theme.name}`;
            button.addEventListener('click', () => {
                setTheme(key);
                updateThemeButtons();
                ChuanxunApp.UI.showNotification(`已切换到${theme.name}`, 'success');
            });

            themeButtons.appendChild(button);
        });

        themeSection.appendChild(themeButtons);
        container.appendChild(themeSection);

        // 颜色主题选择
        const colorSection = document.createElement('div');
        colorSection.className = 'theme-section';
        colorSection.innerHTML = '<h4>主题颜色</h4>';

        const colorButtons = document.createElement('div');
        colorButtons.className = 'color-buttons';

        Object.entries(colorThemes).forEach(([key, colorTheme]) => {
            const button = document.createElement('button');
            button.className = `color-btn ${currentColorTheme === key ? 'active' : ''}`;
            button.innerHTML = `
                <span class="color-preview" style="background: ${colorTheme.colors[0]}"></span>
                <span class="color-name">${colorTheme.name}</span>
            `;
            button.addEventListener('click', () => {
                setColorTheme(key);
                updateColorButtons();
                ChuanxunApp.UI.showNotification(`颜色主题已切换到${colorTheme.name}`, 'success');
            });

            colorButtons.appendChild(button);
        });

        colorSection.appendChild(colorButtons);
        container.appendChild(colorSection);

        // 气泡样式选择
        const bubbleSection = document.createElement('div');
        bubbleSection.className = 'theme-section';
        bubbleSection.innerHTML = '<h4>气泡样式</h4>';

        const bubbleButtons = document.createElement('div');
        bubbleButtons.className = 'bubble-buttons';

        Object.entries(bubbleStyles).forEach(([key, style]) => {
            const button = document.createElement('button');
            button.className = `bubble-btn ${currentBubbleStyle === key ? 'active' : ''}`;
            button.textContent = style.name;
            button.addEventListener('click', () => {
                setBubbleStyle(key);
                updateBubbleButtons();
                ChuanxunApp.UI.showNotification(`气泡样式已切换到${style.name}`, 'success');
            });

            bubbleButtons.appendChild(button);
        });

        bubbleSection.appendChild(bubbleButtons);
        container.appendChild(bubbleSection);

        // 更新函数
        function updateThemeButtons() {
            themeButtons.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            themeButtons.querySelector(`.theme-btn:has(.${themes[currentTheme].icon})`).classList.add('active');
        }

        function updateColorButtons() {
            colorButtons.querySelectorAll('.color-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeBtn = Array.from(colorButtons.children).find(btn => 
                btn.querySelector('.color-name').textContent === colorThemes[currentColorTheme].name
            );
            if (activeBtn) activeBtn.classList.add('active');
        }

        function updateBubbleButtons() {
            bubbleButtons.querySelectorAll('.bubble-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeBtn = Array.from(bubbleButtons.children).find(btn => 
                btn.textContent === bubbleStyles[currentBubbleStyle].name
            );
            if (activeBtn) activeBtn.classList.add('active');
        }

        return container;
    }

    /**
     * 应用自定义背景
     */
    function applyBackground(background) {
        const body = document.body;
        
        // 移除现有背景类
        body.classList.remove('with-background');
        
        if (!background) {
            // 移除背景
            document.documentElement.style.removeProperty('--chat-bg-image');
            ChuanxunApp.Storage.remove('currentBackground');
            return;
        }

        if (background.type === 'color') {
            // 渐变背景
            const cssValue = background.value.startsWith('url(') ? background.value : `url(${background.value})`;
            document.documentElement.style.setProperty('--chat-bg-image', cssValue);
            body.classList.add('with-background');
        } else if (background.type === 'image') {
            // 图片背景
            const cssValue = background.value.startsWith('url(') ? background.value : `url(${background.value})`;
            document.documentElement.style.setProperty('--chat-bg-image', cssValue);
            body.classList.add('with-background');
        }

        // 保存当前背景
        ChuanxunApp.Storage.set('currentBackground', JSON.stringify(background));
    }

    /**
     * 移除背景
     */
    function removeBackground() {
        applyBackground(null);
    }

    /**
     * 获取当前主题信息
     */
    function getCurrentTheme() {
        return {
            theme: currentTheme,
            colorTheme: currentColorTheme,
            bubbleStyle: currentBubbleStyle,
            themeData: themes[currentTheme],
            colorThemeData: colorThemes[currentColorTheme],
            bubbleStyleData: bubbleStyles[currentBubbleStyle]
        };
    }

    /**
     * 重置为默认主题
     */
    function resetToDefault() {
        setTheme('light');
        setColorTheme('gold');
        setBubbleStyle('standard');
        removeBackground();
        ChuanxunApp.UI.showNotification('主题已重置为默认设置', 'info');
    }

    /**
     * 预览主题
     */
    function previewTheme(themeName, colorThemeName, bubbleStyleName) {
        // 保存当前主题
        const originalTheme = { currentTheme, currentColorTheme, currentBubbleStyle };

        // 应用预览主题
        if (themeName && themes[themeName]) setTheme(themeName);
        if (colorThemeName && colorThemes[colorThemeName]) setColorTheme(colorThemeName);
        if (bubbleStyleName && bubbleStyles[bubbleStyleName]) setBubbleStyle(bubbleStyleName);

        // 返回恢复函数
        return () => {
            setTheme(originalTheme.currentTheme);
            setColorTheme(originalTheme.currentColorTheme);
            setBubbleStyle(originalTheme.currentBubbleStyle);
        };
    }

    /**
     * 添加主题样式到页面
     */
    function addThemeStyles() {
        const styles = `
            .theme-selector {
                padding: var(--spacing-lg);
            }

            .theme-section {
                margin-bottom: var(--spacing-xl);
            }

            .theme-section h4 {
                margin-bottom: var(--spacing-md);
                color: var(--text-primary);
                font-weight: 600;
            }

            .theme-buttons,
            .color-buttons,
            .bubble-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: var(--spacing-sm);
            }

            .theme-btn,
            .color-btn,
            .bubble-btn {
                background: var(--primary-bg);
                border: 2px solid var(--border-color);
                border-radius: var(--radius);
                padding: var(--spacing-md);
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-sm);
                font-size: 0.9rem;
                color: var(--text-primary);
            }

            .theme-btn:hover,
            .color-btn:hover,
            .bubble-btn:hover {
                border-color: var(--accent-color);
                transform: translateY(-2px);
            }

            .theme-btn.active,
            .color-btn.active,
            .bubble-btn.active {
                border-color: var(--accent-color);
                background: var(--accent-color);
                color: white;
            }

            .color-preview {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .color-name {
                font-size: 0.8rem;
            }

            .bubble-buttons {
                grid-template-columns: repeat(2, 1fr);
            }

            /* 气泡样式预览 */
            .bubble-standard .message-bubble {
                border-radius: var(--radius);
            }

            .bubble-modern .message-bubble {
                border-radius: 20px;
                font-weight: 500;
            }

            .bubble-rounded .message-bubble {
                border-radius: 25px;
                font-weight: 400;
            }

            .bubble-sharp .message-bubble {
                border-radius: 8px;
                font-weight: 600;
            }
        `;

        ChuanxunApp.UI.addStyles(styles);
    }

    // 公开API
    return {
        init,
        themes,
        colorThemes,
        bubbleStyles,
        setTheme,
        setColorTheme,
        setBubbleStyle,
        toggleDarkMode,
        applyBackground,
        removeBackground,
        getCurrentTheme,
        createThemeSelector,
        resetToDefault,
        previewTheme,
        addThemeStyles
    };
})();

// 初始化主题模块
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ChuanxunApp.Themes.init();
        window.ChuanxunApp.Themes.addThemeStyles();
    });
} else {
    window.ChuanxunApp.Themes.init();
    window.ChuanxunApp.Themes.addThemeStyles();
}