[1mdiff --git a/public/manifest.json b/public/manifest.json[m
[1mindex b97905f..9205653 100644[m
[1m--- a/public/manifest.json[m
[1m+++ b/public/manifest.json[m
[36m@@ -1,5 +1,5 @@[m
 {[m
[31m-  "name": "Trekly — Kerja Asik, Hidup Santai",[m
[32m+[m[32m  "name": "Trekly — Kerja Asik, Hidup Asik",[m
   "short_name": "Trekly",[m
   "description": "Personal productivity, habit tracker, and gamified streak system.",[m
   "start_url": "/",[m
[1mdiff --git a/scripts/generate-icons.js b/scripts/generate-icons.js[m
[1mindex 9dfffb8..7cf4381 100644[m
[1m--- a/scripts/generate-icons.js[m
[1m+++ b/scripts/generate-icons.js[m
[36m@@ -119,7 +119,7 @@[m [masync function main() {[m
 [m
   // Generate Web App Manifest[m
   const manifest = {[m
[31m-    name: "Trekly — Kerja Asik, Hidup Santai",[m
[32m+[m[32m    name: "Trekly — Kerja Asik, Hidup Asik",[m
     short_name: "Trekly",[m
     description: "Personal productivity, habit tracker, and gamified streak system.",[m
     start_url: "/",[m
[1mdiff --git a/src/app/(auth)/layout.tsx b/src/app/(auth)/layout.tsx[m
[1mindex 106b4b4..a2faf27 100644[m
[1m--- a/src/app/(auth)/layout.tsx[m
[1m+++ b/src/app/(auth)/layout.tsx[m
[36m@@ -30,7 +30,7 @@[m [mexport default function AuthLayout({[m
             <span>Trekly</span>[m
           </Link>[m
           <p className="text-xs font-bold uppercase tracking-widest text-[#1a2e1f]/70 mt-1">[m
[31m-            Kerja Asik • Hidup Santai[m
[32m+[m[32m            Kerja Asik • Hidup Asik[m
           </p>[m
         </div>[m
 [m
[1mdiff --git a/src/app/components/landing/LandingPage.tsx b/src/app/components/landing/LandingPage.tsx[m
[1mindex 65c3ac9..5a7e9bb 100644[m
[1m--- a/src/app/components/landing/LandingPage.tsx[m
[1m+++ b/src/app/components/landing/LandingPage.tsx[m
[36m@@ -263,7 +263,7 @@[m [mexport default function LandingPage({ user, tasks = [], activities = [], current[m
             >[m
               Kerja Asik,[m
               <br />[m
[31m-              <span className="text-[#ffc93c]">Hidup Santai.</span>[m
[32m+[m[32m              <span className="text-[#ffc93c]">Hidup Asik.</span>[m
             </h1>[m
 [m
             <p[m
[36m@@ -934,7 +934,7 @@[m [mexport default function LandingPage({ user, tasks = [], activities = [], current[m
               TREKLY[m
             </span>[m
             <p className="text-xs font-bold uppercase tracking-widest text-[#1a2e1f]/70 mt-0.5">[m
[31m-              Kerja Asik • Hidup Santai[m
[32m+[m[32m              Kerja Asik • Hidup Asik[m
             </p>[m
           </div>[m
 [m
[1mdiff --git a/src/app/dashboard/MobileNav.tsx b/src/app/dashboard/MobileNav.tsx[m
[1mindex 5516e06..cbc9725 100644[m
[1m--- a/src/app/dashboard/MobileNav.tsx[m
[1m+++ b/src/app/dashboard/MobileNav.tsx[m
[36m@@ -1,40 +1,46 @@[m
[31m-'use client';[m
[32m+[m[32m"use client";[m
 [m
[31m-import { useState, useEffect, useCallback } from 'react';[m
[31m-import Link from 'next/link';[m
[31m-import { usePathname } from 'next/navigation';[m
[31m-import { Menu, X, Snowflake, Flame } from 'lucide-react';[m
[31m-import { DASHBOARD_NAV_ITEMS } from './SidebarNav';[m
[31m-import TreklyLogo from '@/app/components/TreklyLogo';[m
[31m-import { useTheme } from '@/app/context/ThemeContext';[m
[32m+[m[32mimport { useState, useEffect, useCallback } from "react";[m
[32m+[m[32mimport Link from "next/link";[m
[32m+[m[32mimport { usePathname } from "next/navigation";[m
[32m+[m[32mimport { Menu, X, Snowflake, Flame } from "lucide-react";[m
[32m+[m[32mimport { DASHBOARD_NAV_ITEMS } from "./SidebarNav";[m
[32m+[m[32mimport TreklyLogo from "@/app/components/TreklyLogo";[m
[32m+[m[32mimport { useTheme } from "@/app/context/ThemeContext";[m
 [m
[31m-export default function MobileNav({ currentStreak, freezeCount }: { currentStreak: number; freezeCount: number }) {[m
[32m+[m[32mexport default function MobileNav({[m
[32m+[m[32m  currentStreak,[m
[32m+[m[32m  freezeCount,[m
[32m+[m[32m}: {[m
[32m+[m[32m  currentStreak: number;[m
[32m+[m[32m  freezeCount: number;[m
[32m+[m[32m}) {[m
   const [isOpen, setIsOpen] = useState(false);[m
   const pathname = usePathname();[m
   const { themeStyle, accentColor } = useTheme();[m
 [m
[31m-  const isRetro = themeStyle === 'retro';[m
[31m-  const isOrange = accentColor === 'orange';[m
[32m+[m[32m  const isRetro = themeStyle === "retro";[m
[32m+[m[32m  const isOrange = accentColor === "orange";[m
 [m
   // Lock body scroll when drawer is open[m
   useEffect(() => {[m
     if (isOpen) {[m
[31m-      document.body.style.overflow = 'hidden';[m
[32m+[m[32m      document.body.style.overflow = "hidden";[m
     } else {[m
[31m-      document.body.style.overflow = '';[m
[32m+[m[32m      document.body.style.overflow = "";[m
     }[m
     return () => {[m
[31m-      document.body.style.overflow = '';[m
[32m+[m[32m      document.body.style.overflow = "";[m
     };[m
   }, [isOpen]);[m
 [m
   // Close on Escape key[m
   useEffect(() => {[m
     const handleEscape = (e: KeyboardEvent) => {[m
[31m-      if (e.key === 'Escape') setIsOpen(false);[m
[32m+[m[32m      if (e.key === "Escape") setIsOpen(false);[m
     };[m
[31m-    if (isOpen) document.addEventListener('keydown', handleEscape);[m
[31m-    return () => document.removeEventListener('keydown', handleEscape);[m
[32m+[m[32m    if (isOpen) document.addEventListener("keydown", handleEscape);[m
[32m+[m[32m    return () => document.removeEventListener("keydown", handleEscape);[m
   }, [isOpen]);[m
 [m
   // Close when route changes[m
[36m@@ -50,12 +56,16 @@[m [mexport default function MobileNav({ currentStreak, freezeCount }: { currentStrea[m
       <button[m
         onClick={() => setIsOpen(!isOpen)}[m
         className="relative text-inherit hover:opacity-80 rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"[m
[31m-        aria-label={isOpen ? 'Close menu' : 'Open menu'}[m
[32m+[m[32m        aria-label={isOpen ? "Close menu" : "Open menu"}[m
         aria-expanded={isOpen}[m
         aria-controls="mobile-drawer"[m
       >[m
[31m-        <span className="sr-only">{isOpen ? 'Close' : 'Menu'}</span>[m
[31m-        {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}[m
[32m+[m[32m        <span className="sr-only">{isOpen ? "Close" : "Menu"}</span>[m
[32m+[m[32m        {isOpen ? ([m
[32m+[m[32m          <X className="w-5 h-5" aria-hidden="true" />[m
[32m+[m[32m        ) : ([m
[32m+[m[32m          <Menu className="w-5 h-5" aria-hidden="true" />[m
[32m+[m[32m        )}[m
       </button>[m
 [m
       {/* Backdrop + Drawer */}[m
[36m@@ -79,182 +89,182 @@[m [mexport default function MobileNav({ currentStreak, freezeCount }: { currentStrea[m
             aria-label="Navigation menu"[m
             className={`absolute top-0 left-0 h-full w-[280px] max-w-[85vw] flex flex-col transition-transform duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${[m
               isRetro[m
[31m-                ? 'bg-[#1f4d2b] text-[#fbf3e0] border-r-[3.5px] border-[#1a2e1f] shadow-2xl'[m
[31m-                : 'bg-white text-slate-800 border-r border-slate-200 shadow-2xl'[m
[32m+[m[32m                ? "bg-[#1f4d2b] text-[#fbf3e0] border-r-[3.5px] border-[#1a2e1f] shadow-2xl"[m
[32m+[m[32m                : "bg-white text-slate-800 border-r border-slate-200 shadow-2xl"[m
             } translate-x-0`}[m
           >[m
[31m-          {/* Drawer header */}[m
[31m-          <div[m
[31m-            className={`flex items-center justify-between px-5 h-16 shrink-0 ${[m
[31m-              isRetro[m
[31m-                ? 'border-b-[3px] border-[#163820] bg-[#173e21]'[m
[31m-                : 'border-b border-slate-100 bg-white'[m
[31m-            }`}[m
[31m-          >[m
[31m-            <div className="flex items-center gap-2.5">[m
[31m-              <div[m
[31m-                className={`w-8 h-8 rounded-xl flex items-center justify-center ${[m
[31m-                  isRetro[m
[31m-                    ? 'bg-[#ffc93c] border-2 border-[#1a2e1f]'[m
[31m-                    : 'bg-primary/10 border border-primary/20'[m
[31m-                }`}[m
[31m-              >[m
[31m-                <TreklyLogo[m
[31m-                  className={`w-5 h-5 ${[m
[31m-                    isRetro ? 'text-[#1a2e1f]' : 'text-primary'[m
[32m+[m[32m            {/* Drawer header */}[m
[32m+[m[32m            <div[m
[32m+[m[32m              className={`flex items-center justify-between px-5 h-16 shrink-0 ${[m
[32m+[m[32m                isRetro[m
[32m+[m[32m                  ? "border-b-[3px] border-[#163820] bg-[#173e21]"[m
[32m+[m[32m                  : "border-b border-slate-100 bg-white"[m
[32m+[m[32m              }`}[m
[32m+[m[32m            >[m
[32m+[m[32m              <div className="flex items-center gap-2.5">[m
[32m+[m[32m                <div[m
[32m+[m[32m                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${[m
[32m+[m[32m                    isRetro[m
[32m+[m[32m                      ? "bg-[#ffc93c] border-2 border-[#1a2e1f]"[m
[32m+[m[32m                      : "bg-primary/10 border border-primary/20"[m
[32m+[m[32m                  }`}[m
[32m+[m[32m                >[m
[32m+[m[32m                  <TreklyLogo[m
[32m+[m[32m                    className={`w-5 h-5 ${[m
[32m+[m[32m                      isRetro ? "text-[#1a2e1f]" : "text-primary"[m
[32m+[m[32m                    }`}[m
[32m+[m[32m                  />[m
[32m+[m[32m                </div>[m
[32m+[m[32m                <span[m
[32m+[m[32m                  className={`text-xl tracking-tight ${[m
[32m+[m[32m                    isRetro[m
[32m+[m[32m                      ? "font-['Fraunces',serif] font-black text-[#fbf3e0]"[m
[32m+[m[32m                      : "font-black text-slate-900 font-sans"[m
                   }`}[m
[31m-                />[m
[32m+[m[32m                >[m
[32m+[m[32m                  Trekly[m
[32m+[m[32m                </span>[m
               </div>[m
[31m-              <span[m
[31m-                className={`text-xl tracking-tight ${[m
[32m+[m[32m              <button[m
[32m+[m[32m                onClick={close}[m
[32m+[m[32m                className={`p-2 rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 ${[m
                   isRetro[m
[31m-                    ? "font-['Fraunces',serif] font-black text-[#fbf3e0]"[m
[31m-                    : 'font-black text-slate-900 font-sans'[m
[32m+[m[32m                    ? "text-[#fbf3e0]/80 hover:text-white"[m
[32m+[m[32m                    : "text-slate-400 hover:text-slate-700"[m
                 }`}[m
[32m+[m[32m                aria-label="Close menu"[m
               >[m
[31m-                Trekly[m
[31m-              </span>[m
[32m+[m[32m                <X className="w-5 h-5" aria-hidden="true" />[m
[32m+[m[32m              </button>[m
             </div>[m
[31m-            <button[m
[31m-              onClick={close}[m
[31m-              className={`p-2 rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 ${[m
[31m-                isRetro[m
[31m-                  ? 'text-[#fbf3e0]/80 hover:text-white'[m
[31m-                  : 'text-slate-400 hover:text-slate-700'[m
[31m-              }`}[m
[31m-              aria-label="Close menu"[m
[31m-            >[m
[31m-              <X className="w-5 h-5" aria-hidden="true" />[m
[31m-            </button>[m
[31m-          </div>[m
 [m
[31m-          {/* Nav links */}[m
[31m-          <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col justify-between">[m
[31m-            <div className="space-y-2">[m
[31m-              <div[m
[31m-                className={`px-3 pb-1 text-[11px] font-black uppercase tracking-wider ${[m
[31m-                  isRetro ? 'text-[#ffc93c]' : 'text-slate-400 font-semibold'[m
[31m-                }`}[m
[31m-              >[m
[31m-                Menu Utama[m
[31m-              </div>[m
[31m-              {DASHBOARD_NAV_ITEMS.map((item) => {[m
[31m-                const isActive = item.exact[m
[31m-                  ? pathname === item.href[m
[31m-                  : pathname?.startsWith(item.href);[m
[32m+[m[32m            {/* Nav links */}[m
[32m+[m[32m            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col justify-between">[m
[32m+[m[32m              <div className="space-y-2">[m
[32m+[m[32m                <div[m
[32m+[m[32m                  className={`px-3 pb-1 text-[11px] font-black uppercase tracking-wider ${[m
[32m+[m[32m                    isRetro ? "text-[#ffc93c]" : "text-slate-400 font-semibold"[m
[32m+[m[32m                  }`}[m
[32m+[m[32m                >[m
[32m+[m[32m                  Menu Utama[m
[32m+[m[32m                </div>[m
[32m+[m[32m                {DASHBOARD_NAV_ITEMS.map((item) => {[m
[32m+[m[32m                  const isActive = item.exact[m
[32m+[m[32m                    ? pathname === item.href[m
[32m+[m[32m                    : pathname?.startsWith(item.href);[m
 [m
[31m-                let itemClasses = '';[m
[31m-                if (isRetro) {[m
[31m-                  if (isActive) {[m
[31m-                    itemClasses = item.highlight[m
[31m-                      ? isOrange[m
[31m-                        ? 'bg-[#ff7a2f] text-white border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f]'[m
[31m-                        : 'bg-[#2d6a3e] text-white border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f]'[m
[31m-                      : 'bg-[#bfe3f0] text-[#1a2e1f] border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f]';[m
[31m-                  } else {[m
[31m-                    itemClasses = item.highlight[m
[31m-                      ? 'text-[#fbf3e0] hover:bg-white/10 hover:text-[#ffc93c]'[m
[31m-                      : 'text-[#fbf3e0]/80 hover:bg-white/10 hover:text-white';[m
[31m-                  }[m
[31m-                } else {[m
[31m-                  if (isActive) {[m
[31m-                    itemClasses = isOrange[m
[31m-                      ? 'bg-orange-50 text-[#ff7a2f] border border-orange-200 shadow-xs font-bold rounded-xl'[m
[31m-                      : 'bg-emerald-50 text-[#1f4d2b] border border-emerald-200 shadow-xs font-bold rounded-xl';[m
[32m+[m[32m                  let itemClasses = "";[m
[32m+[m[32m                  if (isRetro) {[m
[32m+[m[32m                    if (isActive) {[m
[32m+[m[32m                      itemClasses = item.highlight[m
[32m+[m[32m                        ? isOrange[m
[32m+[m[32m                          ? "bg-[#ff7a2f] text-white border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f]"[m
[32m+[m[32m                          : "bg-[#2d6a3e] text-white border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f]"[m
[32m+[m[32m                        : "bg-[#bfe3f0] text-[#1a2e1f] border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f]";[m
[32m+[m[32m                    } else {[m
[32m+[m[32m                      itemClasses = item.highlight[m
[32m+[m[32m                        ? "text-[#fbf3e0] hover:bg-white/10 hover:text-[#ffc93c]"[m
[32m+[m[32m                        : "text-[#fbf3e0]/80 hover:bg-white/10 hover:text-white";[m
[32m+[m[32m                    }[m
                   } else {[m
[31m-                    itemClasses =[m
[31m-                      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition-colors';[m
[32m+[m[32m                    if (isActive) {[m
[32m+[m[32m                      itemClasses = isOrange[m
[32m+[m[32m                        ? "bg-orange-50 text-[#ff7a2f] border border-orange-200 shadow-xs font-bold rounded-xl"[m
[32m+[m[32m                        : "bg-emerald-50 text-[#1f4d2b] border border-emerald-200 shadow-xs font-bold rounded-xl";[m
[32m+[m[32m                    } else {[m
[32m+[m[32m                      itemClasses =[m
[32m+[m[32m                        "text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition-colors";[m
[32m+[m[32m                    }[m
                   }[m
[31m-                }[m
 [m
[31m-                return ([m
[31m-                  <Link[m
[31m-                    key={item.href}[m
[31m-                    href={item.href}[m
[31m-                    onClick={close}[m
[31m-                    className={`flex items-center justify-between min-h-[44px] px-3.5 rounded-2xl font-black text-sm transition-all ${itemClasses}`}[m
[31m-                  >[m
[31m-                    <div className="flex items-center gap-3">[m
[31m-                      <item.icon[m
[31m-                        className={`w-5 h-5 shrink-0 ${[m
[31m-                          isRetro[m
[31m-                            ? isActive && !item.highlight[m
[31m-                              ? 'text-[#1a2e1f]'[m
[31m-                              : 'text-inherit'[m
[31m-                            : isActive[m
[31m-                            ? isOrange[m
[31m-                              ? 'text-[#ff7a2f]'[m
[31m-                              : 'text-[#1f4d2b]'[m
[31m-                            : 'text-slate-400'[m
[31m-                        }`}[m
[31m-                        aria-hidden="true"[m
[31m-                      />[m
[31m-                      <span>{item.label}</span>[m
[31m-                    </div>[m
[32m+[m[32m                  return ([m
[32m+[m[32m                    <Link[m
[32m+[m[32m                      key={item.href}[m
[32m+[m[32m                      href={item.href}[m
[32m+[m[32m                      onClick={close}[m
[32m+[m[32m                      className={`flex items-center justify-between min-h-[44px] px-3.5 rounded-2xl font-black text-sm transition-all ${itemClasses}`}[m
[32m+[m[32m                    >[m
[32m+[m[32m                      <div className="flex items-center gap-3">[m
[32m+[m[32m                        <item.icon[m
[32m+[m[32m                          className={`w-5 h-5 shrink-0 ${[m
[32m+[m[32m                            isRetro[m
[32m+[m[32m                              ? isActive && !item.highlight[m
[32m+[m[32m                                ? "text-[#1a2e1f]"[m
[32m+[m[32m                                : "text-inherit"[m
[32m+[m[32m                              : isActive[m
[32m+[m[32m                                ? isOrange[m
[32m+[m[32m                                  ? "text-[#ff7a2f]"[m
[32m+[m[32m                                  : "text-[#1f4d2b]"[m
[32m+[m[32m                                : "text-slate-400"[m
[32m+[m[32m                          }`}[m
[32m+[m[32m                          aria-hidden="true"[m
[32m+[m[32m                        />[m
[32m+[m[32m                        <span>{item.label}</span>[m
[32m+[m[32m                      </div>[m
 [m
[31m-                    {item.badge && ([m
[31m-                      <span[m
[31m-                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${[m
[31m-                          isRetro[m
[31m-                            ? 'border-2 border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f] bg-[#ffc93c] text-[#1a2e1f]'[m
[31m-                            : isOrange[m
[31m-                            ? 'bg-orange-100 text-[#ff7a2f] border border-orange-200 font-bold'[m
[31m-                            : 'bg-emerald-100 text-[#1f4d2b] border border-emerald-200 font-bold'[m
[31m-                        }`}[m
[31m-      