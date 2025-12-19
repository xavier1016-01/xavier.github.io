/**
 * 传讯聊天应用 - 应用入口文件
 * 整合所有模块，提供完整应用功能
 */

window.ChuanxunApp = window.ChuanxunApp || {};

window.ChuanxunApp.App = (function() {
    'use strict';

    /**
     * 初始化完整应用
     */
    function init() {
        // 确保所有模块都已加载
        if (!window.ChuanxunApp.Core || !window.ChuanxunApp.UI || !window.ChuanxunApp.Storage) {
            throw new Error('应用模块未完全加载');
        }

        console.log('正在初始化传讯应用...');

        // 初始化设置模块
        initSettingsModule();

        // 初始化模态框模块
        initModalModule();

        // 初始化表情模块
        initEmojiModule();

        // 绑定菜单项
        bindMenuItems();

        // 加载背景
        loadSavedBackground();

        console.log('传讯应用初始化完成');
    }

    /**
     * 初始化设置模块
     */
    function initSettingsModule() {
        window.ChuanxunApp.Settings = {
            /**
             * 渲染设置面板
             */
            render(settings) {
                const settingsContent = document.querySelector('.settings-content');
                if (!settingsContent) return;

                settingsContent.innerHTML = `
                    <div class="setting-group">
                        <h3>主题设置</h3>
                        <div id="theme-settings"></div>
                    </div>

                    <div class="setting-group">
                        <h3>通知设置</h3>
                        <label class="setting-item">
                            <input type="checkbox" id="setting-message-sound" ${settings.messageSound ? 'checked' : ''}>
                            <span>消息提示音</span>
                        </label>
                        <label class="setting-item">
                            <input type="checkbox" id="setting-notification" ${settings.notificationSound ? 'checked' : ''}>
                            <span>通知声音</span>
                        </label>
                        <label class="setting-item">
                            <input type="checkbox" id="setting-vibration" ${settings.vibrationFeedback ? 'checked' : ''}>
                            <span>震动反馈</span>
                        </label>
                    </div>

                    <div class="setting-group">
                        <h3>显示设置</h3>
                        <label class="setting-item">
                            <input type="checkbox" id="setting-timestamp" ${settings.showTimestamp ? 'checked' : ''}>
                            <span>显示时间戳</span>
                        </label>
                        <label class="setting-item">
                            <input type="checkbox" id="setting-typing" ${settings.showTypingIndicator ? 'checked' : ''}>
                            <span>显示打字指示器</span>
                        </label>
                        <label class="setting-item">
                            <input type="checkbox" id="setting-autosave" ${settings.autoSave ? 'checked' : ''}>
                            <span>自动保存</span>
                        </label>
                    </div>

                    <div class="setting-group">
                        <h3>数据管理</h3>
                        <button class="setting-btn" id="export-data">
                            <i class="fas fa-download"></i> 导出数据
                        </button>
                        <button class="setting-btn" id="import-data">
                            <i class="fas fa-upload"></i> 导入数据
                        </button>
                        <button class="setting-btn" id="clear-data">
                            <i class="fas fa-trash"></i> 清除数据
                        </button>
                        <button class="setting-btn" id="reset-theme">
                            <i class="fas fa-undo"></i> 重置主题
                        </button>
                    </div>

                    <div class="setting-group">
                        <h3>关于应用</h3>
                        <div class="about-info">
                            <p><strong>传讯聊天应用</strong></p>
                            <p>版本: 2.0.0</p>
                            <p>一个现代化的在线聊天应用</p>
                        </div>
                    </div>
                `;

                // 添加主题选择器
                const themeSettings = document.getElementById('theme-settings');
                if (themeSettings && window.ChuanxunApp.Themes) {
                    themeSettings.appendChild(window.ChuanxunApp.Themes.createThemeSelector());
                }

                // 绑定设置事件
                bindSettingsEvents(settings);
            },

            /**
             * 保存设置
             */
            save(settings) {
                ChuanxunApp.Storage.set('settings', JSON.stringify(settings));
                window.ChuanxunApp.Core.state.settings = settings;
            }
        };

        // 添加设置样式
        const settingStyles = `
            .setting-group {
                margin-bottom: var(--spacing-xl);
            }

            .setting-group h3 {
                margin-bottom: var(--spacing-md);
                color: var(--text-primary);
                font-size: 1.1rem;
                font-weight: 600;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: var(--spacing-sm);
            }

            .setting-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-sm) 0;
                cursor: pointer;
                transition: var(--transition);
            }

            .setting-item:hover {
                background: var(--primary-bg);
                margin: 0 calc(-1 * var(--spacing-md));
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--radius);
            }

            .setting-item input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: var(--accent-color);
            }

            .setting-btn {
                width: 100%;
                padding: var(--spacing-sm) var(--spacing-md);
                margin-bottom: var(--spacing-sm);
                background: var(--primary-bg);
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                color: var(--text-primary);
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-size: 0.9rem;
            }

            .setting-btn:hover {
                background: var(--accent-color);
                color: white;
                border-color: var(--accent-color);
            }

            .about-info {
                background: var(--primary-bg);
                padding: var(--spacing-md);
                border-radius: var(--radius);
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .about-info p {
                margin: var(--spacing-xs) 0;
            }

            .about-info strong {
                color: var(--text-primary);
            }
        `;

        ChuanxunApp.UI.addStyles(settingStyles);
    }

    /**
     * 绑定设置事件
     */
    function bindSettingsEvents(settings) {
        // 主题设置由Themes模块处理

        // 通知设置
        const messageSound = document.getElementById('setting-message-sound');
        if (messageSound) {
            messageSound.addEventListener('change', (e) => {
                settings.messageSound = e.target.checked;
                window.ChuanxunApp.Settings.save(settings);
            });
        }

        const notificationSound = document.getElementById('setting-notification');
        if (notificationSound) {
            notificationSound.addEventListener('change', (e) => {
                settings.notificationSound = e.target.checked;
                window.ChuanxunApp.Settings.save(settings);
            });
        }

        const vibration = document.getElementById('setting-vibration');
        if (vibration) {
            vibration.addEventListener('change', (e) => {
                settings.vibrationFeedback = e.target.checked;
                window.ChuanxunApp.Settings.save(settings);
            });
        }

        // 显示设置
        const timestamp = document.getElementById('setting-timestamp');
        if (timestamp) {
            timestamp.addEventListener('change', (e) => {
                settings.showTimestamp = e.target.checked;
                window.ChuanxunApp.Settings.save(settings);
                // 更新消息显示
                updateMessageTimestamps();
            });
        }

        const typing = document.getElementById('setting-typing');
        if (typing) {
            typing.addEventListener('change', (e) => {
                settings.showTypingIndicator = e.target.checked;
                window.ChuanxunApp.Settings.save(settings);
            });
        }

        const autosave = document.getElementById('setting-autosave');
        if (autosave) {
            autosave.addEventListener('change', (e) => {
                settings.autoSave = e.target.checked;
                window.ChuanxunApp.Settings.save(settings);
            });
        }

        // 数据管理按钮
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportData);
        }

        const importBtn = document.getElementById('import-data');
        if (importBtn) {
            importBtn.addEventListener('click', importData);
        }

        const clearBtn = document.getElementById('clear-data');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearData);
        }

        const resetThemeBtn = document.getElementById('reset-theme');
        if (resetThemeBtn) {
            resetThemeBtn.addEventListener('click', () => {
                if (window.ChuanxunApp.Themes) {
                    window.ChuanxunApp.Themes.resetToDefault();
                }
            });
        }
    }

    /**
     * 更新消息时间戳显示
     */
    function updateMessageTimestamps() {
        const times = document.querySelectorAll('.message-time');
        times.forEach(time => {
            time.style.display = window.ChuanxunApp.Core.state.settings.showTimestamp ? 'block' : 'none';
        });
    }

    /**
     * 初始化模态框模块
     */
    function initModalModule() {
        window.ChuanxunApp.Modal = {
            modals: new Map(),

            /**
             * 显示模态框
             */
            show(type, options = {}) {
                let content;

                switch (type) {
                    case 'emoji-picker':
                        content = createEmojiPicker(options);
                        break;
                    case 'image-upload':
                        content = createImageUpload(options);
                        break;
                    case 'anniversary':
                        content = createAnniversaryModal(options);
                        break;
                    case 'favorites':
                        content = createFavoritesModal(options);
                        break;
                    default:
                        content = '<p>未知模态框类型</p>';
                }

                const modal = ChuanxunApp.UI.createModal('', content, options);
                this.modals.set(type, modal);

                return modal;
            },

            /**
             * 关闭模态框
             */
            close(type) {
                const modal = this.modals.get(type);
                if (modal) {
                    modal.close();
                    this.modals.delete(type);
                }
            }
        };
    }

    /**
     * 创建表情选择器
     */
    function createEmojiPicker(options) {
        const emojis = ['😀', '😍', '🥰', '😂', '🎉', '❤️', '👍', '👎', '🙏', '💪', '🎵', '🌈', '🌟', '🔥', '💯'];
        
        let html = '<div class="emoji-grid">';
        emojis.forEach(emoji => {
            html += `<button class="emoji-btn" data-emoji="${emoji}">${emoji}</button>`;
        });
        html += '</div>';

        return html;
    }

    /**
     * 创建图片上传
     */
    function createImageUpload(options) {
        return `
            <div class="image-upload-container">
                <div class="upload-tabs">
                    <button class="tab-btn active" data-tab="file">选择文件</button>
                    <button class="tab-btn" data-tab="url">粘贴URL</button>
                </div>
                <div class="tab-content">
                    <div class="tab-pane active" id="upload-file">
                        <input type="file" id="image-input" accept="image/*" style="display: none;">
                        <button class="upload-trigger">选择图片文件</button>
                        <p class="upload-hint">支持 JPG、PNG、GIF 格式，最大 5MB</p>
                    </div>
                    <div class="tab-pane" id="upload-url">
                        <input type="url" id="image-url" placeholder="输入图片URL...">
                        <button class="upload-trigger">加载图片</button>
                        <p class="upload-hint">请确保图片URL可以正常访问</p>
                    </div>
                </div>
                <div class="image-preview" id="image-preview" style="display: none;">
                    <img id="preview-img" alt="预览">
                    <button class="upload-confirm">确认上传</button>
                </div>
            </div>
        `;
    }

    /**
     * 创建纪念日模态框
     */
    function createAnniversaryModal(options) {
        return `
            <div class="anniversary-form">
                <h3>添加纪念日</h3>
                <input type="text" id="anniversary-name" placeholder="纪念日名称">
                <input type="date" id="anniversary-date" placeholder="日期">
                <textarea id="anniversary-note" placeholder="备注（可选）"></textarea>
                <button class="confirm-btn" id="save-anniversary">保存</button>
            </div>
        `;
    }

    /**
     * 创建收藏模态框
     */
    function createFavoritesModal(options) {
        return `
            <div class="favorites-container">
                <h3>收藏的消息</h3>
                <div class="favorites-list" id="favorites-list">
                    <!-- 收藏的消息将在这里显示 -->
                </div>
            </div>
        `;
    }

    /**
     * 初始化表情模块
     */
    function initEmojiModule() {
        // 表情选择事件委托
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('emoji-btn')) {
                const emoji = e.target.getAttribute('data-emoji');
                if (window.ChuanxunApp.Core.elements.messageInput) {
                    window.ChuanxunApp.Core.elements.messageInput.value += emoji;
                    window.ChuanxunApp.Core.elements.messageInput.focus();
                }
                window.ChuanxunApp.Modal.close('emoji-picker');
            }
        });
    }

    /**
     * 绑定菜单项
     */
    function bindMenuItems() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const action = item.getAttribute('data-action');
                handleMenuAction(action);
            });
        });
    }

    /**
     * 处理菜单动作
     */
    function handleMenuAction(action) {
        switch (action) {
            case 'favorites':
                window.ChuanxunApp.Modal.show('favorites');
                break;
            case 'anniversary':
                window.ChuanxunApp.Modal.show('anniversary');
                break;
            case 'background':
                showBackgroundSettings();
                break;
            case 'export':
                exportData();
                break;
            case 'import':
                importData();
                break;
            case 'about':
                showAbout();
                break;
            default:
                console.log('未知菜单动作:', action);
        }
    }

    /**
     * 显示背景设置
     */
    function showBackgroundSettings() {
        const content = `
            <div class="background-settings">
                <h3>聊天背景</h3>
                <div class="background-options">
                    <button class="bg-option" data-bg="none">
                        <div class="bg-preview" style="background: var(--secondary-bg); border: 1px solid var(--border-color);"></div>
                        <span>无背景</span>
                    </button>
                    <button class="bg-option" data-bg="gradient1">
                        <div class="bg-preview" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
                        <span>紫罗兰</span>
                    </button>
                    <button class="bg-option" data-bg="gradient2">
                        <div class="bg-preview" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"></div>
                        <span>玫瑰金</span>
                    </button>
                    <button class="bg-option" data-bg="gradient3">
                        <div class="bg-preview" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"></div>
                        <span>天空蓝</span>
                    </button>
                </div>
                <button class="upload-bg-btn" id="upload-custom-bg">
                    <i class="fas fa-upload"></i> 上传自定义背景
                </button>
            </div>
        `;

        const modal = ChuanxunApp.UI.createModal('聊天背景设置', content);

        // 绑定背景选择事件
        modal.element.addEventListener('click', (e) => {
            const bgOption = e.target.closest('.bg-option');
            if (bgOption) {
                const bgType = bgOption.getAttribute('data-bg');
                applyBackgroundOption(bgType);
                modal.close();
            }
        });
    }

    /**
     * 应用背景选项
     */
    function applyBackgroundOption(bgType) {
        const backgrounds = {
            none: null,
            gradient1: { type: 'color', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            gradient2: { type: 'color', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            gradient3: { type: 'color', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
        };

        if (window.ChuanxunApp.Themes) {
            window.ChuanxunApp.Themes.applyBackground(backgrounds[bgType]);
        }
    }

    /**
     * 加载保存的背景
     */
    function loadSavedBackground() {
        const savedBackground = ChuanxunApp.Storage.get('currentBackground');
        if (savedBackground && window.ChuanxunApp.Themes) {
            try {
                const background = JSON.parse(savedBackground);
                window.ChuanxunApp.Themes.applyBackground(background);
            } catch (error) {
                console.error('加载背景失败:', error);
            }
        }
    }

    /**
     * 导出数据
     */
    function exportData() {
        try {
            const data = ChuanxunApp.Storage.exportData();
            if (data) {
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chuanxun-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                
                ChuanxunApp.UI.showNotification('数据导出成功', 'success');
            }
        } catch (error) {
            console.error('导出失败:', error);
            ChuanxunApp.UI.showNotification('导出失败', 'error');
        }
    }

    /**
     * 导入数据
     */
    function importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const result = ChuanxunApp.Storage.importData(e.target.result);
                        if (result.success) {
                            ChuanxunApp.UI.showNotification(`成功导入 ${result.itemCount} 项数据`, 'success');
                            // 刷新应用
                            setTimeout(() => {
                                location.reload();
                            }, 1000);
                        } else {
                            ChuanxunApp.UI.showNotification('导入失败: ' + result.error, 'error');
                        }
                    } catch (error) {
                        ChuanxunApp.UI.showNotification('文件格式错误', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    /**
     * 清除数据
     */
    function clearData() {
        ChuanxunApp.UI.confirm('确定要清除所有数据吗？此操作不可撤销。', '确认清除', {
            confirmText: '确认清除',
            cancelText: '取消'
        }).then((confirmed) => {
            if (confirmed) {
                ChuanxunApp.Storage.clear();
                ChuanxunApp.UI.showNotification('所有数据已清除', 'success');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        });
    }

    /**
     * 显示关于信息
     */
    function showAbout() {
        const content = `
            <div class="about-content">
                <h3>传讯聊天应用</h3>
                <p>版本: 2.0.0</p>
                <p>一个现代化的在线聊天应用，支持多主题、自定义设置和响应式设计。</p>
                <div class="about-features">
                    <h4>主要功能:</h4>
                    <ul>
                        <li>🎨 多种主题和颜色方案</li>
                        <li>💬 实时聊天界面</li>
                        <li>📱 完全响应式设计</li>
                        <li>💾 本地数据存储</li>
                        <li>🔧 丰富的自定义选项</li>
                    </ul>
                </div>
            </div>
        `;

        ChuanxunApp.UI.createModal('关于应用', content);
    }

    // 公开API
    return {
        init
    };
})();

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    if (window.ChuanxunApp && window.ChuanxunApp.App) {
        window.ChuanxunApp.App.init();
    }
});