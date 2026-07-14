"use client";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Calendar } from "lucide-react";

// Preview page for the Activity Feed component. Shows the feed with mock data.
export default function ActivityPreviewPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 shadow-lg shadow-emerald-500/10">
            <Calendar className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Activity Feed Preview</h1>
            <p className="text-sm text-white/60">Mock data — showing recent events</p>
          </div>
        </div>
        <div className="w-full max-w-md">
          <ActivityFeed />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
