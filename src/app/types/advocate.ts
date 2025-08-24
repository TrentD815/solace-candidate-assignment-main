export type Advocate = {
    id: number;
    firstName: string;
    lastName: string;
    city: string;
    degree: string;
    specialties: string[];
    yearsOfExperience: number;
    phoneNumber: bigint;
  };

  export type Advocates = Advocate[];

  export type SortField = 'firstName' | 'lastName' | 'city' | 'degree' | 'specialties' | 'yearsOfExperience' | 'phoneNumber';
  
  export type SortDirection = 'asc' | 'desc';