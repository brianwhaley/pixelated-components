import React, { useState } from 'react';

/**
 * INTEGRATION REFERENCE: URL Building with buildUrl
 * 
 * The Contentful Management API integrations use the buildUrl utility to construct
 * consistent, properly-formatted URLs with path segments and query parameters.
 * 
 * EXAMPLE: Building URLs for Contentful Management API
 * 
 * // List all entries in a space
 * const listUrl = buildUrl({
 *   baseUrl: 'https://api.contentful.com',
 *   pathSegments: ['spaces', spaceId, 'environments', environment, 'entries'],
 *   params: { access_token }
 * });
 * 
 * // Get specific entry by ID
 * const entryUrl = buildUrl({
 *   baseUrl: 'https://api.contentful.com',
 *   pathSegments: ['spaces', spaceId, 'environments', environment, 'entries', entryId],
 *   params: { access_token }
 * });
 * 
 * // Publish an entry
 * const publishUrl = buildUrl({
 *   baseUrl: 'https://api.contentful.com',
 *   pathSegments: ['spaces', spaceId, 'environments', environment, 'entries', entryId, 'published']
 * });
 * 
 * // Get content types
 * const ctUrl = buildUrl({
 *   baseUrl: 'https://api.contentful.com',
 *   pathSegments: ['spaces', spaceId, 'environments', env, 'content_types'],
 *   params: { access_token }
 * });
 * 
 * BENEFITS:
 * - Consistent URL construction across all Contentful integrations
 * - Automatic path segment joining with proper separators
 * - Automatic query parameter encoding
 * - Support for both direct API calls and proxy-routed requests
 * 
 * See contentful.management.ts for implementation details
 */

export default {
  title: 'Admin/Contentful Migration',
  component: ContentfulMigrationDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A demo of the Contentful content type migration interface with accordion-based 3-stage workflow.'
      }
    }
  },
  argTypes: {
    showSuccess: {
      control: 'boolean',
      description: 'Show success state',
      table: { defaultValue: { summary: 'false' } }
    },
    showError: {
      control: 'boolean',
      description: 'Show error state',
      table: { defaultValue: { summary: 'false' } }
    }
  }
};

// Mock data for demonstration
const mockContentTypes = [
  {
    sys: { id: 'blogPost', version: 1 },
    name: 'Blog Post',
    description: 'A blog post content type',
    fields: [
      { id: 'title', name: 'Title', type: 'Symbol' },
      { id: 'content', name: 'Content', type: 'RichText' },
      { id: 'author', name: 'Author', type: 'Link' }
    ]
  },
  {
    sys: { id: 'author', version: 1 },
    name: 'Author',
    description: 'Author information',
    fields: [
      { id: 'name', name: 'Name', type: 'Symbol' },
      { id: 'bio', name: 'Bio', type: 'Text' }
    ]
  },
  {
    sys: { id: 'category', version: 1 },
    name: 'Category',
    description: 'Content categories',
    fields: [
      { id: 'name', name: 'Name', type: 'Symbol' },
      { id: 'slug', name: 'Slug', type: 'Symbol' }
    ]
  }
];

interface SpaceCredentials {
  spaceId: string;
  accessToken: string;
}

