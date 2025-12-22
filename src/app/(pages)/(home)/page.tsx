'use client';

import { PageSection } from "@pixelated-tech/components";

export default function HomePage() {
  return (
    <PageSection maxWidth="1024px" columns={1}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Pixelated Admin</h1>
          <p className="text-gray-600">Use the menu button to navigate to different sections.</p>
        </div>
      </div>
    </PageSection>
  );
}
