import { Button } from '@/components/ui/button';
import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    const current = theme === 'system' ? systemTheme : theme;

    return (
        <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(current === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
        >
            {current === 'dark' ? (
                <SunMedium className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
    );
};

export default ThemeToggle;
