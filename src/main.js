const logBox = document.getElementById("logBox");
const connDot = document.getElementById("connDot");
const connText = document.getElementById("connText");
const tokenInput = document.getElementById("gatewayToken");
const connectBtn = document.getElementById("connectBtn");
const openChatBtn = document.getElementById("openChatBtn");
const bootstrapBtn = document.getElementById("bootstrapBtn");
const toggleGatewayBtn = document.getElementById("toggleGatewayBtn");
const metricGateway = document.getElementById("metricGateway");
const metricDevices = document.getElementById("metricDevices");
const metricSessions = document.getElementById("metricSessions");
const serviceChip = document.getElementById("serviceChip");
const agentCardsEl = document.getElementById("agentCards");
const agentHintEl = document.getElementById("agentHint");
const modelPrimaryChip = document.getElementById("modelPrimaryChip");
const providerListEl = document.getElementById("providerList");
const setupBanner = document.getElementById("setupBanner");
const setupTitle = document.getElementById("setupTitle");
const setupText = document.getElementById("setupText");
const onboardingCard = document.getElementById("onboardingCard");
const onboardingTitle = document.getElementById("onboardingTitle");
const onboardingText = document.getElementById("onboardingText");
const onboardingSteps = document.getElementById("onboardingSteps");
const installCliBtn = document.getElementById("installCliBtn");
const copyInstallBtn = document.getElementById("copyInstallBtn");
const openDocsBtn = document.getElementById("openDocsBtn");
const busyOverlay = document.getElementById("busyOverlay");
const busyTitle = document.getElementById("busyTitle");
const busyText = document.getElementById("busyText");
const renameOverlay = document.getElementById("renameOverlay");
const renameInput = document.getElementById("renameInput");
const renameCancelBtn = document.getElementById("renameCancelBtn");
const renameSaveBtn = document.getElementById("renameSaveBtn");
const modelOverlay = document.getElementById("modelOverlay");
const modelProviderSelect = document.getElementById("modelProviderSelect");
const modelSelect = document.getElementById("modelSelect");
const modelCancelBtn = document.getElementById("modelCancelBtn");
const modelSaveBtn = document.getElementById("modelSaveBtn");
const deleteOverlay = document.getElementById("deleteOverlay");
const deleteText = document.getElementById("deleteText");
const deleteCancelBtn = document.getElementById("deleteCancelBtn");
const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");
const addModelOverlay = document.getElementById("addModelOverlay");
const addModelProviderSelect = document.getElementById("addModelProviderSelect");
const addModelInput = document.getElementById("addModelInput");
const addModelNameInput = document.getElementById("addModelNameInput");
const addModelCancelBtn = document.getElementById("addModelCancelBtn");
const addModelSaveBtn = document.getElementById("addModelSaveBtn");
const addProviderOverlay = document.getElementById("addProviderOverlay");
const addProviderBtn = document.getElementById("addProviderBtn");
const providerAliasInput = document.getElementById("providerAliasInput");
const providerBaseUrlInput = document.getElementById("providerBaseUrlInput");
const providerApiKeyInput = document.getElementById("providerApiKeyInput");
const providerApiTypeSelect = document.getElementById("providerApiTypeSelect");
const addProviderCancelBtn = document.getElementById("addProviderCancelBtn");
const addProviderSaveBtn = document.getElementById("addProviderSaveBtn");
const addAgentOverlay = document.getElementById("addAgentOverlay");
const addAgentNameInput = document.getElementById("addAgentNameInput");
const addAgentProviderSelect = document.getElementById("addAgentProviderSelect");
const addAgentModelSelect = document.getElementById("addAgentModelSelect");
const addAgentStatus = document.getElementById("addAgentStatus");
const addAgentActions = document.getElementById("addAgentActions");
const addAgentCancelBtn = document.getElementById("addAgentCancelBtn");
const addAgentSaveBtn = document.getElementById("addAgentSaveBtn");
const connectPhoneOverlay = document.getElementById("connectPhoneOverlay");
const connectPhoneText = document.getElementById("connectPhoneText");
const connectPhoneAppTypeSelect = document.getElementById("connectPhoneAppTypeSelect");
const connectPhoneFields = document.getElementById("connectPhoneFields");
const connectPhoneCancelBtn = document.getElementById("connectPhoneCancelBtn");
const connectPhoneConfirmBtn = document.getElementById("connectPhoneConfirmBtn");

const { invoke } = window.__TAURI__.core;

const STORAGE_TOKEN_KEY = "openclaw_gateway_token";
const INSTALL_COMMAND =
  "curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash";
const DEFAULT_MODEL = "custom-ark/minimax-m2.5";

const I18N = {
  zh: {
    appTitle: "Claw Home",
    appSubtitle: "你的 OpenClaw 控制中心",
    dashboard: "控制台",
    openChat: "打开聊天",
    quickStart: "一键开始",
    gatewayLocal: "本地 Gateway",
    notConnected: "未连接",
    connect: "连接",
    gatewayToken: "Gateway Token",
    fillToken: "填入 token",
    serviceControl: "服务控制",
    checking: "检查中",
    gateway: "Gateway",
    agentCount: "Agent 数量",
    sessionCount: "会话数量",
    startService: "启动服务",
    stopService: "停止服务",
    agentMgmt: "Agent 管理",
    commonInfo: "普通用户常用信息",
    noAgentData: "暂无 Agent 数据",
    modelMgmt: "模型管理",
    defaultModel: "默认模型：{model}",
    providersAndModels: "服务商与模型",
    providersSub: "每个服务商下面管理自己的模型",
    addProvider: "新增服务商",
    noProviderData: "暂无服务商配置",
    logs: "运行日志",
    realtime: "实时",
    byAuthor: "By FMouse",
    langSwitch: "EN",
    online: "Gateway 在线",
    offline: "Gateway 未运行",
    running: "运行中",
    stopped: "已停止",
    onlineShort: "在线",
    stoppedShort: "未运行",
    noUsage: "未记录",
    unavailable: "暂不可用",
    sessionNum: "会话数量",
    tokenUsage: "Token 消耗",
    tokenHelp: "这个数字来自 OpenClaw 历史会话 jsonl 里的 usage 累计，用于本地运营观察，不等同于模型服务商账单。",
    tokenHintTracked: "已从 {sessions} 个会话 / {messages} 条回复累计",
    tokenHintLive: "来自当前会话统计",
    tokenHintMissing: "历史会话存在，但当前模型服务商没有返回可用的 usage 数值",
    tokenHintNone: "历史 usage 还没有可用数值",
    connectPhone: "连接手机",
    delete: "删除",
    createAgent: "新建 Agent",
    clickToCreate: "点击后弹出创建窗口",
    boundCount: "{count} 绑定",
    unbound: "未绑定渠道",
    boundChannels: "已绑定 {count} 个渠道",
    modelLabel: "模型：{model}",
    defaultTag: " · 默认",
    openChatDone: "已打开 OpenClaw 聊天窗口。",
    openChatFail: "打开聊天窗口失败: {err}",
    renameAgent: "修改 Agent 名称",
    renameAgentDesc: "输入一个更好理解的名字，保存后会写回 OpenClaw。",
    renamePlaceholder: "例如 客服助手",
    cancel: "取消",
    save: "保存",
    changeModel: "更换 Agent 模型",
    changeModelDesc: "先选择服务商，再选择这个服务商下面的模型，保存后会自动重启 Gateway。",
    saveRestart: "保存并重启",
    deleteAgent: "删除 Agent",
    deleteConfirm: "确认删除",
    addModel: "新增模型",
    addModelDesc: "选择服务商后，把模型加入到这个服务商下面，并同步到模型列表。",
    modelIdPlaceholder: "模型 ID，例如 minimax-m2.5",
    modelNamePlaceholder: "显示名称，例如 MiniMax M2.5",
    addProviderTitle: "新增服务商",
    addProviderDesc: "填写服务商别名、接口地址和 API Key，保存后就可以往这个服务商下挂模型。",
    providerAliasPlaceholder: "别名，例如 custom-ark-hk",
    baseUrlPlaceholder: "Base URL",
    apiKeyPlaceholder: "API Key",
    addAgentTitle: "新建 Agent",
    addAgentDesc: "先选择服务商和模型，再输入 Agent 名称。",
    agentNamePlaceholder: "Agent 名称，例如 客服助手",
    create: "创建",
    connectAppTitle: "连接手机 App",
    connectAppDesc: "选择一个 App，把消息入口交给这个 Agent。",
    continueConnect: "继续连接",
    setupCliTitle: "需要安装 OpenClaw CLI",
    setupCliText: "本机还没有可用的 OpenClaw 命令行，先安装后才能自动拉起 Gateway。",
    installTerminal: "终端安装",
    copyCommand: "复制命令",
    installDocs: "安装文档",
    firstLaunch: "首次启动",
    onboardingTitleStart: "先把 Claw Home 配起来",
    onboardingTextStart: "按下面 4 步走完，你就能开始管理 Agent、模型和手机 App 了。",
    onboardingTitleRest: "还差 {count} 步就能开始使用",
    onboardingTextRest: "按顺序完成下面的步骤，Claw Home 会越来越完整。",
    stepDone: "已完成",
    stepNext: "下一步",
    stepTodo: "待完成",
    stepInstall: "安装 OpenClaw",
    stepInstallDone: "这台机器已经能找到 OpenClaw CLI。",
    stepInstallTodo: "先安装本地 CLI，Claw Home 才能工作。",
    stepProvider: "配置模型服务商",
    stepProviderDone: "已配置 {count} 个服务商。",
    stepProviderTodo: "先接入一个模型服务商，后面 Agent 才能选模型。",
    stepAgent: "创建第一个 Agent",
    stepAgentDone: "当前已有 {count} 个 Agent。",
    stepAgentTodo: "创建一个 Agent，作为你的第一个助手。",
    stepChannel: "连接手机 App",
    stepChannelDone: "已连接 {count} 个 App 渠道。",
    stepChannelTodo: "把 Telegram、Slack 或 WhatsApp 接进来。",
    available: "可用",
    pendingModel: "待添加模型",
    interfaceType: "接口类型",
    modelNum: "模型数量",
    apiKey: "API Key",
    status: "状态",
    addModelBtn: "新增模型",
    deleteProvider: "删除服务商",
    addProviderCardSub: "新增 Base URL、API Key 和模型容器",
    noModelUnderProvider: "这个服务商下还没有模型",
    configured: "已配置",
    notConfigured: "未配置",
    usedBy: "被 {names} 使用",
    unassignedAgent: "暂未分配给 Agent",
    defaultModelTag: "默认模型",
    agentNum: "{count} 个 Agent",
    noBaseUrl: "未设置 Base URL",
    missingCli: "缺少 CLI",
    notInstalled: "未安装",
    checkEnv: "检查本地环境...",
  },
};

