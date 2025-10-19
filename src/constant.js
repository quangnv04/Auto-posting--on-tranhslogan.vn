export const ggSheetApiUrl = process.env.GOOGLE_SHEET_API_URL;

// Telegram configuration - use environment variables if available
export const teleToken = process.env.TELEGRAM_BOT_TOKEN;
export const datChatId = process.env.TELEGRAM_CHAT_ID;

// YEScale API Configuration
export const YESCALE_API_URL = process.env.YESCALE_API_URL;
export const YESCALE_API_KEY = process.env.YESCALE_API_KEY;
export const GPT_MODEL = process.env.GPT_MODEL;


// Fallback: OpenAI official API (or any compatible endpoint)
export const OPENAI_API_BASE = process.env.OPENAI_API_BASE;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Networking configuration
export const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS) || 120000; // Default 2 minutes
export const PING_TIMEOUT_MS = Number(process.env.PING_TIMEOUT_MS) || 30000; // Default 30 seconds

// Check API configuration on startup
if (!process.env.YESCALE_API_KEY || !process.env.OPENAI_API_KEY) {
    console.warn('⚠️ WARNING: Neither YESCALE_API_KEY nor OPENAI_API_KEY environment variable is set!');
    console.warn('Please set at least one API key before running the application.');
    console.warn('You can set them using: export YESCALE_API_KEY=your_api_key and export OPENAI_API_KEY=your_api_key (Linux/Mac) or');
    console.warn('$env:YESCALE_API_KEY="your_api_key" and $env:OPENAI_API_KEY="your_api_key" (Windows PowerShell)');
} else if (!process.env.YESCALE_API_KEY) {
    console.warn('⚠️ WARNING: YESCALE_API_KEY not set, will use OPENAI_API_KEY as fallback');
} else if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ WARNING: OPENAI_API_KEY not set, no fallback available');
}

