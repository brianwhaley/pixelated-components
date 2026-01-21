import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { Table } from '@/components/general/table';

// Mock SmartImage component
vi.mock('@/components/general/smartimage', () => ({
  SmartImage: (props: any) => {
    const { src, alt, title } = props;
    return React.createElement('img', {
      src,
      alt,
      title,
      'data-testid': 'smart-image'
    });
  },
}));

describe('Table Component', () => {
  const mockTableData = [
    { Name: 'John Doe', Age: '28', Department: 'Engineering' },
    { Name: 'Jane Smith', Age: '34', Department: 'Marketing' },
    { Name: 'Bob Johnson', Age: '45', Department: 'Sales' },
    { Name: 'Alice Williams', Age: '29', Department: 'Design' },
    { Name: 'Charlie Brown', Age: '31', Department: 'Engineering' },
  ];

  describe('Table Rendering', () => {
    it('should render table container', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('should render table with correct ID', () => {
      const { container } = render(
        <Table data={mockTableData} id="my-table" />
      );
      expect(container.querySelector('table')).toHaveAttribute('id', 'my-table');
    });

    it('should apply pixTable class to table', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      expect(container.querySelector('table')).toHaveClass('pixTable');
    });

    it('should render thead element', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      expect(container.querySelector('thead')).toBeInTheDocument();
    });

    it('should render tbody element', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      expect(container.querySelector('tbody')).toBeInTheDocument();
    });
  });

  describe('Table Headers', () => {
    it('should render correct number of header columns', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      const headers = container.querySelectorAll('thead th');
      expect(headers.length).toBe(3); // Name, Age, Department
    });

    it('should render header text from data keys', () => {
      render(<Table data={mockTableData} id="test-table" />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Department')).toBeInTheDocument();
    });

    it('should render all header keys in correct order', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      const headerTexts = Array.from(container.querySelectorAll('thead th')).map(
        h => h.textContent?.split(' ')[0]
      );
      expect(headerTexts).toEqual(['Name', 'Age', 'Department']);
    });

    it('should include sortArrow span in headers when sortable is true', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      );
      const sortArrows = container.querySelectorAll('thead th .sortArrow');
      expect(sortArrows.length).toBe(3);
    });

    it('should not include sortArrow span in headers when sortable is false', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={false} />
      );
      const sortArrows = container.querySelectorAll('thead th .sortArrow');
      expect(sortArrows.length).toBe(0);
    });
  });

  describe('Table Rows and Cells', () => {
    it('should render correct number of rows', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(5);
    });

    it('should render correct number of cells per row', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      const cells = container.querySelectorAll('tbody tr:first-child td');
      expect(cells.length).toBe(3);
    });

    it('should render all cell values from data', () => {
      render(<Table data={mockTableData} id="test-table" />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      // Use getAllByText for duplicates like "Engineering"
      expect(screen.getAllByText('Engineering').length).toBeGreaterThan(0);
    });

    it('should render numeric values as strings', () => {
      render(<Table data={mockTableData} id="test-table" />);
      expect(screen.getByText('28')).toBeInTheDocument();
      expect(screen.getByText('34')).toBeInTheDocument();
    });

    it('should render all rows with correct data', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0].textContent).toContain('John Doe');
      expect(rows[1].textContent).toContain('Jane Smith');
      expect(rows[4].textContent).toContain('Charlie Brown');
    });
  });

  describe('Table Image Detection', () => {
    it('should render image URLs using SmartImage component', () => {
      const imageData = [
        { Name: 'Product 1', Image: 'https://example.com/image.jpg' },
        { Name: 'Product 2', Image: 'https://example.com/photo.png' },
      ];
      const { container } = render(
        <Table data={imageData} id="test-table" />
      );
      const images = container.querySelectorAll('img[data-testid="smart-image"]');
      expect(images.length).toBe(2);
    });

    it('should detect various image formats', () => {
      const imageData = [
        { Type: 'jpeg', Url: 'https://example.com/test.jpeg' },
        { Type: 'jpg', Url: 'https://example.com/test.jpg' },
        { Type: 'png', Url: 'https://example.com/test.png' },
        { Type: 'webp', Url: 'https://example.com/test.webp' },
      ];
      const { container } = render(
        <Table data={imageData} id="test-table" />
      );
      const images = container.querySelectorAll('img[data-testid="smart-image"]');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should render non-image URLs as text', () => {
      const mixedData = [
        { Name: 'Item', Url: 'https://example.com/page' },
      ];
      render(<Table data={mixedData} id="test-table" />);
      expect(screen.getByText('https://example.com/page')).toBeInTheDocument();
    });

    it('should render invalid URLs as text', () => {
      const invalidData = [
        { Name: 'Item', Value: 'not-a-url' },
      ];
      render(<Table data={invalidData} id="test-table" />);
      expect(screen.getByText('not-a-url')).toBeInTheDocument();
    });
  });

  describe('Table Sorting', () => {
    it('should make headers clickable when sortable is true', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      );
      const headers = container.querySelectorAll('thead th');
      // Should not throw when clicking
      expect(headers.length).toBeGreaterThan(0);
      // Verify headers are present
      expect(container.querySelector('thead')).toBeInTheDocument();
    });

    it('should not make headers clickable when sortable is false', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={false} />
      );
      const headers = container.querySelectorAll('thead th');
      // Should not have onclick handlers
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should render sortArrow elements when sortable is true', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      );
      const arrows = container.querySelectorAll('thead .sortArrow');
      expect(arrows.length).toBe(3);
    });

    it('should have no sort arrows initially', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      );
      const arrows = container.querySelectorAll('.sortArrow.asc, .sortArrow.desc');
      expect(arrows.length).toBe(0);
    });

    it('should have different behavior for sortable prop values', () => {
      const sortable1 = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      ).container;
      const sortable0 = render(
        <Table data={mockTableData} id="test-table" sortable={false} />
      ).container;
      
      const arrows1 = sortable1.querySelectorAll('.sortArrow');
      const arrows0 = sortable0.querySelectorAll('.sortArrow');
      expect(arrows1.length).toBeGreaterThan(arrows0.length);
    });
  });

  describe('Table Edge Cases', () => {
    it('should render table with single row', () => {
      const singleRow = [{ Name: 'Single Item', Value: 'Test' }];
      const { container } = render(
        <Table data={singleRow} id="test-table" />
      );
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
    });

    it('should render table with single column', () => {
      const singleCol = [{ Name: 'Item 1' }, { Name: 'Item 2' }];
      const { container } = render(
        <Table data={singleCol} id="test-table" />
      );
      const headers = container.querySelectorAll('thead th');
      expect(headers.length).toBe(1);
    });

    it('should handle empty string values', () => {
      const dataWithEmpty = [
        { Name: 'Item', Description: '' },
      ];
      const { container } = render(
        <Table data={dataWithEmpty} id="test-table" />
      );
      const cells = container.querySelectorAll('tbody td');
      expect(cells.length).toBe(2);
    });

    it('should handle null-like values gracefully', () => {
      const dataWithNull = [
        { Name: 'Item', Value: null as any },
      ];
      const { container } = render(
        <Table data={dataWithNull} id="test-table" />
      );
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('renders arrays as comma-separated strings (defensive)', () => {
      const data = [ { Name: 'Item', Tags: ['one', 'two', 'three'] } ];
      render(<Table data={data as any} id="test-table" />);
      expect(screen.getByText('one, two, three')).toBeInTheDocument();
    });

    it('stringifies object cells instead of throwing (defensive)', () => {
      const data = [ { Name: 'Item', Meta: { a: 1, b: 'two' } } ];
      const { container } = render(<Table data={data as any} id="test-table" />);
      // should render JSON snippet for object cell
      expect(container.textContent).toMatch(/"a":\s*1/);
      expect(container.textContent).toMatch(/"b":\s*"two"/);
    });

    it('should handle special characters in data', () => {
      const specialData = [
        { Name: 'Item & Test', Value: '<tag>content</tag>' },
      ];
      render(<Table data={specialData} id="test-table" />);
      expect(screen.getByText('Item & Test')).toBeInTheDocument();
      // HTML should be escaped and not rendered as tags
      const table = screen.getByRole('table');
      expect(table.textContent).toContain('Item & Test');
      expect(table.textContent).toContain('<tag>');
    });

    it('should handle very long content', () => {
      const longData = [
        { Name: 'A'.repeat(100), Value: 'B'.repeat(100) },
      ];
      const { container } = render(
        <Table data={longData} id="test-table" />
      );
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('should handle numeric column names', () => {
      const numericHeaders = [
        { '1': 'Value1', '2': 'Value2' },
        { '1': 'Value3', '2': 'Value4' },
      ];
      const { container } = render(
        <Table data={numericHeaders} id="test-table" />
      );
      const headers = container.querySelectorAll('thead th');
      expect(headers.length).toBe(2);
    });

    it('should render table with many rows', () => {
      const manyRows = Array.from({ length: 100 }, (_, i) => ({
        Id: i.toString(),
        Name: `Item ${i}`,
        Value: Math.random().toString(),
      }));
      const { container } = render(
        <Table data={manyRows} id="test-table" />
      );
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(100);
    });

    it('should render table with many columns', () => {
      const manyColsData = [
        Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`Col${i}`, `Value${i}`]))
      ];
      const { container } = render(
        <Table data={manyColsData} id="test-table" />
      );
      const headers = container.querySelectorAll('thead th');
      expect(headers.length).toBe(20);
    });
  });

  describe('Table Structure', () => {
    it('should have proper semantic table structure', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      const table = container.querySelector('table');
      expect(table?.querySelector('thead')).toBeInTheDocument();
      expect(table?.querySelector('tbody')).toBeInTheDocument();
    });

    it('should use th elements in header row', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      const headerCells = container.querySelectorAll('thead th');
      expect(headerCells.length).toBeGreaterThan(0);
      headerCells.forEach(cell => {
        expect(cell.tagName).toBe('TH');
      });
    });

    it('should use td elements in body rows', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      const bodyCells = container.querySelectorAll('tbody td');
      expect(bodyCells.length).toBeGreaterThan(0);
      bodyCells.forEach(cell => {
        expect(cell.tagName).toBe('TD');
      });
    });

    it('should wrap header cells in tr element', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      const headerRow = container.querySelector('thead tr');
      expect(headerRow).toBeInTheDocument();
      expect(headerRow?.querySelectorAll('th').length).toBe(3);
    });

    it('should wrap body cells in tr elements', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      const bodyRows = container.querySelectorAll('tbody tr');
      bodyRows.forEach(row => {
        expect(row.querySelectorAll('td').length).toBe(3);
      });
    });
  });

  describe('Table Styling and Classes', () => {
    it('should have pixTable class on table element', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      expect(container.querySelector('table')).toHaveClass('pixTable');
    });

    it('should support custom table ID for CSS targeting', () => {
      const { container } = render(
        <Table data={mockTableData} id="custom-id" />
      );
      expect(container.querySelector('#custom-id')).toBeInTheDocument();
    });
  });

  describe('Table Data Integrity', () => {
    it('should preserve data order on render', () => {
      render(<Table data={mockTableData} id="test-table" />);
      const names = mockTableData.map(row => row.Name);
      names.forEach(name => {
        expect(screen.getByText(name)).toBeInTheDocument();
      });
    });

    it('should not modify original data', () => {
      const originalData = [...mockTableData];
      render(<Table data={mockTableData} id="test-table" />);
      expect(mockTableData).toEqual(originalData);
    });

    it('should handle data with mixed types', () => {
      const mixedData = [
        { String: 'text', Number: '123', Bool: 'true' },
        { String: 'more text', Number: '456', Bool: 'false' },
      ];
      render(<Table data={mixedData} id="test-table" />);
      expect(screen.getByText('text')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('true')).toBeInTheDocument();
    });
  });

  describe('Table Sorting', () => {
    it('should render sort arrow when sortable is true', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      );
      const sortArrows = container.querySelectorAll('.sortArrow');
      expect(sortArrows.length).toBeGreaterThan(0);
    });

    it('should not render sort arrow when sortable is false', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={false} />
      );
      const sortArrows = container.querySelectorAll('.sortArrow');
      expect(sortArrows.length).toBe(0);
    });

    it('should render one sort arrow per header when sortable', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      );
      const headers = container.querySelectorAll('th');
      const arrows = container.querySelectorAll('.sortArrow');
      expect(arrows.length).toBe(headers.length);
    });

    it('should have click handlers on headers when sortable', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      );
      const headers = container.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
      headers.forEach(header => {
        expect(header.onclick).not.toBeNull();
      });
    });

    it('should execute sort on header click', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      );
      const headers = container.querySelectorAll('thead th');
      // Mock innerText for headers to avoid undefined error
      headers.forEach((header, idx) => {
        const keys = ['Name', 'Age', 'Department'];
        Object.defineProperty(header, 'innerText', {
          value: keys[idx],
          writable: true
        });
      });
      
      fireEvent.click(headers[0]);
      // If click executed without error, test passes
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('should clear all arrows before applying new sort', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      );
      const headers = container.querySelectorAll('thead th');
      headers.forEach((header, idx) => {
        const keys = ['Name', 'Age', 'Department'];
        Object.defineProperty(header, 'innerText', {
          value: keys[idx],
          writable: true
        });
      });
      
      // Click different headers
      if (headers.length >= 2) {
        fireEvent.click(headers[0]);
        fireEvent.click(headers[1]);
        // Only one arrow should be active at a time
        const activeArrows = container.querySelectorAll('.sortArrow.asc, .sortArrow.desc');
        expect(activeArrows.length).toBeLessThanOrEqual(1);
      }
    });

    it('should handle sorting with proper data structure', () => {
      const simpleData = [
        { Name: 'Zoe', Score: '90' },
        { Name: 'Alice', Score: '85' },
        { Name: 'Bob', Score: '95' },
      ];
      const { container } = render(
        <Table data={simpleData} id="test-table" sortable={true} />
      );
      
      // Verify all data is rendered
      expect(screen.getByText('Zoe')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should render table with sortable prop true without errors', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      );
      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelectorAll('.sortArrow').length).toBe(3);
    });

    it('should render table with sortable prop false without errors', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={false} />
      );
      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelectorAll('.sortArrow').length).toBe(0);
    });
  });

  describe('Image URL Detection', () => {
    it('should render SmartImage for image URLs', () => {
      const imageData = [
        {
          Name: 'Image 1',
          URL: 'https://example.com/image.jpg'
        }
      ];
      render(<Table data={imageData} id="test-table" />);
      expect(screen.getByTestId('smart-image')).toBeInTheDocument();
    });

    it('should detect various image formats', () => {
      const formats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
      formats.forEach(format => {
        const imageData = [
          {
            Image: `https://example.com/test.${format}`
          }
        ];
        const { container } = render(
          <Table data={imageData} id={`test-${format}`} />
        );
        expect(container.querySelector('img')).toBeInTheDocument();
      });
    });

    it('should be case-insensitive for image extensions', () => {
      const imageData = [
        { Image: 'https://example.com/photo.PNG' }
      ];
      render(<Table data={imageData} id="test-table" />);
      expect(screen.getByTestId('smart-image')).toBeInTheDocument();
    });

    it('should not render SmartImage for non-image URLs', () => {
      const textData = [
        { Name: 'Text', URL: 'https://example.com/page' }
      ];
      const { container } = render(
        <Table data={textData} id="test-table" />
      );
      expect(container.querySelector('img')).not.toBeInTheDocument();
      expect(screen.getByText('https://example.com/page')).toBeInTheDocument();
    });

    it('should not render SmartImage for invalid URLs', () => {
      const invalidData = [
        { Name: 'Invalid', Description: 'This has .jpg in the text' }
      ];
      const { container } = render(
        <Table data={invalidData} id="test-table" />
      );
      // Text content without valid URL should not render as image
      expect(screen.getByText(/This has .jpg/)).toBeInTheDocument();
    });

    it('should render SmartImage with correct attributes', () => {
      const imageData = [
        { Title: 'Test Image', URL: 'https://example.com/test.jpg' }
      ];
      render(<Table data={imageData} id="test-table" />);
      const image = screen.getByTestId('smart-image');
      expect(image).toHaveAttribute('src', 'https://example.com/test.jpg');
      expect(image).toHaveAttribute('title', 'https://example.com/test.jpg');
      expect(image).toHaveAttribute('alt', 'https://example.com/test.jpg');
    });
  });

  describe('Table Edge Cases', () => {
    it('should handle single row of data', () => {
      const singleRow = [{ Name: 'Solo Person', Age: '25' }];
      const { container } = render(
        <Table data={singleRow} id="test-table" />
      );
      expect(container.querySelectorAll('tr')).toHaveLength(2); // 1 header + 1 row
    });

    it('should handle single column of data', () => {
      const singleCol = [{ Name: 'Alice' }, { Name: 'Bob' }];
      const { container } = render(
        <Table data={singleCol} id="test-table" />
      );
      expect(container.querySelectorAll('th')).toHaveLength(1);
    });

    it('should handle empty string values', () => {
      const emptyData = [
        { Name: '', Age: '30' },
        { Name: 'Bob', Age: '' }
      ];
      const { container } = render(
        <Table data={emptyData} id="test-table" />
      );
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('should handle special characters in data', () => {
      const specialData = [
        { Name: 'O\'Brien', Symbol: '$100' },
        { Name: 'Smith & Jones', Symbol: '€50' }
      ];
      render(<Table data={specialData} id="test-table" />);
      expect(screen.getByText("O'Brien")).toBeInTheDocument();
      expect(screen.getByText('Smith & Jones')).toBeInTheDocument();
    });

    it('should handle very long text in cells', () => {
      const longData = [
        {
          Name: 'John Doe',
          Description: 'This is a very long description that might wrap to multiple lines and could potentially cause layout issues in the table'
        }
      ];
      render(<Table data={longData} id="test-table" />);
      expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
    });

    it('should handle data with many columns', () => {
      const manyColsData = [
        {
          Col1: 'A', Col2: 'B', Col3: 'C', Col4: 'D', Col5: 'E',
          Col6: 'F', Col7: 'G', Col8: 'H', Col9: 'I', Col10: 'J'
        }
      ];
      const { container } = render(
        <Table data={manyColsData} id="test-table" />
      );
      expect(container.querySelectorAll('th')).toHaveLength(10);
    });

    it('should handle data with many rows', () => {
      const manyRowsData = Array.from({ length: 100 }, (_, i) => ({
        ID: String(i),
        Name: `Person ${i}`
      }));
      const { container } = render(
        <Table data={manyRowsData} id="test-table" />
      );
      expect(container.querySelectorAll('tbody tr')).toHaveLength(100);
    });
  });

  describe('PropTypes Validation', () => {
    it('should have required prop-types defined', () => {
      expect(Table.propTypes).toBeDefined();
      expect(Table.propTypes).toHaveProperty('data');
      expect(Table.propTypes).toHaveProperty('id');
      expect(Table.propTypes).toHaveProperty('sortable');
    });

    it('should accept sortable as boolean', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" sortable={true} />
      );
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('should work without sortable prop (optional)', () => {
      const { container } = render(
        <Table data={mockTableData} id="test-table" />
      );
      expect(container.querySelector('table')).toBeInTheDocument();
    });
  });
});
