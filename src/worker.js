import {
    getReadyPosts,
    onError,
    parseJSON,
    doneProcess,
    saveArticleToSheets,
    generateArticleID,
    getStage1Prompt,
    getStage2Prompt,
    callOpenAI
} from "./helper.js";

/**
 * Clean and parse JSON from AI response
 * @param {string} response - AI response text
 * @returns {Object} Parsed JSON or null
 */
const cleanAndParseJSON = (response) => {
    if (!response) return null;
    
    // Pre-process response once
    let cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove all control characters
        .trim();
    
    // Find JSON object boundaries
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    let jsonStr = jsonMatch[0];
    
    // Try parsing with different levels of cleaning
    const attempts = [
        // Attempt 1: Basic cleaning
        () => {
            return JSON.parse(jsonStr);
        },
        
        // Attempt 2: Fix common JSON issues
        () => {
            const fixed = jsonStr
                .replace(/,\s*}/g, '}') // Remove trailing commas before }
                .replace(/,\s*]/g, ']') // Remove trailing commas before ]
                .replace(/([^\\])\\([^"\\\/bfnrt])/g, '$1\\\\$2') // Fix unescaped backslashes
                .replace(/([^\\])\\([^"\\\/bfnrt])/g, '$1\\\\$2'); // Fix unescaped backslashes (second pass)
            return JSON.parse(fixed);
        },
        
        // Attempt 3: Escape all newlines and tabs
        () => {
            const escaped = jsonStr
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
            return JSON.parse(escaped);
        },
        
        // Attempt 4: Extract content field only
        () => {
            const contentMatch = response.match(/"content":\s*"([^"]*(?:\\.[^"]*)*)"/);
            if (contentMatch) {
                return { content: contentMatch[1] };
            }
            throw new Error("No content field found");
        },
        
        // Attempt 5: Extract individual fields
        () => {
            const result = {};
            const analysisMatch = response.match(/"analysis":\s*\{[^}]*\}/);
            const outlineMatch = response.match(/"outline":\s*"([^"]*(?:\\.[^"]*)*)"/);
            const tagsMatch = response.match(/"suggested_tags":\s*\[[^\]]*\]/);
            
            if (analysisMatch) {
                try {
                    result.analysis = JSON.parse(`{${analysisMatch[0]}}`).analysis;
                } catch {}
            }
            if (outlineMatch) {
                result.outline = outlineMatch[1];
            }
            if (tagsMatch) {
                try {
                    result.suggested_tags = JSON.parse(`{${tagsMatch[0]}}`).suggested_tags;
                } catch {}
            }
            
            if (Object.keys(result).length === 0) {
                throw new Error("No valid fields found");
            }
            return result;
        }
    ];
    
    for (let i = 0; i < attempts.length; i++) {
        try {
            const result = attempts[i]();
            if (result) {
                console.log(`✅ JSON parsed successfully on attempt ${i + 1}`);
                return result;
            }
        } catch (error) {
            if (i === 0) {
                console.error("❌ Failed to parse JSON:", error.message);
                console.error("Response preview:", response.substring(0, 500));
            } else {
                console.error(`❌ Attempt ${i + 1} also failed:`, error.message);
            }
        }
    }
    
    return null;
};

/**
 * Process a single post through multi-stage AI generation
 * @param {Object} post - Post data from sheets
 * @returns {Promise<Object>} Complete article data
 */
const processPost = async (post) => {
    console.log(`\n📝 Đang xử lý bài viết: ${post.title}`);
    
    try {
        
        // STAGE 1: Keyword Analysis & Outline Creation
        console.log("\n🔍 Stage 1: Phân tích từ khóa và tạo dàn ý...");
        const stage1PromptText = getStage1Prompt(post);
        const stage1Response = await callOpenAI(stage1PromptText, 5000);
        const stage1Data = cleanAndParseJSON(stage1Response);
        
        if (!stage1Data) {
            throw new Error("Stage 1 thất bại: Không parse được JSON response");
        }
        
        console.log("✅ Stage 1 hoàn thành");
        console.log(`   - Từ khóa LSI: ${stage1Data.lsi_keywords?.length || 0} từ`);
        console.log(`   - Tags: ${stage1Data.suggested_tags?.length || 0} tags`);
        console.log(`   - Dàn ý: ${stage1Data.outline ? '✓' : '✗'}`);
        console.log(`   - Dàn ý: ${stage1Data.outline}`);
        
        // STAGE 2: Full Content Writing (HTML format)
        console.log("\n✍️ Stage 2: Viết nội dung đầy đủ (Markdown HTML)...");
        const stage2PromptText = getStage2Prompt(post, stage1Data);
        const stage2Response = await callOpenAI(stage2PromptText, 15000);
        const stage2Data = cleanAndParseJSON(stage2Response);
        
        if (!stage2Data || !stage2Data.content) {
            throw new Error("Stage 2 thất bại: Không có content trong response");
        }
        
        console.log("✅ Stage 2 hoàn thành");
        console.log(`   - Content length: ${stage2Data.content.length} ký tự`);
        
        // Combine all data into final article
        const articleID = generateArticleID();
        const currentDate = new Date().toISOString().slice(0, 10);
        
        const finalArticle = {
            ID: articleID,
            Hash: post.hash,
            Title: post.title,
            Slug: post.slug,
            Tags: stage1Data.suggested_tags?.join(', ') || "",
            Keywords: typeof post.keyword === 'string' ? post.keyword : post.keyword.join(', '),
            Short_content: stage1Data.short_content_variations?.[0] || "",
            Content: stage2Data.content,
            Key_takeaways: stage1Data.key_takeaways?.join('\n') || "",
            Thumbnail: "", // No thumbnail generation
            Categories: stage1Data.suggested_categories?.join(', ') || "",
            Date: currentDate,
            Publish: "draft"
        };
        
        console.log("\n✅ Tạo bài viết hoàn tất!");
        console.log(`   - Hash: ${post.hash}`);
        console.log(`   - Tiêu đề: ${post.title}`);
        console.log(`   - Tags: ${finalArticle.Tags}`);
        console.log(`   - Danh mục: ${finalArticle.Categories}`);
        console.log(`   - Mô tả ngắn: ${finalArticle.Short_content}`);
        
        return finalArticle;
    } catch (error) {
        throw error;
    }
};

// Main execution
try {
    
    getReadyPosts().then(async (data) => {
        if (data.code !== 200) {
            throw new Error("Lỗi khi lấy danh sách bài viết từ Google Sheets");
        }
        
        if (!data.posts || !data.posts.length) {
            console.log("\nℹ️  Không có bài viết nào cần xử lý");
            process.exit(0);
        }
        
        console.log(`\n🚀 Bắt đầu tạo nội dung cho ${data.posts.length} bài viết...\n`);
        
        for (let i = 0; i < data.posts.length; i++) {
            const post = data.posts[i];
            console.log(`\n${'='.repeat(70)}`);
            console.log(`📄 Bài viết ${i + 1}/${data.posts.length}`);
            console.log(`${'='.repeat(70)}`);
            
            try {
                // Generate content
                const finalArticle = await processPost(post);
                
                // Save to Google Sheets
                console.log("\n💾 Đang lưu vào Google Sheets...");
                const saveResult = await saveArticleToSheets(finalArticle);
                
                if (saveResult.code === 200 || saveResult.success) {
                    console.log("✅ Đã lưu thành công vào Google Sheets");
                    await doneProcess(
                        `✅ Bài viết: ${finalArticle.Title}\n` +
                        `🆔 Hash: ${finalArticle.Hash}\n` +
                        `📊 Số từ: ${finalArticle.Content.length} ký tự\n` +
                        `🏷️ Tags: ${finalArticle.Tags}\n` +
                        `📁 Danh mục: ${finalArticle.Categories}\n` +
                        `📅 Ngày: ${finalArticle.Date}\n`
                    );
                } else {
                    throw new Error(`Lỗi lưu vào Sheets: ${JSON.stringify(saveResult)}`);
                }
                
            } catch (error) {
                console.error(`\n❌ Lỗi khi xử lý bài viết: ${post.title}`);
                console.error(`❌ Chi tiết lỗi: ${error.message}`);
                await onError(
                    `❌ Bài viết: ${post.title}\n` +
                    `Hash: ${post.hash}\n` +
                    `Lỗi: ${error.message}`
                );
            }
            
            // Short delay between posts to avoid rate limiting
            if (i < data.posts.length - 1) {
                console.log("\n⏳ Chờ 5 giây trước khi xử lý bài tiếp theo...");
                await new Promise(r => setTimeout(r, 5000));
            }
        }
        
        console.log(`\n${'='.repeat(70)}`);
        console.log("🎉 Hoàn thành tất cả bài viết!");
        console.log(`${'='.repeat(70)}\n`);
        
        // Exit gracefully without killing all processes
        process.exit(0);
        
    }).catch((error) => {
        console.error("\n❌ Lỗi khi lấy danh sách bài viết:", error);
        onError(error);
        process.exit(1);
    });
    
} catch (error) {
    console.error("\n❌ Lỗi nghiêm trọng:", error);
    onError(error);
    process.exit(1);
}
