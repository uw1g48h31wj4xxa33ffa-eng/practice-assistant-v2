"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const menus = [
    { name: 'ダッシュボード', path: '/' },
    { name: '案件一覧', path: '/cases' },
    { name: '設定', path: '/settings' },
  ];

  return (
    <header className="sticky top-0 bg-white border-b border-slate-200 h-16 flex items-center px-4 md:px-6 shrink-0 justify-between z-50">
      <div className="flex items-center gap-3">
        {/* スマホ用メニュー開閉ボタン (md未満のみ表示) */}
        <button 
          className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <div className="flex items-center text-slate-800 font-medium text-sm md:text-base whitespace-nowrap">
          <span>業務検討補助ワークスペース</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <span className="hidden sm:inline-block text-xs md:text-sm text-slate-500 bg-slate-100 px-2 md:px-3 py-1 rounded-full border border-slate-200 whitespace-nowrap">
          オフラインモックモード
        </span>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
          管
        </div>
      </div>

      {/* スマホ用ドロップダウンメニュー (md未満のみ表示) */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg md:hidden flex flex-col py-2">
          {menus.map((menu) => {
            const isActive = pathname === menu.path || (menu.path !== '/' && pathname.startsWith(menu.path));
            return (
              <Link
                key={menu.path}
                href={menu.path}
                onClick={() => setIsMenuOpen(false)}
                className={`px-6 py-4 font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' 
                    : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                {menu.name}
              </Link>
            );
          })}
          <div className="px-6 py-4 mt-2 border-t border-slate-100">
            <Link 
              href="/cases/new" 
              onClick={() => setIsMenuOpen(false)}
              className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center text-white text-sm font-bold transition-colors"
            >
              + 新規案件作成
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
