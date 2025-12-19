/**
 * 传讯聊天应用 - UI模块
 * 处理用户界面相关功能
 */

window.ChuanxunApp = window.ChuanxunApp || {};

window.ChuanxunApp.UI = (function() {
    'use strict';

    // 通知队列
    let notificationQueue = [];
    let isShowingNotification = false;

    /**
     * 显示通知
     */
    function showNotification(message, type = 'info', duration = 3000) {
        const notification = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            message,
            type,
            duration
        };

        notificationQueue.push(notification);

        if (!isShowingNotification) {
            showNextNotification();
        }
    }

    /**
     * 显示下一个通知
     */
    function showNextNotification() {
        if (notificationQueue.length === 0) {
            isShowingNotification = false;
            return;
        }

        isShowingNotification = true;
        const notification = notificationQueue.shift();

        const notificationElement = createNotificationElement(notification);
        document.body.appendChild(notificationElement);

        // 添加动画类
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            hideNotification(notificationElement);
        }, notification.duration);
    }

    /**
     * 创建通知元素
     */
    function createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = `notification ${notification.type}`;
        div.setAttribute('data-notification-id', notification.id);
        
        let icon = '';
        switch (notification.type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }

        div.innerHTML = `
            ${icon}
            <span class="notification-message">${notification.message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        return div;
    }

    /**
     * 隐藏通知
     */
    function hideNotification(element) {
        element.classList.remove('show');
        element.classList.add('hide');
        
        setTimeout(() => {
            if (element.parentElement) {
                element.remove();
            }
            showNextNotification();
        }, 300);
    }

    /**
     * 创建模态框
     */
    function createModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
            </div>
        `;

        // 绑定关闭事件
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            closeModal(modal);
        });

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        // ESC键关闭
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal(modal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // 添加到页面
        document.body.appendChild(modal);

        // 显示动画
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // 返回控制对象
        return {
            element: modal,
            close: () => closeModal(modal),
            updateContent: (newContent) => {
                modal.querySelector('.modal-content').innerHTML = newContent;
            }
        };
    }

    /**
     * 关闭模态框
     */
    function closeModal(modal) {
        if (!modal || !modal.parentElement) return;

        modal.classList.remove('show');
        modal.classList.add('hide');

        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 300);
    }

    /**
     * 创建确认对话框
     */
    function confirm(message, title = '确认', options = {}) {
        return new Promise((resolve) => {
            const content = `
                <p class="confirm-message">${message}</p>
            `;

            const footer = `
                <button class="modal-btn modal-btn-secondary" data-action="cancel">
                    ${options.cancelText || '取消'}
                </button>
                <button class="modal-btn modal-btn-primary" data-action="confirm">
                    ${options.confirmText || '确认'}
                </button>
            `;

            const modal = createModal(title, content, { footer });

            // 绑定按钮事件
            modal.element.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action === 'confirm') {
                    modal.close();
                    resolve(true);
                } else if (action === 'cancel') {
                    modal.close();
                    resolve(false);
                }
            });
        });
    }

    /**
     * 创建输入对话框
     */
    function prompt(message, defaultValue = '', title = '输入', options = {}) {
        return new Promise((resolve) => {
            const content = `
                <p class="prompt-message">${message}</p>
                <input type="text" class="prompt-input" value="${defaultValue}" placeholder="${options.placeholder || ''}">
            `;

            const footer = `
                <button class="modal-btn modal-btn-secondary" data-action="cancel">
                    ${options.cancelText || '取消'}
                </button>
                <button class="modal-btn modal-btn-primary" data-action="confirm">
                    ${options.confirmText || '确认'}
                </button>
            `;

            const modal = createModal(title, content, { footer });
            const input = modal.element.querySelector('.prompt-input');

            // 自动聚焦输入框
            setTimeout(() => {
                input.focus();
                input.select();
            }, 100);

            // 绑定按钮事件
            modal.element.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action === 'confirm') {
                    modal.close();
                    resolve(input.value);
                } else if (action === 'cancel') {
                    modal.close();
                    resolve(null);
                }
            });

            // Enter确认
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    modal.close();
                    resolve(input.value);
                }
            });
        });
    }

    /**
     * 创建加载指示器
     */
    function showLoader(message = '加载中...') {
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <div class="loader-message">${message}</div>
            </div>
        `;

        document.body.appendChild(loader);
        setTimeout(() => {
            loader.classList.add('show');
        }, 10);

        return {
            element: loader,
            message: (newMessage) => {
                loader.querySelector('.loader-message').textContent = newMessage;
            },
            hide: () => {
                loader.classList.remove('show');
                setTimeout(() => {
                    if (loader.parentElement) {
                        loader.remove();
                    }
                }, 300);
            }
        };
    }

    /**
     * 创建工具提示
     */
    function showTooltip(element, text, position = 'top') {
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = text;

        document.body.appendChild(tooltip);

        // 计算位置
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        switch (position) {
            case 'top':
                tooltip.style.left = rect.left + (rect.width - tooltipRect.width) / 2 + 'px';
                tooltip.style.top = rect.top - tooltipRect.height - 8 + 'px';
                break;
            case 'bottom':
                tooltip.style.left = rect.left + (rect.width - tooltipRect.width) / 2 + 'px';
                tooltip.style.top = rect.bottom + 8 + 'px';
                break;
            case 'left':
                tooltip.style.left = rect.left - tooltipRect.width - 8 + 'px';
                tooltip.style.top = rect.top + (rect.height - tooltipRect.height) / 2 + 'px';
                break;
            case 'right':
                tooltip.style.left = rect.right + 8 + 'px';
                tooltip.style.top = rect.top + (rect.height - tooltipRect.height) / 2 + 'px';
                break;
        }

        tooltip.classList.add('show');

        // 自动隐藏
        const hideTooltip = () => {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (tooltip.parentElement) {
                    tooltip.remove();
                }
            }, 300);
        };

        element.addEventListener('mouseleave', hideTooltip, { once: true });
        element.addEventListener('blur', hideTooltip, { once: true });

        return hideTooltip;
    }

    /**
     * 显示下拉菜单
     */
    function showDropdown(trigger, items, options = {}) {
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-menu';

        const list = document.createElement('ul');
        list.className = 'dropdown-list';

        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'dropdown-item';

            if (item.divider) {
                li.className += ' divider';
            } else {
                li.innerHTML = `
                    ${item.icon ? `<i class="${item.icon}"></i>` : ''}
                    <span>${item.text}</span>
                `;

                li.addEventListener('click', () => {
                    if (item.action) {
                        item.action();
                    }
                    hideDropdown();
                });

                if (item.disabled) {
                    li.className += ' disabled';
                }
            }

            list.appendChild(li);
        });

        dropdown.appendChild(list);

        // 计算位置
        const rect = trigger.getBoundingClientRect();
        dropdown.style.position = 'absolute';
        dropdown.style.top = rect.bottom + window.scrollY + 'px';
        dropdown.style.left = rect.left + window.scrollX + 'px';

        document.body.appendChild(dropdown);

        // 显示动画
        setTimeout(() => {
            dropdown.classList.add('show');
        }, 10);

        // 点击其他地方关闭
        const hideDropdown = () => {
            dropdown.classList.remove('show');
            setTimeout(() => {
                if (dropdown.parentElement) {
                    dropdown.remove();
                }
            }, 300);
            document.removeEventListener('click', outsideClickHandler);
        };

        const outsideClickHandler = (e) => {
            if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
                hideDropdown();
            }
        };

        setTimeout(() => {
            document.addEventListener('click', outsideClickHandler);
        }, 10);

        return hideDropdown;
    }

    /**
     * 添加样式类到head
     */
    function addStyles(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        return style;
    }

    // 初始化UI样式
    function initUIStyles() {
        const styles = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .modal-overlay.show {
                opacity: 1;
            }

            .modal-dialog {
                background: var(--secondary-bg);
                border-radius: var(--radius);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                max-width: 90vw;
                max-height: 90vh;
                width: 400px;
                max-width: 90%;
                overflow: hidden;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .modal-overlay.show .modal-dialog {
                transform: scale(1);
            }

            .modal-header {
                padding: var(--spacing-lg);
                border-bottom: 1px solid var(--border-color);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .modal-title {
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0;
            }

            .modal-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 1.2rem;
                cursor: pointer;
                padding: var(--spacing-sm);
                border-radius: 50%;
                transition: var(--transition);
            }

            .modal-close:hover {
                background: var(--primary-bg);
                color: var(--text-primary);
            }

            .modal-content {
                padding: var(--spacing-lg);
                max-height: 60vh;
                overflow-y: auto;
            }

            .modal-footer {
                padding: var(--spacing-lg);
                border-top: 1px solid var(--border-color);
                display: flex;
                gap: var(--spacing-sm);
                justify-content: flex-end;
            }

            .modal-btn {
                padding: var(--spacing-sm) var(--spacing-lg);
                border: none;
                border-radius: var(--radius);
                cursor: pointer;
                font-size: 1rem;
                transition: var(--transition);
            }

            .modal-btn-primary {
                background: var(--accent-color, #c5a47e);
                color: white;
            }

            .modal-btn-secondary {
                background: var(--primary-bg);
                color: var(--text-primary);
            }

            .modal-btn:hover {
                opacity: 0.8;
                transform: translateY(-1px);
            }

            .notification {
                position: fixed;
                top: var(--spacing-lg);
                right: var(--spacing-lg);
                background: var(--secondary-bg);
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                padding: var(--spacing-md);
                box-shadow: var(--shadow);
                z-index: 10000;
                max-width: 300px;
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                transform: translateX(120%);
                transition: transform 0.3s ease;
            }

            .notification.show {
                transform: translateX(0);
            }

            .notification.hide {
                transform: translateX(120%);
            }

            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: var(--spacing-xs);
                border-radius: 50%;
                margin-left: auto;
            }

            .loader-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .loader-overlay.show {
                opacity: 1;
            }

            .loader-content {
                background: var(--secondary-bg);
                padding: var(--spacing-xl);
                border-radius: var(--radius);
                text-align: center;
            }

            .loader-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid var(--border-color);
                border-top: 3px solid var(--accent-color, #c5a47e);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto var(--spacing-md);
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .dropdown-menu {
                position: absolute;
                background: var(--secondary-bg);
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                box-shadow: var(--shadow);
                z-index: 1000;
                opacity: 0;
                transform: translateY(-10px);
                transition: var(--transition);
                min-width: 150px;
            }

            .dropdown-menu.show {
                opacity: 1;
                transform: translateY(0);
            }

            .dropdown-list {
                list-style: none;
                margin: 0;
                padding: var(--spacing-xs) 0;
            }

            .dropdown-item {
                padding: var(--spacing-sm) var(--spacing-lg);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                transition: var(--transition);
            }

            .dropdown-item:hover:not(.disabled) {
                background: var(--primary-bg);
            }

            .dropdown-item.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .dropdown-item.divider {
                height: 1px;
                background: var(--border-color);
                margin: var(--spacing-xs) 0;
                padding: 0;
            }

            .tooltip {
                position: absolute;
                background: var(--text-primary);
                color: var(--secondary-bg);
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: 4px;
                font-size: 0.8rem;
                white-space: nowrap;
                z-index: 10000;
                opacity: 0;
                transform: translateY(-5px);
                transition: var(--transition);
                pointer-events: none;
            }

            .tooltip.show {
                opacity: 1;
                transform: translateY(0);
            }

            .tooltip::after {
                content: '';
                position: absolute;
                border: 4px solid transparent;
            }

            .tooltip-top::after {
                border-top-color: var(--text-primary);
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
            }

            .tooltip-bottom::after {
                border-bottom-color: var(--text-primary);
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
            }

            .tooltip-left::after {
                border-left-color: var(--text-primary);
                right: -8px;
                top: 50%;
                transform: translateY(-50%);
            }

            .tooltip-right::after {
                border-right-color: var(--text-primary);
                left: -8px;
                top: 50%;
                transform: translateY(-50%);
            }
        `;

        addStyles(styles);
    }

    // 公开API
    return {
        showNotification,
        createModal,
        confirm,
        prompt,
        showLoader,
        showTooltip,
        showDropdown,
        addStyles,
        initUIStyles
    };
})();

// 初始化UI样式
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ChuanxunApp.UI.initUIStyles();
    });
} else {
    window.ChuanxunApp.UI.initUIStyles();
}