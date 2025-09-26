import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Github, Moon, SunMedium } from 'lucide-react';
import ThemeToggle from '@/components/layout/ThemeToggle';

const Footer = () => {
    return (
        <footer className="mt-16 border-t border-border/50 bg-card/60 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-primary rounded-full" />
                            <span className="font-semibold">Sweet Shop</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Premium artisanal sweets and a professional inventory manager built with modern tech.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><NavLink to="/" className="hover:text-foreground">Home</NavLink></li>
                            <li><NavLink to="/dashboard" className="hover:text-foreground">Browse Sweets</NavLink></li>
                            <li><NavLink to="/login" className="hover:text-foreground">Login</NavLink></li>
                            <li><NavLink to="/register" className="hover:text-foreground">Register</NavLink></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a className="hover:text-foreground" href="#">About</a></li>
                            <li><a className="hover:text-foreground" href="#">Careers</a></li>
                            <li><a className="hover:text-foreground" href="#">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Preferences</h4>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <Button variant="outline" size="icon" className="rounded-full" asChild>
                                <a href="#" aria-label="GitHub">
                                    <Github className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Sweet Shop. All rights reserved.</p>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                        <a href="#" className="hover:text-foreground">Privacy</a>
                        <span>·</span>
                        <a href="#" className="hover:text-foreground">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
