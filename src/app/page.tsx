"use client";

import { useEffect, useState } from "react";
import {Advocate} from "@/app/types/advocate";


export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term">{searchTerm}</span>
        </p>
        <input style={{ border: "1px solid black" }} value={searchTerm} onChange={onChange} />
        <button onClick={onClick}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate:Advocate) => {
            const rowKey =
              advocate.id ??
              advocate.phoneNumber ??
              `${advocate.firstName}-${advocate.lastName}-${advocate.city}`;
            return (
              <tr key={rowKey}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {
                      advocate.specialties.map((s: string) =>
                      <div key={s}>{s}</div>)
                  }
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
