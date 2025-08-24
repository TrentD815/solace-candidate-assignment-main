"use client";

import { useEffect, useState } from "react";
import { Advocate } from "@/app/types/advocate";

type SortField = 'firstName' | 'lastName' | 'city' | 'degree' | 'specialties' | 'yearsOfExperience' | 'phoneNumber';
type SortDirection = 'asc' | 'desc';

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('firstName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    console.log("fetching advocates...");
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      });
    });
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    console.log("filtering advocates...", value);
    const term = value.toLowerCase();
    const filtered = advocates.filter((advocate) => {
      const firstName = advocate.firstName.toLowerCase();
      const lastName = advocate.lastName.toLowerCase();
      const city = advocate.city.toLowerCase();
      const degree = advocate.degree.toLowerCase();
      const specialties = advocate.specialties.join(" ").toLowerCase()
      const yearsOfExperience = advocate.yearsOfExperience
      const phoneNumber = advocate.phoneNumber

      return (
        firstName.includes(term) ||
        lastName.includes(term) ||
        city.includes(term) ||
        degree.includes(term) ||
        specialties.includes(term) ||
        yearsOfExperience.toString().includes(term) ||
        phoneNumber.toString().includes(term)
      );
    });

    setFilteredAdvocates(filtered);
  };

  const onClick = () => {
    console.log(advocates);
    setSearchTerm("");
    setFilteredAdvocates(advocates);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedAdvocates = () => {
    return [...filteredAdvocates].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'firstName':
          aValue = a.firstName.toLowerCase();
          bValue = b.firstName.toLowerCase();
          break;
        case 'lastName':
          aValue = a.lastName.toLowerCase();
          bValue = b.lastName.toLowerCase();
          break;
        case 'city':
          aValue = a.city.toLowerCase();
          bValue = b.city.toLowerCase();
          break;
        case 'degree':
          aValue = a.degree.toLowerCase();
          bValue = b.degree.toLowerCase();
          break;
        case 'specialties':
          aValue = a.specialties.join(', ').toLowerCase();
          bValue = b.specialties.join(', ').toLowerCase();
          break;
        case 'yearsOfExperience':
          aValue = a.yearsOfExperience;
          bValue = b.yearsOfExperience;
          break;
        case 'phoneNumber':
          aValue = a.phoneNumber;
          bValue = b.phoneNumber;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  const sortedAdvocates = getSortedAdvocates();

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
                      className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
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
                {sortedAdvocates.map((advocate: Advocate, index: number) => {
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
                          {advocate.specialties.map((specialty: string) => (
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
          
          {sortedAdvocates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No advocates found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
