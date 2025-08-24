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
    if (search && search.length >= 3) {
      whereConditions = or(
        ilike(advocates.firstName, `%${search}%`),
        ilike(advocates.lastName, `%${search}%`),
        ilike(advocates.city, `%${search}%`),
        ilike(advocates.degree, `%${search}%`)
      );
    }

    // Get total count
    const totalCountResult = await db
      .select({ count: count() })
      .from(advocates)
      .where(whereConditions);
    
    const totalCount = totalCountResult[0]?.count || 0;

    // Build the main query with sorting and pagination
    const offset = (page - 1) * limit;
    
    let results;
    if (sortBy === 'firstName') {
      results = await db
        .select()
        .from(advocates)
        .where(whereConditions)
        .orderBy(sortOrder === 'desc' ? desc(advocates.firstName) : asc(advocates.firstName))
        .limit(limit)
        .offset(offset);
    } else if (sortBy === 'lastName') {
      results = await db
        .select()
        .from(advocates)
        .where(whereConditions)
        .orderBy(sortOrder === 'desc' ? desc(advocates.lastName) : asc(advocates.lastName))
        .limit(limit)
        .offset(offset);
    } else if (sortBy === 'city') {
      results = await db
        .select()
        .from(advocates)
        .where(whereConditions)
        .orderBy(sortOrder === 'desc' ? desc(advocates.city) : asc(advocates.city))
        .limit(limit)
        .offset(offset);
    } else if (sortBy === 'degree') {
      results = await db
        .select()
        .from(advocates)
        .where(whereConditions)
        .orderBy(sortOrder === 'desc' ? desc(advocates.degree) : asc(advocates.degree))
        .limit(limit)
        .offset(offset);
    } else if (sortBy === 'yearsOfExperience') {
      results = await db
        .select()
        .from(advocates)
        .where(whereConditions)
        .orderBy(sortOrder === 'desc' ? desc(advocates.yearsOfExperience) : asc(advocates.yearsOfExperience))
        .limit(limit)
        .offset(offset);
    } else if (sortBy === 'phoneNumber') {
      results = await db
        .select()
        .from(advocates)
        .where(whereConditions)
        .orderBy(sortOrder === 'desc' ? desc(advocates.phoneNumber) : asc(advocates.phoneNumber))
        .limit(limit)
        .offset(offset);
    } else {
      // Default sorting by firstName
      results = await db
        .select()
        .from(advocates)
        .where(whereConditions)
        .orderBy(asc(advocates.firstName))
        .limit(limit)
        .offset(offset);
    }
    
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
