'use client';

import { useState, useEffect } from 'react';
import { PageSection, Loading, ToggleLoading } from "@pixelated-tech/components";
import './styles.css';

interface Site {
  name: string;
  localPath: string;
}

interface UsageData {
  components: string[];
  siteList: Site[];
  usageMatrix: { [component: string]: { [site: string]: boolean } };
}

export default function ComponentUsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        ToggleLoading({ show: true });
        const response = await fetch('/api/component-usage');
        if (!response.ok) {
          throw new Error('Failed to fetch component usage data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        ToggleLoading({ show: false });
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageSection maxWidth="1024px" columns={1}>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
          	<h1 className="text-3xl font-bold mb-8">Component Usage Analytics</h1>
            <div className="text-center">
              <Loading />
              <p className="mt-4 text-gray-600">Loading component usage data...</p>
            </div>
          </div>
        </div>
      </PageSection>
    );
  }

  if (error) {
    return (
      <PageSection maxWidth="1024px" columns={1}>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
          	<h1 className="text-3xl font-bold mb-8">Component Usage Analytics</h1>
            <div className="text-center">
              <p className="text-red-600">Error: {error}</p>
            </div>
          </div>
        </div>
      </PageSection>
    );
  }

  if (!data) {
    return null;
  }

  const { components, siteList, usageMatrix } = data;

  return (
    <PageSection maxWidth="1024px" columns={1}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Component Usage Analytics</h1>
			<br /><br />
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 usage-table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                      Component
                    </th>
                    {siteList.map(site => (
                      <th key={site.name} className="px-6 py-3 text-center text-xs uppercase tracking-wider site-header">
                        <span className="site-header-label">{site.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {components.map(component => (
                    <tr key={component}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {component}
                      </td>
                      {siteList.map(site => (
                        <td key={site.name} className="px-6 py-4 whitespace-nowrap check-cell">
                          {usageMatrix[component][site.name] && (
                            <span className="text-green-600 text-lg">✓</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-600">
            <p>Legend: <span className="text-green-600">✓ Used</span></p>
            <p>This analysis scans for import statements from @pixelated-tech/components in each sites source code.</p>
          </div>
        </div>
      </div>
    </PageSection>
  );
}