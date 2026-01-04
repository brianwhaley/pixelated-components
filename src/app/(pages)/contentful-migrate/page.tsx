'use client';

import { useState } from 'react';
import { Accordion, PageSection } from '@pixelated-tech/components';

interface ContentType {
  sys: {
    id: string;
    type: string;
  };
  name: string;
  description?: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
  }>;
}

interface MigrationStatus {
  contentTypes: 'pending' | 'complete' | 'error';
  entries: 'pending' | 'in-progress' | 'complete' | 'error';
  assets: 'pending' | 'in-progress' | 'complete' | 'error';
}

export default function ContentfulMigratePage() {
  // Form states
  const [sourceSpaceId, setSourceSpaceId] = useState('');
  const [sourceAccessToken, setSourceAccessToken] = useState('');
  const [targetSpaceId, setTargetSpaceId] = useState('');
  const [targetAccessToken, setTargetAccessToken] = useState('');

  // UI states
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    contentTypes: 'pending',
    entries: 'pending',
    assets: 'pending'
  });

  // Validation functions
  const validateCredentials = async (spaceId: string, accessToken: string, type: 'source' | 'target') => {
    setIsValidating(true);
    setValidationMessage('');

    try {
      const response = await fetch('/api/contentful/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId, accessToken })
      });

      const result = await response.json();

      if (result.success) {
        setValidationMessage(`${type === 'source' ? 'Source' : 'Target'} credentials are valid!`);
        return true;
      } else {
        setValidationMessage(`${type === 'source' ? 'Source' : 'Target'} validation failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      setValidationMessage(`Error validating ${type} credentials`);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const validateBothSpaces = async () => {
    setIsValidating(true);
    setValidationMessage('');

    const sourceValid = await validateCredentials(sourceSpaceId, sourceAccessToken, 'source');
    const targetValid = await validateCredentials(targetSpaceId, targetAccessToken, 'target');

    setIsValidating(false);

    if (sourceValid && targetValid) {
      setValidationMessage('Both spaces validated successfully!');
      // Automatically load content types after successful validation
      await loadContentTypes();
      return true;
    } else {
      setValidationMessage('One or both spaces failed validation. Please check your credentials.');
      return false;
    }
  };

  // Load content types
  const loadContentTypes = async () => {
    if (!sourceSpaceId || !sourceAccessToken) {
      alert('Please enter source credentials first');
      return;
    }

    setIsLoadingTypes(true);
    try {
      const response = await fetch('/api/contentful/content-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: sourceSpaceId,
          accessToken: sourceAccessToken
        })
      });

      const result = await response.json();

      if (result.success) {
        setContentTypes(result.data);
        setMigrationStatus(prev => ({ ...prev, contentTypes: 'complete' }));
      } else {
        alert(`Error loading content types: ${result.error}`);
      }
    } catch (error) {
      alert('Error loading content types');
    } finally {
      setIsLoadingTypes(false);
    }
  };

  // Start migration
  const startMigration = async () => {
    if (!targetSpaceId || !targetAccessToken) {
      alert('Please enter target credentials');
      return;
    }

    if (selectedContentTypes.length === 0) {
      alert('Please select content types to migrate');
      return;
    }

    setIsMigrating(true);
    setMigrationStatus(prev => ({ ...prev, entries: 'in-progress' }));

    try {
      // Migrate each selected content type
      const selectedContentTypeObjects = contentTypes.filter(ct => selectedContentTypes.includes(ct.sys.id));

      for (const contentType of selectedContentTypeObjects) {
        const response = await fetch('/api/contentful/migrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceSpaceId,
            sourceAccessToken,
            targetSpaceId,
            targetAccessToken,
            contentTypeId: contentType.sys.id
          })
        });

        const result = await response.json();

        if (!result.success) {
          alert(`Migration failed for ${contentType.name}: ${result.error}`);
          setMigrationStatus(prev => ({ ...prev, entries: 'error' }));
          return;
        }
      }

      setMigrationStatus(prev => ({ ...prev, entries: 'complete', assets: 'complete' }));
      alert('Migration completed successfully!');
    } catch (error) {
      alert('Migration failed');
      setMigrationStatus(prev => ({ ...prev, entries: 'error' }));
    } finally {
      setIsMigrating(false);
    }
  };

  // Accordion data for configuration
  const accordionItems = [
    {
      title: '1. Configuration & Validation',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Source Space ID</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={sourceSpaceId}
                onChange={(e) => setSourceSpaceId(e.target.value)}
                placeholder="Source space ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Source Access Token</label>
              <input
                type="password"
                className="w-full p-2 border rounded"
                value={sourceAccessToken}
                onChange={(e) => setSourceAccessToken(e.target.value)}
                placeholder="Source access token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Space ID</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={targetSpaceId}
                onChange={(e) => setTargetSpaceId(e.target.value)}
                placeholder="Target space ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Access Token</label>
              <input
                type="password"
                className="w-full p-2 border rounded"
                value={targetAccessToken}
                onChange={(e) => setTargetAccessToken(e.target.value)}
                placeholder="Target access token"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={validateBothSpaces}
              disabled={isValidating || isLoadingTypes || !sourceSpaceId || !sourceAccessToken || !targetSpaceId || !targetAccessToken}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isValidating ? 'Validating...' : isLoadingTypes ? 'Loading Content Types...' : 'Validate & Load Content Types'}
            </button>
          </div>
          {validationMessage && (
            <div className={`p-3 rounded ${validationMessage.includes('valid') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {validationMessage}
            </div>
          )}
        </div>
      ),
      open: true
    },
    {
      title: '2. Content Type Selection & Migration',
      content: (
        <div className="space-y-4">
          {contentTypes.length > 0 ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Select Content Types to Migrate</label>
                <div className="max-h-60 overflow-y-auto border rounded p-3 space-y-2">
                  {contentTypes.map((ct) => (
                    <div key={ct.sys.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={ct.sys.id}
                        checked={selectedContentTypes.includes(ct.sys.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContentTypes([...selectedContentTypes, ct.sys.id]);
                          } else {
                            setSelectedContentTypes(selectedContentTypes.filter(id => id !== ct.sys.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={ct.sys.id} className="flex-1 cursor-pointer">
                        <div className="font-medium text-gray-900">{ct.name}</div>
                        <div className="text-sm text-gray-500">{ct.sys.id} • {ct.fields.length} fields</div>
                        {ct.description && <div className="text-sm text-gray-600 mt-1">{ct.description}</div>}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  {selectedContentTypes.length} of {contentTypes.length} content types selected
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={startMigration}
                  disabled={isMigrating || selectedContentTypes.length === 0}
                  className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMigrating ? 'Migrating...' : `Migrate ${selectedContentTypes.length} Content Type${selectedContentTypes.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-center py-12">
              <div className="text-lg mb-2">No content types loaded</div>
              <div className="text-sm">Validate your spaces above to load content types</div>
            </div>
          )}
        </div>
      ),
      open: contentTypes.length > 0
    }
  ];

  return (
    <PageSection maxWidth="1024px" columns={1}>
      <div className="contentful-items">
        <div className="contentful-items-header">
          <h1>Contentful Migration</h1>
          <p className="text-gray-600 mt-2">Migrate content types from one Contentful space to another</p>
        </div>

        {/* Migration Status */}
        <div className="contentful-item">
          <div className="contentful-item-body">
            <h2>Migration Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium">Content Types</div>
                  <div className="text-sm text-gray-600">Load and validate content models</div>
                </div>
                <div className={`font-bold ${
                  migrationStatus.contentTypes === 'complete' ? 'text-green-600' :
                  migrationStatus.contentTypes === 'error' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {migrationStatus.contentTypes === 'complete' ? 'Complete' :
                   migrationStatus.contentTypes === 'error' ? 'Error' : 'Pending'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium">Migration</div>
                  <div className="text-sm text-gray-600">Copy content types to target space</div>
                </div>
                <div className={`font-bold ${
                  migrationStatus.entries === 'complete' ? 'text-green-600' :
                  migrationStatus.entries === 'error' ? 'text-red-600' :
                  migrationStatus.entries === 'in-progress' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {migrationStatus.entries === 'complete' ? 'Complete' :
                   migrationStatus.entries === 'error' ? 'Error' :
                   migrationStatus.entries === 'in-progress' ? 'In Progress' : 'Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Migration Configuration */}
        <div className="contentful-item">
          <div className="contentful-item-body">
            <h2>Migration Configuration</h2>
            <Accordion items={accordionItems} />
          </div>
        </div>
      </div>
    </PageSection>
  );
}