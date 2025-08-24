import { NextRequest } from "next/server";
import db from "@/db";
import { advocates } from "@/db/schema";
import { eq, ilike, or, desc, asc, sql, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Check if database is properly connected
    if (!db) {
      return Response.json({ error: "Database not connected" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'firstName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build search conditions
    let whereConditions = undefined;
    if (search && search.length >= 2) {
      whereConditions = or(
        ilike(advocates.firstName, `%${search}%`),
        ilike(advocates.lastName, `%${search}%`),
        ilike(advocates.city, `%${search}%`),
        ilike(advocates.degree, `%${search}%`),
        sql`CAST(${advocates.phoneNumber} AS TEXT) ILIKE ${`%${search}%`}`,
        sql`${advocates.specialties}::text ILIKE ${`%${search}%`}`
      );
    }

    // Get total count
    const totalCountResult = await db
      .select({ count: count() })
      .from(advocates)
      .where(whereConditions);
    const totalCount = totalCountResult[0]?.count || 0;
    
    const offset = (page - 1) * limit;
    
    // Determine the sort column
    let sortColumn;
    switch (sortBy) {
      case 'firstName':
        sortColumn = advocates.firstName;
        break;
      case 'lastName':
        sortColumn = advocates.lastName;
        break;
      case 'city':
        sortColumn = advocates.city;
        break;
      case 'degree':
        sortColumn = advocates.degree;
        break;
      case 'yearsOfExperience':
        sortColumn = advocates.yearsOfExperience;
        break;
      case 'phoneNumber':
        sortColumn = advocates.phoneNumber;
        break;
      default:
        sortColumn = advocates.firstName;
    }

    // Build and execute query with proper sorting
    const results = await db
      .select()
      .from(advocates)
      .where(whereConditions)
      .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset);
    
    return Response.json({
      data: results,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error in fetching advocates:', error);
    return Response.json({ error: "Failed to fetch advocates" }, { status: 500 });
  }
}
