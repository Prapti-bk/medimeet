import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Stethoscope, Star, Shield, Zap, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Pricing from "@/components/pricing";
import { creditBenefits, features, testimonials } from "@/lib/data";

export default function Home() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center pt-20 pb-16 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f0f7ff] via-[#f8fbff] to-[#eef4ff]" />
          {/* Blobs */}
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-200/40 to-cyan-200/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-200/30 to-indigo-200/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-teal-100/20 to-sky-100/20 blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{backgroundImage:"linear-gradient(#0ea5e9 1px,transparent 1px),linear-gradient(90deg,#0ea5e9 1px,transparent 1px)",backgroundSize:"48px 48px"}} />
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <div className="space-y-8">
              {/* Trust pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-200/60 shadow-sm backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-sky-700">AI-Powered Healthcare Platform</span>
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold text-slate-900 leading-[1.06] tracking-tight">
                Your health,{" "}
                <span className="gradient-title">brilliantly</span>{" "}
                connected.
              </h1>

              <p className="text-slate-500 text-lg md:text-xl max-w-lg leading-relaxed font-medium">
                Book appointments with verified doctors, consult via HD video,
                and track your health journey — all in one beautifully designed platform.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                {[
                  { icon: <Shield className="h-4 w-4 text-emerald-500" />, text: "HIPAA Compliant" },
                  { icon: <Star className="h-4 w-4 text-amber-400 fill-amber-400" />, text: "4.9 / 5 Rating" },
                  { icon: <Zap className="h-4 w-4 text-sky-500" />, text: "Instant Booking" },
                ].map((t) => (
                  <span key={t.text} className="flex items-center gap-1.5">
                    {t.icon} {t.text}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold px-8 shadow-lg shadow-sky-300/40 border-0 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-300/50"
                >
                  <Link href="/onboarding">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-2xl border-slate-200 bg-white/80 text-slate-700 hover:bg-white hover:border-sky-300 font-semibold px-8 backdrop-blur-sm transition-all hover:-translate-y-0.5"
                >
                  <Link href="/doctors">Browse Doctors</Link>
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {["A","B","C","D"].map((l) => (
                    <div key={l} className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  <span className="text-slate-800 font-bold">2,400+</span> patients trust MediMeet
                </p>
              </div>
            </div>

            {/* Right — hero image */}
            <div className="relative">
              {/* Floating card 1 */}
              <div className="absolute -top-6 -left-6 z-10 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-sky-100 flex items-center gap-3 animate-[float_4s_ease-in-out_infinite]">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-md">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Appointment Confirmed</p>
                  <p className="text-sm font-bold text-slate-800">Dr. Priya Sharma</p>
                </div>
              </div>

              {/* Floating card 2 */}
              <div className="absolute -bottom-4 -right-4 z-10 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-violet-100 flex items-center gap-3 animate-[float_5s_ease-in-out_0.5s_infinite]">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center shadow-md">
                  <Star className="h-5 w-5 text-white fill-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Patient Review</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
                  </div>
                </div>
              </div>

              {/* Main image */}
              <div className="relative h-[420px] lg:h-[540px] rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(14,165,233,0.18)] border border-white/60">
                <div className="absolute inset-0 bg-gradient-to-t from-sky-100/30 to-transparent z-10 pointer-events-none rounded-3xl" />
                <Image
                  src="/banner2.png"
                  alt="Doctor consultation"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-b from-white to-[#f4f9ff]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-sky-50 text-sky-700 border-sky-200 font-semibold px-4 py-1.5 rounded-full">
              How it works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-5">
              Simple. Fast.{" "}
              <span className="gradient-title">Reliable.</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Our platform makes premium healthcare accessible with just a few clicks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const gradients = [
                "from-sky-400 to-cyan-400",
                "from-violet-400 to-indigo-400",
                "from-teal-400 to-emerald-400",
                "from-orange-400 to-pink-400",
                "from-blue-400 to-sky-400",
                "from-purple-400 to-violet-400",
              ];
              const grad = gradients[index % gradients.length];
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-7 border border-slate-100 hover:border-sky-200 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Subtle gradient top border on hover */}
                  <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-3xl bg-gradient-to-r from-sky-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${grad} shadow-lg mb-5`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-50 text-violet-700 border-violet-200 font-semibold px-4 py-1.5 rounded-full">
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-5">
              Consultation{" "}
              <span className="gradient-title">Packages</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
              Choose the perfect package that fits your healthcare needs
            </p>
          </div>

          <div className="mx-auto">
            <Pricing />

            {/* Credit system explainer */}
            <div className="mt-12 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-3xl border border-sky-100 p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 shadow-md">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  How Our Credit System Works
                </h3>
              </div>
              <ul className="space-y-3">
                {creditBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 bg-gradient-to-br from-sky-400 to-cyan-400 p-1 rounded-full shrink-0 shadow-sm">
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: benefit }} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-b from-[#f4f9ff] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-4 py-1.5 rounded-full">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-5">
              Loved by{" "}
              <span className="gradient-title">patients & doctors</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
              Real stories from people who transformed their healthcare experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-7 border border-slate-100 hover:border-sky-200 shadow-sm hover:shadow-xl hover:shadow-sky-100/40 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-md shrink-0">
                    <span className="text-white font-bold text-sm">
                      {testimonial.initials}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 p-12 md:p-20 text-center shadow-[0_32px_80px_rgba(14,165,233,0.30)]">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-white/5 rounded-full blur-2xl" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
                Start your journey today
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                Ready to take control of your healthcare?
              </h2>
              <p className="text-sky-50 text-lg mb-10 font-medium leading-relaxed">
                Join thousands of users who have simplified their healthcare journey.
                Get started free — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl bg-white text-sky-700 hover:bg-sky-50 font-bold px-9 shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <Link href="/sign-up">Sign Up Free</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-2xl border-white/40 bg-white/10 text-white hover:bg-white/20 font-semibold px-9 backdrop-blur-sm transition-all hover:-translate-y-0.5"
                >
                  <Link href="#pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-gradient-to-b from-[#f4f9ff] to-[#eef4ff] border-t border-sky-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">
            © 2026 MediMeet. Built with ❤️ for better healthcare.
          </p>
        </div>
      </footer>
    </div>
  );
}
