
import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

const allowedOrigins = [
  "https://en.cocukgiyimmerkezi.com",
  "https://www.cocukgiyimmerkezi.com"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

const PTT_COUNTRIES =
  "https://api.ptt.gov.tr/api/DeliveryFee/getCountriesByType?type=YD%20KOL%C4%B0";

app.get("/", (req, res) => {
  res.json({
    durum: "PTT API sunucusu aktif",
    servisler: ["/ulkeler", "/test"]
  });
});

app.get("/test", async (req, res) => {
  const sonuc = {};

  for (const [ad, url] of [
    ["PTT_WEB", "https://www.ptt.gov.tr/"],
    ["PTT_API", PTT_COUNTRIES]
  ]) {
    try {
      const response = await fetch(url, {
        headers: {
          "Accept": "*/*",
          "Origin": "https://www.ptt.gov.tr",
          "Referer": "https://www.ptt.gov.tr/"
        },
        signal: AbortSignal.timeout(20000)
      });

      const body = await response.text();

      sonuc[ad] = {
        durum: response.status,
        cevap: body.substring(0, 500)
      };
    } catch (error) {
      sonuc[ad] = {
        hata: error.message,
        neden: error.cause?.message || null,
        kod: error.cause?.code || null
      };
    }
  }

  res.json(sonuc);
});

app.get("/ulkeler", async (req, res) => {
  try {
    const response = await fetch(PTT_COUNTRIES, {
      headers: {
        "Accept": "*/*",
        "Origin": "https://www.ptt.gov.tr",
        "Referer": "https://www.ptt.gov.tr/"
      },
      signal: AbortSignal.timeout(20000)
    });

    const body = await response.text();

    if (!response.ok) {
      return res.status(502).json({
        hata: "PTT ülke servisi yanıt vermedi",
        pttDurum: response.status,
        cevap: body.substring(0, 500)
      });
    }

    try {
      return res
        .status(200)
        .type("application/json")
        .send(JSON.stringify(JSON.parse(body)));
    } catch {
      return res.status(502).json({
        hata: "PTT geçerli JSON döndürmedi",
        cevap: body.substring(0, 500)
      });
    }
  } catch (error) {
    return res.status(502).json({
      hata: "PTT bağlantı hatası",
      detay: error.message,
      neden: error.cause?.message || null,
      kod: error.cause?.code || null
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`PTT API sunucusu ${PORT} portunda çalışıyor.`);
});