function ContentfulMigrationDemo({ showSuccess = false, showError = false }) {
  const [activeAccordion, setActiveAccordion] = useState<string>('stage1');
  const [sourceCredentials, setSourceCredentials] = useState<SpaceCredentials>({ spaceId: '', accessToken: '' });
  const [destinationCredentials, setDestinationCredentials] = useState<SpaceCredentials>({ spaceId: '', accessToken: '' });
  const [contentTypes] = useState(mockContentTypes);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Simulate API calls
  const validateCredentials = async (): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    if (showError) {
      setError('Invalid credentials provided');
      setLoading(false);
      return false;
    }

    setLoading(false);
    return true;
  };

  const handleStage1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const isValid = await validateCredentials();
    if (isValid) {
      setSuccess('Credentials validated successfully!');
      setActiveAccordion('stage2');
    }
  };

  const handleStage2Submit = async () => {
    if (!selectedContentType) {
      setError('Please select a content type');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate migration delay

    if (showError) {
      setError('Migration failed: Network error');
      setLoading(false);
      return;
    }

    const selectedType = contentTypes.find(ct => ct.sys.id === selectedContentType);
    setSuccess(`Content type "${selectedType?.name}" migrated successfully!`);
    setActiveAccordion('stage3');
    setLoading(false);
  };

  const AccordionItem = ({ id, title, children, isOpen }: {
    id: string;
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
  }) => (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={() => setActiveAccordion(activeAccordion === id ? '' : id)}
        className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 border-b border-gray-200 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <svg
            className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="p-6 bg-white">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contentful Content Type Migration</h1>
        <p className="text-gray-600">Copy content type structures from one Contentful space to another</p>
      </div>

      {(error || success) && (
        <div className={`mb-6 p-4 rounded-md ${error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {error ? (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm ${error ? 'text-red-800' : 'text-green-800'}`}>
                {error || success}
              </p>
            </div>
          </div>
        </div>
      )}

      <AccordionItem
        id="stage1"
        title="Stage 1: Configure Spaces"
        isOpen={activeAccordion === 'stage1'}
      >
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Space Credentials</h3>
          <p className="text-gray-600">Enter the Content Management API tokens and Space IDs for both source and destination spaces.</p>
        </div>
        <form onSubmit={handleStage1Submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Source Space</h4>
              <div>
                <label htmlFor="source-space-id" className="block text-sm font-medium text-gray-700 mb-1">Space ID</label>
                <input
                  id="source-space-id"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your source space ID"
                  value={sourceCredentials.spaceId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSourceCredentials(prev => ({ ...prev, spaceId: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="source-access-token" className="block text-sm font-medium text-gray-700 mb-1">Access Token (CMA)</label>
                <input
                  id="source-access-token"
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your source CMA access token"
                  value={sourceCredentials.accessToken}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSourceCredentials(prev => ({ ...prev, accessToken: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Destination Space</h4>
              <div>
                <label htmlFor="dest-space-id" className="block text-sm font-medium text-gray-700 mb-1">Space ID</label>
                <input
                  id="dest-space-id"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your destination space ID"
                  value={destinationCredentials.spaceId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDestinationCredentials(prev => ({ ...prev, spaceId: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="dest-access-token" className="block text-sm font-medium text-gray-700 mb-1">Access Token (CMA)</label>
                <input
                  id="dest-access-token"
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your destination CMA access token"
                  value={destinationCredentials.accessToken}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDestinationCredentials(prev => ({ ...prev, accessToken: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? 'Validating Credentials...' : 'Validate & Continue'}
          </button>
        </form>
      </AccordionItem>

      <AccordionItem
        id="stage2"
        title="Stage 2: Select Content Type"
        isOpen={activeAccordion === 'stage2'}
      >
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Content Type to Migrate</h3>
          <p className="text-gray-600">Choose a content type from the source space to copy to the destination space.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Content Type:</label>
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
              {contentTypes.map((ct) => (
                <div key={ct.sys.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    id={ct.sys.id}
                    name="contentType"
                    value={ct.sys.id}
                    checked={selectedContentType === ct.sys.id}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedContentType(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={ct.sys.id} className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900">{ct.name}</div>
                    <div className="text-sm text-gray-500">
                      ID: {ct.sys.id} • {ct.fields?.length || 0} fields
                      {ct.description && ` • ${ct.description}`}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveAccordion('stage1')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleStage2Submit}
              disabled={!selectedContentType || loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Migrating...' : 'Migrate Content Type'}
            </button>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem
        id="stage3"
        title="Stage 3: Migration Complete"
        isOpen={activeAccordion === 'stage3'}
      >
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Migration Results</h3>
          <p className="text-gray-600">The content type has been successfully migrated to the destination space.</p>
        </div>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  Migration completed successfully! You can now use this content type in your destination space.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                setActiveAccordion('stage2');
                setSelectedContentType('');
              }}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Migrate Another Type
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveAccordion('stage1');
                setSourceCredentials({ spaceId: '', accessToken: '' });
                setDestinationCredentials({ spaceId: '', accessToken: '' });
                setSelectedContentType('');
                setError('');
                setSuccess('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Over
            </button>
          </div>
        </div>
      </AccordionItem>
    </div>
  );
}

export const Default = () => <ContentfulMigrationDemo />;

export const WithSuccess = () => (
  <ContentfulMigrationDemo showSuccess={true} />
);

export const WithError = () => (
  <ContentfulMigrationDemo showError={true} />
);

export const Stage2Active = () => {
  const [activeAccordion, setActiveAccordion] = useState('stage2');
  return <ContentfulMigrationDemo />;
};

export const Stage3Active = () => {
  const [activeAccordion, setActiveAccordion] = useState('stage3');
  return <ContentfulMigrationDemo />;
};