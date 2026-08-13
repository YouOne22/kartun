"use client";

import { DashboardShell } from "@/components/DashboardShell";
import { DocumentationManager } from "@/components/DocumentationManager";

export default function PhotoModerationPage() { return <DashboardShell title="Moderasi Foto"><DocumentationManager moderationOnly /> </DashboardShell>; }
