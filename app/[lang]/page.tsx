"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LanguageSwitcher } from "@/components/language-switcher"
import { usePathname } from "next/navigation"
import {
  Heart,
  DollarSign,
  Users,
  FileText,
  Calendar,
  Upload,
  CheckCircle,
  Shield,
  Zap,
  Target,
  TrendingUp,
  MessageCircle,
  Award,
  Globe,
  Smartphone,
  Laptop,
  Database,
  Lock,
  BarChart3,
  ArrowRight,
  X,
  MessageCircleQuestion,
  CircleDashed,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/components/i18n-provider"

export default function SolucionesHumanas() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [referrals, setReferrals] = useState(1)
  const [monthlyEarnings, setMonthlyEarnings] = useState(25)

  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = pathname.split("/")[1] // Assumes /locale/path

  const { user } = useAuth()
  const { createCheckoutSession, loading, error } = useStripeCheckout()
  const { t } = useTranslations()

  const calculateEarnings = (refs: number) => {
    const directCommission = refs * 25
    const indirectCommission = Math.floor(refs * 0.3) * 12.5
    return directCommission + indirectCommission
  }

  const handleReferralChange = (value: string) => {
    const refs = Number.parseInt(value) || 0
    setReferrals(refs)
    setMonthlyEarnings(calculateEarnings(refs))
  }

  const handlePlanSelection = async (planId: number) => {
    if (!user) {
      router.push(`/${currentLocale}/login`)
      return
    }

    await createCheckoutSession(planId, currentLocale)
  }

  const navigation = [
    { name: t("header.home"), href: `#inicio` },
    { name: t("header.services"), href: `#servicios` },
    { name: t("header.process"), href: `#proceso` },
    { name: t("header.compensation"), href: `#compensacion` },
    { name: t("header.plans"), href: `#planes` },
    { name: t("header.contact"), href: `#contacto` },
  ]

  const features = [
    {
      icon: DollarSign,
      title: t("features.financial_advice_title"),
      description: t("features.financial_advice_description"),
      details: t("features.financial_advice_details"),
      features: [
        t("features.financial_advice_feature1"),
        t("features.financial_advice_feature2"),
        t("features.financial_advice_feature3"),
      ],
    },
    {
      icon: Users,
      title: t("features.family_relationships_title"),
      description: t("features.family_relationships_description"),
      details: t("features.family_relationships_details"),
      features: [
        t("features.family_relationships_feature1"),
        t("features.family_relationships_feature2"),
        t("features.family_relationships_feature3"),
      ],
    },
    {
      icon: Heart,
      title: t("features.relationship_problems_title"),
      description: t("features.relationship_problems_description"),
      details: t("features.relationship_problems_details"),
      features: [
        t("features.relationship_problems_feature1"),
        t("features.relationship_problems_feature2"),
        t("features.relationship_problems_feature3"),
      ],
    },
    {
      icon: Shield,
      title: t("features.total_confidentiality_title"),
      description: t("features.total_confidentiality_description"),
      details: t("features.total_confidentiality_details"),
      features: [
        t("features.total_confidentiality_feature1"),
        t("features.total_confidentiality_feature2"),
        t("features.total_confidentiality_feature3"),
      ],
    },
    {
      icon: Zap,
      title: t("features.quick_response_title"),
      description: t("features.quick_response_description"),
      details: t("features.quick_response_details"),
      features: [
        t("features.quick_response_feature1"),
        t("features.quick_response_feature2"),
        t("features.quick_response_feature3"),
      ],
    },
    {
      icon: Target,
      title: t("features.measurable_results_title"),
      description: t("features.measurable_results_description"),
      details: t("features.measurable_results_details"),
      features: [
        t("features.measurable_results_feature1"),
        t("features.measurable_results_feature2"),
        t("features.measurable_results_feature3"),
      ],
    },
  ]

  const testimonials = [
    {
      name: "María González",
      username: "@maria_g",
      avatar: "M",
      content: t("testimonials.content1"),
      verified: true,
    },
    {
      name: "Carlos Rodríguez",
      username: "@carlos_r",
      avatar: "C",
      content: t("testimonials.content2"),
      verified: true,
    },
    {
      name: "Ana Martínez",
      username: "@ana_martinez",
      avatar: "A",
      content: t("testimonials.content3"),
      verified: true,
    },
    {
      name: "Luis Fernández",
      username: "@luis_dev",
      avatar: "L",
      content: t("testimonials.content4"),
      verified: true,
    },
    {
      name: "Patricia Silva",
      username: "@patricia_s",
      avatar: "P",
      content: t("testimonials.content5"),
      verified: false,
    },
    {
      name: "Roberto Jiménez",
      username: "@roberto_coach",
      avatar: "R",
      content: t("testimonials.content6"),
      verified: true,
    },
    {
      name: "Elena Vargas",
      username: "@elena_design",
      avatar: "E",
      content: t("testimonials.content7"),
      verified: false,
    },
    {
      name: "Diego Morales",
      username: "@diego_startup",
      avatar: "D",
      content: t("testimonials.content8"),
      verified: true,
    },
  ]

  // Duplicate testimonials for infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  const plans = [
    {
      id: 1,
      name: t("plans.standard_name"),
      price: "$49.99",
      frequency: t("plans.frequency_monthly"),
      description: t("plans.standard_description"),
      features: [
        t("plans.standard_features.0"),
        t("plans.standard_features.1"),
        t("plans.standard_features.2"),
        t("plans.standard_features.3"),
      ],
      buttonText: t("plans.standard_button"),
      highlight: false,
    },
    {
      id: 2,
      name: t("plans.premium_name"),
      price: "$149.99",
      frequency: t("plans.frequency_monthly"),
      description: t("plans.premium_description"),
      features: [
        t("plans.premium_features.0"),
        t("plans.premium_features.1"),
        t("plans.premium_features.2"),
        t("plans.premium_features.3"),
        t("plans.premium_features.4"),
      ],
      buttonText: t("plans.premium_button"),
      highlight: true,
    },
    {
      id: 3,
      name: t("plans.collaborative_name"),
      price: "$299.99",
      frequency: t("plans.frequency_monthly"),
      description: t("plans.collaborative_description"),
      features: [
        t("plans.collaborative_features.0"),
        t("plans.collaborative_features.1"),
        t("plans.collaborative_features.2"),
        t("plans.collaborative_features.3"),
        t("plans.collaborative_features.4"),
      ],
      buttonText: t("plans.collaborative_button"),
      highlight: false,
    },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between border-b border-border/40 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <Link className="flex items-center justify-center" href="#">
          <img src="/fox-lawyer-logo.png" alt="FoxLawyer Logo" className="h-8" />
          <span className="sr-only">FoxLawyer</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            {t("common.home")}
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/es/login">
            {t("common.login")}
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/es/register">
            {t("common.register")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border/40">
              <div className="flex items-center space-x-2">
                <img src="/fox-lawyer-logo.png" alt="Fox Lawyer" className="w-8 h-8" />
                <h1 className="text-xl font-bold text-foreground">Fox Lawyer</h1>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <nav className="flex flex-col space-y-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={`/${currentLocale}${item.href}`}
                    className="text-lg font-medium text-foreground hover:text-emerald-400 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>
            <div className="p-6 border-t border-border/40">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white font-medium bg-transparent"
                onClick={() => {
                  router.push(`/${currentLocale}/dashboard`)
                  setMobileMenuOpen(false)
                }}
              >
                {t("header.dashboard")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="inicio" className="py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            {/* Mobile Logo - Only visible on mobile devices */}
            <div className="md:hidden mb-8">
              <img src="/fox-lawyer-logo.png" alt="Fox Lawyer" className="w-20 h-20 mx-auto" />
            </div>

            {/* Announcement Banner */}
            <div className="inline-flex items-center space-x-2 bg-card border border-border/40 rounded-full px-4 py-2 mb-8">
              <span className="text-sm text-muted-foreground">{t("hero.banner")}</span>
              <Button variant="link" className="text-sm p-0 h-auto text-emerald-400 hover:text-emerald-300">
                {t("hero.take_survey")} <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              {t("hero.title_part1")} <span className="text-emerald-400">{t("hero.title_part2")}</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              {t("hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                {t("hero.start_transformation")}
              </Button>
              <Button size="lg" variant="outline" className="border-border/40 bg-transparent">
                {t("hero.request_demo")}
              </Button>
            </div>

            {/* Trusted by section */}
            <div className="space-y-4">
              <div className="flex justify-center items-center space-x-8 md:space-x-12">
                <Globe className="w-8 h-8 company-icon cursor-pointer" />
                <Smartphone className="w-8 h-8 company-icon cursor-pointer" />
                <Laptop className="w-8 h-8 company-icon cursor-pointer" />
                <Database className="w-8 h-8 company-icon cursor-pointer" />
                <Lock className="w-8 h-8 company-icon cursor-pointer" />
              </div>
              <p className="text-sm text-muted-foreground">{t("hero.trusted_by")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card border-border/40 bg-card/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{feature.details}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="proceso" className="py-24 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t("process.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("process.description")}</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{t("process.step1_title")}</h3>
                <p className="text-muted-foreground mb-6">{t("process.step1_description")}</p>
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-4">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("process.step1_advisor")}</span>
                        <span className="font-semibold text-emerald-400">$25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("process.step1_platform")}</span>
                        <span className="font-semibold text-emerald-400">$25</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{t("process.step2_title")}</h3>
                <p className="text-muted-foreground mb-6">{t("process.step2_description")}</p>
                <Card className="border-blue-500/20 bg-blue-500/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{t("process.step2_details")}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{t("process.step3_title")}</h3>
                <p className="text-muted-foreground mb-6">{t("process.step3_description")}</p>
                <Card className="border-purple-500/20 bg-purple-500/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{t("process.step3_details")}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compensation Plan */}
      <section id="compensacion" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t("compensation.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("compensation.description")}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-400">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {t("compensation.commission_structure_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                    <h4 className="font-semibold text-emerald-400 mb-2">{t("compensation.direct_commission_title")}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("compensation.direct_commission_description")}
                    </p>
                    <div className="flex items-center text-xs text-emerald-400">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      {t("compensation.direct_commission_details")}
                    </div>
                  </div>

                  <div className="p-4 h-80 rounded-lg border border-purple-500/20 bg-purple-500/5">
                    <h4 className="font-semibold text-purple-400 mb-2">{t("compensation.leadership_bonuses_title")}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("compensation.leadership_bonuses_description")}
                    </p>
                    <div className="flex items-center text-xs text-purple-400">
                      <Award className="w-3 h-3 mr-1" />
                      {t("compensation.leadership_bonuses_details")}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 mt-2">
                      {t("compensation.leadership_bonuses_text")}
                    </p>

                    <div className="flex items-center text-xs text-purple-400">
                      <MessageCircleQuestion className="w-3 h-3 mr-1" />
                      {t("compensation.leadership_bonuses_what_offers")}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2 ml-2">
                      <CircleDashed className="w-3 h-3 mr-1 text-purple-400" />
                      {t("compensation.leadership_bonuses_volume")}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2 ml-2">
                      <CircleDashed className="w-3 h-3 mr-1 text-purple-400" />
                      {t("compensation.leadership_bonuses_mentorship")}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2 ml-2">
                      <CircleDashed className="w-3 h-3 mr-1 text-purple-400" />
                      {t("compensation.leadership_bonuses_monthly_recognition")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-emerald-400">{t("compensation.income_calculator_title")}</CardTitle>
                <CardDescription>{t("compensation.income_calculator_description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="referrals" className="text-sm font-medium">
                    {t("compensation.direct_referrals_label")}
                  </Label>
                  <Input
                    id="referrals"
                    type="number"
                    value={referrals}
                    onChange={(e) => handleReferralChange(e.target.value)}
                    min="0"
                    className="mt-2"
                  />
                </div>

                <Separator />

                <div className="p-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">{t("compensation.estimated_monthly_income")}</p>
                    <p className="text-4xl font-bold text-emerald-400">${monthlyEarnings.toLocaleString()} USD</p>
                    <p className="text-xs text-muted-foreground">
                      {t("compensation.based_on_referrals", { referrals })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• {t("compensation.calculation_note1")}</p>
                  <p>• {t("compensation.calculation_note2")}</p>
                  <p>• {t("compensation.calculation_note3")}</p>
                </div>

                <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                  {t("compensation.start_as_advisor")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section id="planes" className="py-24 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t("plans.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("plans.description")}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`border-border/40 ${
                  plan.highlight ? "border-emerald-500 ring-2 ring-emerald-500" : ""
                } bg-card/50 hover:bg-card/80 transition-colors flex flex-col`}
              >
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between p-6 pt-0">
                  <div className="text-center mb-6">
                    <p className="text-5xl font-bold text-foreground">
                      {plan.price}
                      <span className="text-lg text-muted-foreground">/{plan.frequency}</span>
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.highlight
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-muted-foreground hover:bg-muted-foreground/80 text-white"
                    }`}
                    size="lg"
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("plans.processing")}
                      </>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {!user && (
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                {t("plans.no_account_question")}{" "}
                <Link href="/es/register">
                  <Button variant="link" className="p-0 h-auto text-emerald-400 hover:text-emerald-300">
                    {t("plans.register_here")}
                  </Button>
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Framework Integration Section */}
      <section className="py-24 px-4 bg-card/20">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">
              {t("framework_integration.tagline")}{" "}
              <span className="text-emerald-400">{t("framework_integration.highlight")}</span>
            </p>

            <h2 className="text-4xl font-bold text-foreground mb-16">
              {t("framework_integration.title_part1")}{" "}
              <span className="text-emerald-400">{t("framework_integration.title_part2")}</span>
            </h2>

            <div className="flex justify-center items-center space-x-8 md:space-x-12 opacity-60 mb-16">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{t("framework_integration.customer_stories")}</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section with Spotlight Effect */}
      <section className="py-24 px-4 spotlight-bg relative overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t("testimonials.title")}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{t("testimonials.description")}</p>

            <div className="flex justify-center space-x-4 mb-12">
              <Button variant="outline" size="sm" className="border-border/40 bg-transparent">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("testimonials.github_discussions")}
              </Button>
              <Button variant="outline" size="sm" className="border-border/40 bg-transparent">
                Discord
              </Button>
            </div>
          </div>

          {/* Infinite Scrolling Testimonials */}
          <div className="relative">
            <div className="flex space-x-6 animate-scroll">
              {duplicatedTestimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="flex-shrink-0 w-80 border-border/40 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">{testimonial.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-foreground truncate">{testimonial.name}</p>
                          {testimonial.verified && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{testimonial.username}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{testimonial.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              {t("testimonials.transform_life_part1")}{" "}
              <span className="text-emerald-400">{t("testimonials.transform_life_part2")}</span>
            </h3>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contacto" className="py-24 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t("contact.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("contact.description")}</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-center text-emerald-400">{t("contact.form_title")}</CardTitle>
                <CardDescription className="text-center">{t("contact.form_description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t("contact.first_name_label")}</Label>
                    <Input id="firstName" placeholder={t("contact.first_name_placeholder")} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t("contact.last_name_label")}</Label>
                    <Input id="lastName" placeholder={t("contact.last_name_placeholder")} className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">{t("contact.email_label")}</Label>
                  <Input id="email" type="email" placeholder={t("contact.email_placeholder")} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="phone">{t("contact.phone_label")}</Label>
                  <Input id="phone" type="tel" placeholder={t("contact.phone_placeholder")} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="service">{t("contact.importance_label")}</Label>
                  <select className="w-full p-3 mt-1 border border-input bg-background rounded-md text-sm">
                    <option value="">{t("contact.select_area")}</option>
                    <option value="financial">{t("contact.financial_advice_option")}</option>
                    <option value="family">{t("contact.family_relationships_option")}</option>
                    <option value="love">{t("contact.love_relationships_option")}</option>
                    <option value="advisor">{t("contact.become_advisor_option")}</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="service">{t("contact.interest_area_label")}</Label>
                  <select className="w-full p-3 mt-1 border border-input bg-background rounded-md text-sm">
                    <option value="">{t("contact.select_priority_level")}</option>
                    <option value="low">{t("contact.low_priority")}</option>
                    <option value="mid">{t("contact.medium_priority")}</option>
                    <option value="high">{t("contact.high_priority")}</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="message">{t("contact.message_label")}</Label>
                  <Textarea id="message" placeholder={t("contact.message_placeholder")} rows={4} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="file">{t("contact.upload_document_label")}</Label>
                  <div className="mt-1">
                    <Input id="file" type="file" className="hidden" />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("file")?.click()}
                      className="w-full border-dashed"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {t("contact.select_file")}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600">{t("contact.send_message")}</Button>
                  <Button variant="outline" className="flex-1 border-border/40 bg-transparent">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t("contact.schedule_consultation")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-[#f0f2f5] text-[#555555]">
        <p className="text-xs">&copy; 2024 FoxLawyer. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