const currentLang = "zh";

let runtimeStatus = null;
let agentsCache = [];
let sessionsCache = [];
let channelsCache = [];
let modelConfigCache = null;
let tokenUsageCache = { agents: {}, hasTrackedData: false };
let agentActivityCache = { agents: {} };
let isBusy = false;
let autoSyncTimer = null;
let renameDraft = null;
let modelDraft = null;
let deleteDraft = null;
let addModelDraft = null;
let addProviderDraft = null;
let addAgentDraft = null;
let connectPhoneDraft = null;

function t(key, vars = {}) {
  const template = I18N.zh[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
}

const PHONE_APPS = [
  { id: "telegram", label: "Telegram" },
  { id: "discord", label: "Discord" },
  { id: "feishu", label: "飞书" },
  { id: "slack", label: "Slack" },
  { id: "wechat", label: "微信个人号（实验性）" },
  { id: "whatsapp", label: "WhatsApp" },
];

function appendLog(line) {
  const el = document.createElement("div");
  el.className = "log-line";
  el.textContent = line;
  logBox.appendChild(el);
  logBox.scrollTop = logBox.scrollHeight;
}

function applyTranslations() {
  document.documentElement.lang = "zh-CN";
  document.title = t("appTitle");
  const brandTitle = document.querySelector(".brand-title");
  const brandSub = document.querySelector(".brand-sub");
  const brandMeta = document.querySelector(".brand-meta");
  const pageTitle = document.querySelector(".title");
  const pageSubtitle = document.querySelector(".subtitle");
  const cardTitles = document.querySelectorAll(".card-title");
  const metricLabels = document.querySelectorAll(".metric-label");
  const providerTitle = document.querySelector(".subsection-title");
  const providerSub = document.querySelector(".subsection-sub");
  const realtimeChip = document.querySelector(".card:last-child .chip");

  if (brandTitle) brandTitle.textContent = t("appTitle");
  if (brandSub) brandSub.textContent = t("appSubtitle");
  if (brandMeta) brandMeta.textContent = t("byAuthor");
  if (pageTitle) pageTitle.textContent = t("dashboard");
  if (pageSubtitle) pageSubtitle.textContent = t("appSubtitle");
  if (cardTitles[0]) cardTitles[0].textContent = t("serviceControl");
  if (cardTitles[1]) cardTitles[1].textContent = t("agentMgmt");
  if (cardTitles[2]) cardTitles[2].textContent = t("modelMgmt");
  if (cardTitles[3]) cardTitles[3].textContent = t("logs");
  if (metricLabels[0]) metricLabels[0].textContent = t("gateway");
  if (metricLabels[1]) metricLabels[1].textContent = t("agentCount");
  if (metricLabels[2]) metricLabels[2].textContent = t("sessionCount");
  if (providerTitle) providerTitle.textContent = t("providersAndModels");
  if (providerSub) providerSub.textContent = t("providersSub");
  if (realtimeChip) realtimeChip.textContent = t("realtime");

  if (openChatBtn) openChatBtn.textContent = t("openChat");
  if (bootstrapBtn) bootstrapBtn.textContent = t("quickStart");
  if (connectBtn) connectBtn.textContent = t("connect");
  if (tokenInput) tokenInput.placeholder = t("fillToken");
  const tokenLabel = document.querySelector(".auth-label");
  if (tokenLabel) tokenLabel.textContent = t("gatewayToken");
  const localPill = document.querySelector(".pill");
  if (localPill) localPill.textContent = t("gatewayLocal");
  if (agentHintEl && !agentsCache.length) agentHintEl.textContent = t("commonInfo");
  if (addProviderBtn) addProviderBtn.textContent = t("addProvider");
}

function setConnectionStatus(online, text) {
  connDot.classList.toggle("online", online);
  connDot.classList.toggle("offline", !online);
  connText.textContent = text;
  toggleGatewayBtn.textContent = online ? t("stopService") : t("startService");
  toggleGatewayBtn.classList.toggle("ghost", online);
  toggleGatewayBtn.classList.toggle("primary", !online);
}

function setMetric(el, value) {
  el.textContent = value == null ? "-" : String(value);
}

function setBootstrapState(text, disabled = false) {
  bootstrapBtn.textContent = text;
  bootstrapBtn.disabled = disabled;
}

function showSetupBanner(title, text) {
  setupTitle.textContent = title;
  setupText.textContent = text;
  setupBanner.classList.remove("hidden");
}

function hideSetupBanner() {
  setupBanner.classList.add("hidden");
}

function showOnboarding() {
  onboardingCard?.classList.remove("hidden");
}

function hideOnboarding() {
  onboardingCard?.classList.add("hidden");
}

function setBusy(active, title = "正在处理...", text = "请稍等，不要重复点击。") {
  isBusy = active;
  busyOverlay.classList.toggle("hidden", !active);
  document.body.classList.toggle("busy", active);
  busyTitle.textContent = title;
  busyText.textContent = text;

  [
    connectBtn,
    openChatBtn,
    bootstrapBtn,
    toggleGatewayBtn,
    installCliBtn,
    copyInstallBtn,
    openDocsBtn,
    tokenInput,
    addAgentNameInput,
    addAgentProviderSelect,
    addAgentModelSelect,
    addAgentCancelBtn,
    addAgentSaveBtn,
  ].forEach((el) => {
    if (el) el.disabled = active;
  });
}

function openRenameModal(agentId, currentName) {
  renameDraft = { agentId, currentName };
  renameInput.value = currentName || "";
  renameOverlay.classList.remove("hidden");
  requestAnimationFrame(() => renameInput.focus());
}

function closeRenameModal() {
  renameDraft = null;
  renameOverlay.classList.add("hidden");
}

function availableModels(modelConfig) {
  const providers = modelConfig?.catalog?.providers || {};
  return Object.entries(providers).flatMap(([providerId, provider]) =>
    (Array.isArray(provider?.models) ? provider.models : []).map((item) => ({
      providerId,
      modelId: item.id,
      fullId: `${providerId}/${item.id}`,
      label: item.name || item.id,
    }))
  );
}

function openModelModal(agentId, currentModel) {
  modelDraft = { agentId, currentModel };
  const models = availableModels(modelConfigCache);
  const grouped = new Map();
  models.forEach((model) => {
    if (!grouped.has(model.providerId)) grouped.set(model.providerId, []);
    grouped.get(model.providerId).push(model);
  });

  const [currentProvider = "", currentModelId = ""] = String(currentModel || "").split("/");
  modelProviderSelect.innerHTML = "";
  [...grouped.keys()].forEach((providerId) => {
    const option = document.createElement("option");
    option.value = providerId;
    option.textContent = providerId;
    option.selected = providerId === currentProvider;
    modelProviderSelect.appendChild(option);
  });

  if (!grouped.size) {
    modelProviderSelect.innerHTML = '<option value="">暂无服务商</option>';
    modelSelect.innerHTML = '<option value="">暂无可用模型</option>';
  } else {
    const selectedProvider =
      modelProviderSelect.value || [...grouped.keys()][0] || "";
    renderProviderModelsForAgent(selectedProvider, currentModelId, grouped);
  }

  modelProviderSelect.onchange = () => {
    renderProviderModelsForAgent(modelProviderSelect.value, "", grouped);
  };

  if (!models.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "暂无可用模型";
    modelSelect.appendChild(option);
  }
  modelOverlay.classList.remove("hidden");
}

function renderProviderModelsForAgent(providerId, selectedModelId, groupedModels) {
  modelSelect.innerHTML = "";
  const models = groupedModels.get(providerId) || [];
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = `${model.providerId}/${model.modelId}`;
    option.textContent = model.label;
    option.selected =
      option.value === `${providerId}/${selectedModelId}` ||
      model.modelId === selectedModelId;
    modelSelect.appendChild(option);
  });
  if (!models.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "这个服务商下暂无模型";
    modelSelect.appendChild(option);
  }
}

