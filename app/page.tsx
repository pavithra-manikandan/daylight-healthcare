'use client';

import React, { useState } from 'react';
import Papa, { ParseResult } from 'papaparse';
import { FiUpload } from 'react-icons/fi';

type CSVRow = Record<string, string | null>;
type ParsedCSVData = string[][];

export default function HomePage() {
  const [data, setData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid .csv file.');
      return;
    }

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results: ParseResult<string[]>) => {
        if (!results.data || !Array.isArray(results.data)) {
          setError('Could not parse CSV file.');
          return;
        }

        // Filter out empty or whitespace-only rows
        const nonEmptyRows = results.data.filter((row: string[]) => 
          row.some((cell: string) => cell?.trim() !== '')
        );

        if (nonEmptyRows.length === 0) {
          setError('CSV file contains no valid data.');
          return;
        }

        // Find first row with actual data (skip placeholder rows)
        const headerRowIndex = nonEmptyRows.findIndex((row: string[]) => 
          row.some((cell: string) => cell?.trim() !== '' && cell?.trim() !== '—')
        );

        if (headerRowIndex === -1) {
          setError('Could not find valid headers in CSV.');
          return;
        }

        // Use first valid row as headers
        const potentialHeaders = nonEmptyRows[headerRowIndex].map((header: string) => 
          header?.trim() || `Column_${Math.random().toString(36).substring(2, 7)}`
        );

        // Process remaining rows
        const processedData = nonEmptyRows.slice(headerRowIndex + 1).map((row: string[]) => {
          const obj: CSVRow = {};
          potentialHeaders.forEach((header: string, i: number) => {
            const value = row[i];
            obj[header] = (value && value.trim() !== '—') ? value.trim() : null;
          });
          return obj;
        });

        // Remove empty columns (where all values are null)
        const columnsWithData = potentialHeaders.filter((header: string) => 
          processedData.some(row => row[header] !== null)
        );

        // Filter the data to only include columns with data
        const filteredData = processedData.map((row: CSVRow) => {
          const filteredRow: CSVRow = {};
          columnsWithData.forEach((header: string) => {
            filteredRow[header] = row[header];
          });
          return filteredRow;
        });

        setHeaders(columnsWithData);
        setData(filteredData);
      },
      error: (err: Error) => {
        setError(`CSV parsing failed: ${err.message}`);
      },
    });
  };

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-gray-800 mb-4 pb-2 border-b-2 border-amber-200 inline-block">
            Daylight Healthcare
          </h1>
        </div>

        <div className="mb-8">
          <label className="block text-lg text-gray-600 mb-3 font-medium">
            Upload CSV
          </label>
          <div className="flex items-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
              id="csv-upload"
            />
            <label 
              htmlFor="csv-upload"
              className="cursor-pointer bg-amber-100 px-8 py-4 rounded-xl shadow-md border-2 border-dashed border-amber-300 hover:bg-amber-200 transition-all duration-300 flex items-center justify-center w-full max-w-md"
            >
              <FiUpload className="text-3xl text-amber-600 mr-3" />
              <span className="text-lg text-amber-800 font-medium">Choose CSV File</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="text-red-600 bg-red-50 border-l-4 border-red-500 p-4 rounded mb-8 max-w-md">
            {error}
          </div>
        )}

        {data.length > 0 && (
          <div className="overflow-auto bg-amber-75 rounded-2xl shadow-lg border border-amber-100">
            <table className="min-w-full text-base">
              <thead>
                <tr className="bg-amber-75">
                  {headers.map((header) => (
                    <th 
                      key={header} 
                      className="p-5 text-left font-medium text-amber-900 tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className="hover:bg-amber-50 transition-colors duration-150 even:bg-amber-75"
                  >
                    {headers.map((header) => (
                      <td 
                        key={`${rowIndex}-${header}`} 
                        className="p-5 text-gray-700"
                      >
                        {row[header] || (
                          <span 
                            className="text-gray-400 relative group"
                            title="Information unavailable!"
                          >
                            —
                            <span className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 -bottom-8 -left-1/2 transform -translate-x-1/4 whitespace-nowrap">
                              Information unavailable!
                            </span>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}