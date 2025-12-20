'use client';

import { SidePanel, Accordion } from '@pixelated-tech/components';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import routes from '@/data/routes.json';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(true);

  const hamburgerIcon = (
    <div className="flex flex-col space-y-1">
      <div className="w-4 h-0.5 bg-gray-600"></div>
      <div className="w-4 h-0.5 bg-gray-600"></div>
      <div className="w-4 h-0.5 bg-gray-600"></div>
    </div>
  );

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/login');
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen">
      <SidePanel 
        isOpen={panelOpen} 
        onClose={() => setPanelOpen(false)} 
        onToggle={() => setPanelOpen(!panelOpen)}
        showTab={true}
        tabIcon={hamburgerIcon}
        tabLabel="Menu"
        className="w-64 bg-gray-100"
      >
        <nav className="p-4">
          {routes.map((route) => (
            <Accordion
              key={route.name}
              className="mb-2"
              items={[
                {
                  title: route.name,
                  content: route.items.length > 0 ? (
                    <div className="pl-4">
                      {route.items.map((item) => (
                        <a
                          key={item.path}
                          href={item.path}
                          className="block p-2 hover:bg-gray-200"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <a
                      href={route.path}
                      className="block p-2 hover:bg-gray-200"
                    >
                      {route.name}
                    </a>
                  ),
                },
              ]}
            />
          ))}
        </nav>
      </SidePanel>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Welcome to Pixelated Admin. Use the menu to navigate.</p>
      </main>
    </div>
  );
}