function providerModelGroups(modelConfig) {
  const providers = modelConfig?.catalog?.providers || {};
  const groups = new Map();
  Object.entries(providers).forEach(([providerId, provider]) => {
    groups.set(
      providerId,
      (Array.isArray(provider?.models) ? provider.models : []).map((item) => ({
        providerId,
        modelId: item.id,
        fullId: `${providerId}/${item.id}`,
        label: item.name || item.id,
      }))
    );
  });
  return groups;
}

function fillModelOptionsForProvider(
  modelSelectEl,
  groups,
  providerId,
  selectedFullModel = ""
) {
  if (!modelSelectEl) return;
  const [, selectedModelId = ""] = String(selectedFullModel || "").split("/");
  modelSelectEl.innerHTML = "";
  const models = groups.get(providerId) || [];
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.fullId;
    option.textContent = model.label;
    option.selected =
      option.value === selectedFullModel || model.modelId === selectedModelId;
    modelSelectEl.appendChild(option);
  });

  if (!models.length) {
    modelSelectEl.innerHTML = '<option value="">这个服务商下暂无模型</option>';
  }
}

function renderCreateAgentModelOptions(providerSelectEl, modelSelectEl, selectedFullModel = "") {
  if (!providerSelectEl || !modelSelectEl) return;
  const groups = providerModelGroups(modelConfigCache);
  const [selectedProvider = "", selectedModelId = ""] = String(selectedFullModel || "").split("/");

  providerSelectEl.innerHTML = "";
  [...groups.keys()].forEach((providerId) => {
    const option = document.createElement("option");
    option.value = providerId;
    option.textContent = providerId;
    option.selected = providerId === selectedProvider;
    providerSelectEl.appendChild(option);
  });

  const providerValue = providerSelectEl.value || [...groups.keys()][0] || "";
  const activeModel =
    providerValue === selectedProvider ? `${providerValue}/${selectedModelId}` : "";
  fillModelOptionsForProvider(modelSelectEl, groups, providerValue, activeModel);

  providerSelectEl.onchange = () => {
    fillModelOptionsForProvider(modelSelectEl, groups, providerSelectEl.value, "");
  };
}

function closeModelModal() {
  modelDraft = null;
  modelOverlay.classList.add("hidden");
}

function openDeleteModal(agent) {
  deleteDraft = {
    kind: "agent",
    id: agent.id,
    name: agent.name,
  };
  deleteText.textContent = `删除 ${agent.name} 后，这个 Agent 的工作区、状态和绑定配置都会一起移除。`;
  deleteOverlay.classList.remove("hidden");
}

function openDeleteProviderModal(providerId, modelCount = 0) {
  deleteDraft = {
    kind: "provider",
    id: providerId,
    name: providerId,
  };
  deleteText.textContent = `删除服务商 ${providerId} 后，这个服务商下的 ${modelCount} 个模型也会一起移除。`;
  deleteOverlay.classList.remove("hidden");
}

function closeDeleteModal() {
  deleteDraft = null;
  deleteOverlay.classList.add("hidden");
}

function openAddModelModal(providerId = "") {
  addModelDraft = { providerId };
  addModelInput.value = "";
  addModelNameInput.value = "";
  addModelProviderSelect.innerHTML = "";
  const providers = Object.keys(modelConfigCache?.catalog?.providers || {});
  providers.forEach((provider) => {
    const option = document.createElement("option");
    option.value = provider;
    option.textContent = provider;
    option.selected = provider === providerId;
    addModelProviderSelect.appendChild(option);
  });
  addModelOverlay.classList.remove("hidden");
  requestAnimationFrame(() =>
    (providers.length ? addModelProviderSelect : addModelInput).focus()
  );
}

function closeAddModelModal() {
  addModelDraft = null;
  addModelOverlay.classList.add("hidden");
}

function openAddProviderModal() {
  addProviderDraft = {};
  providerAliasInput.value = "";
  providerBaseUrlInput.value = "";
  providerApiKeyInput.value = "";
  providerApiTypeSelect.value = "openai-completions";
  addProviderOverlay.classList.remove("hidden");
  requestAnimationFrame(() => providerAliasInput.focus());
}

function closeAddProviderModal() {
  addProviderDraft = null;
  addProviderOverlay.classList.add("hidden");
}

function openAddAgentModal() {
  addAgentDraft = {};
  addAgentNameInput.value = "";
  setAddAgentStatus("", "");
  setAddAgentActionsVisible(true);
  renderCreateAgentModelOptions(
    addAgentProviderSelect,
    addAgentModelSelect,
    DEFAULT_MODEL
  );
  addAgentOverlay.classList.remove("hidden");
  requestAnimationFrame(() => addAgentNameInput.focus());
}

function closeAddAgentModal() {
  addAgentDraft = null;
  addAgentOverlay.classList.add("hidden");
  setAddAgentStatus("", "");
  setAddAgentActionsVisible(true);
}

function setAddAgentStatus(message, kind = "") {
  if (!addAgentStatus) return;
  addAgentStatus.textContent = message;
  addAgentStatus.classList.toggle("hidden", !message);
  addAgentStatus.classList.toggle("error", kind === "error");
  addAgentStatus.classList.toggle("success", kind === "success");
}

function setAddAgentActionsVisible(visible) {
  if (!addAgentActions) return;
  addAgentActions.classList.toggle("hidden", !visible);
}

function openConnectPhoneModal(agent) {
  connectPhoneDraft = agent;
  connectPhoneText.textContent = `选择一个 App，把消息入口交给 ${agent.name}。`;
  connectPhoneAppTypeSelect.innerHTML = PHONE_APPS.map(
    (app) => `<option value="${app.id}">${app.label}</option>`
  ).join("");
  renderConnectPhoneFields(connectPhoneAppTypeSelect.value);
  connectPhoneAppTypeSelect.onchange = () => {
    renderConnectPhoneFields(connectPhoneAppTypeSelect.value);
  };
  connectPhoneOverlay.classList.remove("hidden");
}

function closeConnectPhoneModal() {
  connectPhoneDraft = null;
  connectPhoneOverlay.classList.add("hidden");
}

