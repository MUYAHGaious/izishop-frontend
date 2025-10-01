/**
 * IndexedDB Chat Storage Implementation
 * Based on WhatsApp/Telegram best practices for message persistence
 *
 * References:
 * - WhatsApp Web uses IndexedDB for all chat data
 * - Telegram uses IndexedDB with cloud sync
 * - IndexedDB provides 50% of disk space vs localStorage's ~10MB
 * - Batch operations are critical for performance
 */

const DB_NAME = 'IziShopChats';
const DB_VERSION = 1;
const CONVERSATIONS_STORE = 'conversations';
const MESSAGES_STORE = 'messages';

class ChatStorage {
  constructor() {
    this.db = null;
    this.initPromise = this.initDB();
  }

  /**
   * Initialize IndexedDB with proper indexes for fast queries
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Conversations store
        if (!db.objectStoreNames.contains(CONVERSATIONS_STORE)) {
          const conversationsStore = db.createObjectStore(CONVERSATIONS_STORE, {
            keyPath: 'id'
          });
          // Index for querying by user and type
          conversationsStore.createIndex('userId_type', ['userId', 'type'], { unique: false });
          conversationsStore.createIndex('userId', 'userId', { unique: false });
          conversationsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        // Messages store with sharding for performance
        if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
          const messagesStore = db.createObjectStore(MESSAGES_STORE, {
            keyPath: 'id'
          });
          // Indexes for efficient queries
          messagesStore.createIndex('conversationId', 'conversationId', { unique: false });
          messagesStore.createIndex('created_at', 'created_at', { unique: false });
          messagesStore.createIndex('conversationId_createdAt', ['conversationId', 'created_at'], { unique: false });
        }

        console.log('📦 IndexedDB schema created');
      };
    });
  }

  /**
   * Ensure DB is ready before operations
   */
  async ensureDB() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  /**
   * Save conversation (upsert)
   * WhatsApp pattern: Store conversation metadata separately from messages
   */
  async saveConversation(userId, conversation) {
    try {
      const db = await this.ensureDB();

      const conversationData = {
        ...conversation,
        userId: userId,
        lastUpdated: new Date().toISOString()
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite');
        const store = transaction.objectStore(CONVERSATIONS_STORE);
        const request = store.put(conversationData);

        request.onsuccess = () => {
          console.log(`💾 Conversation saved: ${conversation.id}`);
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('Failed to save conversation:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('saveConversation error:', error);
      throw error;
    }
  }

  /**
   * Save multiple messages in batch for performance
   * Best practice: Batch writes are 10-100x faster than individual writes
   */
  async saveMessages(conversationId, messages) {
    try {
      const db = await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([MESSAGES_STORE], 'readwrite');
        const store = transaction.objectStore(MESSAGES_STORE);

        let completed = 0;
        const total = messages.length;

        messages.forEach(message => {
          const messageData = {
            ...message,
            conversationId: conversationId
          };

          const request = store.put(messageData);

          request.onsuccess = () => {
            completed++;
            if (completed === total) {
              console.log(`💾 ${total} messages saved for conversation: ${conversationId}`);
              resolve(total);
            }
          };

          request.onerror = () => {
            console.error('Failed to save message:', request.error);
          };
        });

        transaction.oncomplete = () => {
          resolve(completed);
        };

        transaction.onerror = () => {
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('saveMessages error:', error);
      throw error;
    }
  }

  /**
   * Get user's conversations sorted by last updated
   * Telegram pattern: Recent chats first
   */
  async getUserConversations(userId) {
    try {
      const db = await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CONVERSATIONS_STORE], 'readonly');
        const store = transaction.objectStore(CONVERSATIONS_STORE);
        const index = store.index('userId');
        const request = index.getAll(userId);

        request.onsuccess = () => {
          const conversations = request.result || [];
          // Sort by lastUpdated descending (newest first)
          conversations.sort((a, b) =>
            new Date(b.lastUpdated) - new Date(a.lastUpdated)
          );
          console.log(`📂 Loaded ${conversations.length} conversations for user ${userId}`);
          resolve(conversations);
        };

        request.onerror = () => {
          console.error('Failed to load conversations:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('getUserConversations error:', error);
      return [];
    }
  }

  /**
   * Get messages for a conversation with pagination
   * WhatsApp pattern: Load recent messages first, load more on scroll
   */
  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    try {
      const db = await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([MESSAGES_STORE], 'readonly');
        const store = transaction.objectStore(MESSAGES_STORE);
        const index = store.index('conversationId_createdAt');

        // Create key range for this conversation
        const keyRange = IDBKeyRange.bound(
          [conversationId, new Date(0).toISOString()],
          [conversationId, new Date().toISOString()]
        );

        const request = index.getAll(keyRange);

        request.onsuccess = () => {
          let messages = request.result || [];
          // Sort by created_at ascending (oldest first for chat display)
          messages.sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
          );

          // Apply pagination (get last N messages)
          if (limit) {
            messages = messages.slice(-limit);
          }

          console.log(`💬 Loaded ${messages.length} messages for conversation: ${conversationId}`);
          resolve(messages);
        };

        request.onerror = () => {
          console.error('Failed to load messages:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('getConversationMessages error:', error);
      return [];
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId) {
    try {
      const db = await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([MESSAGES_STORE], 'readwrite');
        const store = transaction.objectStore(MESSAGES_STORE);
        const request = store.delete(messageId);

        request.onsuccess = () => {
          console.log(`🗑️ Message deleted: ${messageId}`);
          resolve();
        };

        request.onerror = () => {
          console.error('Failed to delete message:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('deleteMessage error:', error);
      throw error;
    }
  }

  /**
   * Update a message (for editing)
   */
  async updateMessage(messageId, updates) {
    try {
      const db = await this.ensureDB();

      return new Promise(async (resolve, reject) => {
        const transaction = db.transaction([MESSAGES_STORE], 'readwrite');
        const store = transaction.objectStore(MESSAGES_STORE);

        // Get existing message
        const getRequest = store.get(messageId);

        getRequest.onsuccess = () => {
          const message = getRequest.result;
          if (!message) {
            reject(new Error('Message not found'));
            return;
          }

          // Update message
          const updatedMessage = {
            ...message,
            ...updates,
            edited: true,
            edited_at: new Date().toISOString()
          };

          const putRequest = store.put(updatedMessage);

          putRequest.onsuccess = () => {
            console.log(`✏️ Message updated: ${messageId}`);
            resolve(updatedMessage);
          };

          putRequest.onerror = () => {
            console.error('Failed to update message:', putRequest.error);
            reject(putRequest.error);
          };
        };

        getRequest.onerror = () => {
          reject(getRequest.error);
        };
      });
    } catch (error) {
      console.error('updateMessage error:', error);
      throw error;
    }
  }

  /**
   * Clear all data (for logout)
   */
  async clearAllData() {
    try {
      const db = await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CONVERSATIONS_STORE, MESSAGES_STORE], 'readwrite');

        transaction.objectStore(CONVERSATIONS_STORE).clear();
        transaction.objectStore(MESSAGES_STORE).clear();

        transaction.oncomplete = () => {
          console.log('🧹 All chat data cleared');
          resolve();
        };

        transaction.onerror = () => {
          console.error('Failed to clear data:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('clearAllData error:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const db = await this.ensureDB();

      const conversationsCount = await this.getCount(CONVERSATIONS_STORE);
      const messagesCount = await this.getCount(MESSAGES_STORE);

      return {
        conversations: conversationsCount,
        messages: messagesCount
      };
    } catch (error) {
      console.error('getStorageStats error:', error);
      return { conversations: 0, messages: 0 };
    }
  }

  async getCount(storeName) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
const chatStorage = new ChatStorage();
export default chatStorage;
