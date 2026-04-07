// /home/node/clawd/renovation-api/src/services/openclaw-client.js
const WebSocket = require('ws');

/**
 * OpenClaw Gateway WebSocket Client
 * Token: 6231b19034cd32b9621b579b053b0b336a7750d95b98679c (从 ~/.openclaw/openclaw.json)
 */
class OpenclawClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'ws://170.106.137.46:28502/';
    this.sessionKey = options.sessionKey || 'agent:main:main';
    this.token = options.token || 'd070b2042a98d38e6c78a7f4a4f7bb911d29d4a694f5c3f3';
    this.autoReconnect = options.autoReconnect ?? true;
    this.reconnectDelay = options.reconnectDelay || 3000;
    
    this.ws = null;
    this.pendingCallbacks = new Map();
    this.connected = false;
    this.challengeReceived = false;
    this.connectPromiseResolve = null;
    this.connectPromiseReject = null;
    
    this._generateId = () => Math.random().toString(36).substr(2, 10);
  }

  async connect() {
    if (this.connected) return this;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.baseUrl);
      
      let connectTimeout;
      
      this.ws.on('open', () => {
        console.log('[OpenClaw] WebSocket connected, waiting for challenge...');
        
        // 等待 challenge 并在收到后自动发送 connect
      });

      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          
          // 收到 challenge 后立即响应
          if (msg.type === 'event' && msg.event === 'connect.challenge') {
            console.log('[OpenClaw] Challenge received, authenticating...');
            
            setTimeout(() => {
              this._sendConnect(msg.payload.nonce, msg.payload.ts);
            }, 200);
            return;
          }

          // 处理响应
          if (msg.type === 'res') {
            const callback = this.pendingCallbacks.get(msg.id);
            if (callback) {
              this.pendingCallbacks.delete(msg.id);
              
              if (msg.ok) {
                if (msg.payload?.type === 'hello-ok') {
                  this.connected = true;
                  console.log('[OpenClaw] ✅ Connected successfully!');
                  
                  clearTimeout(connectTimeout);
                  
                  if (this.connectPromiseResolve) {
                    this.connectPromiseResolve();
                    this.connectPromiseResolve = null;
                  }
                  
                  resolve();
                }
                
                // 普通请求响应
                if (typeof msg.payload === 'object' && msg.payload !== null) {
                  callback(msg.payload);
                } else {
                  callback(msg.payload);
                }
              } else {
                const err = new Error(msg.error?.message || 'Unknown error');
                err.code = msg.error?.code;
                console.error('[OpenClaw] Error:', err.message);
                reject(err);
              }
            }
          }
        } catch (err) {
          console.error('[OpenClaw] Message parse error:', err);
        }
      });

      this.ws.on('error', (err) => {
        console.error('[OpenClaw] WebSocket error:', err.message);
        
        if (this.connectPromiseReject && !this.connected) {
          this.connectPromiseReject(err);
          this.connectPromiseReject = null;
        }
        
        if (this.autoReconnect && !this.connected) {
          console.log(`[OpenClaw] Attempting to reconnect in ${this.reconnectDelay}ms...`);
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      });

      this.ws.on('close', (code, reason) => {
        console.log(`[OpenClaw] Connection closed (code: ${code})`);
        this.connected = false;
        
        if (this.autoReconnect) {
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      });

      // 30 秒超时
      connectTimeout = setTimeout(() => {
        if (this.connectPromiseReject) {
          this.connectPromiseReject(new Error('Connection timeout after 30s'));
          this.connectPromiseReject = null;
        }
      }, 30000);
    });
  }

  _sendConnect(nonce, ts) {
    const connectRequest = {
      type: "req",
      id: this._generateId(),
      method: "connect",
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: "cli",
          version: "1.0.0",
          platform: "nodejs",
          mode: "operator"
        },
        role: "operator",
        scopes: ["operator.read"],
        locale: "zh-CN",
        userAgent: "renovation-api/1.0.0",
        auth: {
          token: this.token  // ← 关键！加上 token
        },
        device: {
          id: "renovation-api-client",
          publicKey: "",
          signature: "",
          signedAt: ts || Date.now(),
          nonce: nonce || ""
        }
      }
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(connectRequest));
      console.log('[OpenClaw] Connect request sent with token');
    } else {
      console.error('[OpenClaw] Cannot send connect request - not connected');
      if (this.connectPromiseReject) {
        this.connectPromiseReject(new Error('WebSocket not open'));
      }
    }
  }

  async _request(method, params = {}) {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const id = this._generateId();
      const message = {
        type: "req",
        id,
        method,
        params
      };

      this.pendingCallbacks.set(id, (response) => {
        if (typeof response === 'object' && response !== null) {
          if (response.ok === false) {
            reject(new Error(response.error?.message || 'Request failed'));
          } else {
            resolve(response.payload);
          }
        } else {
          resolve(response);
        }
      });

      setTimeout(() => {
        if (this.pendingCallbacks.has(id)) {
          this.pendingCallbacks.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 60000);

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      } else {
        this.connect().then(() => {
          this.ws.send(JSON.stringify(message));
        }).catch(reject);
      }
    });
  }

  async sendMessage(sessionKey, message) {
    return this._request('chat.send', {
      sessionKey: sessionKey || this.sessionKey,
      channel: 'webchat',
      message
    });
  }

  isReady() {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Disconnecting');
      this.ws = null;
    }
    this.connected = false;
  }
}

module.exports = OpenclawClient;