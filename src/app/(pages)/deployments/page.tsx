'use client';

import { PageSection } from "@pixelated-tech/components";

export default function DeploymentPage() {
  return (
    <PageSection maxWidth="1024px" columns={1}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Deployment Dashboard</h1>
          <p className="text-lg text-gray-600">
            Monitor and manage deployments across all Pixelated sites
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deployments</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">3</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-blue-600 text-xl">🚀</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sites Deployed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">12</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-green-600 text-xl">🌐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">98%</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <span className="text-emerald-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Deploy Time</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">2.3m</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <span className="text-purple-600 text-xl">⚡</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Deployments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Deployments</h2>
            <p className="text-sm text-gray-600 mt-1">Latest deployment activities across all sites</p>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600">✅</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Oak Tree Landscaping</h3>
                    <p className="text-sm text-gray-600">Production environment • v2.1.4</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Success
                  </span>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600">⏳</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Palmetto Epoxy</h3>
                    <p className="text-sm text-gray-600">Staging environment • v1.8.2</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    In Progress
                  </span>
                  <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600">❌</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Information Focus</h3>
                    <p className="text-sm text-gray-600">Development environment • v1.9.1</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Failed
                  </span>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Production</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  8 sites healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Staging</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  3 sites deploying
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Development</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  5 sites active
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/deploy"
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="mr-2">🚀</span>
                New Deployment
              </a>
              <button className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                <span className="mr-2">📊</span>
                View Analytics
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                <span className="mr-2">⚙️</span>
                Site Settings
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                <span className="mr-2">📋</span>
                Deployment Logs
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Deployment Dashboard • Last updated: {new Date().toLocaleString()}</p>
        </div>
        </div>
      </div>
    </PageSection>
  );
}