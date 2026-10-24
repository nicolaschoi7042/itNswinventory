const fetch = require('node-fetch');

const SLACK_API = 'https://slack.com/api/chat.postMessage';

class SlackNotify {
    constructor(config) {
        this.botToken = config.botToken || process.env.SLACK_BOT_TOKEN;
        this.channel = config.channel || process.env.SLACK_NOTIFY_CHANNEL || 'D088R2K789F';
    }

    isEnabled() {
        return !!this.botToken;
    }

    async send(text, blocks) {
        if (!this.botToken) return;

        const body = { channel: this.channel, text };
        if (blocks) body.blocks = blocks;

        const res = await fetch(SLACK_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.botToken}`,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!data.ok) {
            console.error('Slack API error:', data.error);
        }
    }

    async notifyDeactivatedWithAssets(userName, username, assets) {
        const hw = assets.hardware || [];
        const sw = assets.software || [];
        const asgn = assets.assignments || [];

        const lines = [];
        if (hw.length > 0) lines.push(`*HW (${hw.length}):* ${hw.map(h => h.name || h.asset_tag).join(', ')}`);
        if (sw.length > 0) lines.push(`*SW (${sw.length}):* ${sw.map(s => s.name).join(', ')}`);
        if (asgn.length > 0) lines.push(`*배정 (${asgn.length}건)* 미반납`);

        const blocks = [
            {
                type: 'header',
                text: { type: 'plain_text', text: '퇴사자 자산 미반납 알림' }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*${userName}* (${username}) 계정이 비활성화되었으나 자산이 남아 있습니다.\n\n${lines.join('\n')}`
                }
            },
            {
                type: 'context',
                elements: [{ type: 'mrkdwn', text: 'IT 자산 관리 시스템 자동 알림' }]
            }
        ];

        await this.send(`퇴사자 ${userName} 자산 미반납: ${lines.join(' / ')}`, blocks);
    }
}

module.exports = { SlackNotify };
