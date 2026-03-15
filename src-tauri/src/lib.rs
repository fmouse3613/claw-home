use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::time::Duration;
use std::{net::TcpStream, thread};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;
use tauri::{AppHandle, Manager, Url, WebviewUrl, WebviewWindowBuilder};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OpenClawRuntimeStatus {
    cli_installed: bool,
    cli_path: Option<String>,
    version: Option<String>,
    gateway_online: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OpenClawCommandResult {
    success: bool,
    action: String,
    detail: String,
}

async fn run_blocking<F, T>(task: F) -> Result<T, String>
where
    F: FnOnce() -> Result<T, String> + Send + 'static,
    T: Send + 'static,
{
    tauri::async_runtime::spawn_blocking(task)
        .await
        .map_err(|err| err.to_string())?
}

#[tauri::command]
fn read_openclaw_gateway_token() -> Result<Option<String>, String> {
    let config_path = openclaw_config_path();
    let content = match fs::read_to_string(&config_path) {
        Ok(text) => text,
        Err(_) => return Ok(None),
    };

    let parsed: Value = json5::from_str(&content).map_err(|err| err.to_string())?;
    let token = parsed
        .get("gateway")
        .and_then(|v| v.get("auth"))
        .and_then(|v| v.get("token"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    Ok(token)
}

#[tauri::command]
async fn inspect_openclaw_runtime() -> Result<OpenClawRuntimeStatus, String> {
    run_blocking(inspect_openclaw_runtime_sync).await
}

fn inspect_openclaw_runtime_sync() -> Result<OpenClawRuntimeStatus, String> {
    let cli_path = find_openclaw_path();
    let version = if cli_path.is_some() {
        run_openclaw_capture(["--version"]).ok()
    } else {
        None
    };

    Ok(OpenClawRuntimeStatus {
        cli_installed: cli_path.is_some(),
        cli_path,
        version,
        gateway_online: gateway_is_online(),
    })
}

#[tauri::command]
async fn ensure_openclaw_gateway() -> Result<OpenClawCommandResult, String> {
    run_blocking(ensure_openclaw_gateway_sync).await
}

fn ensure_openclaw_gateway_sync() -> Result<OpenClawCommandResult, String> {
    if find_openclaw_path().is_none() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "missing-cli".to_string(),
            detail: "openclaw CLI is not installed".to_string(),
        });
    }

    if gateway_is_online() {
        return Ok(OpenClawCommandResult {
            success: true,
            action: "already-online".to_string(),
            detail: "Gateway already online".to_string(),
        });
    }

    if run_openclaw_status(["gateway", "start"]).is_ok() {
        thread::sleep(Duration::from_millis(1200));
        if gateway_is_online() {
            return Ok(OpenClawCommandResult {
                success: true,
                action: "service-start".to_string(),
                detail: "Started gateway service".to_string(),
            });
        }
    }

    if run_openclaw_status(["gateway", "install"]).is_ok()
        && run_openclaw_status(["gateway", "start"]).is_ok()
    {
        thread::sleep(Duration::from_millis(1200));
        if gateway_is_online() {
            return Ok(OpenClawCommandResult {
                success: true,
                action: "install-and-start".to_string(),
                detail: "Installed and started gateway service".to_string(),
            });
        }
    }

    spawn_gateway_run()?;
    for _ in 0..10 {
        thread::sleep(Duration::from_millis(500));
        if gateway_is_online() {
            return Ok(OpenClawCommandResult {
                success: true,
                action: "spawn-run".to_string(),
                detail: "Spawned openclaw gateway run".to_string(),
            });
        }
    }

    Ok(OpenClawCommandResult {
        success: false,
        action: "start-failed".to_string(),
        detail: "Failed to start OpenClaw Gateway".to_string(),
    })
}

#[tauri::command]
fn open_openclaw_install_docs() -> Result<OpenClawCommandResult, String> {
    let status = Command::new("open")
        .arg("https://docs.openclaw.ai/install")
        .status()
        .map_err(|err| err.to_string())?;

    Ok(OpenClawCommandResult {
        success: status.success(),
        action: "open-docs".to_string(),
        detail: if status.success() {
            "Opened OpenClaw install docs".to_string()
        } else {
            format!("open exited with status {}", status)
        },
    })
}

#[tauri::command]
fn launch_openclaw_installer() -> Result<OpenClawCommandResult, String> {
    let installer_cmd =
        "curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash";
    let script = format!(
        "tell application \"Terminal\"\nactivate\ndo script \"{}\"\nend tell",
        installer_cmd.replace('\\', "\\\\").replace('\"', "\\\"")
    );

    let status = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .status()
        .map_err(|err| err.to_string())?;

    Ok(OpenClawCommandResult {
        success: status.success(),
        action: "launch-installer".to_string(),
        detail: if status.success() {
            "Opened Terminal and started the OpenClaw installer".to_string()
        } else {
            format!("osascript exited with status {}", status)
        },
    })
}

#[tauri::command]
fn open_openclaw_chat_window(app: AppHandle) -> Result<OpenClawCommandResult, String> {
    if !gateway_is_online() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "open-chat-window".to_string(),
            detail: "Gateway 未运行，先启动服务再打开聊天窗口。".to_string(),
        });
    }

    if let Some(window) = app.get_webview_window("openclaw-chat") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(OpenClawCommandResult {
            success: true,
            action: "open-chat-window".to_string(),
            detail: "已打开 OpenClaw 聊天窗口。".to_string(),
        });
    }

    let token = read_openclaw_gateway_token()?;
    let chat_url = if let Some(token) = token.filter(|value| !value.trim().is_empty()) {
        Url::parse(&format!(
            "http://127.0.0.1:18789/#token={}",
            urlencoding::encode(&token)
        ))
        .map_err(|err| err.to_string())?
    } else {
        Url::parse("http://127.0.0.1:18789/").map_err(|err| err.to_string())?
    };

    WebviewWindowBuilder::new(
        &app,
        "openclaw-chat",
        WebviewUrl::External(chat_url),
    )
    .title("OpenClaw Chat")
    .inner_size(1200.0, 860.0)
    .min_inner_size(980.0, 720.0)
    .resizable(true)
    .center()
    .build()
    .map_err(|err| err.to_string())?;

    Ok(OpenClawCommandResult {
        success: true,
        action: "open-chat-window".to_string(),
        detail: "已打开 OpenClaw 聊天窗口。".to_string(),
    })
}

