// https://emojipedia.org/
const COUNTRIES: Record<string, string[]> = {
  "🇦🇷 AR 阿根廷": ["🇦🇷", "AR", "阿根廷"],
  "🇦🇺 AU 澳大利亚": ["🇦🇺", "AU", "澳大利亚"],
  "🇨🇦 CA 加拿大": ["🇨🇦", "CA", "加拿大"],
  "🇨🇭 CH 瑞士": ["🇨🇭", "CH", "瑞士"],
  "🇩🇪 DE 德国": ["🇩🇪", "DE", "德国"],
  "🇪🇸 ES 西班牙": ["🇪🇸", "ES", "西班牙"],
  "🇫🇷 FR 法国": ["🇫🇷", "FR", "法国"],
  "🇬🇧 UK 英国": ["🇬🇧", "UK", "英国"],
  "🇭🇰 HK 香港": ["🇭🇰", "HK", "香港"],
  "🇮🇪 IE 爱尔兰": ["🇮🇪", "IE", "爱尔兰"],
  "🇮🇱 IL 以色列": ["🇮🇱", "IL", "以色列"],
  "🇮🇳 IN 印度": ["🇮🇳", "IN", "印度"],
  "🇯🇵 JP 日本": ["🇯🇵", "JP", "日本"],
  "🇰🇷 KR 韩国": ["🇰🇷", "KR", "韩国"],
  "🇳🇱 NL 荷兰": ["🇳🇱", "NL", "荷兰"],
  "🇳🇴 NO 挪威": ["🇳🇴", "NO", "挪威"],
  "🇷🇺 RU 俄罗斯": ["🇷🇺", "RU", "俄罗斯"],
  "🇷🇺 SG 新加坡": ["🇷🇺", "SG", "新加坡"],
  "🇸🇪 SE 瑞典": ["🇸🇪", "SE", "瑞典"],
  "🇹🇷 TR 土耳其": ["🇹🇷", "TR", "土耳其"],
  "🇹🇼 TW 台湾": ["🇹🇼", "TW", "台湾"],
  "🇺🇦 UA 乌克兰": ["🇺🇦", "UA", "乌克兰"],
  "🇺🇸 US 美国": ["🇺🇸", "US", "美国"],
  "🇿🇦 ZA 南非": ["🇿🇦", "ZA", "南非"],
};

async function getCountry(name: string): Promise<string> {
  for (const country in COUNTRIES) {
    for (const pattern of COUNTRIES[country]) {
      if (name.includes(pattern)) {
        return country;
      }
    }
  }
  return "🏳️‍🌈 Other";
}

export async function groupProxies(
  proxies: string[],
): Promise<Record<string, string[]>> {
  const groups: Record<string, string[]> = {};
  for (const proxy_name of proxies) {
    const country = await getCountry(proxy_name);
    if (!country) continue;
    if (country in groups) {
      groups[country].push(proxy_name);
    } else {
      groups[country] = [proxy_name];
    }
  }
  return groups;
}