function renderConnectPhoneFields(appType) {
  if (!connectPhoneFields) return;
  const existingAccount = existingChannelAccount(appType);
  const accountHint = existingAccount
    ? `已存在账号：${existingAccount}`
    : "不填则使用 default";

  if (appType === "telegram") {
    connectPhoneFields.innerHTML = `
      <input class="auth-input modal-input" id="connectPhoneTokenInput" placeholder="Telegram Bot Token" />
      <input class="auth-input modal-input" id="connectPhoneAccountInput" placeholder="账号标识（可选）" value="${existingAccount || ""}" />
      <div class="busy-text">${accountHint}</div>
    `;
    return;
  }

  if (appType === "discord") {
    connectPhoneFields.innerHTML = `
      <input class="auth-input modal-input" id="connectPhoneTokenInput" placeholder="Discord Bot Token" />
      <input class="auth-input modal-input" id="connectPhoneAccountInput" placeholder="账号标识（可选）" value="${existingAccount || ""}" />
      <div class="busy-text">${accountHint}</div>
    `;
    return;
  }

  if (appType === "slack") {
    connectPhoneFields.innerHTML = `
      <input class="auth-input modal-input" id="connectPhoneAppTokenInput" placeholder="Slack App Token (xapp-...)" />
      <input class="auth-input modal-input" id="connectPhoneBotTokenInput" placeholder="Slack Bot Token (xoxb-...)" />
      <input class="auth-input modal-input" id="connectPhoneAccountInput" placeholder="账号标识（可选）" value="${existingAccount || ""}" />
      <div class="busy-text">${accountHint}</div>
    `;
    return;
  }

  if (appType === "feishu") {
    connectPhoneFields.innerHTML = `
      <input class="auth-input modal-input" id="connectPhoneAppIdInput" placeholder="飞书 App ID" />
      <input class="auth-input modal-input" id="connectPhoneAppSecretInput" placeholder="飞书 App Secret" />
      <input class="auth-input modal-input" id="connectPhoneBotNameInput" placeholder="机器人名称（可选）" />
      <input class="auth-input modal-input" id="connectPhoneAccountInput" placeholder="账号标识（可选）" value="${existingAccount || ""}" />
      <div class="busy-text">在飞书开放平台创建应用并开启 Bot 后，填写 App ID 和 App Secret 即可。</div>
      <div class="busy-text">${accountHint}</div>
    `;
    return;
  }

  if (appType === "wechat") {
    connectPhoneFields.innerHTML = `
      <input class="auth-input modal-input" id="connectPhoneServerUrlInput" placeholder="WeChatPadPro 地址，例如 http://localhost:8849" />
      <input class="auth-input modal-input" id="connectPhoneTokenKeyInput" placeholder="WeChatPadPro TOKEN_KEY" />
      <input class="auth-input modal-input" id="connectPhoneTriggerPrefixInput" placeholder="触发前缀（可选），例如 @ai" value="@ai" />
      <input class="auth-input modal-input" id="connectPhoneAccountInput" placeholder="账号标识（可选）" value="${existingAccount || "default"}" />
      <div class="busy-text">这是社区插件方案，会在终端里执行插件安装和配置，再打开 OpenClaw Gateway 的微信登录流程。</div>
      <div class="busy-text">${accountHint}</div>
    `;
    return;
  }

  if (appType === "whatsapp") {
    connectPhoneFields.innerHTML = `
      <input class="auth-input modal-input" id="connectPhoneAccountInput" placeholder="账号标识（可选）" value="${existingAccount || "default"}" />
      <div class="busy-text">确认后会打开终端，进入 WhatsApp 扫码登录流程。</div>
    `;
    return;
  }

  connectPhoneFields.innerHTML = "";
}

function existingChannelAccount(channel) {
  const binding = channelsCache.find((item) =>
    String(item).toLowerCase().startsWith(`${String(channel).toLowerCase()}:`)
  );
  return binding ? binding.split(":")[1] || "default" : "";
}

function nextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

async function withBusy(title, text, action) {
  if (isBusy) return;
  setBusy(true, title, text);
  try {
    await nextPaint();
    return await action();
  } finally {
    setBusy(false);
  }
}

function slugChannelBindings(payload) {
  const result = [];
  const chat = payload?.chat || {};
  Object.entries(chat).forEach(([channel, accounts]) => {
    (accounts || []).forEach((accountId) => {
      result.push(`${channel}:${accountId}`);
    });
  });
  return result;
}

function normalizeAgents(payload) {
  const list =
    payload?.agents ||
    payload?.items ||
    payload?.list ||
    (Array.isArray(payload) ? payload : []);
  if (!Array.isArray(list)) return [];
  return list.map((agent) => ({
    id: agent.id || agent.agentId || agent.name,
    name:
      agent.identity?.name ||
      agent.identityName ||
      agent.displayName ||
      agent.name ||
      agent.id,
    model: agent.model || "-",
    bindings: agent.bindings || 0,
    routes: Array.isArray(agent.routes) ? agent.routes : [],
    isDefault: Boolean(agent.isDefault),
  }));
}

function normalizeSessions(payload) {
  const list = Array.isArray(payload?.sessions) ? payload.sessions : [];
  return list.map((session) => ({
    agentId: session.agentId || extractAgentId(session.key),
    key: session.key || "-",
    totalTokens: session.totalTokens,
    kind: session.kind || "-",
    updatedAt: session.updatedAt || null,
    model: formatModel(session),
  }));
}

function extractAgentId(key) {
  if (!key || typeof key !== "string" || !key.startsWith("agent:")) return null;
  return key.split(":")[1] || null;
}

function formatModel(item) {
  if (item.modelProvider && item.model) return `${item.modelProvider}/${item.model}`;
  return item.model || "-";
}

function groupSessionsByAgent(sessions) {
  const map = new Map();
  sessions.forEach((session) => {
    const agentId = session.agentId || "unknown";
    if (!map.has(agentId)) {
      map.set(agentId, { sessions: 0, tokens: 0, tokensKnown: false });
    }
    const row = map.get(agentId);
    row.sessions += 1;
    if (typeof session.totalTokens === "number") {
      row.tokens += session.totalTokens;
      row.tokensKnown = true;
    }
  });
  return map;
}

function tokenUsageForAgent(agentId) {
  const entry = tokenUsageCache?.agents?.[agentId];
  if (!entry) {
    return {
      totalTokens: 0,
      trackedSessions: 0,
      trackedMessages: 0,
      hasTrackedData: false,
      hasUsableValue: false,
    };
  }
  return {
    totalTokens: Number(entry.totalTokens || 0),
    trackedSessions: Number(entry.trackedSessions || 0),
    trackedMessages: Number(entry.trackedMessages || 0),
    hasTrackedData: Number(entry.trackedSessions || 0) > 0,
    hasUsableValue: Number(entry.totalTokens || 0) > 0,
  };
}

function activityForAgent(agentId) {
  const raw = agentActivityCache?.agents?.[agentId] || {
    status: "idle",
    label: "摸鱼中",
    tone: "neutral",
  };
  const labels = {
    offline: currentLang === "zh" ? "睡着了" : "Sleeping",
    idle: currentLang === "zh" ? "摸鱼中" : "Chilling",
    thinking: currentLang === "zh" ? "动脑中" : "Thinking",
    working: currentLang === "zh" ? "打工中" : "Working",
    replying: currentLang === "zh" ? "回复中" : "Replying",
    done: currentLang === "zh" ? "刚下班" : "Done",
    error: currentLang === "zh" ? "翻车了" : "Oops",
  };
  return { ...raw, label: labels[raw.status] || raw.label };
}

function petMoodForActivity(activity) {
  const status = activity?.status || "idle";
  const map = {
    offline: { klass: "pet-offline", text: currentLang === "zh" ? "窝着睡觉" : "Taking a nap", mark: currentLang === "zh" ? "先眯会" : "Nap time" },
    idle: { klass: "pet-idle", text: currentLang === "zh" ? "正在摸鱼" : "Taking it easy", mark: currentLang === "zh" ? "划水中" : "Just chill" },
    thinking: { klass: "pet-thinking", text: currentLang === "zh" ? "转圈思考" : "Thinking hard", mark: currentLang === "zh" ? "我想想" : "Hmm..." },
    working: { klass: "pet-working", text: currentLang === "zh" ? "认真搬砖" : "Hard at work", mark: currentLang === "zh" ? "在干活" : "On it" },
    replying: { klass: "pet-replying", text: currentLang === "zh" ? "努力回复" : "Replying now", mark: currentLang === "zh" ? "马上回" : "Replying" },
    done: { klass: "pet-done", text: currentLang === "zh" ? "刚刚收工" : "Wrapped up", mark: currentLang === "zh" ? "搞定啦" : "Done!" },
    error: { klass: "pet-error", text: currentLang === "zh" ? "有点慌张" : "A bit panicked", mark: currentLang === "zh" ? "出岔子" : "Oops" },
  };
  return map[status] || map.idle;
}