#[tauri::command]
async fn list_local_agents() -> Result<Value, String> {
    run_blocking(|| run_openclaw_json(["agents", "list", "--json"])).await
}

#[tauri::command]
async fn list_local_sessions() -> Result<Value, String> {
    run_blocking(|| run_openclaw_json(["sessions", "--all-agents", "--json"])).await
}

#[tauri::command]
async fn list_local_channels() -> Result<Value, String> {
    run_blocking(|| run_openclaw_json(["channels", "list", "--json"])).await
}

#[tauri::command]
async fn read_model_config() -> Result<Value, String> {
    run_blocking(read_model_config_sync).await
}

#[tauri::command]
async fn load_dashboard_data() -> Result<Value, String> {
    run_blocking(load_dashboard_data_sync).await
}

#[tauri::command]
async fn start_openclaw_gateway() -> Result<OpenClawCommandResult, String> {
    run_blocking(start_openclaw_gateway_sync).await
}

fn start_openclaw_gateway_sync() -> Result<OpenClawCommandResult, String> {
    if gateway_is_online() {
        return Ok(OpenClawCommandResult {
            success: true,
            action: "already-online".to_string(),
            detail: "Gateway already online".to_string(),
        });
    }
    ensure_openclaw_gateway_sync()
}

#[tauri::command]
async fn stop_openclaw_gateway() -> Result<OpenClawCommandResult, String> {
    run_blocking(stop_openclaw_gateway_sync).await
}

fn stop_openclaw_gateway_sync() -> Result<OpenClawCommandResult, String> {
    if find_openclaw_path().is_none() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "missing-cli".to_string(),
            detail: "openclaw CLI is not installed".to_string(),
        });
    }

    let stop_output = run_openclaw_capture(["gateway", "stop", "--json"]).ok();
    if !gateway_is_online() {
        return Ok(OpenClawCommandResult {
            success: true,
            action: "gateway-stop".to_string(),
            detail: "Stopped gateway service".to_string(),
        });
    }

    if kill_gateway_listener()? {
        thread::sleep(Duration::from_millis(500));
        return Ok(OpenClawCommandResult {
            success: !gateway_is_online(),
            action: "gateway-stop".to_string(),
            detail: if gateway_is_online() {
                "Tried to stop Gateway listener, but port 18789 is still busy.".to_string()
            } else {
                "Stopped Gateway listener on port 18789.".to_string()
            },
        });
    }

    Ok(OpenClawCommandResult {
        success: false,
        action: "gateway-stop".to_string(),
        detail: stop_output.unwrap_or_else(|| "Failed to stop OpenClaw Gateway".to_string()),
    })
}

#[tauri::command]
async fn create_openclaw_agent(name: String, model: String) -> Result<OpenClawCommandResult, String> {
    run_blocking(move || create_openclaw_agent_sync(name, model)).await
}

fn create_openclaw_agent_sync(name: String, model: String) -> Result<OpenClawCommandResult, String> {
    if find_openclaw_path().is_none() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "missing-cli".to_string(),
            detail: "openclaw CLI is not installed".to_string(),
        });
    }

    let trimmed_name = name.trim();
    if trimmed_name.is_empty() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "create-agent".to_string(),
            detail: "Agent name is required".to_string(),
        });
    }

    let workspace = default_agent_workspace(trimmed_name)?;
    let cli = find_openclaw_path().ok_or_else(|| "openclaw CLI not found".to_string())?;
    let output = openclaw_command(&cli)
        .args([
            "agents",
            "add",
            trimmed_name,
            "--model",
            model.trim(),
            "--workspace",
            workspace.to_string_lossy().as_ref(),
            "--non-interactive",
            "--json",
        ])
        .output()
        .map_err(|err| err.to_string())?;

    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();

    Ok(OpenClawCommandResult {
        success: output.status.success(),
        action: "create-agent".to_string(),
        detail: if output.status.success() {
            format!("Created agent {}", trimmed_name)
        } else if !stderr.is_empty() {
            stderr
        } else if !stdout.is_empty() {
            stdout
        } else {
            format!("Failed to create agent {}", trimmed_name)
        },
    })
}

#[tauri::command]
async fn bind_agent_channel(agent_id: String, binding: String) -> Result<OpenClawCommandResult, String> {
    run_blocking(move || bind_agent_channel_sync(agent_id, binding)).await
}

fn bind_agent_channel_sync(agent_id: String, binding: String) -> Result<OpenClawCommandResult, String> {
    if find_openclaw_path().is_none() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "missing-cli".to_string(),
            detail: "openclaw CLI is not installed".to_string(),
        });
    }

    let cli = find_openclaw_path().ok_or_else(|| "openclaw CLI not found".to_string())?;
    let status = openclaw_command(&cli)
        .args([
            "agents",
            "bind",
            "--agent",
            agent_id.trim(),
            "--bind",
            binding.trim(),
            "--json",
        ])
        .status()
        .map_err(|err| err.to_string())?;

    Ok(OpenClawCommandResult {
        success: status.success(),
        action: "bind-channel".to_string(),
        detail: if status.success() {
            format!("Bound {} to {}", binding.trim(), agent_id.trim())
        } else {
            format!("Failed to bind {} to {}", binding.trim(), agent_id.trim())
        },
    })
}

#[tauri::command]
async fn connect_agent_phone_app(
    agent_id: String,
    app_type: String,
    account: String,
    token: String,
    app_token: String,
    bot_token: String,
    app_id: String,
    app_secret: String,
    bot_name: String,
    server_url: String,
    token_key: String,
    trigger_prefix: String,
) -> Result<OpenClawCommandResult, String> {
    run_blocking(move || {
        connect_agent_phone_app_sync(
            agent_id,
            app_type,
            account,
            token,
            app_token,
            bot_token,
            app_id,
            app_secret,
            bot_name,
            server_url,
            token_key,
            trigger_prefix,
        )
    })
    .await
}

