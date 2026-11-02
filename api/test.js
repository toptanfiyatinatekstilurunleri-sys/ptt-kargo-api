
export default async function handler(req, res) {
  const targets = [
    {
      ad: "PTT_WEB",
      url: "https://www.ptt.gov.tr/"
    },
    {
      ad: "PTT_API",
      url: "https://api.ptt.gov.tr/api/DeliveryFee/getCountriesByType?type=YD%20KOL%C4%B0"
    }
  ];

  const results = [];

  for (const target of targets) {
    try {
      const response = await fetch(target.url, {
        method: "GET",
        headers: {
          "Accept": "*/*",
          "Origin": "https://www.ptt.gov.tr",
          "Referer": "https://www.ptt.gov.tr/"
        }
      });

      const body = await response.text();

      results.push({
        servis: target.ad,
        durum: response.status,
        cevap: body.substring(0, 500)
      });
    } catch (error) {
      results.push({
        servis: target.ad,
        hata: error.message,
        neden: error.cause?.message || null,
        kod: error.cause?.code || null
      });
    }
  }

  return res.status(200).json(results);
}
