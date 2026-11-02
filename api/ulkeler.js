
export default async function handler(req, res) {
  const allowedOrigins = [
    "https://en.cocukgiyimmerkezi.com",
    "https://www.cocukgiyimmerkezi.com"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      hata: "Method not allowed"
    });
  }

  try {
    const response = await fetch(
      "https://api.ptt.gov.tr/api/DeliveryFee/getCountriesByType?type=YD%20KOL%C4%B0",
      {
        method: "GET",
        headers: {
          "Accept": "*/*",
          "Origin": "https://www.ptt.gov.tr",
          "Referer": "https://www.ptt.gov.tr/",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8"
        }
      }
    );

    const data = await response.text();

    return res
      .status(response.status)
      .setHeader("Content-Type", "application/json; charset=utf-8")
      .send(data);

  } catch (error) {
    return res.status(502).json({
      hata: "PTT bağlantı hatası",
      detay: error.message,
      neden: error.cause?.message || null,
      kod: error.cause?.code || null,
      hostname: error.cause?.hostname || null
    });
  }
}