fn connect_agent_phone_app_sync(
    agent_id: String,
    app_type: String,
    account: String,
    token: String,
    app_token: String,
    bot_token: String,
    app_id: String,
    app_secret: String,
    bot_name: String,
    server_url: String,
    token_key: String,
    trigger_prefix: String,
) -> Result<OpenClawCommandResult, String> {
    if find_openclaw_path().is_none() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "missing-cli".to_string(),
            detail: "openclaw CLI is not installed".to_string(),
        });
    }

    let app = app_type.trim().to_lowercase();
    let agent = agent_id.trim();
    let account = if account.trim().is_empty() {
        "default".to_string()
    } else {
        account.trim().to_string()
    };
    let cli = find_openclaw_path().ok_or_else(|| "openclaw CLI not found".to_string())?;

    match app.as_str() {
        "telegram" | "discord" => {
            if token.trim().is_empty() {
                return Ok(OpenClawCommandResult {
                    success: false,
                    action: "connect-phone".to_string(),
                    detail: format!("{} token is required", app),
                });
            }

            let add_status = openclaw_command(&cli)
                .args([
                    "channels",
                    "add",
                    "--channel",
                    &app,
                    "--account",
                    &account,
                    "--token",
                    token.trim(),
                ])
                .status()
                .map_err(|err| err.to_string())?;

            if !add_status.success() {
                return Ok(OpenClawCommandResult {
                    success: false,
                    action: "connect-phone".to_string(),
                    detail: format!("Failed to configure {} channel", app),
                });
            }

            return bind_agent_channel_sync(agent.to_string(), format!("{}:{}", app, account));
        }
        "slack" => {
            if app_token.trim().is_empty() || bot_token.trim().is_empty() {
                return Ok(OpenClawCommandResult {
                    success: false,
                    action: "connect-phone".to_string(),
                    detail: "Slack App Token and Bot Token are required".to_string(),
                });
            }

            let add_status = openclaw_command(&cli)
                .args([
                    "channels",
                    "add",
                    "--channel",
                    "slack",
                    "--account",
                    &account,
                    "--app-token",
                    app_token.trim(),
                    "--bot-token",
                    bot_token.trim(),
                ])
                .status()
                .map_err(|err| err.to_string())?;

            if !add_status.success() {
                return Ok(OpenClawCommandResult {
                    success: false,
                    action: "connect-phone".to_string(),
                    detail: "Failed to configure Slack channel".to_string(),
                });
            }

            return bind_agent_channel_sync(agent.to_string(), format!("slack:{}", account));
        }
        "feishu" => {
            if app_id.trim().is_empty() || app_secret.trim().is_empty() {
                return Ok(OpenClawCommandResult {
                    success: false,
                    action: "connect-phone".to_string(),
                    detail: "Feishu App ID and App Secret are required".to_string(),
                });
            }

            let config_path = openclaw_config_path();
            let content = fs::read_to_string(&config_path).map_err(|err| err.to_string())?;
            let mut parsed: Value = json5::from_str(&content).map_err(|err| err.to_string())?;

            let root = parsed
                .as_object_mut()
                .ok_or_else(|| "OpenClaw config root must be an object".to_string())?;

            let channels = root
                .entry("channels".to_string())
                .or_insert_with(|| serde_json::json!({}))
                .as_object_mut()
                .ok_or_else(|| "channels config must be an object".to_string())?;

            let feishu = channels
                .entry("feishu".to_string())
                .or_insert_with(|| serde_json::json!({}))
                .as_object_mut()
                .ok_or_else(|| "channels.feishu config must be an object".to_string())?;

            feishu.insert("enabled".to_string(), serde_json::json!(true));
            if !feishu.contains_key("dmPolicy") {
                feishu.insert("dmPolicy".to_string(), serde_json::json!("pairing"));
            }

            let accounts = feishu
                .entry("accounts".to_string())
                .or_insert_with(|| serde_json::json!({}))
                .as_object_mut()
                .ok_or_else(|| "channels.feishu.accounts must be an object".to_string())?;

            let mut account_config = serde_json::Map::new();
            account_config.insert("appId".to_string(), serde_json::json!(app_id.trim()));
            account_config.insert(
                "appSecret".to_string(),
                serde_json::json!(app_secret.trim()),
            );
            if !bot_name.trim().is_empty() {
                account_config.insert("botName".to_string(), serde_json::json!(bot_name.trim()));
            }
            accounts.insert(account.to_string(), Value::Object(account_config));

            let pretty = serde_json::to_string_pretty(&parsed).map_err(|err| err.to_string())?;
            fs::write(&config_path, pretty).map_err(|err| err.to_string())?;

            let _ = stop_openclaw_gateway_sync();
            let restart = start_openclaw_gateway_sync()?;
            if !restart.success {
                return Ok(OpenClawCommandResult {
                    success: false,
                    action: "connect-phone".to_string(),
                    detail: "Saved Feishu config, but failed to restart Gateway".to_string(),
                });
            }

            let bind_result =
                bind_agent_channel_sync(agent.to_string(), format!("feishu:{}", account))?;
            if bind_result.success {
                return Ok(OpenClawCommandResult {
                    success: true,
                    action: "connect-phone".to_string(),
                    detail: format!("已配置飞书账号 {}，并绑定到 {}", account, agent),
                });
            }

            return Ok(bind_result);
        }
        "wechat" => {
            if server_url.trim().is_empty() || token_key.trim().is_empty() {
                return Ok(OpenClawCommandResult {
                    success: false,
                    action: "connect-phone".to_string(),
                    detail: "WeChatPadPro 地址和 TOKEN_KEY 是必填的".to_string(),
                });
            }

            let prefix = if trigger_prefix.trim().is_empty() {
                "@ai"
            } else {
                trigger_prefix.trim()
            };

            let escaped_cli = cli.replace('\\', "\\\\").replace('\"', "\\\"");
            let escaped_server = server_url.trim().replace('\\', "\\\\").replace('\"', "\\\"");
            let escaped_token = token_key.trim().replace('\\', "\\\\").replace('\"', "\\\"");
            let escaped_prefix = prefix.replace('\\', "\\\\").replace('\"', "\\\"");
            let escaped_account = account.replace('\\', "\\\\").replace('\"', "\\\"");
            let escaped_agent = agent.replace('\\', "\\\\").replace('\"', "\\\"");

            let script_body = format!(
                "{cli} plugins install @icesword760/openclaw-wechat && \
{cli} config set channels.wechat.enabled true && \
{cli} config set channels.wechat.serverUrl \\\"{server}\\\" && \
{cli} config set channels.wechat.token \\\"{token}\\\" && \
{cli} config set channels.wechat.triggerPrefix \\\"{prefix}\\\" && \
{cli} config set session.dmScope per-peer && \
{cli} agents bind --agent \\\"{agent}\\\" --bind \\\"wechat:{account}\\\" && \
{cli} gateway",
                cli = escaped_cli,
                server = escaped_server,
                token = escaped_token,
                prefix = escaped_prefix,
                agent = escaped_agent,
                account = escaped_account,
            );

            let script = format!(
                "tell application \"Terminal\"\nactivate\ndo script \"{}\"\nend tell",
                script_body
            );

            let status = Command::new("osascript")
                .arg("-e")
                .arg(script)
                .status()
                .map_err(|err| err.to_string())?;

            if !status.success() {
                return Ok(OpenClawCommandResult {
                    success: false,
                    action: "connect-phone".to_string(),
                    detail: "Failed to open WeChat plugin setup terminal".to_string(),
                });
            }

            return Ok(OpenClawCommandResult {
                success: true,
                action: "connect-phone".to_string(),
                detail: "已打开终端开始安装微信社区插件并配置登录流程。按终端提示完成扫码后，微信入口就会接到这个 Agent。".to_string(),
            });
        }
        "whatsapp" => {
            let script = format!(
                "tell application \"Terminal\"\nactivate\ndo script \"{}\"\nend tell",
                format!(
                    "{} channels login --channel whatsapp --account {}",
                    cli.replace('\\', "\\\\").replace('\"', "\\\""),
                    account.replace('\\', "\\\\").replace('\"', "\\\"")
                )
            );

            let status = Command::new("osascript")
                .arg("-e")
                .arg(script)
                .status()
                .map_err(|err| err.to_string())?;

            if !status.success() {
                return Ok(OpenClawCommandResult {
                    success: false,
                    action: "connect-phone".to_string(),
                    detail: "Failed to open WhatsApp login terminal".to_string(),
                });
            }

            let _ = bind_agent_channel_sync(agent.to_string(), format!("whatsapp:{}", account));

            return Ok(OpenClawCommandResult {
                success: true,
                action: "connect-phone".to_string(),
                detail: "Opened WhatsApp login terminal. Scan the QR code, then come back and the Agent will use this account.".to_string(),
            });
        }
        _ => {
            return Ok(OpenClawCommandResult {
                success: false,
                action: "connect-phone".to_string(),
                detail: format!("Unsupported app type: {}", app),
            });
        }
    }
}

