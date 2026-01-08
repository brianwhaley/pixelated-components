import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfigBuilder } from '../components/sitebuilder/config/ConfigBuilder';
import defaultConfigData from '../data/routes.json';
import testConfigData from './configbuilder.test.json';

describe('ConfigBuilder Component', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  describe('ConfigBuilder Basic Rendering', () => {
    it('should render ConfigBuilder component', () => {
      const { container } = render(<ConfigBuilder />);
      expect(container.querySelector('.config-builder')).toBeInTheDocument();
    });

    it('should render with initial config', async () => {
      const initialConfig = {
        siteInfo: testConfigData.siteInfo,
        routes: testConfigData.routes,
        visualdesign: testConfigData.visualdesign
      };
      render(<ConfigBuilder initialConfig={initialConfig} />);
      
      // Wait for form to render and check that the config is displayed in the preview
      await waitFor(() => {
        const preElement = screen.getByText((content) => content.includes('Test Site'));
        expect(preElement).toBeInTheDocument();
      });
      
      // Switch to Routes tab to check route fields
      const routesTab = screen.getByText('Routes');
      fireEvent.click(routesTab);
      expect(screen.getByDisplayValue('/home')).toBeInTheDocument();
    });

    it('should render file upload section', () => {
      render(<ConfigBuilder />);
      expect(screen.getByLabelText('Load Configuration File:')).toBeInTheDocument();
      expect(screen.getByText('Save Config')).toBeInTheDocument();
    });

    it('should render tabs correctly', () => {
      render(<ConfigBuilder />);
      expect(screen.getByText('Site Info')).toBeInTheDocument();
      expect(screen.getByText('Routes')).toBeInTheDocument();
      expect(screen.getByText('Visual Design')).toBeInTheDocument();
    });
  });

  describe('Visual Design Tab Functionality', () => {
    it('should render visual design form with initial config', () => {
      const initialConfig = {
        siteInfo: { 
          ...defaultConfigData.siteInfo,
          name: 'Test Site', 
          author: 'Test Author',
          description: 'A test site', 
          url: 'https://test.com',
          email: 'test@test.com',
          display: 'standalone',
          favicon_sizes: '64x64 32x32 24x24 16x16',
          favicon_type: 'image/x-icon',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          default_locale: 'en'
        },
        routes: [],
        visualdesign: defaultConfigData.visualdesign
      };
      render(<ConfigBuilder initialConfig={initialConfig} />);
      
      // Switch to Visual Design tab
      const visualDesignTab = screen.getByText('Visual Design');
      fireEvent.click(visualDesignTab);

      // Check that form fields are rendered
      const primaryColorInput = screen.getByLabelText('Primary color');
      expect(primaryColorInput).toBeInTheDocument();
    });

    it('should allow editing visual design form fields', () => {
      render(<ConfigBuilder />);
      
      // Switch to Visual Design tab
      const visualDesignTab = screen.getByText('Visual Design');
      fireEvent.click(visualDesignTab);

      // Fill out a form field
      const primaryColorInput = screen.getByLabelText('Primary color');
      
      // Check initial value - should be the default from config
      expect((primaryColorInput as HTMLInputElement).value).toBe('#336699');
      
      fireEvent.change(primaryColorInput, { target: { value: '#123456' } });

      expect((primaryColorInput as HTMLInputElement).value).toBe('#123456');
    });
  });

  describe('File Upload Functionality', () => {
    it('should handle valid JSON file upload', async () => {
      const { container } = render(<ConfigBuilder />);
      
      const file = new File([JSON.stringify({
        siteInfo: { name: 'Uploaded Site', author: 'Test', description: 'Test', url: 'https://test.com', email: 'test@test.com', favicon: '/favicon.ico', favicon_sizes: '64x64', favicon_type: 'image/x-icon', theme_color: '#fff', background_color: '#fff', default_locale: 'en', display: 'standalone' },
        routes: [{ path: '/uploaded', component: 'TestComponent' }]
      })], 'config.json', { type: 'application/json' });
      
      const fileInput = screen.getByLabelText('Load Configuration File:') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('Uploaded Site'))).toBeInTheDocument();
      });
      
      // Switch to Routes tab
      const routesTab = screen.getByText('Routes');
      fireEvent.click(routesTab);
      expect(screen.getByDisplayValue('/uploaded')).toBeInTheDocument();
    });

    it('should handle invalid JSON file', async () => {
      const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      const { container } = render(<ConfigBuilder />);
      
      const file = new File(['invalid json content'], 'config.json', { type: 'application/json' });
      const fileInput = screen.getByLabelText('Load Configuration File:') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error parsing JSON file. Please ensure it contains valid JSON.');
      });
      
      mockAlert.mockRestore();
    });

    it('should handle invalid config structure', async () => {
      const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      const { container } = render(<ConfigBuilder />);
      
      const file = new File([JSON.stringify({ invalidProperty: 'value' })], 'config.json', { type: 'application/json' });
      const fileInput = screen.getByLabelText('Load Configuration File:') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Invalid configuration file. Expected siteInfo and routes properties.');
      });
      
      mockAlert.mockRestore();
    });

    it('should reset file input after upload', async () => {
      const { container } = render(<ConfigBuilder />);
      
      const file = new File([JSON.stringify({
        siteInfo: { name: 'Test', author: 'Test', description: 'Test', url: 'https://test.com', email: 'test@test.com', favicon: '/favicon.ico', favicon_sizes: '64x64', favicon_type: 'image/x-icon', theme_color: '#fff', background_color: '#fff', default_locale: 'en', display: 'standalone' },
        routes: []
      })], 'config.json', { type: 'application/json' });
      
      const fileInput = screen.getByLabelText('Load Configuration File:') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(fileInput.value).toBe('');
      });
    });
  });

  describe('Address Fields', () => {
    it('should update address fields', () => {
      render(<ConfigBuilder />);
      
      const streetInput = screen.getByPlaceholderText('Street Address') as HTMLInputElement;
      const cityInput = screen.getByPlaceholderText('City') as HTMLInputElement;
      const stateInput = screen.getByPlaceholderText('State/Region') as HTMLInputElement;
      const postalInput = screen.getByPlaceholderText('Postal Code') as HTMLInputElement;
      const countryInput = screen.getByPlaceholderText('Country') as HTMLInputElement;
      
      fireEvent.change(streetInput, { target: { value: '123 Main St' } });
      fireEvent.change(cityInput, { target: { value: 'Anytown' } });
      fireEvent.change(stateInput, { target: { value: 'CA' } });
      fireEvent.change(postalInput, { target: { value: '12345' } });
      fireEvent.change(countryInput, { target: { value: 'USA' } });
      
      expect(streetInput.value).toBe('123 Main St');
      expect(cityInput.value).toBe('Anytown');
      expect(stateInput.value).toBe('CA');
      expect(postalInput.value).toBe('12345');
      expect(countryInput.value).toBe('USA');
    });

    it('should render address fields with initial values', () => {
      const initialConfig = {
        siteInfo: testConfigData.siteInfoWithAddress,
        routes: testConfigData.emptyRoutes,
        visualdesign: testConfigData.visualdesign
      };
      
      render(<ConfigBuilder initialConfig={initialConfig} />);
      
      expect(screen.getByDisplayValue('456 Oak St')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Springfield')).toBeInTheDocument();
      expect(screen.getByDisplayValue('IL')).toBeInTheDocument();
      expect(screen.getByDisplayValue('62701')).toBeInTheDocument();
      expect(screen.getByDisplayValue('USA')).toBeInTheDocument();
    });
  });

  describe('Social Links Management', () => {
    it('should add social link', () => {
      render(<ConfigBuilder />);
      
      const addButton = screen.getByText('Add Social Link');
      fireEvent.click(addButton);
      
      const socialInputs = screen.getAllByPlaceholderText('https://social-link.com');
      expect(socialInputs).toHaveLength(2); // One existing + one added
    });

    it('should update social link', () => {
      render(<ConfigBuilder />);
      
      const socialInput = screen.getByPlaceholderText('https://social-link.com') as HTMLInputElement;
      fireEvent.change(socialInput, { target: { value: 'https://twitter.com/test' } });
      
      expect(socialInput.value).toBe('https://twitter.com/test');
    });

    it('should remove social link', () => {
      render(<ConfigBuilder />);
      
      const addButton = screen.getByText('Add Social Link');
      fireEvent.click(addButton);
      
      let socialInputs = screen.getAllByPlaceholderText('https://social-link.com');
      expect(socialInputs).toHaveLength(2);
      
      const removeButtons = screen.getAllByText('Remove');
      fireEvent.click(removeButtons[0]);
      
      socialInputs = screen.getAllByPlaceholderText('https://social-link.com');
      expect(socialInputs).toHaveLength(1);
    });

    it('should render social links with initial values', () => {
      const initialConfig = {
        siteInfo: testConfigData.siteInfoWithSocial,
        routes: testConfigData.emptyRoutes,
        visualdesign: testConfigData.visualdesign
      };
      
      render(<ConfigBuilder initialConfig={initialConfig} />);
      
      expect(screen.getByDisplayValue('https://twitter.com/test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://github.com/test')).toBeInTheDocument();
    });
  });

  describe('Form Submission and Validation', () => {
    it('should handle form submission', () => {
      render(<ConfigBuilder />);
      
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      
      // Form submission should update the config
      expect(screen.getByText((content) => content.includes('siteInfo'))).toBeInTheDocument();
    });

    it('should update config when form fields change', () => {
      render(<ConfigBuilder />);
      
      const nameInput = screen.getByLabelText('Site Name') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Updated Site Name' } });
      
      expect(nameInput.value).toBe('Updated Site Name');
    });
  });

  describe('Tab Functionality', () => {
    it('should switch between tabs', () => {
      render(<ConfigBuilder />);
      
      // Start on Site Info tab
      expect(screen.getByText('Site Info')).toBeInTheDocument();
      
      // Switch to Routes tab
      const routesTab = screen.getByText('Routes');
      fireEvent.click(routesTab);
      
      expect(screen.getByText('Add Route')).toBeInTheDocument();

      // Switch to Visual Design tab
      const visualDesignTab = screen.getByText('Visual Design');
      fireEvent.click(visualDesignTab);

      // Check that Visual Design content is rendered (FormEngine with form fields)
      expect(screen.getByLabelText('Primary color')).toBeInTheDocument();
    });

    it('should maintain tab state', () => {
      render(<ConfigBuilder />);
      
      // Switch to Routes tab
      const routesTab = screen.getByText('Routes');
      fireEvent.click(routesTab);
      
      // Add a route
      const addButton = screen.getByText('Add Route');
      fireEvent.click(addButton);
      
      // Switch back to Site Info
      const siteInfoTab = screen.getByText('Site Info');
      fireEvent.click(siteInfoTab);
      
      // Switch back to Routes - route should still be there
      fireEvent.click(routesTab);
      expect(screen.getAllByPlaceholderText('e.g., /')).toHaveLength(1);
    });
  });

  describe('Preview and JSON Output', () => {
    it('should display config preview', () => {
      render(<ConfigBuilder />);
      
      const preview = screen.getByText((content) => content.includes('siteInfo'));
      expect(preview).toBeInTheDocument();
    });

    it('should update preview when config changes', async () => {
      render(<ConfigBuilder />);
      
      // Initially should have default name from imported config
      expect(screen.getByText((content) => content.includes('"name": "Pixelated Technologies"'))).toBeInTheDocument();
      
      // Update name
      const nameInput = screen.getByLabelText('Site Name') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'New Name' } });
      
      // Input value should update
      await waitFor(() => {
        expect(nameInput.value).toBe('New Name');
      });
      
      // Preview should update
      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('"name": "New Name"'))).toBeInTheDocument();
      });
    });
  });

  describe('Services Tab Functionality', () => {
    it('should switch to services tab and render correctly', () => {
      render(<ConfigBuilder />);
      
      const servicesTab = screen.getByRole('button', { name: /services/i });
      fireEvent.click(servicesTab);
      
      expect(screen.getByText(/Add Service/i)).toBeInTheDocument();
    });

    it('should add a service and update preview', async () => {
      render(<ConfigBuilder />);
      
      // Select Services tab
      const servicesTab = screen.getByRole('button', { name: /services/i });
      fireEvent.click(servicesTab);
      
      // Click Add Service
      const addButton = screen.getByText(/Add Service/i);
      fireEvent.click(addButton);
      
      // Find the name field (FormEngine should render it based on services-form.json)
      const nameInput = screen.getByLabelText(/Service Name/i);
      fireEvent.change(nameInput, { target: { value: 'New Test Service' } });
      
      // Preview should update
      await waitFor(() => {
        expect(screen.getByText((content) => content.includes('"name": "New Test Service"'))).toBeInTheDocument();
      });
    });
  });

  describe('Site Info Form Fields', () => {
    it('should render all site info form fields including new schema fields', () => {
      render(<ConfigBuilder />);
      
      // Check existing required fields
      expect(screen.getByLabelText('Site Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Author')).toBeInTheDocument();
      expect(screen.getByLabelText('Site Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Site URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      
      // Check new schema fields
      expect(screen.getByLabelText('Telephone')).toBeInTheDocument();
      expect(screen.getByLabelText('Opening Hours')).toBeInTheDocument();
      expect(screen.getByLabelText('Price Range')).toBeInTheDocument();
      expect(screen.getByLabelText('Keywords')).toBeInTheDocument();
      expect(screen.getByLabelText('Publisher Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Copyright Year')).toBeInTheDocument();
      expect(screen.getByLabelText('Search Action Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Search Target URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Query Input')).toBeInTheDocument();
    });

    it('should update new schema fields and reflect in preview', async () => {
      render(<ConfigBuilder />);
      
      // Update opening hours
      const openingHoursInput = screen.getByLabelText('Opening Hours') as HTMLInputElement;
      fireEvent.change(openingHoursInput, { target: { value: 'Mo-Fr 09:00-17:00' } });
      
      // Update publisher type
      const publisherTypeSelect = screen.getByLabelText('Publisher Type') as HTMLSelectElement;
      fireEvent.change(publisherTypeSelect, { target: { value: 'LocalBusiness' } });
      
      // Update copyright year
      const copyrightYearInput = screen.getByLabelText('Copyright Year') as HTMLInputElement;
      fireEvent.change(copyrightYearInput, { target: { value: '2024' } });
      
      // Check that the input values are updated
      expect(openingHoursInput.value).toBe('Mo-Fr 09:00-17:00');
      expect(publisherTypeSelect.value).toBe('LocalBusiness');
      expect(copyrightYearInput.value).toBe('2024');
      
      // Check that preview contains the updated values (more flexible check)
      await waitFor(() => {
        const preview = screen.getByText((content) => content.includes('Configuration Preview'));
        expect(preview).toBeInTheDocument();
        
        // Check that the preview contains our updated values somewhere in the JSON
        const previewContent = screen.getByText((content) => content.includes('Mo-Fr 09:00-17:00'));
        expect(previewContent).toBeInTheDocument();
      });
    });
  });
});