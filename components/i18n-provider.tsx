"use client"

import type React from "react"

import { NextIntlClientProvider, useMessages } from "next-intl"
import { createContext, useContext } from "react"

interface I18nContextType {
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children, locale }: { children: React.ReactNode; locale: string }) {
  const messages = useMessages()

  // Simple translation function for client components
  const t = (key: string): string => {
    const keys = key.split(".")
    let current: any = messages
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k]
      } else {
        return key // Return the key itself if not found
      }
    }
    return typeof current === "string" ? current : key
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <I18nContext.Provider value={{ t }}>{children}</I18nContext.Provider>
    </NextIntlClientProvider>
  )
}

export function useTranslations() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useTranslations must be used within an I18nProvider")
  }
  return context
}
