import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";
import { Link, useLocation } from "wouter";

export function Header() {
  const { t, language, setLanguage } = useTranslation();
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <a className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
                  {t('header.title')}
                </a>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={language} onValueChange={(value: 'en' | 'tr') => setLanguage(value)}>
              <SelectTrigger className="w-32" data-testid="language-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" data-testid="language-en">English</SelectItem>
                <SelectItem value="tr" data-testid="language-tr">Türkçe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}
