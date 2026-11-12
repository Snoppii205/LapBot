import { useEffect, useState } from 'react';
import {
  AI_HUMAN_WAIT_MAX_SEC,
  AI_HUMAN_WAIT_MIN_SEC,
  AI_MAX_TOKENS_MAX,
  AI_MAX_TOKENS_MIN,
  AI_TURN_TIMEOUT_MAX_MS,
  AI_TURN_TIMEOUT_MIN_MS,
  type AdminAiConfig,
  type AdminAiTestResult,
  type AdminProfile
} from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';
import {
  AdminKpiGridSkeleton,
  RetroSkeleton,
  RetroTopProgress
} from '../../components/os/RetroOsPrimitives.js';
import { ChatMessageContent } from '../../components/chat/ChatMessageContent.js';
import {
  IconAlertTriangle,
  IconBotCpu,
  IconCheck,
  IconClose,
  IconRefresh,
  IconSend,
  IconSparkles,
  IconSpinner,
  IconTerminalAdmin
} from '../../components/icons/RetroIcons.js';

export function AdminAiPage() {
  const [me, setMe] = useState<AdminProfile | null>(null);
  const [config, setConfig] = useState<AdminAiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form draft state
  const [aiOverride, setAiOverride] = useState<boolean | null>(null);
  const [activeModel, setActiveModel] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [welcomeMsg, setWelcomeMsg] = useState<string>('');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [newChip, setNewChip] = useState<string>('');
  const [maxTokens, setMaxTokens] = useState<number>(600);
  const [turnTimeout, setTurnTimeout] = useState<number>(18000);
  const [humanTimeout, setHumanTimeout] = useState<number>(60);

  // Live AI Sandbox Test Bench state
  const [testModel, setTestModel] = useState<string>('');
  const [testPrompt, setTestPrompt] = useState<string>(
    'Tư vấn cho mình laptop gaming mỏng nhẹ dưới 25 triệu'
  );
  const [probing, setProbing] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<AdminAiTestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<AdminAiConfig>('/admin/ai/config');
      setConfig(data);
      setAiOverride(data.ai_enabled_override);
      setActiveModel(data.active_model);
      setTestModel(data.active_model);
      setCustomInstructions(data.custom_system_instructions);
      setWelcomeMsg(data.welcome_message);
      setSuggestedPrompts(data.suggested_prompts);
      setMaxTokens(data.max_tokens_per_call);
      setTurnTimeout(data.turn_timeout_ms);
      setHumanTimeout(data.human_wait_timeout_sec);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không tải được cấu hình AI.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void apiJson<AdminProfile>('/admin/me')
      .then(setMe)
      .catch(() => {});
    fetchConfig();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const clampedTokens = Math.min(
        AI_MAX_TOKENS_MAX,
        Math.max(AI_MAX_TOKENS_MIN, Math.round(Number(maxTokens) || 600))
      );
      const clampedTimeout = Math.min(
        AI_TURN_TIMEOUT_MAX_MS,
        Math.max(AI_TURN_TIMEOUT_MIN_MS, Math.round(Number(turnTimeout) || 18000))
      );
      const clampedHumanWait = Math.min(
        AI_HUMAN_WAIT_MAX_SEC,
        Math.max(AI_HUMAN_WAIT_MIN_SEC, Math.round(Number(humanTimeout) || 60))
      );
      setMaxTokens(clampedTokens);
      setTurnTimeout(clampedTimeout);
      setHumanTimeout(clampedHumanWait);

      const updated = await apiJson<AdminAiConfig>('/admin/ai/config', {
        method: 'PATCH',
        body: JSON.stringify({
          ai_enabled_override: aiOverride,
          active_model: activeModel,
          custom_system_instructions: customInstructions,
          welcome_message: welcomeMsg,
          suggested_prompts: suggestedPrompts,
          max_tokens_per_call: clampedTokens,
          turn_timeout_ms: clampedTimeout,
          human_wait_timeout_sec: clampedHumanWait
        })
      });
      setConfig(updated);
      setSuccessMsg('Đã lưu cấu hình AI & Model thành công!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu cấu hình AI.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddChip = () => {
    if (!newChip.trim()) return;
    setSuggestedPrompts([...suggestedPrompts, newChip.trim()]);
    setNewChip('');
  };

  const handleRemoveChip = (index: number) => {
    setSuggestedPrompts(suggestedPrompts.filter((_, i) => i !== index));
  };

  const handleRunProbe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim()) return;
    setProbing(true);
    setTestError(null);
    setTestResult(null);
    try {
      const result = await apiJson<AdminAiTestResult>('/admin/ai/test', {
        method: 'POST',
        body: JSON.stringify({ model: testModel || activeModel, test_prompt: testPrompt })
      });
      setTestResult(result);
    } catch (err: unknown) {
      setTestError(err instanceof Error ? err.message : 'Lỗi khi chạy thử nghiệm model.');
    } finally {
      setProbing(false);
    }
  };

  if (loading && !config) {
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        role="status"
        aria-busy="true"
        aria-label="Đang tải cấu hình AI Gateway"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <RetroSkeleton variant="text" width={360} height={24} />
            <RetroSkeleton variant="text" width={460} height={14} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <RetroSkeleton height={34} width={210} radius={4} />
            <RetroSkeleton height={34} width={104} radius={4} />
          </div>
        </div>
        <RetroSkeleton height={44} radius={4} />
        <div className="retro-window">
          <div className="retro-window-header">
            <span>01 // ĐANG ĐỒNG BỘ DANH MỤC MODEL & CẤU HÌNH AI GATEWAY...</span>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <RetroSkeleton height={54} radius={4} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '10px'
              }}
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <RetroSkeleton key={idx} height={86} radius={4} />
              ))}
            </div>
          </div>
        </div>
        <AdminKpiGridSkeleton count={4} mini />
      </div>
    );
  }

  if (!config) return null;

  const canEditAi = me?.role === 'SUPER_ADMIN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      <RetroTopProgress
        active={(loading && Boolean(config)) || saving}
        label="Đang đồng bộ cấu hình AI"
      />
      {/* Title & Status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <IconBotCpu size={22} />
            <span>QUẢN TRỊ TRÍ TUỆ AI, DANH MỤC MODEL & TELEMETRY</span>
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-secondary)' }}>
            Chuyển đổi linh hoạt giữa 16+ mô hình AI đã kiểm thử, tinh chỉnh prompt và giám sát độ
            trễ thời gian thực.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              background: config.ai_enabled_effective ? '#eafaf1' : '#fdf2f2',
              border: `1.5px solid ${config.ai_enabled_effective ? '#2ecc71' : '#e74c3c'}`,
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: config.ai_enabled_effective ? '#27ae60' : '#c0392b'
            }}
          >
            TRẠNG THÁI AI:{' '}
            {config.ai_enabled_effective ? 'ĐANG BẬT (ONLINE)' : 'ĐANG TẮT (OFFLINE)'}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => void fetchConfig()}
            className={`retro-btn ${loading ? 'is-busy' : ''}`}
            aria-label="Làm mới cấu hình AI"
          >
            <IconRefresh size={14} className={loading ? 'retro-spin' : ''} />
            <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {me && !canEditAi && (
        <div
          style={{
            background: '#FFF7DF',
            border: '1.5px solid var(--ink-border)',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          <strong>Chế độ chỉ xem (STAFF):</strong> Bạn có thể theo dõi trạng thái vận hành và chỉ số
          Telemetry AI, nhưng chỉ tài khoản <strong>SUPER_ADMIN</strong> mới được thay đổi Model,
          System Prompt hoặc chạy thử nghiệm Gateway.
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fdf2f2',
            border: '1px solid #e74c3c',
            color: '#c0392b',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          <strong>Lỗi: </strong> {error}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            background: '#eafaf1',
            border: '1px solid #2ecc71',
            color: '#27ae60',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          <strong>Thành công: </strong> {successMsg}
        </div>
      )}

      {/* Gateway info card */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--ink-border)',
          borderRadius: '4px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '12px'
        }}
      >
        <div>
          Cổng API Gateway: <code>{config.gateway_base_url_masked || 'Chưa cấu hình'}</code>
        </div>
        <div
          style={{
            color: config.gateway_configured ? '#27ae60' : '#e74c3c',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {config.gateway_configured ? (
            <>
              <IconCheck size={14} />
              <span>Đã thiết lập API Key trong .env</span>
            </>
          ) : (
            <>
              <IconAlertTriangle size={14} />
              <span>Thiếu API Key trong .env</span>
            </>
          )}
        </div>
      </div>

      {/* Main Settings Form */}
      <form
        onSubmit={handleSaveConfig}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <fieldset
          className="admin-rbac-fieldset"
          disabled={!canEditAi}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div className="retro-window">
            <div className="retro-window-header">
              <span>01 // CHỌN MÔ HÌNH AI ĐIỀU HÀNH & CÔNG TẮC KHẨN CẤP</span>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Master Switch */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  background: 'var(--bg-canvas)',
                  padding: '12px 16px',
                  borderRadius: '4px',
                  border: '1px solid var(--ink-border)'
                }}
              >
                <div>
                  <strong style={{ fontSize: '13px', display: 'block' }}>
                    Công tắc vận hành AI:
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Khi tắt, hệ thống tự động chuyển khách sang hàng đợi nhân viên hỗ trợ trực tiếp
                    (HITL).
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      cursor: canEditAi ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <input
                      type="radio"
                      name="ai_override"
                      checked={aiOverride === null}
                      onChange={() => setAiOverride(null)}
                    />
                    <span>THEO MẶC ĐỊNH (.ENV)</span>
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      cursor: canEditAi ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <input
                      type="radio"
                      name="ai_override"
                      checked={aiOverride === true}
                      onChange={() => setAiOverride(true)}
                    />
                    <span style={{ color: '#27ae60', fontWeight: 700 }}>LUÔN BẬT AI</span>
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      cursor: canEditAi ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <input
                      type="radio"
                      name="ai_override"
                      checked={aiOverride === false}
                      onChange={() => setAiOverride(false)}
                    />
                    <span style={{ color: '#c0392b', fontWeight: 700 }}>TẮT AI KHẨN CẤP</span>
                  </label>
                </div>
              </div>

              {/* Model Selector Cards */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '8px'
                  }}
                >
                  Chọn Model AI Đang Hoạt Động (Active Model):
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '10px'
                  }}
                >
                  {config.verified_models.map(m => {
                    const isSelected = activeModel === m.id;
                    return (
                      <div
                        key={m.id}
                        role="button"
                        tabIndex={canEditAi ? 0 : -1}
                        onClick={() => canEditAi && setActiveModel(m.id)}
                        onKeyDown={e => {
                          if (canEditAi && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            setActiveModel(m.id);
                          }
                        }}
                        style={{
                          padding: '12px',
                          borderRadius: '4px',
                          border: isSelected
                            ? '2px solid var(--ink-border)'
                            : '1px solid var(--ink-border)',
                          background: isSelected
                            ? 'var(--accent-amber-light, #fef9e7)'
                            : 'var(--bg-surface)',
                          cursor: canEditAi ? 'pointer' : 'default',
                          boxShadow: isSelected ? '3px 3px 0px var(--ink-border)' : 'none',
                          transition: 'all 0.1s ease'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              background: '#34495e',
                              color: '#fff',
                              fontWeight: 600
                            }}
                          >
                            {m.group}
                          </span>
                          {m.recommended && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '3px',
                                background: 'var(--accent-amber)',
                                color: '#000',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <IconSparkles size={10} />
                              <span>KHUYÊN DÙNG</span>
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: '13px',
                            fontFamily: 'var(--font-mono)',
                            margin: '4px 0'
                          }}
                        >
                          {m.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Độ trễ: <strong>{m.latency_tier}</strong> · {m.note}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Model ID input */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }}
                >
                  Hoặc nhập ID Model tùy chỉnh:
                </label>
                <input
                  type="text"
                  value={activeModel}
                  onChange={e => setActiveModel(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '3px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Instructions & Welcome Experience */}
          <div className="retro-window">
            <div className="retro-window-header">
              <span>02 // CHỈ DẪN NGHIỆP VỤ (SYSTEM PROMPT) & LỜI CHÀO GỢI Ý</span>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Chỉ dẫn bổ sung cho trợ lý AI (Custom System Instructions):
                </label>
                <span
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '6px'
                  }}
                >
                  Chỉ dẫn này sẽ được tiêm trực tiếp vào đầu mỗi lượt hội thoại của AI (ví dụ: quy
                  định chương trình khuyến mãi tháng này, quà tặng kèm, lưu ý dòng máy).
                </span>
                <textarea
                  rows={5}
                  placeholder="Ví dụ: Đang có chương trình tặng balo chống sốc khi mua laptop Asus TUF; ưu tiên gợi ý trả góp 0%..."
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '3px',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}
                >
                  Lời chào mở đầu khi khách mở khung chat (Welcome Message):
                </label>
                <input
                  type="text"
                  value={welcomeMsg}
                  onChange={e => setWelcomeMsg(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '3px',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Suggested Prompts Chips */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '6px'
                  }}
                >
                  Gợi ý câu hỏi nhanh (Suggested Prompt Chips):
                </label>
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}
                >
                  {suggestedPrompts.map((chip, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--ink-border)',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{chip}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChip(idx)}
                        className="retro-icon-btn"
                        style={{ color: '#c0392b', padding: '2px' }}
                        aria-label="Xóa gợi ý"
                      >
                        <IconClose size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', maxWidth: '500px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Thêm câu hỏi gợi ý mới..."
                    value={newChip}
                    onChange={e => setNewChip(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChip();
                      }
                    }}
                    style={{
                      flex: '1 1 200px',
                      padding: '7px 10px',
                      border: '1px solid var(--ink-border)',
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}
                  />
                  <button type="button" onClick={handleAddChip} className="retro-btn retro-btn-sm">
                    + THÊM CHIP
                  </button>
                </div>
              </div>

              {/* Tuning sliders / number inputs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  borderTop: '1px dashed var(--ink-border)',
                  paddingTop: '14px'
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}
                  >
                    Max Tokens mỗi lượt gọi ({AI_MAX_TOKENS_MIN}–{AI_MAX_TOKENS_MAX}):
                  </label>
                  <input
                    type="number"
                    min={AI_MAX_TOKENS_MIN}
                    max={AI_MAX_TOKENS_MAX}
                    value={maxTokens}
                    onChange={e => setMaxTokens(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '3px',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}
                  >
                    Timeout lượt gọi LLM ({AI_TURN_TIMEOUT_MIN_MS}–{AI_TURN_TIMEOUT_MAX_MS} ms):
                  </label>
                  <input
                    type="number"
                    min={AI_TURN_TIMEOUT_MIN_MS}
                    max={AI_TURN_TIMEOUT_MAX_MS}
                    step={1000}
                    value={turnTimeout}
                    onChange={e => setTurnTimeout(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '3px',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}
                  >
                    Thời gian chờ nhân sự tiếp quản ({AI_HUMAN_WAIT_MIN_SEC}–{AI_HUMAN_WAIT_MAX_SEC}
                    s):
                  </label>
                  <input
                    type="number"
                    min={AI_HUMAN_WAIT_MIN_SEC}
                    max={AI_HUMAN_WAIT_MAX_SEC}
                    value={humanTimeout}
                    onChange={e => setHumanTimeout(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '3px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                {canEditAi ? (
                  <button
                    type="submit"
                    disabled={saving}
                    className={`retro-btn retro-btn-primary ${saving ? 'is-busy' : ''}`}
                    style={{ padding: '10px 24px' }}
                  >
                    {saving && <IconSpinner size={15} />}
                    <span>{saving ? 'ĐANG LƯU CẤU HÌNH...' : 'LƯU CẤU HÌNH AI & MODEL'}</span>
                  </button>
                ) : (
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--ink-secondary)',
                      fontStyle: 'italic',
                      padding: '8px 14px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--ink-border)',
                      borderRadius: '3px'
                    }}
                  >
                    * Chế độ xem: Chỉ tài khoản <strong>SUPER_ADMIN</strong> mới có quyền cập nhật
                    cấu hình AI.
                  </div>
                )}
              </div>
            </div>
          </div>
        </fieldset>
      </form>

      {/* Section 3: Live Telemetry & Model Breakdown */}
      <div className="admin-grid-ai">
        {/* Telemetry KPIs */}
        <div className="retro-window">
          <div className="retro-window-header">
            <span>CHỈ SỐ HIỆU NĂNG AI (24 GIỜ QUA)</span>
          </div>
          <div
            style={{
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px'
            }}
          >
            <div
              style={{
                background: 'var(--bg-canvas)',
                padding: '10px',
                border: '1px solid var(--ink-border)',
                borderRadius: '3px'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                TỔNG LƯỢT HỘI THOẠI
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {config.telemetry.total_turns_24h}
              </div>
            </div>
            <div
              style={{
                background: 'var(--bg-canvas)',
                padding: '10px',
                border: '1px solid var(--ink-border)',
                borderRadius: '3px'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TỶ LỆ THÀNH CÔNG</div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: '#27ae60'
                }}
              >
                {config.telemetry.success_rate_pct}%
              </div>
            </div>
            <div
              style={{
                background: 'var(--bg-canvas)',
                padding: '10px',
                border: '1px solid var(--ink-border)',
                borderRadius: '3px'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ĐỘ TRỄ TRUNG BÌNH</div>
              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {config.telemetry.avg_latency_ms} ms
              </div>
            </div>
            <div
              style={{
                background: 'var(--bg-canvas)',
                padding: '10px',
                border: '1px solid var(--ink-border)',
                borderRadius: '3px'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                TỔNG TOKENS TIÊU THỤ
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {config.telemetry.total_tokens_24h.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Model Breakdown */}
        <div className="retro-window">
          <div className="retro-window-header">
            <span>PHÂN BỔ SỬ DỤNG THEO MODEL (24H)</span>
          </div>
          <div style={{ padding: '12px' }}>
            {config.telemetry.model_breakdown.length === 0 ? (
              <p
                style={{
                  margin: '10px 0',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '13px'
                }}
              >
                Chưa có dữ liệu hội thoại trong 24h qua.
              </p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Lượt</th>
                    <th>Prompt Tok</th>
                    <th>Compl Tok</th>
                  </tr>
                </thead>
                <tbody>
                  {config.telemetry.model_breakdown.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {row.model}
                      </td>
                      <td>{row.turns}</td>
                      <td>{row.prompt_tokens}</td>
                      <td>{row.completion_tokens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Live AI Sandbox Test Bench */}
      <div className="retro-window">
        <div className="retro-window-header" style={{ background: '#2c3e50' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <IconTerminalAdmin size={16} />
            <span>PHÒNG THỬ NGHIỆM MODEL TRỰC TIẾP (AI SANDBOX TEST BENCH)</span>
          </span>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-secondary)' }}>
            Gửi yêu cầu thử nghiệm độc lập trực tiếp đến mô hình AI để kiểm tra độ trễ (latency),
            khả năng trích xuất công cụ tra cứu laptop (Tool Calling) và văn phong phản hồi trước
            khi bật cho khách hàng.
          </p>

          <form onSubmit={handleRunProbe}>
            <fieldset
              className="admin-rbac-fieldset"
              disabled={!canEditAi}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div className="admin-grid-brand-model">
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}
                  >
                    Model thử nghiệm:
                  </label>
                  <select
                    value={testModel}
                    onChange={e => setTestModel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '3px',
                      fontSize: '13px'
                    }}
                  >
                    {config.verified_models.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.group})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}
                  >
                    Câu hỏi thử nghiệm từ khách hàng:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <input
                      type="text"
                      required
                      value={testPrompt}
                      onChange={e => setTestPrompt(e.target.value)}
                      style={{
                        flex: '1 1 220px',
                        padding: '8px 12px',
                        border: '1.5px solid var(--ink-border)',
                        borderRadius: '3px',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={probing || !canEditAi}
                      className={`retro-btn retro-btn-primary ${probing ? 'is-busy' : ''}`}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {probing ? <IconSpinner size={14} /> : <IconSend size={14} />}
                      <span>{probing ? 'ĐANG CHẠY...' : 'GỬI THỬ NGHIỆM'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </fieldset>
          </form>

          {probing && (
            <div className="admin-probe-loading" role="status" aria-live="polite">
              <RetroTopProgress active label="Đang chạy thử nghiệm AI Gateway" />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <IconSpinner size={16} />
                <span>
                  Đang kết nối AI Gateway ({testModel || activeModel}), thực thi Tool danh mục &
                  tổng hợp phản hồi...
                </span>
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}
              >
                <RetroSkeleton variant="text" width="92%" height={13} />
                <RetroSkeleton variant="text" width="76%" height={13} />
              </div>
            </div>
          )}

          {testError && (
            <div
              style={{
                background: '#fdf2f2',
                border: '1px solid #e74c3c',
                color: '#c0392b',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            >
              <strong>Lỗi kiểm thử: </strong> {testError}
            </div>
          )}

          {testResult && (
            <div
              style={{
                background: 'var(--bg-canvas)',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '4px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--ink-border)',
                  paddingBottom: '8px',
                  fontSize: '12px'
                }}
              >
                <div>
                  Model phản hồi: <strong>{testResult.model}</strong> · Độ trễ:{' '}
                  <strong>{testResult.latency_ms} ms</strong>
                </div>
                {testResult.tokens && (
                  <div style={{ fontFamily: 'var(--font-mono)' }}>
                    Tokens: {testResult.tokens.prompt_tokens} in /{' '}
                    {testResult.tokens.completion_tokens} out
                  </div>
                )}
              </div>

              {/* Tool Calls Preview */}
              {testResult.tool_calls.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      marginBottom: '4px'
                    }}
                  >
                    CÁC HÀM CÔNG CỤ (TOOL CALLS) MÔ HÌNH ĐÃ THỰC THI:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {testResult.tool_calls.map(tc => (
                      <div
                        key={tc.id}
                        style={{
                          background: '#fff',
                          border: '1px solid var(--ink-border)',
                          borderRadius: '3px',
                          padding: '8px',
                          fontSize: '12px',
                          overflowWrap: 'anywhere'
                        }}
                      >
                        <div>
                          <strong>{tc.name}</strong> <code>{tc.arguments}</code>
                        </div>
                        <div
                          style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}
                        >
                          Kết quả trả về: {tc.result_preview}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response Text */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--ink-secondary)',
                    marginBottom: '4px'
                  }}
                >
                  NỘI DUNG TRẢ LỜI CỦA AI:
                </div>
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid var(--ink-border)',
                    borderRadius: '4px',
                    padding: '12px',
                    fontSize: '13px',
                    lineHeight: 1.6
                  }}
                >
                  <ChatMessageContent content={testResult.response_text} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