#[tauri::command]
async fn rename_openclaw_agent(agent_id: String, name: String) -> Result<OpenClawCommandResult, String> {
    run_blocking(move || rename_openclaw_agent_sync(agent_id, name)).await
}

fn rename_openclaw_agent_sync(agent_id: String, name: String) -> Result<OpenClawCommandResult, String> {
    if find_openclaw_path().is_none() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "missing-cli".to_string(),
            detail: "openclaw CLI is not installed".to_string(),
        });
    }

    let trimmed_name = name.trim();
    if trimmed_name.is_empty() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "rename-agent".to_string(),
            detail: "Agent name is required".to_string(),
        });
    }

    let cli = find_openclaw_path().ok_or_else(|| "openclaw CLI not found".to_string())?;
    let status = openclaw_command(&cli)
        .args([
            "agents",
            "set-identity",
            "--agent",
            agent_id.trim(),
            "--name",
            trimmed_name,
            "--json",
        ])
        .status()
        .map_err(|err| err.to_string())?;

    Ok(OpenClawCommandResult {
        success: status.success(),
        action: "rename-agent".to_string(),
        detail: if status.success() {
            format!("Renamed agent {} to {}", agent_id.trim(), trimmed_name)
        } else {
            format!("Failed to rename agent {}", agent_id.trim())
        },
    })
}

#[tauri::command]
async fn update_openclaw_agent_model(agent_id: String, model: String) -> Result<OpenClawCommandResult, String> {
    run_blocking(move || update_openclaw_agent_model_sync(agent_id, model)).await
}

fn update_openclaw_agent_model_sync(agent_id: String, model: String) -> Result<OpenClawCommandResult, String> {
    if find_openclaw_path().is_none() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "missing-cli".to_string(),
            detail: "openclaw CLI is not installed".to_string(),
        });
    }

    let trimmed_model = model.trim();
    if trimmed_model.is_empty() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "update-agent-model".to_string(),
            detail: "Model is required".to_string(),
        });
    }

    let agents = run_openclaw_json(["config", "get", "agents", "--json"])?;
    let list = agents
        .get("list")
        .and_then(|value| value.as_array())
        .ok_or_else(|| "OpenClaw agents config is missing list".to_string())?;

    let index = list
        .iter()
        .position(|item| item.get("id").and_then(|value| value.as_str()) == Some(agent_id.trim()))
        .ok_or_else(|| format!("Agent {} not found in config", agent_id.trim()))?;

    let path = format!("agents.list[{}].model", index);
    let cli = find_openclaw_path().ok_or_else(|| "openclaw CLI not found".to_string())?;
    let set_status = openclaw_command(&cli)
        .args(["config", "set", &path, trimmed_model])
        .status()
        .map_err(|err| err.to_string())?;

    if !set_status.success() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "update-agent-model".to_string(),
            detail: format!("Failed to update model for {}", agent_id.trim()),
        });
    }

    let _ = stop_openclaw_gateway_sync();
    let restart = start_openclaw_gateway_sync()?;
    Ok(OpenClawCommandResult {
        success: restart.success,
        action: "update-agent-model".to_string(),
        detail: if restart.success {
            format!("Updated model for {} and restarted Gateway", agent_id.trim())
        } else {
            format!("Updated model for {}, but Gateway restart failed", agent_id.trim())
        },
    })
}

#[tauri::command]
async fn delete_openclaw_agent(agent_id: String) -> Result<OpenClawCommandResult, String> {
    run_blocking(move || delete_openclaw_agent_sync(agent_id)).await
}