function onboardingState() {
  const cliInstalled = Boolean(runtimeStatus?.cliInstalled);
  const providers = Object.keys(modelConfigCache?.catalog?.providers || {});
  const hasProvider = providers.length > 0;
  const hasAgent = agentsCache.length > 0;
  const hasChannel = channelsCache.length > 0;
  const primaryAgent = agentsCache.find((agent) => agent.isDefault) || agentsCache[0] || null;
  return {
    cliInstalled,
    hasProvider,
    hasAgent,
    hasChannel,
    primaryAgent,
    steps: [
      {
        id: "install",
        title: "安装 OpenClaw",
        text: cliInstalled ? "这台机器已经能找到 OpenClaw CLI。" : "先安装本地 CLI，Claw Home 才能工作。",
        done: cliInstalled,
        action: cliInstalled ? "已完成" : "去安装",
      },
      {
        id: "provider",
        title: "配置模型服务商",
        text: hasProvider ? `已配置 ${providers.length} 个服务商。` : "先接入一个模型服务商，后面 Agent 才能选模型。",
        done: hasProvider,
        action: hasProvider ? "已完成" : "新增服务商",
      },
      {
        id: "agent",
        title: "创建第一个 Agent",
        text: hasAgent ? `当前已有 ${agentsCache.length} 个 Agent。` : "创建一个 Agent，作为你的第一个助手。",
        done: hasAgent,
        action: hasAgent ? "已完成" : "新建 Agent",
      },
      {
        id: "channel",
        title: "连接手机 App",
        text: hasChannel ? `已连接 ${channelsCache.length} 个 App 渠道。` : "把 Telegram、Slack 或 WhatsApp 接进来。",
        done: hasChannel,
        action: hasChannel ? "已完成" : "连接 App",
        disabled: !hasAgent,
      },
    ],
  };
}

function renderOnboarding() {
  if (!onboardingCard || !onboardingSteps) return;
  const state = onboardingState();
  if (!state.cliInstalled) {
    hideOnboarding();
    return;
  }

  const doneCount = state.steps.filter((step) => step.done).length;
  if (doneCount === state.steps.length) {
    hideOnboarding();
    return;
  }

  showOnboarding();
  onboardingTitle.textContent =
    doneCount === 0 ? "先把 Claw Home 配起来" : `还差 ${state.steps.length - doneCount} 步就能开始使用`;
  onboardingText.textContent =
    doneCount === 0
      ? "按下面 4 步走完，你就能开始管理 Agent、模型和手机 App 了。"
      : "按顺序完成下面的步骤，Claw Home 会越来越完整。";

  const currentId = state.steps.find((step) => !step.done)?.id;
  onboardingSteps.innerHTML = state.steps
    .map((step, index) => {
      const stateLabel = step.done ? "已完成" : step.id === currentId ? "下一步" : "待完成";
      return `
        <div class="onboarding-step ${step.done ? "done" : ""} ${step.id === currentId ? "current" : ""}">
          <div class="onboarding-step-head">
            <div class="onboarding-step-no">${index + 1}</div>
            <div class="onboarding-step-state">${stateLabel}</div>
          </div>
          <div class="onboarding-step-title">${step.title}</div>
          <div class="onboarding-step-text">${step.text}</div>
          <button class="btn ${step.done ? "ghost" : "primary"} small onboarding-action-btn" data-step-id="${step.id}" ${step.done || step.disabled ? "disabled" : ""}>
            ${step.action}
          </button>
        </div>
      `;
    })
    .join("");

  onboardingSteps.querySelectorAll(".onboarding-action-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const stepId = button.dataset.stepId;
      if (stepId === "install") {
        installCliBtn.click();
      } else if (stepId === "provider") {
        openAddProviderModal();
      } else if (stepId === "agent") {
        openAddAgentModal();
      } else if (stepId === "channel" && state.primaryAgent) {
        openConnectPhoneModal(state.primaryAgent);
      }
    });
  });
}

function renderAgentCards(agents, sessions) {
  agentCardsEl.innerHTML = "";
  const stats = groupSessionsByAgent(sessions);
  agentHintEl.textContent =
    currentLang === "zh" ? `${agents.length} 个 Agent` : `${agents.length} agents`;

  agents.forEach((agent) => {
    const stat = stats.get(agent.id) || {
      sessions: 0,
      tokens: 0,
      tokensKnown: false,
    };
    const localUsage = tokenUsageForAgent(agent.id);
    const activity = activityForAgent(agent.id);
    const petMood = petMoodForActivity(activity);
    const card = document.createElement("div");
    card.className = "agent-card";

    const defaultChannels =
      agent.isDefault && !agent.routes.length && agent.bindings === 0 && channelsCache.length
        ? channelsCache.map((binding) => {
            const [channel, account] = String(binding).split(":");
            return `${formatChannelName(channel)}${account ? ` · ${account}` : ""}`;
          })
        : [];
    const bindings = agent.routes.length
      ? agent.routes
      : defaultChannels.length
        ? defaultChannels
      : agent.bindings > 0
        ? [t("boundChannels", { count: agent.bindings })]
        : [t("unbound")];
    const bindingCount = defaultChannels.length || agent.bindings;
    const tokenText = localUsage.hasUsableValue
      ? String(localUsage.totalTokens)
      : stat.tokensKnown
        ? String(stat.tokens)
        : localUsage.hasTrackedData
          ? t("noUsage")
          : t("unavailable");
    const tokenHint = localUsage.hasUsableValue
      ? t("tokenHintTracked", {
          sessions: localUsage.trackedSessions,
          messages: localUsage.trackedMessages,
        })
      : stat.tokensKnown
        ? t("tokenHintLive")
        : localUsage.hasTrackedData
          ? t("tokenHintMissing")
          : t("tokenHintNone");

    card.innerHTML = `
      <div class="agent-card-head">
        <div>
          <div class="agent-name" data-agent-id="${agent.id}" data-agent-name="${agent.name}">${agent.name}</div>
          <div class="agent-id">${agent.id}${agent.isDefault ? t("defaultTag") : ""}</div>
        </div>
        <div class="agent-head-meta">
          <div class="chip activity-chip ${activity.tone || "neutral"}">${activity.label}</div>
          <div class="chip neutral">${t("boundCount", { count: bindingCount })}</div>
        </div>
      </div>
      <div class="agent-model" data-agent-id="${agent.id}" data-agent-model="${agent.model}">${t("modelLabel", { model: agent.model })}</div>
      <div class="pet-stage ${petMood.klass}">
        <div class="pet-scene">
          <div class="pet-floor"></div>
          <div class="pet-actor">
            <div class="pet-shadow"></div>
            <div class="pet-body">
              <div class="pet-ear left"></div>
              <div class="pet-ear right"></div>
              <div class="pet-face">
                <span class="pet-eye left"></span>
                <span class="pet-eye right"></span>
                <span class="pet-mouth"></span>
              </div>
              <div class="pet-paw left"></div>
              <div class="pet-paw right"></div>
            </div>
            <div class="pet-emote">${petMood.mark}</div>
          </div>
        </div>
        <div class="pet-caption">${petMood.text}</div>
      </div>
      <div class="agent-meta-grid">
        <div class="agent-meta">
          <div class="agent-meta-label">${t("sessionNum")}</div>
          <div class="agent-meta-value">${stat.sessions}</div>
        </div>
        <div class="agent-meta">
          <div class="agent-meta-label">${t("tokenUsage")} <button class="meta-help" type="button" data-help-toggle="token-usage">i</button></div>
          <div class="agent-meta-value">${tokenText}</div>
          <div class="agent-meta-note">${tokenHint}</div>
          <div class="meta-help-popover hidden">
            ${t("tokenHelp")}
          </div>
        </div>
      </div>
      <div class="agent-bindings">
        ${bindings.map((binding) => `<span class="binding-pill">${binding}</span>`).join("")}
      </div>
      <div class="agent-actions">
        <button class="btn ghost small agent-connect-btn" data-agent-id="${agent.id}">${t("connectPhone")}</button>
        ${agent.id === "main" ? "" : `<button class="btn ghost small agent-delete-btn" data-agent-id="${agent.id}">${t("delete")}</button>`}
      </div>
    `;
    agentCardsEl.appendChild(card);
  });

  agentCardsEl.querySelectorAll(".agent-name").forEach((el) => {
    el.addEventListener("click", () => {
      renameAgent(el.dataset.agentId, el.dataset.agentName);
    });
  });
  agentCardsEl.querySelectorAll(".agent-model").forEach((el) => {
    el.addEventListener("click", () => {
      openModelModal(el.dataset.agentId, el.dataset.agentModel);
    });
  });
  agentCardsEl.querySelectorAll(".agent-delete-btn").forEach((el) => {
    el.addEventListener("click", () => {
      const agent = agents.find((item) => item.id === el.dataset.agentId);
      if (agent) openDeleteModal(agent);
    });
  });
  agentCardsEl.querySelectorAll(".agent-connect-btn").forEach((el) => {
    el.addEventListener("click", () => {
      const agent = agents.find((item) => item.id === el.dataset.agentId);
      if (agent) openConnectPhoneModal(agent);
    });
  });
  agentCardsEl.querySelectorAll("[data-help-toggle='token-usage']").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      const card = el.closest(".agent-meta");
      if (!card) return;
      const popover = card.querySelector(".meta-help-popover");
      if (!popover) return;
      agentCardsEl.querySelectorAll(".meta-help-popover").forEach((node) => {
        if (node !== popover) node.classList.add("hidden");
      });
      popover.classList.toggle("hidden");
    });
  });

  const createCard = document.createElement("div");
  createCard.className = "agent-card create-card";
  createCard.innerHTML = `
    <div class="add-card-plus">+</div>
    <div class="agent-create-title">${t("createAgent")}</div>
    <div class="agent-create-sub">${t("clickToCreate")}</div>
  `;
  createCard.addEventListener("click", openAddAgentModal);
  agentCardsEl.appendChild(createCard);
}

