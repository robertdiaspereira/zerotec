"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
        </AuthProvider>
    );
}
