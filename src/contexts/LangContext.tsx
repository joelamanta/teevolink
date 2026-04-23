import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { translations, type Lang } from '../i18n/translations'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: k => k })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    (localStorage.getItem('teevolink-lang') as Lang) ?? 'en'
  )

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('teevolink-lang', l)
  }, [])

  const t = useCallback((key: string): string =>
    translations[lang][key] ?? translations.en[key] ?? key
  , [lang])

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