document.addEventListener("click", (event) => {
  if (event.target.closest(".meta-help")) return;
  document.querySelectorAll(".meta-help-popover").forEach((node) => {
    node.classList.add("hidden");
  });
});

function renderModels(modelConfig) {
  providerListEl.innerHTML = "";
  const defaults = modelConfig?.defaults || {};
  const agents = modelConfig?.agents || {};
  const catalog = modelConfig?.catalog || {};
  const providers = catalog?.providers || {};
  const primary = defaults?.model?.primary || "-";
  modelPrimaryChip.textContent = `默认模型：${primary}`;

  const modelMap = new Map();
  const configured = defaults?.models || {};
  Object.keys(configured).forEach((id) => {
    modelMap.set(id, {
      id,
      isPrimary: id === primary,
      agents: [],
    });
  });

  const agentList = Array.isArray(agents?.list) ? agents.list : [];
  agentList.forEach((agent) => {
    if (agent.model) {
      if (!modelMap.has(agent.model)) {
        modelMap.set(agent.model, {
          id: agent.model,
          isPrimary: agent.model === primary,
          agents: [],
        });
      }
      modelMap.get(agent.model).agents.push(
        agent.identity?.name || agent.name || agent.id || "-"
      );
    }
  });

  const providerEntries = Object.entries(providers);
  if (!providerEntries.length) {
    providerListEl.innerHTML = '<div class="agent-empty">暂无服务商配置</div>';
    return;
  }

  providerEntries.forEach(([providerId, provider]) => {
    const card = document.createElement("div");
    card.className = "provider-card";
    const modelCount = Array.isArray(provider?.models) ? provider.models.length : 0;
    const maskedKey = provider?.apiKey ? "已配置" : "未配置";
    const providerModels = Array.isArray(provider?.models) ? provider.models : [];
    const modelsHtml = providerModels.length
      ? providerModels
          .map((item) => {
            const fullId = `${providerId}/${item.id}`;
            const stat = modelMap.get(fullId) || {
              agents: [],
              isPrimary: fullId === primary,
            };
            const usedBy =
              stat.agents.length > 0
                ? `被 ${stat.agents.join("、")} 使用`
                : "暂未分配给 Agent";
            return `
              <div class="model-card">
                <div class="model-name">${item.name || item.id}</div>
                <div class="model-sub">${item.id}</div>
                <div class="model-sub">${usedBy}</div>
                <div class="model-meta">
                  ${stat.isPrimary ? '<span class="mini-pill">默认模型</span>' : ""}
                  <span class="mini-pill">${stat.agents.length} 个 Agent</span>
                </div>
              </div>
            `;
          })
          .join("")
      : '<div class="provider-model-empty">这个服务商下还没有模型</div>';
    card.innerHTML = `
      <div class="provider-name">${providerId}</div>
      <div class="provider-sub">${provider?.baseUrl || "未设置 Base URL"}</div>
      <div class="provider-grid">
        <div class="provider-meta">
          <div class="provider-meta-label">接口类型</div>
          <div class="provider-meta-value">${provider?.api || "-"}</div>
        </div>
        <div class="provider-meta">
          <div class="provider-meta-label">模型数量</div>
          <div class="provider-meta-value">${modelCount}</div>
        </div>
        <div class="provider-meta">
          <div class="provider-meta-label">API Key</div>
          <div class="provider-meta-value">${maskedKey}</div>
        </div>
        <div class="provider-meta">
          <div class="provider-meta-label">状态</div>
          <div class="provider-meta-value">${modelCount > 0 ? "可用" : "待添加模型"}</div>
        </div>
      </div>
      <div class="provider-models">${modelsHtml}</div>
      <div class="provider-actions">
        <button class="btn ghost small provider-add-model-btn" data-provider-id="${providerId}">新增模型</button>
        <button class="btn ghost small provider-delete-btn" data-provider-id="${providerId}" data-model-count="${modelCount}">删除服务商</button>
      </div>
    `;
    providerListEl.appendChild(card);
  });

  const addProviderCard = document.createElement("button");
  addProviderCard.type = "button";
  addProviderCard.className = "model-card add-card";
  addProviderCard.innerHTML = `
    <div class="add-card-plus">+</div>
    <div class="model-name">新增服务商</div>
    <div class="model-sub">新增 Base URL、API Key 和模型容器</div>
  `;
  addProviderCard.addEventListener("click", openAddProviderModal);
  providerListEl.appendChild(addProviderCard);

  providerListEl.querySelectorAll(".provider-add-model-btn").forEach((el) => {
    el.addEventListener("click", () => {
      openAddModelModal(el.dataset.providerId);
    });
  });
  providerListEl.querySelectorAll(".provider-delete-btn").forEach((el) => {
    el.addEventListener("click", () => {
      openDeleteProviderModal(
        el.dataset.providerId,
        Number(el.dataset.modelCount || 0)
      );
    });
  });
}

function formatChannelName(channel) {
  const labels = {
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    feishu: "飞书",
    wechat: "微信",
    webchat: "网页聊天",
    slack: "Slack",
    discord: "Discord",
    email: "Email",
  };
  return labels[String(channel || "").toLowerCase()] || channel || "未知渠道";
}

async function loadTokenFromConfig() {
  try {
    const token = await invoke("read_openclaw_gateway_token");
    if (token) {
      tokenInput.value = token;
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    }
  } catch (err) {
    appendLog(`[${new Date().toLocaleTimeString()}] 读取 token 失败: ${err}`);
  }
}

