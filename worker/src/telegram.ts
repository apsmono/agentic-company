import { DatabaseService } from './db.js';

export interface TelegramAlertRecord {
  type: 'approval' | 'circuit_breaker' | 'status';
  taskId?: string;
  message: string;
  timestamp: string;
}

export class TelegramNotifier {
  private botToken?: string;
  private chatId?: string;
  private sentAlerts: TelegramAlertRecord[] = [];

  constructor(botToken?: string, chatId?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = chatId || process.env.TELEGRAM_CHAT_ID;
  }

  public isConfigured(): boolean {
    return Boolean(this.botToken && this.chatId);
  }

  public getSentAlerts(): TelegramAlertRecord[] {
    return [...this.sentAlerts];
  }

  public clearAlerts(): void {
    this.sentAlerts = [];
  }

  public async sendApprovalAlert(data: {
    taskId: string;
    action: string;
    requestedBy: string;
    note?: string;
  }): Promise<boolean> {
    const formattedMessage = [
      `⚠️ <b>ONE-WAY DOOR APPROVAL REQUIRED</b>`,
      `<b>Task:</b> <code>${data.taskId}</code>`,
      `<b>Action:</b> ${data.action}`,
      `<b>Requested By:</b> ${data.requestedBy}`,
      data.note ? `<b>Note:</b> <i>${data.note}</i>` : '',
      ``,
      `👉 <b>Chairman Action:</b> Reply <code>/approve ${data.taskId}</code> or approve via Cockpit PIN.`
    ].filter(Boolean).join('\n');

    this.sentAlerts.push({
      type: 'approval',
      taskId: data.taskId,
      message: formattedMessage,
      timestamp: new Date().toISOString()
    });

    console.log(`\n\x1b[35m[TelegramAlert] 📱 Push Notification Dispatched:\x1b[0m\n${formattedMessage}\n`);

    if (!this.isConfigured()) {
      return true; // Mock mode successful delivery
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: formattedMessage,
          parse_mode: 'HTML'
        })
      });
      return res.ok;
    } catch (err) {
      console.warn('[TelegramNotifier] Failed to send Telegram message:', err);
      return false;
    }
  }

  public async sendCircuitBreakerAlert(reason: string, currentSpend: number, dailyCap: number): Promise<boolean> {
    const message = [
      `🛑 <b>FINANCIAL CIRCUIT BREAKER TRIPPED</b>`,
      `<b>Reason:</b> ${reason}`,
      `<b>Current Spend:</b> $${currentSpend.toFixed(2)} / $${dailyCap.toFixed(2)}`,
      `Worker polling paused automatically.`
    ].join('\n');

    this.sentAlerts.push({
      type: 'circuit_breaker',
      message,
      timestamp: new Date().toISOString()
    });

    console.log(`\n\x1b[31m[TelegramAlert] 🛑 Circuit Breaker Notification:\x1b[0m\n${message}\n`);

    if (!this.isConfigured()) return true;

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async handleCommand(commandText: string, db: DatabaseService): Promise<string> {
    const trimmed = commandText.trim();

    if (trimmed.startsWith('/approve')) {
      const parts = trimmed.split(/\s+/);
      const taskId = parts[1];
      if (!taskId) {
        return '❌ Usage: /approve <task_id>';
      }

      // Update task to queued
      const taskUpdated = await db.updateTaskStatus(taskId, 'queued', { lease_until: null });
      if (taskUpdated) {
        return `✅ Task <code>${taskId}</code> approved by Chairman. Re-enqueued for worker execution.`;
      } else {
        return `❌ Task <code>${taskId}</code> not found or could not be updated.`;
      }
    }

    if (trimmed === '/status') {
      const spend = await db.getTodaySpend();
      return `📊 <b>Company Status:</b>\nToday's Burn: $${spend.toFixed(2)}\nSystem Status: Operational`;
    }

    return '❓ Unrecognized command. Available: /approve <task_id>, /status';
  }
}

export const defaultTelegramNotifier = new TelegramNotifier();