fn delete_openclaw_agent_sync(agent_id: String) -> Result<OpenClawCommandResult, String> {
    if find_openclaw_path().is_none() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "missing-cli".to_string(),
            detail: "openclaw CLI is not installed".to_string(),
        });
    }

    if agent_id.trim() == "main" {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "delete-agent".to_string(),
            detail: "main agent cannot be deleted".to_string(),
        });
    }

    let cli = find_openclaw_path().ok_or_else(|| "openclaw CLI not found".to_string())?;
    let status = openclaw_command(&cli)
        .args(["agents", "delete", agent_id.trim(), "--force", "--json"])
        .status()
        .map_err(|err| err.to_string())?;

    Ok(OpenClawCommandResult {
        success: status.success(),
        action: "delete-agent".to_string(),
        detail: if status.success() {
            format!("Deleted agent {}", agent_id.trim())
        } else {
            format!("Failed to delete agent {}", agent_id.trim())
        },
    })
}

#[tauri::command]
async fn add_openclaw_model(
    provider_id: String,
    model_id: String,
    display_name: String,
) -> Result<OpenClawCommandResult, String> {
    run_blocking(move || add_openclaw_model_sync(provider_id, model_id, display_name)).await
}

fn add_openclaw_model_sync(
    provider_id: String,
    model_id: String,
    display_name: String,
) -> Result<OpenClawCommandResult, String> {
    let provider = provider_id.trim();
    let model = model_id.trim();
    let name = display_name.trim();
    if provider.is_empty() || model.is_empty() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "add-model".to_string(),
            detail: "Provider and model ID are required".to_string(),
        });
    }

    let config_path = openclaw_config_path();
    let content = fs::read_to_string(&config_path).map_err(|err| err.to_string())?;
    let mut parsed: Value = json5::from_str(&content).map_err(|err| err.to_string())?;

    let root = parsed
        .as_object_mut()
        .ok_or_else(|| "OpenClaw config root must be an object".to_string())?;

    let models_root = root
        .entry("models".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "models config must be an object".to_string())?;

    let providers = models_root
        .entry("providers".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "models.providers must be an object".to_string())?;

    let provider_entry = providers
        .get_mut(provider)
        .and_then(|value| value.as_object_mut())
        .ok_or_else(|| format!("Provider {} not found", provider))?;

    let provider_api = provider_entry
        .get("api")
        .and_then(|value| value.as_str())
        .unwrap_or("openai-completions")
        .to_string();

    let provider_models = provider_entry
        .entry("models".to_string())
        .or_insert_with(|| serde_json::json!([]))
        .as_array_mut()
        .ok_or_else(|| "provider models must be a list".to_string())?;

    let exists = provider_models.iter().any(|item| {
        item.get("id").and_then(|value| value.as_str()) == Some(model)
    });

    if !exists {
        provider_models.push(serde_json::json!({
            "id": model,
            "name": if name.is_empty() { model } else { name },
            "reasoning": false,
            "input": ["text"],
            "cost": {
                "input": 0,
                "output": 0,
                "cacheRead": 0,
                "cacheWrite": 0
            },
            "contextWindow": 16000,
            "maxTokens": 4096,
            "api": provider_api
        }));
    }

    let agents_models = root
        .entry("agents".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "agents config must be an object".to_string())?
        .entry("defaults".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "agents.defaults config must be an object".to_string())?
        .entry("models".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "agents.defaults.models must be an object".to_string())?;

    let compound_id = format!("{}/{}", provider, model);
    if !agents_models.contains_key(&compound_id) {
        agents_models.insert(compound_id.clone(), serde_json::json!({}));
    }

    let pretty = serde_json::to_string_pretty(&parsed).map_err(|err| err.to_string())?;
    fs::write(&config_path, pretty).map_err(|err| err.to_string())?;

    Ok(OpenClawCommandResult {
        success: true,
        action: "add-model".to_string(),
        detail: format!("Added model {} under provider {}", model, provider),
    })
}

#[tauri::command]
async fn add_openclaw_provider(
    alias: String,
    base_url: String,
    api_key: String,
    api_type: String,
) -> Result<OpenClawCommandResult, String> {
    run_blocking(move || add_openclaw_provider_sync(alias, base_url, api_key, api_type)).await
}

fn add_openclaw_provider_sync(
    alias: String,
    base_url: String,
    api_key: String,
    api_type: String,
) -> Result<OpenClawCommandResult, String> {
    let alias = alias.trim();
    let base_url = base_url.trim();
    let api_key = api_key.trim();
    let api_type = api_type.trim();

    if alias.is_empty() || base_url.is_empty() || api_key.is_empty() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "add-provider".to_string(),
            detail: "Alias, Base URL and API Key are required".to_string(),
        });
    }

    let config_path = openclaw_config_path();
    let content = fs::read_to_string(&config_path).map_err(|err| err.to_string())?;
    let mut parsed: Value = json5::from_str(&content).map_err(|err| err.to_string())?;

    let providers = parsed
        .as_object_mut()
        .ok_or_else(|| "OpenClaw config root must be an object".to_string())?
        .entry("models".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "models config must be an object".to_string())?
        .entry("providers".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "models.providers must be an object".to_string())?;

    providers.insert(
        alias.to_string(),
        serde_json::json!({
            "baseUrl": base_url,
            "apiKey": api_key,
            "api": if api_type.is_empty() { "openai-completions" } else { api_type },
            "models": []
        }),
    );

    let pretty = serde_json::to_string_pretty(&parsed).map_err(|err| err.to_string())?;
    fs::write(&config_path, pretty).map_err(|err| err.to_string())?;

    Ok(OpenClawCommandResult {
        success: true,
        action: "add-provider".to_string(),
        detail: format!("Added provider {}", alias),
    })
}

#[tauri::command]
async fn delete_openclaw_provider(provider_id: String) -> Result<OpenClawCommandResult, String> {
    run_blocking(move || delete_openclaw_provider_sync(provider_id)).await
}

