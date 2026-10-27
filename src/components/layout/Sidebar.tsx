import React from 'react';
import { 
  ClipboardList, 
  Columns3, 
  Users, 
  FileSpreadsheet, 
  BarChart3,
  ShieldAlert
} from 'lucide-react';

export type NavTab = 'incidents' | 'board' | 'responders' | 'handover' | 'analytics';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unresolvedCount: number;
  activeP1Count: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unresolvedCount,
  activeP1Count
}) => {
  const navItems = [
    {
      id: 'incidents' as NavTab,
      label: 'Incident Master',
      icon: ClipboardList,
      badge: unresolvedCount > 0 ? unresolvedCount : undefined,
      badgeColor: 'bg-slate-200 text-slate-800'
    },
    {
      id: 'board' as NavTab,
      label: 'Triage Kanban',
      icon: Columns3,
      badge: activeP1Count > 0 ? `${activeP1Count} P1` : undefined,
      badgeColor: 'bg-red-100 text-red-800 font-bold'
    },
    {
      id: 'responders' as NavTab,
      label: 'Duty Responders',
      icon: Users
    },
    {
      id: 'handover' as NavTab,
      label: 'Shift Handover (SBAR)',
      icon: FileSpreadsheet
    },
    {
      id: 'analytics' as NavTab,
      label: 'SLA Analytics',
      icon: BarChart3
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`inline-flex items-center space-x-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded text-[10px] ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
