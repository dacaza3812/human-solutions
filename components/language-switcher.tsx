"use client"

import { useRouter, usePathname } from "next/navigation"
import { useTranslations } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GlobeIcon } from "lucide-react"

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslations()

  const currentLocale = pathname.split("/")[1] // e.g., "es" from "/es/dashboard"

  const changeLanguage = (locale: string) => {
    // Replace the current locale in the pathname with the new locale
    const newPathname = `/${locale}${pathname.substring(currentLocale.length + 1)}`
    router.push(newPathname)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <GlobeIcon className="h-5 w-5" />
          <span className="sr-only">{t("common.language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("en")}>{t("common.english")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("es")}>{t("common.spanish")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
