import { TwitterApi } from 'twitter-api-v2';
import { TEXT } from '../config/text.js';

export class XService {
    private client: TwitterApi;

    constructor() {
        const appKey = process.env.X_API_KEY;
        const appSecret = process.env.X_API_SECRET;
        const accessToken = process.env.X_ACCESS_TOKEN;
        const accessSecret = process.env.X_ACCESS_SECRET;

        if (!appKey || !appSecret || !accessToken || !accessSecret) {
            throw new Error(TEXT.errors.xAuthMissing);
        }
        this.client = new TwitterApi({
            appKey,
            appSecret,
            accessToken,
            accessSecret,
        });
    }

    /**
     * ツイートを投稿する
     * Posts a tweet.
     * @param content 投稿内容 / Content to post
     * @returns 投稿されたツイートの情報 / Posted tweet info
     */
    async postTweet(content: string): Promise<{ id: string; text: string }> {
        try {
            const result = await this.client.v2.tweet(content);
            return {
                id: result.data.id,
                text: result.data.text
            };
        } catch (error) {
            console.error(TEXT.errors.xPostFailed, error);
            throw error;
        }
    }
}
