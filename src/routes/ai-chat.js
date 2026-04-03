const express = require('express'); 
const OpenclawClient = require('../services/openclaw-client'); 
const router = express.Router(); 

// 全局共享的 Client 实例（避免重复连接） 
let openclawClient = null; 

function getClient() { 
  if (!openclawClient) { 
    openclawClient = new OpenclawClient({ 
      baseUrl: process.env.OPENCLAW_WS_URL || 'ws://106.53.160.55:18789', 
      sessionKey: 'agent:main:main', 
      autoReconnect: true 
    }); 
    console.log('[AI Chat] Client created', openclawClient);
    // 启动连接（服务器启动时连一次） 
    getClient().connect().catch(err => { 
      console.error('[AI Chat] Failed to connect:', err); 
    }); 
  } 
  
  return openclawClient; 
} 

/** 
 * POST /api/ai-chat 
 * AI 问答接口 
 */ 
router.post('/', async (req, res) => { 
  try { 
    const client = getClient(); 
    console.log('[AI Chat Route] Client used', client);
    // 确保已连接 
    if (!client.isReady()) { 
      await client.connect(); 
    } 

    const { question, context } = req.body; 
    
    if (!question) { 
      return res.status(400).json({ 
        success: false, 
        error: '问题参数缺失' 
      }); 
    } 

    // 构造提示词 
    let prompt = question; 
    if (context) { 
      prompt += `\n\n参考数据：${JSON.stringify(context)}`; 
    } 

    // 发送并等待回答 
    const response = await client.sendMessage('agent:main:main', prompt); 
    
    res.json({ 
      success: true, 
      aiResponse: response, 
      timestamp: new Date().toISOString() 
    }); 

  } catch (error) { 
    console.error('[AI Chat Route] 错误:', error); 
    res.status(500).json({ 
      success: false, 
      error: 'AI 服务调用失败', 
      details: error.message 
    }); 
  } 
}); 

/** 
 * GET /api/ai-chat/health 
 * 检查 AI 服务健康状态 
 */ 
router.get('/health', async (req, res) => { 
  try { 
  
    const client = getClient(); 
    res.json({ 
      status: client.isReady() ? 'online' : 'connecting', 
      connected: client.isReady() 
    }); 
  } catch (error) { 
    res.json({ 
      status: 'error', 
      message: error.message 
    }); 
  } 
}); 

module.exports = router; 