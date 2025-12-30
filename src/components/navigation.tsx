"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ListTodo, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";

export function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const { isSignedIn } = useUser();
    const isAdvanced = pathname === "/advanced";

    const handleNavigation = (path: string) => {
        if (!isSignedIn) {
            // Don't navigate if not signed in - let the page handle showing sign-in
            return;
        }
        router.push(path);
    };

    return (
        <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ListTodo className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">Tasks Voice</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <SignedIn>
                            <Button
                                variant={!isAdvanced ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleNavigation("/")}
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
                                onClick={() => handleNavigation("/advanced")}
                                className={cn(
                                    "flex items-center gap-2",
                                    isAdvanced && "bg-primary text-primary-foreground"
                                )}
                            >
                                <Mic className="h-4 w-4" />
                                Voice Mode
                            </Button>
                        </SignedIn>
                        
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button 
                                    variant={!isAdvanced ? "default" : "ghost"} 
                                    size="sm"
                                    className={cn(
                                        "flex items-center gap-2",
                                        !isAdvanced && "bg-primary text-primary-foreground"
                                    )}
                                >
                                    <ListTodo className="h-4 w-4" />
                                    Tasks
                                </Button>
                            </SignInButton>
                            <SignInButton mode="modal">
                                <Button 
                                    variant={isAdvanced ? "default" : "ghost"} 
                                    size="sm"
                                    className={cn(
                                        "flex items-center gap-2",
                                        isAdvanced && "bg-primary text-primary-foreground"
                                    )}
                                >
                                    <Mic className="h-4 w-4" />
                                    Voice Mode
                                </Button>
                            </SignInButton>
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