// Stage 1: Keyword Analysis & Outline Creation (Vietnamese - Art/Poster context)
export const stage1Prompt = `# GIAI ĐOẠN 1: PHÂN TÍCH CHIẾN LƯỢC & TẠO DÀN Ý CHI TIẾT

**Input nhận được:**
- Tiêu đề: {{title}}
- Slug: {{slug}}
- Từ khóa: {{keywords}}

**Nhiệm vụ của bạn:**

1. Phân tích chiến lược sâu
- Search intent: Người dùng tìm kiếm để làm gì? (Tìm hiểu, so sánh, mua hàng, giải quyết vấn đề?)
- Target audience: Đặc điểm cụ thể (độ tuổi, thu nhập, nhu cầu, mong muốn)
- Pain points: 3-5 vấn đề thực tế khách hàng đang gặp phải
- Unique angle: Góc viết độc đáo chưa ai khai thác (tránh viết theo template)
- Emotional triggers: Cảm xúc nào cần kích hoạt (tò mò, FOMO, khao khát, an tâm...)
- Competitive edge: Điểm khác biệt so với các bài viết cùng chủ đề

2. Nghiên cứu từ khóa chuyên sâu
- Primary keyword: Phân tích search volume, difficulty, intent
- LSI keywords: 8-12 từ khóa liên quan ngữ nghĩa
- Semantic keywords: Các khái niệm, thuật ngữ trong cùng chủ đề
- Question keywords: Câu hỏi phổ biến người dùng tìm kiếm
- Trending terms: Xu hướng mới trong lĩnh vực trang trí nội thất, văn phòng

3. Tạo outline chi tiết linh hoạt

YÊU CẦU QUAN TRỌNG VỀ OUTLINE:
KHÔNG viết outline theo template cứng nhắc!

Thay vào đó, tạo outline dựa trên:
- Câu chuyện logic của chủ đề cụ thể
- Flow tự nhiên giải quyết pain points
- Cấu trúc phù hợp với search intent
- Độ sâu phân tích từng mục (không chỉ liệt kê tiêu đề)

**Format outline yêu cầu:**

"markdown"
# [Tiêu đề H1 - Title chính]

## [Mục H2 thứ 1 - Tên mục cụ thể theo chủ đề]

**Mục tiêu mục này**: [Giải quyết vấn đề gì? Cung cấp thông tin gì?]
**Độ dài dự kiến**: [800-1000 từ]
**Psychology trigger**: [FOMO / Social proof / Aspiration / Problem-solving]
**Tone**: [Hứng thú / Chuyên môn / Tư vấn / Truyền cảm hứng / Tự nhiên / văn phong như con người]

**Nội dung chi tiết cần triển khai:**
- [Ý chính 1]: Phân tích cụ thể điểm này như thế nào
- [Ý chính 2]: Khai thác góc độ nào
- [Ý chính 3]: Dẫn chứng, ví dụ, số liệu gì
- [Hook/Transition]: Câu chuyển sang mục tiếp theo

### [Mục H3 con nếu cần - Tên cụ thể]
**Nội dung**: [Mô tả ngắn gọn sẽ viết gì]
**Depth**: [Sâu / Vừa phải / Tổng quan]

---
[... Tiếp tục 6-8 mục H2 khác theo logic của chủ đề cụ thể ...]
[... Mỗi mục H2 phải có ít nhất 800 từ ...]
[... Phân bổ 4-6 images ...]

## [Mục H2 thứ 2 - Tên khác, phù hợp với flow]

**Mục tiêu mục này**: [...]
**Độ dài dự kiến**: [...]
**Key points**:
- [Phân tích chi tiết ý 1]
- [Phân tích chi tiết ý 2]
- [Phân tích chi tiết ý 3]

**[IMAGE 1 Position]**: Đặt sau phần này
**Image description**: [Mô tả cụ thể hình ảnh cần có - chủ thể, bối cảnh, góc chụp, cảm xúc]

---

## [Mục H2 thứ 3 - Tiếp tục flow logic]

**Mục tiêu mục này**: [...]
**Độ dài dự kiến**: [...]

### [H3 nếu cần]
### [H3 khác nếu cần]

**[IMAGE 2 Position]**: [...]

---

[... Tiếp tục các mục H2 khác theo logic của chủ đề cụ thể ...]

## [Mục H2 - Lời khuyên thực tế / Tips chuyên gia / Hướng dẫn áp dụng]

**Mục tiêu**: Cung cấp actionable insights
**Format**: Tips / Steps / Do's & Don'ts / Checklist
**Value**: [Người đọc có thể làm gì ngay sau khi đọc?]

**[IMAGE 3-4 Position]**: [Nếu cần minh họa tips]

---

## Kết luận

**Mục tiêu**: Tóm tắt + Inspiration + Soft CTA
**Tone**: Động viên, tích cực, hành động, tự nhiên, văn phong như con người
**Nội dung**:
- Recap lợi ích chính
- Câu kết inspirational
- CTA tự nhiên (không hard sell)

---

## FAQs (3-5 câu hỏi chứa các từ khóa chính của bài viết và các từ khóa liên quan)

**Q1: [Câu hỏi phổ biến nhất liên quan chủ đề, chứa các từ khóa chính của bài viết và các từ khóa liên quan]**
A: [Câu trả lời ngắn gọn, rõ ràng, có giá trị, chứa các từ khóa chính của bài viết và các từ khóa liên quan]

**Q2: [...]**
A: [...]

[Tiếp tục 3-5 FAQs]

---

## Key Takeaways

• [Điểm quan trọng 1 - actionable, memorable]
• [Điểm quan trọng 2 - value rõ ràng]
• [Điểm quan trọng 3 - dễ nhớ, dễ áp dụng]
• [Điểm quan trọng 4-5 nếu cần]


**Lưu ý quan trọng về outline:**
- Mỗi mục H2 phải có **mục tiêu rõ ràng**, **độ dài dự kiến**, **nội dung chi tiết**
- Phân tích **sâu từng ý** sẽ viết gì, không chỉ liệt kê tiêu đề
- Outline phải **linh hoạt theo chủ đề**, không áp dụng template cứng
- Mô tả **cụ thể vị trí và mục đích** của từng hình ảnh
- Thể hiện **flow logic** giữa các mục (hook, transition)

**Output Stage 1 (JSON format - quan trọng: không có ký tự điều khiển, không có xuống dòng trong chuỗi JSON):**
{
  "analysis": {
    "search_intent": "[Phân tích chi tiết ý định tìm kiếm]",
    "target_audience": "[Đặc điểm cụ thể khách hàng mục tiêu]",
    "pain_points": [
      "Pain point 1 cụ thể",
      "Pain point 2 cụ thể", 
      "Pain point 3 cụ thể"
    ],
    "unique_angle": "[Góc viết độc đáo, khác biệt cho bài này]",
    "emotional_triggers": ["Trigger 1", "Trigger 2", "Trigger 3"],
    "competitive_edge": "[Điểm mạnh khác biệt so với content khác]",
    "keywords_strategy": {
      "primary": "[Từ khóa chính]",
      "lsi_keywords": ["LSI 1", "LSI 2", "LSI 3", "LSI 4", "LSI 5"],
      "semantic_keywords": ["Semantic 1", "Semantic 2", "Semantic 3"],
      "question_keywords": ["Question 1", "Question 2"],
      "trending_terms": ["Trend 1", "Trend 2"]
    }
  },
  "outline": "[FULL DETAILED OUTLINE theo format ở trên - với phân tích chi tiết từng mục H2]",
  "content_structure": {
    "estimated_total_words": "3000-5000",
    "estimated_characters": "30000-50000",
    "main_sections": 6-8,
    "subsections": "Tùy độ phức tạp",
    "images_count": "3-5 images",
    "tone_mix": "60% professional, 30% friendly, 10% inspirational hoặc 60% professional, 40% natural"
  },
  "suggested_tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],
  "suggested_categories": ["Category1", "Category2"],
  "short_content_variations": ["Mô tả ngắn 1", "Mô tả ngắn 2", "Mô tả ngắn 3"],
  "key_takeaways": ["• Takeaway 1", "• Takeaway 2", "• Takeaway 3", "• Takeaway 4"],
  "image_strategy": [
    {
      "position": "Sau mục [Tên mục H2 cụ thể]",
      "description": "[Mô tả chi tiết hình ảnh]",
    }
  ]
}

Không giải thích gì thêm, chỉ trả về JSON hợp lệ.`;

