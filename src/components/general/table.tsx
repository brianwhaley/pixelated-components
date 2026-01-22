import React, { useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SmartImage } from './smartimage';
import './table.css';

const debug = false;

function isImageURL(url: string) {
  	const isImage = /\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(url);
	const isURL = () => { try { new URL(url); return true; } catch { return false; } };
	return isImage && isURL ;
}

Table.propTypes = {
	data: PropTypes.array.isRequired,
	id: PropTypes.string.isRequired,
	sortable: PropTypes.bool,
	altRowColor: PropTypes.string,
};
export type TableType = InferProps<typeof Table.propTypes>;
export function Table (props: TableType) {

	const [ tableData, setTableData ] = useState(props.data);

	function getHeadings (data: Array<{ [key: string]: any }>) {
		const headings = Object.keys(data[0]).map((key, i) => {
			return (props.sortable && props.sortable == true) 
				? <th key={i} onClick={() => { sortTable(key); }}><span>{key}</span> <span className="sortArrow" /></th>
				: <th key={i}><span>{key}</span></th>;
		});
		return <tr>{headings}</tr>;
	}

	function getRows (data: Array<{ [key: string]: any }>) {
		return data.map((obj, i) => {
			const rowStyle = (props.altRowColor && i % 2 === 1) ? { backgroundColor: props.altRowColor } : {};
			return <tr key={i} style={rowStyle}>{getCells(obj)}</tr>;
		});
	}

	function getCells (obj:{ [key: string]: any }) {
		// Use entries so we have access to the column key when rendering nested tables
		return Object.entries(obj).map(([key, value], i) => {
			// Defensive rendering: handle React nodes, images, arrays, and objects gracefully
			const myValue = (() => {
				// If it's already a React element, render it directly
				if (React.isValidElement(value)) return value;
				if (isImageURL(value)) return <SmartImage src={value} title={String(value)} alt={String(value)} />;
				if (value === null || value === undefined) return '';
				if (Array.isArray(value)) return value.join(', ');
				if (typeof value === 'object') {
					// Render nested table for object cells (no sortable or altRowColor props)
					try {
						// Convert the object to an array of name-value objects
						const nameValueArray = Object.entries(value).map(([key, value]) => {
							return { name: key, value: value };
						});
						// return <Table data={[nameValueArray]} id={key} />;
						return JSON.stringify(value, null, 2);
					} catch (err) {
						// Fallback: stringify if something goes wrong
						return JSON.stringify(value, null, 2);
					}
				}
				return value;
			})();
			return <td key={i} data-testid={`cell-${i}`}>{myValue}</td>;
		});
	}

	/* ========== SORT FUNCTIONS ========== */

	function getHeader(column: string){
		const table = document.getElementById(props.id) as HTMLTableElement;
		const headers = table.querySelectorAll('th');
		let myHeader = undefined;
		headers.forEach(header => {
			if (header.innerText.trim().toUpperCase() === column.trim().toUpperCase()) {
				myHeader = header as HTMLTableCellElement;
			}
		});
		return (myHeader);
	}

	function getDirection(header: HTMLTableCellElement){
		const arrow = header.querySelector('.sortArrow');
		let oldDirection = '';
		if (arrow){
			const oldClassList = arrow.classList;
			if (oldClassList.contains('asc')) {
				oldDirection = 'asc';
			} else if (oldClassList.contains('desc')) {
				oldDirection = 'desc';
			} 
		}
		return (oldDirection);
	}

	function clearAllArrows() {
		const table = document.getElementById(props.id) as HTMLTableElement;
		const headers = table.querySelectorAll('th');
		headers.forEach(header => {
			const arrow = header.querySelector('.sortArrow');
			if (arrow) {
				arrow.classList.remove('asc', 'desc');
			}
		});
	}

	function updateArrow(column: string, oldDirection: string) {
		const header = getHeader(column) as unknown as HTMLTableCellElement;
		const arrow = header.querySelector('.sortArrow');
		if (arrow) {
			if (oldDirection == 'asc') {
				arrow.classList.add('desc');
			} else {
				arrow.classList.add('asc');
			}
		}
	}

	function sortTable(column: string) {
		const oldTableData = [...tableData];
		const myHeader = getHeader(column);
		if (myHeader && getDirection(myHeader) === 'asc') {
			setTableData(oldTableData.sort((a, b) => b[column].localeCompare(a[column])));
		} else {
			setTableData( oldTableData.sort((a, b) => a[column].localeCompare(b[column])) );
		}
		if (myHeader) {
			const oldDirection = getDirection(myHeader);
			clearAllArrows();
			updateArrow(column, oldDirection );
		}
	}

	return (
		<div>
			<table id={props.id ?? undefined} className="pixTable">
				<thead>{getHeadings(tableData)}</thead>
				<tbody>{getRows(tableData)}</tbody>
			</table>
		</div>
	);

};

