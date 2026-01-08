
export interface TokenLog {
    date: string;
    time: string;
    mode: string;
    model: string;
    input: number;
    output: number;
    total: number;
}

export interface DailyStat {
    date: string;
    input: number;
    output: number;
}

/**
 * トークン使用量ログのテンプレートを生成する
 * Generates a template for token usage logs.
 */
export function createTokenUsageTemplate(
    provider: string,
    yearMonth: string,
    dailyStats: DailyStat[],
    logs: TokenLog[]
): string {
    const mermaidGraph = generateMermaidGraph(dailyStats);
    const logTable = generateLogTable(logs);

    return `---
type: token-usage
provider: ${provider}
month: ${yearMonth}
---

# Token Usage: ${provider} (${yearMonth})

## 📊 Daily Usage

\`\`\`mermaid
${mermaidGraph}
\`\`\`

## 📝 Logs

${logTable}
`;
}

function generateMermaidGraph(stats: DailyStat[]): string {
    if (stats.length === 0) {
        return 'graph TD\n    NoData[No Data Yet]';
    }

    const sortedStats = [...stats].sort((a, b) => a.date.localeCompare(b.date));
    const dates = sortedStats.map(s => `"${s.date.split('-')[2]}"`).join(', ');
    const inputs = sortedStats.map(s => s.input).join(', ');
    const outputs = sortedStats.map(s => s.output).join(', ');

    return `xychart-beta
    title "Token Usage per Day"
    x-axis [${dates}]
    y-axis "Tokens"
    bar [${inputs}]
    bar [${outputs}]
    `;
}

function generateLogTable(logs: TokenLog[]): string {
    const header = `| Date | Time | Mode | Model | Input | Output | Total |\n|---|---|---|---|---|---|---|`;
    
    const rows = logs.map(log => {
        return `| ${log.date} | ${log.time} | ${log.mode} | ${log.model} | ${log.input} | ${log.output} | ${log.total} |`;
    }).join('\n');

    return `${header}\n${rows}`;
}
