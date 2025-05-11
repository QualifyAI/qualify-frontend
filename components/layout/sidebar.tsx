import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="9"></rect>
        <rect x="14" y="3" width="7" height="5"></rect>
        <rect x="14" y="12" width="7" height="9"></rect>
        <rect x="3" y="16" width="7" height="5"></rect>
      </svg>
    ),
  },
  {
    href: "/dashboard/learning-paths",
    label: "Learning Paths",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 2v8"></path>
        <path d="m16 4-4 4-4-4"></path>
        <path d="M3 12h10"></path>
        <path d="m7 16-4-4 4-4"></path>
        <path d="M21 12h-4"></path>
        <path d="M12 22v-8"></path>
        <path d="m16 20-4-4-4 4"></path>
      </svg>
    ),
  },
  {
    href: "/dashboard/skill-gap",
    label: "Skill Gap Analysis",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="m22 8-6 4 6 4V8Z"></path>
        <rect x="2" y="6" width="14" height="12" rx="2"></rect>
        <path d="M6 12h.01"></path>
        <path d="M10 12h.01"></path>
      </svg>
    ),
  },
  {
    href: "/dashboard/resume",
    label: "Resume Enhancement",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
        <path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4"></path>
        <path d="M5 21h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2Z"></path>
        <path d="M7 17h.01"></path>
        <path d="M11 17h.01"></path>
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="8" r="5"></circle>
        <path d="M20 21a8 8 0 1 0-16 0"></path>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-white border-r flex-shrink-0 hidden md:block">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold gradient-text">QualifyAI</span>
        </Link>
      </div>
      <nav className="py-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center py-3 px-4 text-sm font-medium transition-colors",
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  <span className={cn("mr-3", isActive ? "text-blue-600" : "text-gray-500")}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="absolute bottom-0 p-4 w-64 border-t">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center text-white font-semibold">
            JS
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">John Smith</p>
            <p className="text-xs text-gray-500">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
} 