async function inspectRuntime() {
  try {
    runtimeStatus = await invoke("inspect_openclaw_runtime");
    if (!runtimeStatus?.cliInstalled) {
      setConnectionStatus(false, "缺少 CLI");
      serviceChip.textContent = "未安装";
      metricGateway.textContent = "未安装";
      showSetupBanner(
        "需要安装 OpenClaw CLI",
        "先安装 OpenClaw，桌面端才能帮你启动、停止和管理 Agent。"
      );
      return runtimeStatus;
    }

    hideSetupBanner();
    const online = Boolean(runtimeStatus.gatewayOnline);
    setConnectionStatus(online, online ? t("online") : t("offline"));
    serviceChip.textContent = online ? t("onlineShort") : t("stoppedShort");
    metricGateway.textContent = online ? t("running") : t("stopped");
    if (runtimeStatus.version) {
      appendLog(
        `[${new Date().toLocaleTimeString()}] 检测到 ${runtimeStatus.version}`
      );
    }
    return runtimeStatus;
  } catch (err) {
    appendLog(`[${new Date().toLocaleTimeString()}] 检测运行状态失败: ${err}`);
    return null;
  }
}

async function syncDashboard() {
  try {
    const data = await invoke("load_dashboard_data");
    runtimeStatus = data?.runtime || null;
    const status = runtimeStatus;
    if (!status?.cliInstalled) {
      setConnectionStatus(false, "缺少 CLI");
      serviceChip.textContent = "未安装";
      metricGateway.textContent = "未安装";
      showSetupBanner(
        "需要安装 OpenClaw CLI",
        "先安装 OpenClaw，桌面端才能帮你启动、停止和管理 Agent。"
      );
      return;
    }

    hideSetupBanner();
    const online = Boolean(status.gatewayOnline);
    setConnectionStatus(online, online ? t("online") : t("offline"));
    serviceChip.textContent = online ? t("onlineShort") : t("stoppedShort");
    metricGateway.textContent = online ? t("running") : t("stopped");

    modelConfigCache = data?.models || null;
    tokenUsageCache = data?.tokenUsage || { agents: {}, hasTrackedData: false };
    agentActivityCache = data?.agentActivity || { agents: {} };
    agentsCache = normalizeAgents(data?.agents);
    sessionsCache = normalizeSessions(data?.sessions);
    channelsCache = slugChannelBindings(data?.channels);

    setMetric(metricDevices, agentsCache.length);
    setMetric(metricSessions, sessionsCache.length);
    renderAgentCards(agentsCache, sessionsCache);
    renderModels(modelConfigCache);
    renderOnboarding();
    appendLog(
      `[${new Date().toLocaleTimeString()}] 已同步 ${agentsCache.length} 个 Agent / ${sessionsCache.length} 个会话`
    );
  } catch (err) {
    appendLog(`[${new Date().toLocaleTimeString()}] 同步控制台失败: ${err}`);
  }
}

function startAutoSync() {
  if (autoSyncTimer) return;
  autoSyncTimer = setInterval(() => {
    if (isBusy || document.hidden) return;
    syncDashboard();
  }, 10000);
}

async function ensureGatewayThenSync() {
  return withBusy("正在准备 OpenClaw", "正在检测环境并同步本地状态。", async () => {
    setBootstrapState("检查环境...", true);
    const status = await inspectRuntime();
    if (!status?.cliInstalled) {
      setBootstrapState("未检测到 OpenClaw");
      return;
    }

    if (!status.gatewayOnline) {
      setBootstrapState("正在启动...", true);
      try {
        const result = await invoke("start_openclaw_gateway");
        appendLog(
          `[${new Date().toLocaleTimeString()}] ${result.detail}`
        );
      } catch (err) {
        appendLog(`[${new Date().toLocaleTimeString()}] 启动 Gateway 失败: ${err}`);
      }
    }

    await syncDashboard();
    setBootstrapState("已同步");
  });
}

async function startGateway() {
  return withBusy("正在启动 Gateway", "这可能需要几秒钟时间。", async () => {
    setBootstrapState("正在启动...", true);
    try {
      const result = await invoke("start_openclaw_gateway");
      appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
      await syncDashboard();
    } catch (err) {
      appendLog(`[${new Date().toLocaleTimeString()}] 启动 Gateway 失败: ${err}`);
    }
  });
}

async function stopGateway() {
  return withBusy("正在停止 Gateway", "正在关闭本地服务，请稍等。", async () => {
    try {
      appendLog(`[${new Date().toLocaleTimeString()}] 正在停止 Gateway...`);
      setConnectionStatus(false, "正在停止");
      setBootstrapState("正在停止...", true);
      const result = await invoke("stop_openclaw_gateway");
      appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
      await syncDashboard();
    } catch (err) {
      appendLog(`[${new Date().toLocaleTimeString()}] 停止 Gateway 失败: ${err}`);
    }
  });
}

async function toggleGateway() {
  if (runtimeStatus?.gatewayOnline) {
    return stopGateway();
  }
  return startGateway();
}

async function createAgent() {
  appendLog(`[${new Date().toLocaleTimeString()}] 开始创建 Agent...`);
  const name = addAgentNameInput?.value.trim() || "";
  const model = addAgentModelSelect?.value.trim() || DEFAULT_MODEL;
  if (!name) {
    const msg = "请输入 Agent 名称";
    setAddAgentActionsVisible(true);
    setAddAgentStatus(msg, "error");
    appendLog(`[${new Date().toLocaleTimeString()}] ${msg}`);
    return;
  }
  if (!model) {
    const msg = "请选择模型";
    setAddAgentActionsVisible(true);
    setAddAgentStatus(msg, "error");
    appendLog(`[${new Date().toLocaleTimeString()}] ${msg}`);
    return;
  }
  if (/[^\u0000-\u007f]/.test(name)) {
    const msg = "Agent 名称暂时只支持英文、数字和常见符号，请先去掉中文或 emoji。";
    setAddAgentActionsVisible(true);
    setAddAgentStatus(msg, "error");
    appendLog(`[${new Date().toLocaleTimeString()}] ${msg}`);
    return;
  }

  setAddAgentActionsVisible(false);
  setAddAgentStatus("正在创建 Agent，请稍等...", "");
  return withBusy("正在创建 Agent", "正在写入配置并刷新列表。", async () => {
    try {
      const result = await invoke("create_openclaw_agent", { name, model });
      appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
      if (result.success) {
        setAddAgentStatus("创建成功，正在刷新列表...", "success");
        await syncDashboard();
        closeAddAgentModal();
      } else {
        setAddAgentActionsVisible(true);
        setAddAgentStatus(result.detail || "创建失败，请检查配置后重试。", "error");
      }
    } catch (err) {
      const msg = `创建 Agent 失败: ${err}`;
      setAddAgentActionsVisible(true);
      setAddAgentStatus(msg, "error");
      appendLog(`[${new Date().toLocaleTimeString()}] ${msg}`);
    }
  });
}

async function renameAgent(agentId, currentName) {
  openRenameModal(agentId, currentName);
}

async function submitRenameAgent() {
  if (!renameDraft) return;
  const { agentId, currentName } = renameDraft;
  const trimmed = renameInput.value.trim();
  if (!trimmed || trimmed === currentName) {
    closeRenameModal();
    return;
  }

  closeRenameModal();
  return withBusy("正在修改 Agent 名称", "正在写回 OpenClaw 配置。", async () => {
    try {
      const result = await invoke("rename_openclaw_agent", {
        agentId,
        name: trimmed,
      });
      appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
      if (result.success) {
        await syncDashboard();
      }
    } catch (err) {
      appendLog(`[${new Date().toLocaleTimeString()}] 修改 Agent 名称失败: ${err}`);
    }
  });
}

async function submitModelChange() {
  if (!modelDraft) return;
  const { agentId, currentModel } = modelDraft;
  const nextModel = modelSelect.value;
  if (!nextModel || nextModel === currentModel) {
    closeModelModal();
    return;
  }

  closeModelModal();
  return withBusy("正在更换模型", "正在更新配置并重启 Gateway。", async () => {
    try {
      const result = await invoke("update_openclaw_agent_model", {
        agentId,
        model: nextModel,
      });
      appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
      if (result.success) {
        await syncDashboard();
      }
    } catch (err) {
      appendLog(`[${new Date().toLocaleTimeString()}] 更换模型失败: ${err}`);
    }
  });
}

