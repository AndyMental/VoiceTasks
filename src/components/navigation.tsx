"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ListTodo, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const isAdvanced = pathname === "/advanced";

    return (
        <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ListTodo className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">Tasks Voice</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Button
                            variant={!isAdvanced ? "default" : "ghost"}
                            size="sm"
                            onClick={() => router.push("/")}
                            className={cn(
                                "flex items-center gap-2",
                                !isAdvanced && "bg-primary text-primary-foreground"
                            )}
                        >
                            <ListTodo className="h-4 w-4" />
                            Tasks
                        </Button>
                        <Button
                            variant={isAdvanced ? "default" : "ghost"}
                            size="sm"
                            onClick={() => router.push("/advanced")}
                            className={cn(
                                "flex items-center gap-2",
                                isAdvanced && "bg-primary text-primary-foreground"
                            )}
                        >
                            <Mic className="h-4 w-4" />
                            Voice Mode
                        </Button>
                        
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm">Sign In</Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button size="sm">Sign Up</Button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </div>
                </div>
            </div>
        </nav>
    );
}

