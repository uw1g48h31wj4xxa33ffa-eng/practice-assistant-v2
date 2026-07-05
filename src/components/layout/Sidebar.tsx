"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/contexts/SettingsContext';

export default function Sidebar() {
  const { settings } = useSettings();
  const pathname = usePathname();

  const menus = [
    { name: 'ダッシュボード', path: '/' },
    { name: '案件一覧', path: '/cases' },
    { name: '設定', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold leading-tight">Practice Assistant V2</h1>
        <p className="text-xs text-slate-400 mt-1">士業業務アシスタント</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="px-3 pb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">メインメニュー</p>
        </div>
        <ul className="space-y-1 mb-6">
          {menus.map((menu) => {
            const isActive = pathname === menu.path || (menu.path !== '/' && pathname.startsWith(menu.path));
            return (
              <li key={menu.path}>
                <Link 
                  href={menu.path} 
                  className={`block px-4 py-3 rounded-xl transition-colors text-base font-semibold ${
                    isActive 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {menu.name}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="px-2 mt-6">
          <Link href="/cases/new" className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center text-sm font-bold transition-colors">
            + 新規案件作成
          </Link>
        </div>
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        <p>※ 匿名管理モード{settings.anonymousMode ? '有効' : '無効'}</p>
      </div>
    </aside>
  );
}