async function submitDeleteAgent() {
  if (!deleteDraft) return;
  const target = deleteDraft;
  closeDeleteModal();

  if (target.kind === "provider") {
    return withBusy("正在删除服务商", "正在移除服务商和关联模型。", async () => {
      try {
        const result = await invoke("delete_openclaw_provider", {
          providerId: target.id,
        });
        appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
        if (result.success) {
          await syncDashboard();
        }
      } catch (err) {
        appendLog(`[${new Date().toLocaleTimeString()}] 删除服务商失败: ${err}`);
      }
    });
  }

  return withBusy("正在删除 Agent", "正在移除工作区并刷新控制台。", async () => {
    try {
      const result = await invoke("delete_openclaw_agent", {
        agentId: target.id,
      });
      appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
      if (result.success) {
        await syncDashboard();
      }
    } catch (err) {
      appendLog(`[${new Date().toLocaleTimeString()}] 删除 Agent 失败: ${err}`);
    }
  });
}

async function submitAddModel() {
  if (!addModelDraft) return;
  const providerId = addModelProviderSelect.value;
  const modelId = addModelInput.value.trim();
  const displayName = addModelNameInput.value.trim() || modelId;
  if (!providerId || !modelId) {
    closeAddModelModal();
    return;
  }

  closeAddModelModal();
  return withBusy("正在新增模型", "正在写入 OpenClaw 模型配置。", async () => {
    try {
      const result = await invoke("add_openclaw_model", {
        providerId,
        modelId,
        displayName,
      });
      appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
      if (result.success) {
        await syncDashboard();
      }
    } catch (err) {
      appendLog(`[${new Date().toLocaleTimeString()}] 新增模型失败: ${err}`);
    }
  });
}

async function submitAddProvider() {
  if (!addProviderDraft) return;
  const alias = providerAliasInput.value.trim();
  const baseUrl = providerBaseUrlInput.value.trim();
  const apiKey = providerApiKeyInput.value.trim();
  const apiType = providerApiTypeSelect.value;
  if (!alias || !baseUrl || !apiKey) {
    closeAddProviderModal();
    return;
  }

  closeAddProviderModal();
  return withBusy("正在新增服务商", "正在写入 OpenClaw 服务商配置。", async () => {
    try {
      const result = await invoke("add_openclaw_provider", {
        alias,
        baseUrl,
        apiKey,
        apiType,
      });
      appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
      if (result.success) {
        await syncDashboard();
      }
    } catch (err) {
      appendLog(`[${new Date().toLocaleTimeString()}] 新增服务商失败: ${err}`);
    }
  });
}

async function submitConnectPhone() {
  if (!connectPhoneDraft) return;
  const agent = connectPhoneDraft;
  const appType = connectPhoneAppTypeSelect.value;
  const account =
    document.getElementById("connectPhoneAccountInput")?.value.trim() || "default";
  const token =
    document.getElementById("connectPhoneTokenInput")?.value.trim() || "";
  const appToken =
    document.getElementById("connectPhoneAppTokenInput")?.value.trim() || "";
  const botToken =
    document.getElementById("connectPhoneBotTokenInput")?.value.trim() || "";
  const appId =
    document.getElementById("connectPhoneAppIdInput")?.value.trim() || "";
  const appSecret =
    document.getElementById("connectPhoneAppSecretInput")?.value.trim() || "";
  const botName =
    document.getElementById("connectPhoneBotNameInput")?.value.trim() || "";
  const serverUrl =
    document.getElementById("connectPhoneServerUrlInput")?.value.trim() || "";
  const tokenKey =
    document.getElementById("connectPhoneTokenKeyInput")?.value.trim() || "";
  const triggerPrefix =
    document.getElementById("connectPhoneTriggerPrefixInput")?.value.trim() || "";

  if (!appType) {
    closeConnectPhoneModal();
    appendLog(`[${new Date().toLocaleTimeString()}] 请选择一个 App`);
    return;
  }

  closeConnectPhoneModal();
  return withBusy("正在连接手机", "正在把 App 入口交给这个 Agent。", async () => {
    try {
      const result = await invoke("connect_agent_phone_app", {
        agentId: agent.id,
        appType,
        account,
        token,
        appToken,
        botToken,
        appId,
        appSecret,
        botName,
        serverUrl,
        tokenKey,
        triggerPrefix,
      });
      appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
      if (result.success) {
        await syncDashboard();
      }
    } catch (err) {
      appendLog(`[${new Date().toLocaleTimeString()}] 连接手机失败: ${err}`);
    }
  });
}

connectBtn.addEventListener("click", ensureGatewayThenSync);
bootstrapBtn.addEventListener("click", ensureGatewayThenSync);
toggleGatewayBtn.addEventListener("click", toggleGateway);
openChatBtn.addEventListener("click", async () => {
  try {
    const result = await invoke("open_openclaw_chat_window");
    appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
  } catch (err) {
    appendLog(`[${new Date().toLocaleTimeString()}] ${t("openChatFail", { err })}`);
  }
});
installCliBtn.addEventListener("click", async () => {
  try {
    const result = await invoke("launch_openclaw_installer");
    appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
  } catch (err) {
    appendLog(`[${new Date().toLocaleTimeString()}] 打开安装器失败: ${err}`);
  }
});

copyInstallBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    appendLog(`[${new Date().toLocaleTimeString()}] 已复制安装命令`);
  } catch (err) {
    appendLog(`[${new Date().toLocaleTimeString()}] 复制失败: ${err}`);
  }
});

openDocsBtn.addEventListener("click", async () => {
  try {
    const result = await invoke("open_openclaw_install_docs");
    appendLog(`[${new Date().toLocaleTimeString()}] ${result.detail}`);
  } catch (err) {
    appendLog(`[${new Date().toLocaleTimeString()}] 打开文档失败: ${err}`);
  }
});
renameCancelBtn.addEventListener("click", closeRenameModal);
renameSaveBtn.addEventListener("click", submitRenameAgent);
modelCancelBtn.addEventListener("click", closeModelModal);
modelSaveBtn.addEventListener("click", submitModelChange);
deleteCancelBtn.addEventListener("click", closeDeleteModal);
deleteConfirmBtn.addEventListener("click", submitDeleteAgent);
addModelCancelBtn.addEventListener("click", closeAddModelModal);
addModelSaveBtn.addEventListener("click", submitAddModel);
addProviderBtn.addEventListener("click", openAddProviderModal);
addProviderCancelBtn.addEventListener("click", closeAddProviderModal);
addProviderSaveBtn.addEventListener("click", submitAddProvider);
addAgentCancelBtn.addEventListener("click", closeAddAgentModal);
addAgentSaveBtn.addEventListener("click", createAgent);
connectPhoneCancelBtn.addEventListener("click", closeConnectPhoneModal);
connectPhoneConfirmBtn.addEventListener("click", submitConnectPhone);
renameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitRenameAgent();
  } else if (event.key === "Escape") {
    closeRenameModal();
  }
});
modelSelect.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitModelChange();
  } else if (event.key === "Escape") {
    closeModelModal();
  }
});
modelProviderSelect.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitModelChange();
  } else if (event.key === "Escape") {
    closeModelModal();
  }
});
addModelInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitAddModel();
  } else if (event.key === "Escape") {
    closeAddModelModal();
  }
});
addModelNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitAddModel();
  } else if (event.key === "Escape") {
    closeAddModelModal();
  }
});
providerApiKeyInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitAddProvider();
  } else if (event.key === "Escape") {
    closeAddProviderModal();
  }
});
addAgentModelSelect.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    createAgent();
  } else if (event.key === "Escape") {
    closeAddAgentModal();
  }
});
addAgentNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    createAgent();
  } else if (event.key === "Escape") {
    closeAddAgentModal();
  }
});
addAgentProviderSelect.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    createAgent();
  } else if (event.key === "Escape") {
    closeAddAgentModal();
  }
});
connectPhoneAppTypeSelect.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitConnectPhone();
  } else if (event.key === "Escape") {
    closeConnectPhoneModal();
  }
});

window.addEventListener("focus", () => {
  if (!isBusy) syncDashboard();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !isBusy) {
    syncDashboard();
  }
});

const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
if (savedToken) {
  tokenInput.value = savedToken;
}

setMetric(metricDevices, null);
setMetric(metricSessions, null);
setMetric(metricGateway, "-");
applyTranslations();
setConnectionStatus(false, t("checking"));
setBootstrapState("检查本地环境...");
hideSetupBanner();
hideOnboarding();
renderAgentCards([], []);
renderModels(null);
startAutoSync();

loadTokenFromConfig().then(() => {
  ensureGatewayThenSync();
});
