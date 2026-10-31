import { NextResponse } from "next/server";
import OpenAI from "openai";
import { triageLegalQuery, matchSpecialists, STATUTORY_CITATIONS } from "@/lib/triage";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, conversation_id, history = [], region } = body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Xabar matni kiritilmadi" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Check if real OpenAI key is provided and valid
    if (apiKey && !apiKey.includes("your-openai-api-key") && !apiKey.includes("placeholder")) {
      try {
        const openai = new OpenAI({ apiKey });

        const systemPrompt = `Siz O'zbekiston Respublikasi qonunchiligi bo'yicha sun'iy intellekt huquqiy tahlilchisisiz ("Huquqiy Yordam" / Themis platformasi).
Vazifangiz:
1. Foydalanuvchining huquqiy muammosini tahlil qilish va qisqacha tushuntirish.
2. Qaysi huquqiy sohaga tegishli ekanligini aniqlash (labor, family, civil, housing, criminal, administrative, business, property, contract, tax).
3. 2-3 ta aniq amaliy qadamni ko'rsatish. Mehnat nizolarida albatta "Mehnat kodeksiga binoan" iborasini va 161, 244-moddalarni kiriting.
4. Manbalarga (O'zbekiston Respublikasi Kodekslari: Mehnat, Fuqarolik, Oila, Uy-joy, Jinoyat, Soliq va hk) qat'iy tayanish.
5. Advokat konsultatsiyasi zarurligini baholash.

Cheklovlar:
- Siz rasmiy advokat emassiz, bu birlamchi huquqiy yo'naltirish.
- O'ylab topilgan moddalarni keltirmang, faqat O'zbekiston Respublikasi amaldagi qonunlariga (Lex.uz) asoslaning.
- Javobni FAQAT quyidagi JSON formatida qaytaring:
{
  "content": "Javob matni (O'zbek tilida, professional yuridik uslubda, paragraflar bilan)",
  "category": "labor | family | civil | housing | criminal | administrative | business | property | contract | tax",
  "sources": [{"title": "O'zbekiston Respublikasi Yangi Mehnat Kodeksi", "article": "161, 244-moddalar", "url": "https://lex.uz/docs/6257288"}],
  "needs_specialist": true
}`;

        const messages: any[] = [
          { role: "system", content: systemPrompt },
          ...history.map((h: any) => ({ role: h.role, content: h.content })),
          { role: "user", content: message },
        ];

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const raw = completion.choices[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          const matchedSpecs = matchSpecialists(parsed.category, region);
          const officialSources =
            parsed.sources && parsed.sources.length > 0
              ? parsed.sources
              : STATUTORY_CITATIONS[parsed.category] || STATUTORY_CITATIONS.civil;

          return NextResponse.json({
            conversation_id: conversation_id || "conv-" + Date.now(),
            response: {
              content: parsed.content,
              category: parsed.category,
              sources: officialSources,
              needs_specialist: parsed.needs_specialist !== false,
              recommended_specialists: matchedSpecs,
            },
          });
        }
      } catch (aiErr) {
        console.warn("OpenAI API call failed or quota reached, falling back to smart rule-based AI advisor:", aiErr);
      }
    }

    // High-Precision Knowledge Base Engine (with Uzbek Morphological & Tokenized Scoring)
    const triage = triageLegalQuery(message, { region });

    return NextResponse.json({
      conversation_id: conversation_id || "conv-" + Date.now(),
      response: {
        content: triage.content,
        category: triage.category,
        sources: triage.sources,
        needs_specialist: triage.needs_specialist,
        recommended_specialists: triage.recommended_specialists,
        structured_sections: triage.structured_sections,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server xatosi" }, { status: 500 });
  }
}