fn delete_openclaw_provider_sync(provider_id: String) -> Result<OpenClawCommandResult, String> {
    let provider = provider_id.trim();
    if provider.is_empty() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "delete-provider".to_string(),
            detail: "Provider ID is required".to_string(),
        });
    }

    let config_path = openclaw_config_path();
    let content = fs::read_to_string(&config_path).map_err(|err| err.to_string())?;
    let mut parsed: Value = json5::from_str(&content).map_err(|err| err.to_string())?;

    let root = parsed
        .as_object_mut()
        .ok_or_else(|| "OpenClaw config root must be an object".to_string())?;

    let providers = root
        .entry("models".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "models config must be an object".to_string())?
        .entry("providers".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "models.providers must be an object".to_string())?;

    let removed = providers.remove(provider).is_some();

    let registered_models = root
        .entry("agents".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "agents config must be an object".to_string())?
        .entry("defaults".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "agents.defaults config must be an object".to_string())?
        .entry("models".to_string())
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or_else(|| "agents.defaults.models must be an object".to_string())?;

    let prefix = format!("{}/", provider);
    registered_models.retain(|key, _| !key.starts_with(&prefix));

    let pretty = serde_json::to_string_pretty(&parsed).map_err(|err| err.to_string())?;
    fs::write(&config_path, pretty).map_err(|err| err.to_string())?;

    Ok(OpenClawCommandResult {
        success: removed,
        action: "delete-provider".to_string(),
        detail: if removed {
            format!("Deleted provider {}", provider)
        } else {
            format!("Provider {} not found", provider)
        },
    })
}

#[tauri::command]
fn configure_discord_channel(token: String, account_id: Option<String>) -> Result<OpenClawCommandResult, String> {
    if find_openclaw_path().is_none() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "missing-cli".to_string(),
            detail: "openclaw CLI is not installed".to_string(),
        });
    }

    let trimmed_token = token.trim();
    if trimmed_token.is_empty() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "configure-discord".to_string(),
            detail: "Discord bot token is required".to_string(),
        });
    }

    let account = account_id
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or("default");

    let cli = find_openclaw_path().ok_or_else(|| "openclaw CLI not found".to_string())?;
    let status = openclaw_command(&cli)
        .args([
            "channels",
            "add",
            "--channel",
            "discord",
            "--account",
            account,
            "--token",
            trimmed_token,
        ])
        .status()
        .map_err(|err| err.to_string())?;

    Ok(OpenClawCommandResult {
        success: status.success(),
        action: "configure-discord".to_string(),
        detail: if status.success() {
            format!("Configured Discord channel ({})", account)
        } else {
            format!("Failed to configure Discord channel ({})", account)
        },
    })
}

#[tauri::command]
fn open_discord_invite_url(client_id: String) -> Result<OpenClawCommandResult, String> {
    let trimmed = client_id.trim();
    if trimmed.is_empty() {
        return Ok(OpenClawCommandResult {
            success: false,
            action: "open-discord-invite".to_string(),
            detail: "Discord client ID is required".to_string(),
        });
    }

    let invite_url = format!(
        "https://discord.com/oauth2/authorize?client_id={}&scope=bot%20applications.commands&permissions=274877975552",
        trimmed
    );

    let status = Command::new("open")
        .arg(&invite_url)
        .status()
        .map_err(|err| err.to_string())?;

    Ok(OpenClawCommandResult {
        success: status.success(),
        action: "open-discord-invite".to_string(),
        detail: if status.success() {
            "Opened Discord bot invite URL".to_string()
        } else {
            format!("open exited with status {}", status)
        },
    })
}

fn openclaw_config_path() -> PathBuf {
    let mut path = if let Ok(custom) = std::env::var("OPENCLAW_CONFIG_PATH") {
        PathBuf::from(custom)
    } else if let Ok(home) = std::env::var("HOME") {
        PathBuf::from(home)
    } else {
        PathBuf::from(".")
    };

    if path.file_name().map(|name| name == "openclaw.json") == Some(true) {
        return path;
    }

    path.push(".openclaw");
    path.push("openclaw.json");
    path
}

fn read_model_config_sync() -> Result<Value, String> {
    let agents = run_openclaw_json(["config", "get", "agents", "--json"])?;
    let defaults = run_openclaw_json(["config", "get", "agents.defaults", "--json"])?;
    let catalog = run_openclaw_json(["config", "get", "models", "--json"])?;
    Ok(serde_json::json!({
        "agents": agents,
        "defaults": defaults,
        "catalog": catalog
    }))
}

fn load_dashboard_data_sync() -> Result<Value, String> {
    let runtime = inspect_openclaw_runtime_sync()?;
    let agents = if runtime.cli_installed {
        run_openclaw_json(["agents", "list", "--json"]).unwrap_or_else(|_| serde_json::json!([]))
    } else {
        serde_json::json!([])
    };
    let sessions = if runtime.cli_installed {
        run_openclaw_json(["sessions", "--all-agents", "--json"])
            .unwrap_or_else(|_| serde_json::json!({ "sessions": [] }))
    } else {
        serde_json::json!({ "sessions": [] })
    };
    let channels = if runtime.cli_installed {
        run_openclaw_json(["channels", "list", "--json"])
            .unwrap_or_else(|_| serde_json::json!({ "chat": {}, "auth": [] }))
    } else {
        serde_json::json!({ "chat": {}, "auth": [] })
    };
    let models = if runtime.cli_installed {
        read_model_config_sync().unwrap_or_else(|_| serde_json::json!({}))
    } else {
        serde_json::json!({})
    };
    let token_usage = scan_session_jsonl_token_usage_sync()
        .unwrap_or_else(|_| serde_json::json!({ "agents": {}, "hasTrackedData": false }));
    let agent_activity = scan_agent_activity_sync(runtime.gateway_online)
        .unwrap_or_else(|_| serde_json::json!({ "agents": {} }));

    Ok(serde_json::json!({
        "runtime": runtime,
        "agents": agents,
        "sessions": sessions,
        "channels": channels,
        "models": models,
        "tokenUsage": token_usage,
        "agentActivity": agent_activity,
    }))
}

