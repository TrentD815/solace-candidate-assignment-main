"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Advocate, SortField, SortDirection } from "@/app/types/advocate";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('firstName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch advocates with search, sorting, and pagination
  const fetchAdvocates = useCallback(async (search?: string, page: number = 1, sortBy?: SortField, sortOrder?: SortDirection) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search && search.length >= 2) {
        params.append('search', search);
      }
      params.append('page', page.toString());
      params.append('limit', '10');
      params.append('sortBy', sortBy || sortField);
      params.append('sortOrder', sortOrder || sortDirection);

      const response = await fetch(`/api/advocates?${params.toString()}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }

      setFilteredAdvocates(data.data);
      setAdvocates(data.data);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch advocates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sortField, sortDirection]);

  // Initial load
  useEffect(() => {
    fetchAdvocates();
  }, [fetchAdvocates]);

  // Perform search with debouncing
  const performSearch = useCallback((value: string) => {
    if (!value || value.length < 2) {
      setCurrentPage(1);
      fetchAdvocates();
      return;
    }

    setCurrentPage(1);
    fetchAdvocates(value, 1, sortField, sortDirection);
  }, [fetchAdvocates, sortField, sortDirection]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Only search if there are 2 or more characters
    if (value.length >= 2) {
      // Debounce the search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    } else if (value.length === 0) {
      // Immediately show all results if search is cleared
      setCurrentPage(1);
      fetchAdvocates();
    } else {
      // Show all results if less than 2 characters
      setCurrentPage(1);
      fetchAdvocates();
    }
  };

  const onClick = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchAdvocates();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      const newSortOrder = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newSortOrder);
      fetchAdvocates(searchTerm, currentPage, field, newSortOrder);
    } else {
      setSortField(field);
      setSortDirection('asc');
      fetchAdvocates(searchTerm, currentPage, field, 'asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchAdvocates(searchTerm, newPage, sortField, sortDirection);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Solace Advocates</h1>
        
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Advocates
              </label>
              <input
                id="search"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Search by name, city, degree, specialties..."
                value={searchTerm}
                onChange={onChange}
              />
            </div>
            <button
              onClick={onClick}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors h-10"
            >
              Reset Search
            </button>
          </div>
          {searchTerm && (
            <p className="mt-3 text-sm text-gray-600">
              Searching for: <span className="font-semibold text-blue-600">{searchTerm}</span>
            </p>
          )}
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredAdvocates.length} of {totalCount} advocates
            </p>
            {isLoading && (
              <div className="text-blue-600 text-sm">Loading...</div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead className="bg-blue-700 text-white">
                <tr>
                  {[
                    { field: 'firstName', label: 'First Name' },
                    { field: 'lastName', label: 'Last Name' },
                    { field: 'city', label: 'City' },
                    { field: 'degree', label: 'Degree' },
                    { field: 'specialties', label: 'Specialties' },
                    { field: 'yearsOfExperience', label: 'Years of Experience' },
                    { field: 'phoneNumber', label: 'Phone Number' }
                  ].map(({ field, label }) => (
                    <th
                      key={field}
                      className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-600 transition-colors"
                      onClick={() => handleSort(field as SortField)}
                    >
                      <div className="flex items-center gap-2">
                        {label}
                        <SortIcon field={field as SortField} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAdvocates?.map((advocate: Advocate, index: number) => {
                  const rowKey =
                    advocate.id ??
                    advocate.phoneNumber ??
                    `${advocate.firstName}-${advocate.lastName}-${advocate.city}`;
                  return (
                    <tr
                      key={rowKey}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {advocate.firstName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {advocate.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {advocate.city}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {advocate.degree}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {advocate.specialties?.map((specialty: string) => (
                            <span
                              key={specialty}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {advocate.yearsOfExperience} years
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {advocate.phoneNumber}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredAdvocates.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No advocates found matching your search criteria.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
