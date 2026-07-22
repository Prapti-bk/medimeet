import React from "react";
import { Button } from "./ui/button";
import {
  Calendar,
  CreditCard,
  ShieldCheck,
  Stethoscope,
  User,
  LayoutDashboard,
  MapPin,
  Sparkles,
  BookOpen,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import { Badge } from "./ui/badge";
import { checkAndAllocateCredits } from "@/actions/credits";
import Image from "next/image";

export default async function Header() {
  const user = await checkUser();
  if (user?.role === "PATIENT") {
    await checkAndAllocateCredits(user);
  }

  const isSignedIn = !!user;

  return (
    <header className="fixed top-0 w-full z-40">
      {/* Frosted glass bar */}
      <div className="mx-3 mt-3 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_4px_24px_rgba(14,165,233,0.08),0_1px_4px_rgba(0,0,0,0.04)] supports-[backdrop-filter]:bg-white/65">
        <nav className="container mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <Image
              src="/logo-single.png"
              alt="MediMeet"
              width={160}
              height={48}
              className="h-8 w-auto object-contain transition-opacity group-hover:opacity-80"
            />
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1.5">
            {isSignedIn && (
              <>
                {/* ADMIN */}
                {user?.role === "ADMIN" && (
                  <NavLink href="/admin" icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Admin" />
                )}

                {/* DOCTOR */}
                {user?.role === "DOCTOR" && (
                  <NavLink href="/doctor" icon={<Stethoscope className="h-3.5 w-3.5" />} label="Dashboard" />
                )}

                {/* PATIENT */}
                {user?.role === "PATIENT" && (
                  <>
                    <NavLink href="/dashboard"                        icon={<LayoutDashboard className="h-3.5 w-3.5" />} label="Dashboard" />
                    <NavLink href="/dashboard/wellness"               icon={<Activity className="h-3.5 w-3.5" />}       label="Wellness" />
                    <NavLink href="/dashboard/nearby-hospitals"       icon={<MapPin className="h-3.5 w-3.5" />}         label="Hospitals" />
                    <NavLink href="/dashboard/medical-awareness"      icon={<BookOpen className="h-3.5 w-3.5" />}       label="Awareness" />
                    <NavLink href="/appointments"                     icon={<Calendar className="h-3.5 w-3.5" />}       label="Appointments" />
                  </>
                )}

                {/* UNASSIGNED */}
                {user?.role === "UNASSIGNED" && (
                  <NavLink href="/onboarding" icon={<User className="h-3.5 w-3.5" />} label="Complete Profile" />
                )}
              </>
            )}

            {/* Credits / Pricing badge */}
            {(!user || user?.role !== "ADMIN") && (
              <Link href={user?.role === "PATIENT" ? "/pricing" : "/doctors"}>
                <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-700 hover:from-sky-100 hover:to-cyan-100 transition-colors shadow-sm">
                  <CreditCard className="h-3.5 w-3.5 text-sky-500" />
                  {user && user.role !== "ADMIN" ? (
                    <>
                      {user.credits}
                      <span className="hidden md:inline text-sky-600">
                        {user?.role === "PATIENT" ? " Credits" : " Earned"}
                      </span>
                    </>
                  ) : (
                    "Pricing"
                  )}
                </span>
              </Link>
            )}

            {/* Sign in */}
            {!isSignedIn && (
              <>
                <Link href="/doctors">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl text-sm font-medium">
                    Find Doctors
                  </Button>
                </Link>
                <SignInButton>
                  <Button
                    size="sm"
                    className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold shadow-md shadow-sky-200/60 border-0 px-5"
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </>
            )}

            {/* User avatar */}
            {isSignedIn && (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 ring-2 ring-sky-200 ring-offset-1",
                    userButtonPopoverCard: "shadow-2xl rounded-2xl border border-sky-100",
                    userPreviewMainIdentifier: "font-semibold text-slate-800",
                  },
                }}
                afterSignOutUrl="/"
              />
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, icon, label }) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        size="sm"
        className="hidden md:inline-flex items-center gap-1.5 rounded-xl text-slate-600 hover:text-sky-700 hover:bg-sky-50/80 font-medium text-sm h-8 px-3 transition-all"
      >
        <span className="text-sky-500">{icon}</span>
        {label}
      </Button>
      <Button variant="ghost" size="sm" className="md:hidden w-9 h-9 p-0 rounded-xl text-sky-500 hover:bg-sky-50">
        {icon}
      </Button>
    </Link>
  );
}
