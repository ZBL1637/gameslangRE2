import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { FLOATING_TERMS, SCRIPT } from '../../data';
import { queryDeepSeek, AiQueryResult } from '@/services/aiQuery';
import npcAiLibrarian from '@/assets/images/npc_ai_librarian.png';
import './AIQueryPanel.scss';

interface AIQueryPanelProps {
  onQuery: (term: string) => void;
  queriedTerms: string[];
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  term?: string;
  details?: {
    definition: string;
    usage: string;
    emotion: string;
    origin: string;
    relatedTerms: string[];
  };
}

export const AIQueryPanel: React.FC<AIQueryPanelProps> = ({
  onQuery,
  queriedTerms,
  onClose
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: SCRIPT.ch3_ai_intro
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Esc 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 处理查询
  const handleQuery = async (term: string) => {
    if (!term.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: term.trim()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // DeepSeek 查询
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const result: AiQueryResult = await queryDeepSeek(term.trim(), abortRef.current.signal);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `关于「${result.term}」的解析：`,
        term: result.term,
        details: {
          definition: result.definition,
          usage: result.usage,
          emotion: result.level || '—',
          origin: result.context,
          relatedTerms: result.synonyms || []
        }
      };
      onQuery(result.term);
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI Query Error:', err);
      const msg = (err as Error)?.message || '';
      let errorHandled = false;

      // 1. 检查 API Key 配置
      if (msg.includes('VITE_DEEPSEEK_API_KEY') || msg.includes('API Key not configured') || msg.includes('Server configuration error')) {
        const sysMsg: Message = {
          id: `system-${Date.now()}`,
          type: 'system',
          content: '【系统警告】未检测到 API Key。请在 Vercel 环境变量中配置 DEEPSEEK_API_KEY (线上) 或在 .env.local 设置 VITE_DEEPSEEK_API_KEY (本地)。目前仅支持查询本地档案。'
        };
        setMessages(prev => [...prev, sysMsg]);
        errorHandled = true;
      }

      // 2. 检查网络/CORS 问题
      if (msg.includes('Failed to fetch') || msg.toLowerCase().includes('networkerror') || msg.toLowerCase().includes('cors')) {
        const sysMsg: Message = {
          id: `system-${Date.now()}`,
          type: 'system',
          content: '【连接失败】网络请求受阻（可能是 CORS 或网络波动）。建议使用本地代理或检查网络。目前仅支持查询本地档案。'
        };
        setMessages(prev => [...prev, sysMsg]);
        errorHandled = true;
      }

      // 3. 本地降级查找
      const fallback = term.trim().toUpperCase();
      const matched = FLOATING_TERMS.find(t => t.term.toUpperCase() === fallback);
      
      if (matched) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: `虽然无法连接外部知识库，但在本地档案中找到了关于「${matched.term}」的记录：`,
          term: matched.term,
          details: {
            definition: matched.definition,
            usage: matched.example,
            emotion: matched.emotion || '—',
            origin: matched.origin || `源自${matched.category}游戏圈`,
            relatedTerms: FLOATING_TERMS
              .filter(t => t.category === matched.category && t.id !== matched.id)
              .slice(0, 3)
              .map(t => t.term)
          }
        };
        onQuery(matched.term);
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // 本地也没找到
        if (errorHandled) {
          // 如果已经报过系统错误，就不再重复说“没记录”了，或者给一个更温和的提示
          // 这里选择不再添加新消息，让用户先去解决配置问题
        } else {
          // 如果不是配置错误，而是真的查不到（API 报错但不是 Key/Network 问题，或者 API 返回了空结果等）
          // 或者 API 实际上是成功的但结果不理想（虽然这里是 catch 块，说明肯定抛错了）
          const errorMsg: Message = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            content: `关于「${term.trim()}」，我的档案里暂时没有记录。即使是真言守护者也有知识的盲区。（错误信息：${msg}）`
          };
          setMessages(prev => [...prev, errorMsg]);
        }
      }
    } finally {
      setIsTyping(false);
    }
  };

  // 处理输入提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuery(inputValue);
  };

  // 快捷查询建议
  const suggestions = ['GG', 'YYDS', '欧皇', '氪金', '破防', '666'];
  const unusedSuggestions = suggestions.filter(s => !queriedTerms.includes(s));

  return (
    <div className="ai-query-overlay" onClick={onClose}>
      <div className="rpg-dialog-container" onClick={e => e.stopPropagation()}>
        
        {/* 左侧 NPC 形象 */}
        <div className="npc-portrait">
          <img src={npcAiLibrarian} alt="梅林 · 真言守护者" />
          <div className="npc-name-tag">
            <span className="name">梅林</span>
            <span className="title">真言守护者</span>
          </div>
        </div>

        {/* 右侧对话区域 */}
        <div className="dialog-panel">
          <div className="panel-header">
            <h3>真言档案馆</h3>
            <button className="close-btn" aria-label="关闭" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="messages-container">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.type === 'user' && (
                  <div className="message-content user-message">
                    <p>{message.content}</p>
                  </div>
                )}

                {message.type === 'ai' && (
                  <div className="message-content ai-message">
                    <p>{message.content}</p>
                    {message.details && (
                      <div className="details-card">
                        <div className="detail-item">
                          <span className="label">📖 释义</span>
                          <p>{message.details.definition}</p>
                        </div>
                        <div className="detail-item">
                          <span className="label">💬 用法</span>
                          <p>{message.details.usage}</p>
                        </div>
                        <div className="detail-item">
                          <span className="label">📜 起源</span>
                          <p>{message.details.origin}</p>
                        </div>
                        {message.details.relatedTerms.length > 0 && (
                          <div className="related-terms">
                            <span className="label">相关：</span>
                            {message.details.relatedTerms.map((term, i) => (
                              <button
                                key={i}
                                className="link-btn"
                                onClick={() => handleQuery(term)}
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {message.type === 'system' && (
                  <div className="message-content system-message">
                    <p>{message.content}</p>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message ai">
                <div className="message-content ai-message typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 快捷选项 */}
          {unusedSuggestions.length > 0 && (
            <div className="quick-options">
              {unusedSuggestions.slice(0, 4).map(suggestion => (
                <button
                  key={suggestion}
                  className="option-btn"
                  onClick={() => handleQuery(suggestion)}
                >
                  查询 "{suggestion}"
                </button>
              ))}
            </div>
          )}

          {/* 输入框 */}
          <form className="input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="询问其他黑话..."
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
