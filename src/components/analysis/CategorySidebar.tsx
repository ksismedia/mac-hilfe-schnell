import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Search, Zap, Smartphone, Share2, Users, Headphones } from 'lucide-react';

interface CategorySidebarProps {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
  scores: {
    seoAndContent: number;
    performanceAndMobile: number;
    socialMedia: number;
    staffAndService: number;
  };
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ onCategoryChange, activeCategory, scores }) => {
  const collapsed = false; // Fixed for now

  const categories = [
    { 
      id: 'seo-content', 
      title: 'SEO & Content', 
      icon: Search, 
      score: scores.seoAndContent,
      description: collapsed ? '' : 'Suchmaschinenoptimierung & Inhalte'
    },
    { 
      id: 'performance-mobile', 
      title: 'Performance & Technik', 
      icon: Zap, 
      score: scores.performanceAndMobile,
      description: collapsed ? '' : 'Website-Performance & Mobile'
    },
    { 
      id: 'social-media', 
      title: 'Social Media', 
      icon: Share2, 
      score: scores.socialMedia,
      description: collapsed ? '' : 'Social Media Präsenz'
    },
    { 
      id: 'staff-service', 
      title: 'Personal & Service', 
      icon: Users, 
      score: scores.staffAndService,
      description: collapsed ? '' : 'Mitarbeiter & Kundenservice'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-yellow-400';
    if (score >= 60) return 'text-green-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number, isActive: boolean) => {
    const baseClasses = isActive ? 'bg-gray-700' : 'hover:bg-gray-800/50';
    if (score >= 80) return `${baseClasses} border-l-4 border-yellow-400`;
    if (score >= 60) return `${baseClasses} border-l-4 border-green-400`;
    return `${baseClasses} border-l-4 border-red-400`;
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
                            <span className="font-medium text-white truncate">
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