fn scan_agent_activity_sync(gateway_online: bool) -> Result<Value, String> {
    let home = std::env::var("HOME").map_err(|err| err.to_string())?;
    let agents_root = PathBuf::from(home).join(".openclaw/agents");
    if !agents_root.exists() {
        return Ok(serde_json::json!({ "agents": {} }));
    }

    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_millis() as u64;

    let mut agent_map = serde_json::Map::new();
    for agent_entry in fs::read_dir(&agents_root).map_err(|err| err.to_string())? {
        let agent_entry = match agent_entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };
        let agent_id = agent_entry.file_name().to_string_lossy().to_string();
        let sessions_dir = agent_entry.path().join("sessions");
        if !sessions_dir.is_dir() {
            continue;
        }

        let mut latest_ts = 0_u64;
        let mut latest_kind = "idle".to_string();

        for session_file in fs::read_dir(&sessions_dir).map_err(|err| err.to_string())? {
            let session_file = match session_file {
                Ok(entry) => entry,
                Err(_) => continue,
            };
            let path = session_file.path();
            if path.extension().and_then(|ext| ext.to_str()) != Some("jsonl") {
                continue;
            }

            let content = match fs::read_to_string(&path) {
                Ok(text) => text,
                Err(_) => continue,
            };

            for line in content.lines() {
                if line.trim().is_empty() {
                    continue;
                }
                let record: Value = match serde_json::from_str(line) {
                    Ok(value) => value,
                    Err(_) => continue,
                };

                let record_ts = record
                    .get("message")
                    .and_then(|value| value.get("timestamp"))
                    .and_then(|value| value.as_u64())
                    .or_else(|| record.get("timestamp").and_then(|value| value.as_u64()))
                    .unwrap_or(0);
                if record_ts < latest_ts {
                    continue;
                }

                let kind = classify_activity_record(&record);
                if kind == "ignore" {
                    continue;
                }

                latest_ts = record_ts;
                latest_kind = kind.to_string();
            }
        }

        let activity = summarize_agent_activity(gateway_online, now_ms, latest_ts, &latest_kind);
        agent_map.insert(agent_id, activity);
    }

    Ok(serde_json::json!({ "agents": agent_map }))
}

fn classify_activity_record(record: &Value) -> &'static str {
    let message = match record.get("message") {
        Some(value) => value,
        None => return "ignore",
    };

    if message.get("errorMessage").is_some() {
        return "error";
    }

    match message.get("role").and_then(|value| value.as_str()) {
        Some("toolResult") => "tool",
        Some("assistant") => {
            if message
                .get("stopReason")
                .and_then(|value| value.as_str())
                == Some("error")
            {
                return "error";
            }

            let content = message
                .get("content")
                .and_then(|value| value.as_array())
                .cloned()
                .unwrap_or_default();

            if content.iter().any(|item| item.get("type").and_then(|value| value.as_str()) == Some("toolCall"))
                || message.get("stopReason").and_then(|value| value.as_str()) == Some("toolUse")
            {
                return "tool";
            }

            if content.iter().any(|item| item.get("type").and_then(|value| value.as_str()) == Some("thinking")) {
                return "thinking";
            }

            "assistant"
        }
        _ => "ignore",
    }
}

fn summarize_agent_activity(
    gateway_online: bool,
    now_ms: u64,
    latest_ts: u64,
    latest_kind: &str,
) -> Value {
    if !gateway_online {
        return serde_json::json!({
            "status": "offline",
            "label": "睡着了",
            "tone": "muted",
            "updatedAt": latest_ts
        });
    }

    if latest_ts == 0 {
        return serde_json::json!({
            "status": "idle",
            "label": "摸鱼中",
            "tone": "neutral",
            "updatedAt": latest_ts
        });
    }

    let age_ms = now_ms.saturating_sub(latest_ts);
    let (status, label, tone) = if latest_kind == "error" && age_ms <= 10 * 60 * 1000 {
        ("error", "翻车了", "danger")
    } else if latest_kind == "tool" && age_ms <= 90 * 1000 {
        ("working", "打工中", "accent")
    } else if latest_kind == "thinking" && age_ms <= 90 * 1000 {
        ("thinking", "动脑中", "warning")
    } else if latest_kind == "assistant" && age_ms <= 45 * 1000 {
        ("replying", "回复中", "accent")
    } else if age_ms <= 5 * 60 * 1000 {
        ("done", "刚下班", "success")
    } else {
        ("idle", "摸鱼中", "neutral")
    };

    serde_json::json!({
        "status": status,
        "label": label,
        "tone": tone,
        "updatedAt": latest_ts
    })
}

fn scan_session_jsonl_token_usage_sync() -> Result<Value, String> {
    let home = std::env::var("HOME").map_err(|err| err.to_string())?;
    let agents_root = PathBuf::from(home).join(".openclaw/agents");
    if !agents_root.exists() {
        return Ok(serde_json::json!({ "agents": {}, "hasTrackedData": false }));
    }

    let mut agent_map = serde_json::Map::new();

    for agent_entry in fs::read_dir(&agents_root).map_err(|err| err.to_string())? {
        let agent_entry = match agent_entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };
        let agent_id = agent_entry.file_name().to_string_lossy().to_string();
        let sessions_dir = agent_entry.path().join("sessions");
        if !sessions_dir.is_dir() {
            continue;
        }

        let mut total_tokens = 0_u64;
        let mut tracked_messages = 0_u64;
        let mut tracked_sessions = 0_u64;

        for session_file in fs::read_dir(&sessions_dir).map_err(|err| err.to_string())? {
            let session_file = match session_file {
                Ok(entry) => entry,
                Err(_) => continue,
            };
            let path = session_file.path();
            if path.extension().and_then(|ext| ext.to_str()) != Some("jsonl") {
                continue;
            }

            let content = match fs::read_to_string(&path) {
                Ok(text) => text,
                Err(_) => continue,
            };

            let mut session_has_usage = false;
            for line in content.lines() {
                if line.trim().is_empty() {
                    continue;
                }
                let record: Value = match serde_json::from_str(line) {
                    Ok(value) => value,
                    Err(_) => continue,
                };

                let message = match record.get("message") {
                    Some(value) => value,
                    None => continue,
                };
                if message.get("role").and_then(|value| value.as_str()) != Some("assistant") {
                    continue;
                }

                let usage = match message.get("usage") {
                    Some(value) => value,
                    None => continue,
                };
                let line_tokens = usage
                    .get("totalTokens")
                    .and_then(|value| value.as_u64())
                    .or_else(|| {
                        let input = usage.get("input").and_then(|value| value.as_u64()).unwrap_or(0);
                        let output = usage.get("output").and_then(|value| value.as_u64()).unwrap_or(0);
                        let total = input + output;
                        if total > 0 { Some(total) } else { None }
                    });

                if let Some(tokens) = line_tokens {
                    total_tokens = total_tokens.saturating_add(tokens);
                    tracked_messages = tracked_messages.saturating_add(1);
                    session_has_usage = true;
                }
            }

            if session_has_usage {
                tracked_sessions = tracked_sessions.saturating_add(1);
            }
        }

        if tracked_messages > 0 {
            agent_map.insert(
                agent_id,
                serde_json::json!({
                    "totalTokens": total_tokens,
                    "trackedMessages": tracked_messages,
                    "trackedSessions": tracked_sessions,
                    "source": "session-jsonl"
                }),
            );
        }
    }

    let has_tracked_data = !agent_map.is_empty();
    Ok(serde_json::json!({
        "agents": agent_map,
        "hasTrackedData": has_tracked_data
    }))
}

