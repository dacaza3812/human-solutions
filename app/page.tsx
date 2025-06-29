import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default function HomePage() {
  const headersList = headers()
  const acceptLanguage = headersList.get("accept-language")

  // Determine the preferred language
  let lang = "es" // Default to Spanish
  if (acceptLanguage) {
    if (acceptLanguage.includes("en")) {
      lang = "en"
    } else if (acceptLanguage.includes("es")) {
      lang = "es"
    }
  }

  // Redirect to the localized home page
  redirect(`/${lang}`)
}
