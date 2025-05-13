export const LANGUAGES = {
    he: {
      code: 'he',
      isRTL: true,
    },
    en: {
      code: 'en',
      isRTL: false,
    },
    ar: {
        code: 'ar',
        isRTL: true,
      },
    zh: {
      code: 'zh',
      isRTL: false,
    },
  } as const;
  
  export type Language = keyof typeof LANGUAGES; 
  
  export interface SiteContentRequestBody {
    language: Language;
  }
  