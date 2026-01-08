/**
 * 標準入力からすべてのデータを読み込み、データとパイプ入力かどうかのフラグ
 * Reads all data from standard input and returns the data and whether it's piped or not.
 * @returns {Promise<{ data: string, isPiped: boolean }>}
 */
export async function readStdin(): Promise<{ data: string, isPiped: boolean }> {
    const isPiped = !process.stdin.isTTY;

    if (!isPiped) {
        return { data: "", isPiped: false };
    }

    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
        chunks.push(Buffer.from(chunk));
    }
    return { 
        data: Buffer.concat(chunks).toString('utf-8'),
        isPiped: true
    };
}
