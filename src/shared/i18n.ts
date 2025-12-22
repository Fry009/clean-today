type Lang = 'es' | 'en';

const dict: Record<Lang, Record<string, string>> = {
  es: {
    today: 'Hoy',
    jobs: 'Servicios',
    kpis: 'KPIs',
    profile: 'Perfil',
    sync: 'Sincronizar',
    premium: 'Premium'
  },
  en: {
    today: 'Today',
    jobs: 'Jobs',
    kpis: 'KPIs',
    profile: 'Profile',
    sync: 'Sync',
    premium: 'Premium'
  }
};

let currentLang: Lang = 'es';

export function setLang(lang: Lang) {
  currentLang = lang;
}

export function t(key: string) {
  return dict[currentLang][key] || key;
}
