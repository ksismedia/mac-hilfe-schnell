import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Search, Zap, Share2, TrendingUp, Eye, Headphones } from 'lucide-react';

interface CategorySidebarProps {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
  scores: {
    onlineQualityAuthority: number;
    websitePerformanceTech: number;
    socialMediaPerformance: number;
    marketEnvironment: number;
    corporateAppearance: number;
    serviceQuality: number;
  };
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ onCategoryChange, activeCategory, scores }) => {
  const collapsed = false; // Fixed for now

  const categories = [
    { 
      id: 'online-quality-authority', 
      title: 'Online-Qualität · Relevanz · Autorität', 
      icon: Search, 
      score: scores.onlineQualityAuthority,
      description: collapsed ? '' : 'SEO, Keywords, Content, Backlinks'
    },
    { 
      id: 'website-performance-tech', 
      title: 'Webseiten-Performance & Technik', 
      icon: Zap, 
      score: scores.websitePerformanceTech,
      description: collapsed ? '' : 'Performance, Mobile, Conversion'
    },
    { 
      id: 'social-media-performance', 
      title: 'Online-/Web-/Social-Media Performance', 
      icon: Share2, 
      score: scores.socialMediaPerformance,
      description: collapsed ? '' : 'Social Media, Bewertungen, Social Proof'
    },
    { 
      id: 'market-environment', 
      title: 'Markt & Marktumfeld', 
      icon: TrendingUp, 
      score: scores.marketEnvironment,
      description: collapsed ? '' : 'Stundensatz, Personal, Konkurrenz'
    },
    { 
      id: 'corporate-appearance', 
      title: 'Außendarstellung & Erscheinungsbild', 
      icon: Eye, 
      score: scores.corporateAppearance,
      description: collapsed ? '' : 'Corporate Design'
    },
    { 
      id: 'service-quality', 
      title: 'Qualität · Service · Kundenorientierung', 
      icon: Headphones, 
      score: scores.serviceQuality,
      description: collapsed ? '' : 'Kundenservice'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-400';  // 90-100% gold
    if (score >= 61) return 'text-green-400';   // 61-89% green
    return 'text-red-400';                      // 0-60% red
  };

  const getScoreBg = (score: number, isActive: boolean) => {
    const baseClasses = isActive ? 'bg-gray-700' : 'hover:bg-gray-800/50';
    if (score >= 90) return `${baseClasses} border-l-4 border-yellow-400`;  // 90-100% gold
    if (score >= 61) return `${baseClasses} border-l-4 border-green-400`;   // 61-89% green
    return `${baseClasses} border-l-4 border-red-400`;                      // 0-60% red
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-80"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-yellow-400 font-bold">
            {collapsed ? 'Kategorien' : 'Analyse-Kategorien'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton
                    asChild
                    className={getScoreBg(category.score, activeCategory === category.id)}
                  >
                    <button
                      onClick={() => onCategoryChange(category.id)}
                      className="w-full text-left p-3 flex items-center gap-3"
                    >
                      <category.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sidebar-foreground truncate">
                              {category.title}
                            </span>
                            <span className={`text-sm font-bold ${getScoreColor(category.score)}`}>
                              {category.score}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {category.description}
                          </div>
                        </div>
                      )}
                      {collapsed && (
                        <span className={`text-xs font-bold ${getScoreColor(category.score)} absolute right-1 top-1`}>
                          {category.score}
                        </span>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default CategorySidebar;