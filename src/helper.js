import { datChatId, ggSheetApiUrl, teleToken, stage1Prompt, stage2Prompt, YESCALE_API_URL, YESCALE_API_KEY, GPT_MODEL, OPENAI_API_BASE, OPENAI_API_KEY, REQUEST_TIMEOUT_MS } from "./constant.js";
import { Agent, ProxyAgent } from 'undici';
import TelegramBot from "node-telegram-bot-api";

/**
 * Replace placeholders in prompt templates
 * @param {string} template - Prompt template
 * @param {Object} data - Data to replace
 * @returns {string} - Prompt with replaced values
 */
export const fillPromptTemplate = (template, data) => {
    let result = template;
    Object.keys(data).forEach(key => {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), data[key]);
    });
    return result;
};

/**
 * Generate unique ID for article
 * @returns {string} - Format: YYYYMMDD_HHMMSS_XXX
 */
export const generateArticleID = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${date}_${time}_${random}`;
};

/**
 * Parses a JSON string and returns the parsed object.
 * @param {string} str - The JSON string to parse.
 * @param {Object} defaultObj - The default object to return if parsing fails.
 * @returns {Object} - The parsed object or the default object.
 */
export function parseJSON(str, defaultObj) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return defaultObj;
    }
}

/**
 * Fetches ready posts from a Google Sheets API.
 * @returns {Promise<Object>} - A promise that resolves to the fetched data.
 */
export const getReadyPosts = () => fetch(ggSheetApiUrl)
    .then((r) => r.json())
    .then((data) => {
        // Some deployments may return a JSON string wrapped in TextOutput
        if (typeof data === "string") {
            try {
                return JSON.parse(data);
            } catch {
                return { code: 500, message: "Invalid JSON from Sheets API" };
            }
        }
        return data; // expected: { code: 200, posts: [...] }
    });

/**
 * Save complete article data to Google Sheets
 * @param {Object} articleData - Complete article data with all fields
 * @returns {Promise<Object>}
 */
export const saveArticleToSheets = async (articleData) => {
    // Prefer POST to avoid URL length limits
    const body = new URLSearchParams({
        action: "saveArticle",
        data: JSON.stringify(articleData)
    });
    try {
        const r = await fetch(ggSheetApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json,text/plain,*/*'
            },
            body
        });
        const text = await r.text();
        try {
            return JSON.parse(text);
        } catch {
            // Some Google Apps Script deployments return text/html; capture gracefully
            return { code: r.ok ? 200 : r.status || 500, success: r.ok, message: 'Non-JSON response from Sheets API', raw: text.slice(0, 1000) };
        }
    } catch (e) {
        // Fallback to GET if POST fails at the edge/gateway
        const params = new URLSearchParams({
            action: "saveArticle",
            data: JSON.stringify(articleData)
        });
        const r = await fetch(ggSheetApiUrl + "?" + params.toString(), {
            headers: { 'Accept': 'application/json,text/plain,*/*' }
        });
        const text = await r.text();
        try {
            return JSON.parse(text);
        } catch {
            return { code: r.ok ? 200 : r.status || 500, success: r.ok, message: 'Non-JSON response from Sheets API (GET fallback)', raw: text.slice(0, 1000) };
        }
    }
};

const bot = teleToken ? new TelegramBot(teleToken, { polling: false }) : null;

/**
 * Handles errors and sends a message to Telegram if configured
 * @param {Error} error - The error object
 * @returns {Promise<void>}
 */
export const onError = async (error) => {
    const errorMsg = `⛔ Error\nTime: ${new Date().toISOString()}\nError: ${String(error)}`;
    console.error(errorMsg);
    
    if (bot && datChatId) {
        try {
            await bot.sendMessage(datChatId, errorMsg);
        } catch (teleError) {
            console.error('Failed to send Telegram notification:', teleError.message);
        }
    }
};

/**
 * Sends a completion message to Telegram if configured
 * @param {string} message - The message to send
 * @returns {Promise<void>}
 */
export const doneProcess = async (message) => {
    const doneMsg = `✅ Done\nTime: ${new Date().toISOString()}\n\n${message}`;
    console.log(doneMsg);
    
    if (bot && datChatId) {
        try {
            await bot.sendMessage(datChatId, doneMsg, { parse_mode: "HTML" });
        } catch (teleError) {
            console.error('Failed to send Telegram notification:', teleError.message);
        }
    }
};

// Build undici dispatcher supporting proxy and self-signed certs
const buildDispatcher = () => {
    const allowSelfSigned = String(process.env.YESCALE_ALLOW_SELF_SIGNED || '').toLowerCase() === 'true' || process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0';
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    const connect = { rejectUnauthorized: !allowSelfSigned };
    try {
        const host = new URL(YESCALE_API_URL).hostname;
        // SNI safety in some networks
        // @ts-ignore
        connect.servername = host;
    } catch {}
    if (proxyUrl) {
        return new ProxyAgent(proxyUrl, { connect });
    }
    return new Agent({ connect });
};


/**
 * Get stage 1 prompt (Keyword Analysis & Outline)
 * @param {Object} data - Input data
 * @returns {string} - Filled prompt
 */
export const getStage1Prompt = (data) => {
    return fillPromptTemplate(stage1Prompt, {
        hash: data.hash,
        title: data.title,
        slug: data.slug,
        keywords: typeof data.keyword === 'string' ? data.keyword : data.keyword.join(', ')
    });
};

/**
 * Get stage 2 prompt (Content Writing)
 * @param {Object} data - Input data
 * @param {Object} stage1Output - Stage 1 output
 * @returns {string} - Filled prompt
 */
export const getStage2Prompt = (data, stage1Output) => {
    return fillPromptTemplate(stage2Prompt, {
        hash: data.hash,
        title: data.title,
        slug: data.slug,
        keywords: typeof data.keyword === 'string' ? data.keyword : data.keyword.join(', '),
        stage1_output: JSON.stringify(stage1Output, null, 2)
    });
};

/**
 * Compresses large prompts by removing unnecessary content
 * @param {string} prompt - Full prompt to compress
 * @returns {string} - Compressed prompt
 */
const compressPrompt = (prompt) => {
    if (prompt.length < 8000) {
        return prompt;
    }
    
    let compressed = prompt;
    compressed = compressed.replace(/```(?:json|markdown|html)\n[\s\S]*?```/g, '');
    compressed = compressed.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return compressed;
};

/**
 * Call OpenAI API via YEScale with retry logic
 * @param {string} prompt - Prompt to send
 * @param {number} maxTokens - Max tokens for response
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<string>} - AI response content
 */
export const callOpenAI = async (prompt, maxTokens = 4000, maxRetries = 2) => {
    const optimizedPrompt = compressPrompt(prompt);
    const timeout = REQUEST_TIMEOUT_MS;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                console.log(`🔄 API retry ${attempt}/${maxRetries}`);
            }
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log(`⏰ Request timeout after ${timeout}ms`);
                controller.abort();
            }, timeout);
            
            // Primary: YEScale
            const response = await fetch(YESCALE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${YESCALE_API_KEY}`
                },
                body: JSON.stringify({
                    model: GPT_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: "Bạn là chuyên gia có nhiều năm trong nghề viết content SEO cho website bán tranh nghệ thuật treo tường cho website https://tranhslogan.vn, tranh canvas, tranh động lực, tranh slogan, decor nhà cửa, văn phòng, và các sản phẩm khác liên quan. Nhiệm vụ của bạn là nghiên cứu từ khóa, tạo outlint và viết bài chất lượng, chuẩn SEO để bài viết dễ dàng ontop google search. Luôn trả về JSON hợp lệ."
                        },
                        {
                            role: "user",
                            content: optimizedPrompt
                        }
                    ],
                    max_tokens: maxTokens,
                    temperature: 0.7
                }),
                signal: controller.signal,
                dispatcher: buildDispatcher()
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                let body = '';
                try { body = await response.text(); } catch {}
                const snippet = body ? ` - ${body.slice(0, 500)}` : '';
                throw new Error(`HTTP ${response.status}${snippet}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content;
            
        } catch (error) {
            const isTimeout = error?.name === 'AbortError';
            // @ts-ignore
            const cause = error?.cause;
            const causeInfo = cause?.code ? ` [${cause.code}${cause.errno ? `:${cause.errno}`:''}]` : '';
            
            if (isTimeout) {
                console.log(`⏰ Request timed out on attempt ${attempt + 1}`);
            } else {
                console.log(`❌ Request failed on attempt ${attempt + 1}: ${error?.message || error}`);
            }
            
            // Fallback to OpenAI if configured
            if (OPENAI_API_KEY) {
                try {
                    console.log('↩️ Falling back to OpenAI API');
                    const controller2 = new AbortController();
                    const timeoutId2 = setTimeout(() => {
                        console.log(`⏰ Fallback request timeout after ${timeout}ms`);
                        controller2.abort();
                    }, timeout);
                    const response2 = await fetch(OPENAI_API_BASE, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${OPENAI_API_KEY}`
                        },
                        body: JSON.stringify({
                            model: GPT_MODEL,
                            messages: [
                                {
                                    role: "system",
                                    content: "Bạn là chuyên gia có nhiều năm trong nghề viết content SEO cho website bán tranh nghệ thuật treo tường cho website https://tranhslogan.vn, tranh canvas, tranh động lực, tranh slogan, decor nhà cửa, văn phòng, và các sản phẩm khác liên quan. Nhiệm vụ của bạn là nghiên cứu từ khóa, tạo outlint và viết bài chất lượng, chuẩn SEO để bài viết dễ dàng ontop google search. Luôn trả về JSON hợp lệ."
                                },
                                {
                                    role: "user",
                                    content: optimizedPrompt
                                }
                            ],
                            max_tokens: maxTokens,
                            temperature: 0.7
                        }),
                        signal: controller2.signal
                    });
                    clearTimeout(timeoutId2);
                    if (!response2.ok) {
                        let body2 = '';
                        try { body2 = await response2.text(); } catch {}
                        const snippet2 = body2 ? ` - ${body2.slice(0, 500)}` : '';
                        throw new Error(`OpenAI HTTP ${response2.status}${snippet2}`);
                    }
                    const data2 = await response2.json();
                    return data2.choices?.[0]?.message?.content;
                } catch (fallbackErr) {
                    console.error('❌ Fallback failed');
                }
            }
            
            if (attempt === maxRetries) {
                throw new Error(`API failed after ${maxRetries + 1} attempts: ${(error?.message || error)}${causeInfo}`);
            }
            
            const waitTime = Math.min(Math.pow(2, attempt) * 1000, 10000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
};