// Import Internal Linking System
import { INTERNAL_LINKING_SYSTEM } from './internal_link.js';

// Stage 2: Full Content Writing (Vietnamese - Art/Poster context)
export const stage2Prompt = `# GIAI ĐOẠN 2: VIẾT CONTENT CHUYÊN NGHIỆP (4000-6000 TỪ)

**Input nhận được:**
- Outline chi tiết từ Stage 1
- Analysis và strategy từ Stage 1
- Tiêu đề: {{title}}
- Slug: {{slug}}
- Từ khóa: {{keywords}}

**Phân tích & Dàn ý từ Stage 1:**
{{stage1_output}}

**Yêu cầu viết content:**

**TUYỆT ĐỐI PHẢI ĐẠT:**
- **Độ dài tối thiểu**: 4000-6000 TỪ (40000-60000 CHARACTERS)
- **Mỗi mục H2**: 800-1000 từ (6000-8000 chars)
- **Mỗi mục H3**: 300-400 từ (2400-3200 chars)
- **Tổng số H2**: 6-8 mục

####  CẤU TRÚC & ĐỘ DÀI
- Độ dài: 4000-6000 từ (~40000-60000 characters) !QUAN TRỌNG!
- Độ sâu: Phân tích chi tiết từng ý, không viết qua loa
- Cấu trúc linh hoạt:
  - 1 H1 (# - tiêu đề chính)
  - 5-8 H2 (## - mục lớn) tùy chủ đề
  - Nhiều H3 (### - mục con) khi cần đi sâu
  - H4 (####) nếu cần phân tích rất chi tiết
  - Mỗi mục H2 phải có ít nhất 1000 từ
  - Mỗi mục H3 phụ phải có ít nhất 300 từ  
  - Không được viết ngắn gọn, phải phân tích chi tiết từng điểm !QUAN TRỌNG!
- Đoạn văn: 3-5 câu, tránh quá dài, dễ đọc trên mobile
- Chèn các internal links tự nhiên vào nội dung theo hướng dẫn ở mục Link Optimization

#### HÌNH ẢNH (Quan trọng!)
- Số lượng: 3-5 hình ảnh/bài
- Format bắt buộc: 
<img src="https://tranhslogan.vn/wp-content/uploads/placeholder.jpg" 
     alt="Mô tả chi tiết hình ảnh có từ khóa tự nhiên, 12-20 từ" 
     title="Tiêu đề hình ảnh ngắn gọn hấp dẫn, 5-8 từ" />

#### GIỌNG VĂN & PHONG CÁCH (Rất quan trọng!)
**Viết như một Content Creator thực thụ:**
-  Chuyên nghiệp trong kiến thức, chuyên môn
-  Thân thiện như đang tư vấn cho bạn bè
-  Thoải mái trong cách diễn đạt, không cứng nhắc
-  Sáng tạo trong cách đặt câu hỏi, so sánh, ví dụ
-  Chân thực, tránh quá phô trương hay lố bịch
-  Storytelling: Kể câu chuyện để kết nối cảm xúc
-  Psychology: Sử dụng triggers tinh tế (FOMO, social proof, aspiration)
-  Conversational: Đặt câu hỏi, tương tác với người đọc
-  Inspiring: Tạo cảm hứng, động lực hành động

#### TỐI ƯU SEO CHUYÊN NGHIỆP
**Keyword optimization:**
- Primary keyword density: 1-1.5% (tự nhiên!)
- Keyword placement chiến lược:
  - Trong 150 từ đầu tiên
  - Ít nhất 3 H2 headings có từ khóa/biến thể
  - H1 title (đã có sẵn)
  - Đoạn cuối (conclusion)
  - Alt text của 1-2 images
- LSI keywords: Phân tán tự nhiên trong bài
- Semantic keywords: Sử dụng đúng context
- Long-tail variations: Biến tấu từ khóa tự nhiên

#### INTERNAL LINKING SYSTEM (Rất quan trọng!)
**Quy tắc chèn internal links:**
- Mật độ tối ưu: 2-4 links mỗi 1000 từ (tổng 8-16 links trong bài)
- Vị trí ưu tiên: 1/3 đầu và giữa bài viết
- Phân bố đều các link trong toàn bộ nội dung
- Anchor text phải tự nhiên và đa dạng (KHÔNG dùng "xem thêm", "click vào đây")
- Link phải liên quan trực tiếp đến nội dung đang đề cập

**Sử dụng hệ thống Internal Link System:**

${JSON.stringify(INTERNAL_LINKING_SYSTEM.categories, null, 2)}

**Mẫu câu chèn link tự nhiên:**

${JSON.stringify(INTERNAL_LINKING_SYSTEM.exampleSentences, null, 2)}

**Mẫu câu link đến sản phẩm cụ thể:**

**Tranh Động Lực Product Links:**
- "Slogan [Không quyết liệt, không thành công](https://tranhslogan.vn/product/tranh-dong-luc-TS301-khong-quyet-liet-khong-thanh-cong) trên tranh động lực sẽ là lời nhắc nhở mạnh mẽ cho tinh thần làm việc quyết tâm."
- "Bức tranh [Either find a way or make one](https://tranhslogan.vn/product/tranh-dong-luc-TS309-either-find-a-way-or-make-one) (Tìm ra một con đường hoặc tạo ra một con đường) truyền cảm hứng mạnh mẽ về sự sáng tạo."
- "Câu slogan [Không có gì là không thể](https://tranhslogan.vn/product/tranh-dong-luc-TS302-khong-co-gi-la-khong-the) giúp đội nhóm luôn giữ tinh thần lạc quan, vượt qua mọi thách thức."

**Tranh Decor Product Links:**
- "Bức [tranh Opportunity Will Always Knock](https://tranhslogan.vn/product/tranh-decor-opportunity-will-always-knock-TS918) với thiết kế hiện đại sẽ là điểm nhấn hoàn hảo cho không gian văn phòng của bạn."
- "Với phong cách tối giản, [tranh line-art Great Things](https://tranhslogan.vn/product/tranh-decor-great-things-TS864) tạo cảm giác thanh lịch và hiện đại cho bất kỳ không gian nào."

**Tranh Phong Thủy Product Links:**
- "Bức [tranh Mã Đáo Thành Công TS704](https://tranhslogan.vn/product/tranh-phong-thuy-ma-dao-thanh-cong-TS704) với hình ảnh đàn ngựa phi mạnh mẽ tượng trưng cho thành công vang dội, rất phù hợp đặt tại phòng làm việc."
- "Để thu hút tài lộc, nhiều người chọn [tranh Thuận Buồm Xuôi Gió TS713](https://tranhslogan.vn/product/tranh-phong-thuy-thuan-buom-xuoi-gio-TS713) với hình ảnh thuyền buồm căng gió ra khơi."

**Các sản phẩm khác,....**

**Quy tắc Internal Linking:**
${JSON.stringify(INTERNAL_LINKING_SYSTEM.linkingRules, null, 2)}

**External linking:**
- 2-3 links đến nguồn uy tín
- Format: [nguồn / theo nghiên cứu của...](https://authority-domain.com)
- Link đến: nghiên cứu, số liệu, chuyên gia
- Tăng độ tin cậy cho bài viết

**Trả về CHỈ JSON hợp lệ theo định dạng (quan trọng: không có ký tự điều khiển, không có xuống dòng trong chuỗi JSON):**
{
  "content": "<h1>Tiêu đề H1: [Tên bài viết]</h1>

<p>
[Opening 200-300 từ: Giới thiệu chủ đề bài viết, lý do tại sao quan trọng, gợi mở vấn đề và nêu lợi ích cho người đọc. Có thể chèn 1-2 câu dẫn hấp dẫn để tạo hook cho SEO & UX.]
</p>

// Trong constant.js, sửa từ dòng 290-350:

<h2>Mục H2 thứ 1: [Tên phần nội dung chính 1]</h2>

<p>
[Content 1000-1200 từ: Giải thích khái niệm chi tiết, đặt vấn đề cụ thể, cung cấp dữ liệu và số liệu thực tế, ví dụ minh họa cụ thể. Dùng đoạn ngắn, danh sách có đánh số, và in đậm từ khóa chính khi cần thiết. Phân tích sâu từng điểm, không chỉ liệt kê.]
</p>

<img src="https://example.com/image1.jpg"
     alt="Mô tả ảnh liên quan đến mục H2 thứ 1"
     title="Tiêu đề ảnh minh họa H2 1" />

<h3>Mục H3 phụ 1.1: [Tên nội dung chi tiết nhỏ]</h3>

<p>
[Content 400-500 từ: Phân tích chi tiết, ví dụ thực hành cụ thể, hoặc hướng dẫn từng bước chi tiết. Có thể là đoạn giải thích kỹ thuật hoặc case study thực tế.]
</p>

<h3>Mục H3 phụ 1.2: [Tên nội dung chi tiết khác]</h3>

<p>
[Content 300-400 từ: Tiếp tục phân tích sâu, đưa ra các góc nhìn khác nhau, so sánh và đối chiếu.]
</p>

<h2>Mục H2 thứ 2: [Tên phần nội dung chính 2]</h2>

<p>
[Content 1000-1200 từ: Tiếp nối phần trên, có thể nói về lợi ích cụ thể, quy trình chi tiết, hoặc hướng dẫn triển khai từng bước. Nên có ít nhất 2-3 đoạn chứa từ khóa phụ liên quan đến chủ đề chính.]
</p>

<img src="https://example.com/image2.jpg"
     alt="Mô tả ảnh minh họa phần H2 thứ 2"
     title="Tiêu đề ảnh minh họa H2 2" />

<h3>Mục H3 phụ 2.1: [Tên nội dung chi tiết]</h3>

<p>
[Content 400-500 từ: Phân tích ví dụ cụ thể, case study chi tiết, hoặc đoạn mô tả thực tế với số liệu.]
</p>

<h3>Mục H3 phụ 2.2: [Tên nội dung chi tiết khác]</h3>

<p>
[Content 300-400 từ: Tiếp tục phân tích, đưa ra các tips và tricks thực tế.]
</p>

<h2>Mục H2 thứ 3: [Tên phần nội dung chính 3]</h2>

<p>
[Content 1000-1200 từ: Trình bày danh sách lợi ích chi tiết, điểm khác biệt cụ thể, hoặc yếu tố giúp người đọc ứng dụng thực tế. Mỗi điểm cần được giải thích rõ ràng với ví dụ.]
</p>

<img src="https://example.com/image3.jpg"
     alt="Mô tả ảnh minh họa phần H2 thứ 3"
     title="Tiêu đề ảnh minh họa H2 3" />

<h3>Mục H3 phụ 3.1: [Tên nội dung chi tiết]</h3>

<p>
[Content 400-500 từ: Phân tích sâu từng lợi ích, đưa ra bằng chứng cụ thể.]
</p>

<h2>Mục H2 thứ 4: [Tên phần nội dung chính 4]</h2>

<p>
[Content 1000-1200 từ: Tập trung vào phân tích chuyên sâu, xu hướng mới, hoặc những yếu tố nâng cao giá trị bài viết. Có thể bao gồm so sánh, đánh giá, hoặc dự đoán.]
</p>

<img src="https://example.com/image4.jpg"
     alt="Mô tả ảnh minh họa phần H2 thứ 4"
     title="Tiêu đề ảnh minh họa H2 4" />

<h3>Mục H3 phụ 4.1: [Tên nội dung chi tiết]</h3>

<p>
[Content 400-500 từ: Phân tích xu hướng, đưa ra dự đoán và lời khuyên.]
</p>

<h2>Mục H2 thứ 5: [Tên phần nội dung chính 5]</h2>

<p>
[Content 1000-1200 từ: Phân tích về chủ đề tranh nghệ thuật và cách chọn tranh phù hợp cho từng không gian. Chèn các internal links tự nhiên theo cấu trúc hệ thống INTERNAL_LINKING_SYSTEM, ưu tiên dùng mẫu câu tự nhiên đã cung cấp. Đảm bảo mỗi link đều có giá trị thực sự cho người đọc và liên quan trực tiếp đến nội dung.]
</p>

<img src="https://example.com/image5.jpg"
     alt="Mô tả ảnh minh họa phần H2 thứ 5"
     title="Tiêu đề ảnh minh họa H2 5" />

<h3>Mục H3 phụ 5.1: [Tên nội dung chi tiết]</h3>

<p>
[Content 400-500 từ: Phân tích xu hướng, đưa ra dự đoán và lời khuyên.]
</p>

<h2>Mục H2 thứ 6: [Tên phần nội dung chính 6]</h2>

<p>
[Content 1000-1200 từ: Tóm tắt phần trước, nhấn mạnh giá trị cốt lõi hoặc chuyển sang phần kết luận.]
</p>

<img src="https://example.com/image6.jpg"
     alt="Mô tả ảnh minh họa phần H2 thứ 6"
     title="Tiêu đề ảnh minh họa H2 6" />

<h3>Mục H3 phụ 6.1: [Tên nội dung chi tiết]</h3>

<p>
[Content 400-500 từ: Hướng dẫn cụ thể cách áp dụng, tips thực tế.]
</p>

<h2>Mục H2 thứ 7: [Tên phần nội dung chính 7]</h2>

<p>
[Content 800-1000 từ: Phần bổ sung, có thể là troubleshooting, lưu ý quan trọng, hoặc các câu hỏi thường gặp.]
</p>

<img src="https://example.com/image6.jpg"
     alt="Mô tả ảnh minh họa phần H2 thứ 7"
     title="Tiêu đề ảnh minh họa H2 7" />

<hr />

<h2>Kết luận</h2>

<p>
[Conclusion 150-250 từ: Tóm tắt toàn bài, khẳng định lại quan điểm hoặc giá trị chính. Có thể chèn CTA nhẹ: “Khám phá thêm tại…”, “Xem bộ sưu tập…”, hoặc “Liên hệ ngay để được tư vấn”.]
</p>

<hr />

<h2>FAQs</h2>

<h3>Q1: [Câu hỏi thường gặp 1]</h3>
<p>
A: [Trả lời 50-100 từ, súc tích và dễ hiểu. Có thể thêm ví dụ minh họa hoặc link nội bộ nếu cần.]
</p>

<h3>Q2: [Câu hỏi thường gặp 2]</h3>
<p>
A: [Trả lời 50-100 từ, cung cấp thông tin cụ thể, hữu ích.]
</p>

<h3>Q3: [Câu hỏi thường gặp 3]</h3>
<p>
A: [Trả lời 50-100 từ, hướng dẫn chi tiết hoặc lời khuyên thực tế.]
</p>

<h3>Q4: [Câu hỏi thường gặp 4]</h3>
<p>
A: [Trả lời 50-100 từ.]
</p>

<h3>Q5: [Câu hỏi thường gặp 5]</h3>
<p>
A: [Trả lời 50-100 từ.]
</p>

<hr />"
}

Không giải thích gì thêm, chỉ trả về JSON hợp lệ.`;