const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK_URL) console.warn("DISCORD_WEBHOOK_URL is not set.");

app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(rateLimit({ windowMs: 60 * 1000, max: 10 }));

app.post("/api/submit", async (req, res) => {
  try {
    if (!WEBHOOK_URL) {
      return res.status(500).json({
        ok: false,
        error: "Webhook غير مضبوط."
      });
    }

    const d = req.body || {};

    const fields = [
      ["الاسم داخل لعبه", d.name],
      ["ID", d.id],
      ["رقم مملكة", d.kingdom],
      ["مدة اللعب في لعبه منذ انشاء الحساب", d.playDuration],
      ["العمر(الحقيقي)", d.age],
      ["معرف ديسكورد الخاص بك", d.discord],
      ["URL قناة يوتيوب خاصه بك", d.youtube || "—"],
      ["التقييم في صناعة المحتوى", d.rating + " / 5"],
      ["كم هي خبرتك؟", d.experience],
      ["كم قوتك الحاليه في لعبه؟", d.power],
      ["لاعب مجاني او لاعب يشحن؟", d.spender],
      ["هل لديك اصرار لصناعة المحتوى؟", d.determination],
      [
        "ما سبب قدومك لتصبح صانع محتوى هل بدافع راتب او مهنة او شغف؟",
        d.reason
      ],
      ["كم تقييم لعبه من ناحيه كل شي؟", d.gameRating],
      [
        "هل لديك اقتراحات تنفذها لتحسين من صورة العبه؟",
        d.suggestions
      ],
      ["هل كنت يوتيوبر في لعبه اخرى؟", d.otherYoutuber]
    ];

    if (d.otherGameReason) {
      fields.push([
        "فما هي لعبه ولماذا تركت صناعة محتوى عنها",
        d.otherGameReason
      ]);
    }

    const safe = (v) => String(v ?? "—").slice(0, 1000);

    const embeds = [
      {
        title: "استبيان لعبة الحصن",
        fields: fields.map(([name, value]) => ({
          name,
          value: safe(value),
          inline: false
        })),
        timestamp: new Date().toISOString()
      }
    ];

    const r = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ embeds })
    });

    if (!r.ok) {
      return res.status(502).json({
        ok: false,
        error: "تعذر إرسال الاستبيان إلى Discord."
      });
    }

    res.json({ ok: true });

  } catch (e) {
    res.status(500).json({
      ok: false,
      error: "حدث خطأ أثناء الإرسال."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});
