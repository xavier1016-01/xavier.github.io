/**
 * 传讯聊天应用 - 存储模块
 * 处理本地存储和数据持久化
 */

window.ChuanxunApp = window.ChuanxunApp || {};

window.ChuanxunApp.Storage = (function() {
    'use strict';

    // 存储前缀
    const STORAGE_PREFIX = 'chuanxun_';
    
    // 会话ID
    let sessionId = null;

    /**
     * 初始化存储模块
     */
    function init() {
        // 生成或获取会话ID
        sessionId = sessionStorage.getItem('chuanxun_session') || generateSessionId();
        sessionStorage.setItem('chuanxun_session', sessionId);
    }

    /**
     * 生成会话ID
     */
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 获取存储键名
     */
    function getStorageKey(key) {
        return `${STORAGE_PREFIX}${sessionId}_${key}`;
    }

    /**
     * 设置存储项
     */
    function set(key, value) {
        try {
            const storageKey = getStorageKey(key);
            localStorage.setItem(storageKey, value);
            return true;
        } catch (error) {
            console.error('存储写入失败:', error);
            
            // 处理存储空间不足
            if (error.name === 'QuotaExceededError') {
                handleStorageQuotaExceeded();
            }
            return false;
        }
    }

    /**
     * 获取存储项
     */
    function get(key) {
        try {
            const storageKey = getStorageKey(key);
            return localStorage.getItem(storageKey);
        } catch (error) {
            console.error('存储读取失败:', error);
            return null;
        }
    }

    /**
     * 删除存储项
     */
    function remove(key) {
        try {
            const storageKey = getStorageKey(key);
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('存储删除失败:', error);
            return false;
        }
    }

    /**
     * 清空所有存储
     */
    function clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(STORAGE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('存储清空失败:', error);
            return false;
        }
    }

    /**
     * 处理存储空间不足
     */
    function handleStorageQuotaExceeded() {
        console.warn('存储空间不足，尝试清理旧数据');
        
        try {
            // 获取所有相关的存储项
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith(STORAGE_PREFIX)
            );

            // 按时间戳排序，删除最旧的数据
            const items = keys.map(key => {
                const value = localStorage.getItem(key);
                try {
                    const parsed = JSON.parse(value);
                    return { key, timestamp: parsed.timestamp || 0 };
                } catch {
                    return { key, timestamp: 0 };
                }
            });

            items.sort((a, b) => a.timestamp - b.timestamp);

            // 删除最旧的25%数据
            const toDelete = Math.ceil(items.length * 0.25);
            for (let i = 0; i < toDelete; i++) {
                localStorage.removeItem(items[i].key);
            }

            console.log(`已清理 ${toDelete} 个旧存储项`);
        } catch (error) {
            console.error('清理存储失败:', error);
        }
    }

    /**
     * 获取存储使用情况
     */
    function getStorageUsage() {
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith(STORAGE_PREFIX)
            );

            let totalSize = 0;
            const items = [];

            keys.forEach(key => {
                const value = localStorage.getItem(key);
                const size = new Blob([value]).size;
                totalSize += size;

                items.push({
                    key: key.replace(STORAGE_PREFIX + sessionId + '_', ''),
                    size: size,
                    sizeFormatted: formatBytes(size)
                });
            });

            return {
                total: totalSize,
                totalFormatted: formatBytes(totalSize),
                itemCount: keys.length,
                items: items.sort((a, b) => b.size - a.size)
            };
        } catch (error) {
            console.error('获取存储使用情况失败:', error);
            return null;
        }
    }

    /**
     * 格式化字节大小
     */
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 导出数据
     */
    function exportData() {
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith(STORAGE_PREFIX + sessionId)
            );

            const data = {};
            keys.forEach(key => {
                const shortKey = key.replace(STORAGE_PREFIX + sessionId + '_', '');
                data[shortKey] = localStorage.getItem(key);
            });

            // 添加元数据
            const exportData = {
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                sessionId: sessionId,
                data: data
            };

            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('数据导出失败:', error);
            return null;
        }
    }

    /**
     * 导入数据
     */
    function importData(jsonData) {
        try {
            const importData = JSON.parse(jsonData);

            // 验证数据格式
            if (!importData.version || !importData.data) {
                throw new Error('无效的数据格式');
            }

            // 清空当前数据
            clear();

            // 导入新数据
            Object.entries(importData.data).forEach(([key, value]) => {
                set(key, value);
            });

            // 更新会话ID
            if (importData.sessionId) {
                sessionId = importData.sessionId;
                sessionStorage.setItem('chuanxun_session', sessionId);
            }

            return {
                success: true,
                itemCount: Object.keys(importData.data).length,
                version: importData.version,
                timestamp: importData.timestamp
            };
        } catch (error) {
            console.error('数据导入失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 压缩存储数据
     */
    function compressData() {
        try {
            const usage = getStorageUsage();
            if (!usage) return false;

            // 压缩消息数据
            const messages = get('messages');
            if (messages) {
                try {
                    const parsedMessages = JSON.parse(messages);
                    // 只保留最近的消息
                    if (parsedMessages.length > 1000) {
                        const compressed = parsedMessages.slice(-500);
                        set('messages', JSON.stringify(compressed));
                        console.log('消息数据已压缩，从', parsedMessages.length, '条压缩到', compressed.length, '条');
                    }
                } catch (error) {
                    console.error('压缩消息数据失败:', error);
                }
            }

            // 压缩背景图片
            const backgrounds = get('backgroundGallery');
            if (backgrounds) {
                try {
                    const parsedBackgrounds = JSON.parse(backgrounds);
                    // 只保留最近的背景
                    if (parsedBackgrounds.length > 10) {
                        const compressed = parsedBackgrounds.slice(-5);
                        set('backgroundGallery', JSON.stringify(compressed));
                        console.log('背景数据已压缩，从', parsedBackgrounds.length, '个压缩到', compressed.length, '个');
                    }
                } catch (error) {
                    console.error('压缩背景数据失败:', error);
                }
            }

            return true;
        } catch (error) {
            console.error('数据压缩失败:', error);
            return false;
        }
    }

    /**
     * 验证数据完整性
     */
    function validateData() {
        try {
            const issues = [];

            // 检查消息数据
            const messages = get('messages');
            if (messages) {
                try {
                    const parsedMessages = JSON.parse(messages);
                    if (!Array.isArray(parsedMessages)) {
                        issues.push('消息数据格式错误');
                    } else {
                        parsedMessages.forEach((message, index) => {
                            if (!message.id || !message.timestamp) {
                                issues.push(`消息 ${index} 缺少必要字段`);
                            }
                        });
                    }
                } catch (error) {
                    issues.push('消息数据解析失败');
                }
            }

            // 检查设置数据
            const settings = get('settings');
            if (settings) {
                try {
                    JSON.parse(settings);
                } catch (error) {
                    issues.push('设置数据格式错误');
                }
            }

            // 检查存储空间
            const usage = getStorageUsage();
            if (usage && usage.total > 4 * 1024 * 1024) { // 4MB
                issues.push('存储空间使用过多');
            }

            return {
                valid: issues.length === 0,
                issues: issues,
                usage: usage
            };
        } catch (error) {
            console.error('数据验证失败:', error);
            return {
                valid: false,
                issues: ['数据验证过程中发生错误'],
                usage: null
            };
        }
    }

    /**
     * 修复数据问题
     */
    function repairData() {
        try {
            const validation = validateData();
            if (!validation.valid) {
                console.log('发现数据问题:', validation.issues);

                // 尝试修复消息数据
                const messages = get('messages');
                if (messages) {
                    try {
                        let parsedMessages = JSON.parse(messages);
                        if (!Array.isArray(parsedMessages)) {
                            parsedMessages = [];
                        }

                        // 修复缺少字段的消息
                        parsedMessages = parsedMessages.filter(message => {
                            if (!message.id) {
                                message.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                            }
                            if (!message.timestamp) {
                                message.timestamp = new Date().toISOString();
                            }
                            return true;
                        });

                        set('messages', JSON.stringify(parsedMessages));
                        console.log('消息数据已修复');
                    } catch (error) {
                        console.error('修复消息数据失败:', error);
                    }
                }

                // 压缩数据以节省空间
                compressData();

                return true;
            }
            return true;
        } catch (error) {
            console.error('数据修复失败:', error);
            return false;
        }
    }

    /**
     * 获取会话ID
     */
    function getSessionId() {
        return sessionId;
    }

    /**
     * 设置会话ID
     */
    function setSessionId(newSessionId) {
        sessionId = newSessionId;
        sessionStorage.setItem('chuanxun_session', sessionId);
    }

    /**
     * 获取所有会话
     */
    function getAllSessions() {
        try {
            const keys = Object.keys(localStorage);
            const sessions = new Set();

            keys.forEach(key => {
                const match = key.match(new RegExp(`^${STORAGE_PREFIX}([^_]+)_`));
                if (match) {
                    sessions.add(match[1]);
                }
            });

            return Array.from(sessions);
        } catch (error) {
            console.error('获取会话列表失败:', error);
            return [];
        }
    }

    // 公开API
    return {
        init,
        set,
        get,
        remove,
        clear,
        getStorageUsage,
        exportData,
        importData,
        compressData,
        validateData,
        repairData,
        getSessionId,
        setSessionId,
        getAllSessions
    };
})();

// 自动初始化存储模块
window.ChuanxunApp.Storage.init();