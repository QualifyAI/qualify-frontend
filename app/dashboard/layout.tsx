'use client';

import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-10">
          <div className="md:hidden">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold gradient-text">QualifyAI</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Button size="sm" variant="outline" className="rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M12 18v-6"></path>
                <path d="M8 18v-1"></path>
                <path d="M16 18v-3"></path>
              </svg>
              View Reports
            </Button>
            <Button size="sm" className="rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              New Analysis
            </Button>
          </div>
        </header>
        
        <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
} 