
"use client"

import * as React from "react"
import { Moon, Sun, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()

  const themeColors = [
    { name: 'Zinc', class: 'theme-zinc' },
    { name: 'Rose', class: 'theme-rose' },
    { name: 'Blue', class: 'theme-blue' },
    { name: 'Orange', class: 'theme-orange' },
  ];

  const fonts = [
    { name: 'Default', value: 'default-font' },
    { name: 'Inter/Lora', value: 'inter-lora' },
  ]
  
  const handleFontChange = (font: string) => {
    document.documentElement.setAttribute('data-font', font);
    localStorage.setItem('font', font);
  }

  React.useEffect(() => {
    const savedFont = localStorage.getItem('font');
    if (savedFont) {
        document.documentElement.setAttribute('data-font', savedFont);
    }
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
         <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Color</DropdownMenuLabel>
         {themeColors.map(({ name, class: themeClass }) => (
            <DropdownMenuItem
                key={name}
                onClick={() => setTheme(name.toLowerCase())}
                >
                <span>{name}</span>
            </DropdownMenuItem>
        ))}
         <DropdownMenuSeparator />
        <DropdownMenuLabel>Font</DropdownMenuLabel>
         {fonts.map(({ name, value }) => (
            <DropdownMenuItem
                key={name}
                onClick={() => handleFontChange(value)}
                >
                <span>{name}</span>
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