fn find_openclaw_path() -> Option<String> {
    if let Ok(path) = std::env::var("OPENCLAW_BIN") {
        if !path.trim().is_empty() {
            return Some(path);
        }
    }

    for candidate in fallback_openclaw_candidates() {
        if candidate.is_file() {
            return Some(candidate.to_string_lossy().to_string());
        }
    }

    let output = Command::new("which").arg("openclaw").output().ok()?;
    if !output.status.success() {
        return None;
    }

    let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if path.is_empty() {
        None
    } else {
        Some(path)
    }
}

fn fallback_openclaw_candidates() -> Vec<PathBuf> {
    let mut candidates = vec![
        PathBuf::from("/opt/homebrew/bin/openclaw"),
        PathBuf::from("/usr/local/bin/openclaw"),
        PathBuf::from("/usr/bin/openclaw"),
    ];

    if let Ok(home) = std::env::var("HOME") {
        let home = PathBuf::from(home);
        candidates.push(home.join(".local/bin/openclaw"));
        candidates.push(home.join(".npm-global/bin/openclaw"));

        let nvm_dir = home.join(".nvm/versions/node");
        if let Ok(entries) = fs::read_dir(nvm_dir) {
            let mut versions: Vec<PathBuf> = entries
                .flatten()
                .map(|entry| entry.path().join("bin/openclaw"))
                .collect();
            versions.sort();
            versions.reverse();
            candidates.extend(versions);
        }
    }

    candidates
}

fn run_openclaw_capture<const N: usize>(args: [&str; N]) -> Result<String, String> {
    let cli = find_openclaw_path().ok_or_else(|| "openclaw CLI not found".to_string())?;
    let output = openclaw_command(&cli)
        .args(args)
        .output()
        .map_err(|err| err.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }
    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

fn run_openclaw_json<const N: usize>(args: [&str; N]) -> Result<Value, String> {
    let output = run_openclaw_capture(args)?;
    serde_json::from_str(&output).map_err(|err| err.to_string())
}

fn run_openclaw_status<const N: usize>(args: [&str; N]) -> Result<(), String> {
    let cli = find_openclaw_path().ok_or_else(|| "openclaw CLI not found".to_string())?;
    let status = openclaw_command(&cli)
        .args(args)
        .status()
        .map_err(|err| err.to_string())?;
    if status.success() {
        Ok(())
    } else {
        Err(format!("command failed with status {}", status))
    }
}

fn kill_gateway_listener() -> Result<bool, String> {
    let output = Command::new("lsof")
        .args(["-ti", "tcp:18789"])
        .output()
        .map_err(|err| err.to_string())?;
    if !output.status.success() && output.stdout.is_empty() {
        return Ok(false);
    }

    let pids: Vec<String> = String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .map(ToOwned::to_owned)
        .collect();

    if pids.is_empty() {
        return Ok(false);
    }

    for pid in &pids {
        let _ = Command::new("kill").args(["-TERM", pid]).status();
    }
    thread::sleep(Duration::from_millis(500));

    if gateway_is_online() {
        for pid in &pids {
            let _ = Command::new("kill").args(["-KILL", pid]).status();
        }
    }

    Ok(true)
}

fn spawn_gateway_run() -> Result<(), String> {
    let cli = find_openclaw_path().ok_or_else(|| "openclaw CLI not found".to_string())?;
    openclaw_command(&cli)
        .args(["gateway", "run"])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|err| err.to_string())?;
    Ok(())
}

fn openclaw_command(cli: &str) -> Command {
    let mut command = Command::new(cli);
    if let Some(parent) = PathBuf::from(cli).parent() {
        let current = std::env::var_os("PATH").unwrap_or_default();
        let mut paths = vec![parent.to_path_buf()];
        paths.extend(std::env::split_paths(&current));
        if let Ok(joined) = std::env::join_paths(paths) {
            command.env("PATH", joined);
        }
    }
    command
}


fn gateway_is_online() -> bool {
    TcpStream::connect_timeout(
        &"127.0.0.1:18789"
            .parse()
            .expect("valid gateway socket address"),
        Duration::from_millis(300),
    )
    .is_ok()
}

fn default_agent_workspace(name: &str) -> Result<PathBuf, String> {
    let home = std::env::var("HOME").map_err(|err| err.to_string())?;
    let mut path = PathBuf::from(home);
    path.push(".openclaw");
    path.push("workspaces");
    let slug = slugify(name);
    path.push(if slug.is_empty() { "agent" } else { &slug });
    Ok(path)
}

fn slugify(value: &str) -> String {
    let mut slug = String::new();
    let mut last_dash = false;
    for ch in value.chars() {
        let lower = ch.to_ascii_lowercase();
        if lower.is_ascii_alphanumeric() {
            slug.push(lower);
            last_dash = false;
        } else if !last_dash {
            slug.push('-');
            last_dash = true;
        }
    }
    slug.trim_matches('-').to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_openclaw_gateway_token,
            inspect_openclaw_runtime,
            ensure_openclaw_gateway,
            open_openclaw_install_docs,
            launch_openclaw_installer,
            list_local_agents,
            list_local_sessions,
            list_local_channels,
            read_model_config,
            load_dashboard_data,
            start_openclaw_gateway,
            stop_openclaw_gateway,
            create_openclaw_agent,
            bind_agent_channel,
            connect_agent_phone_app,
            rename_openclaw_agent,
            update_openclaw_agent_model,
            delete_openclaw_agent,
            add_openclaw_model,
            add_openclaw_provider,
            delete_openclaw_provider,
            configure_discord_channel,
            open_discord_invite_url,
            open_openclaw_chat_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
