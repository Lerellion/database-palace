"use server"

import { db } from "@/lib/services/database"
import { sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function createRecordAction(tableName: string, data: Record<string, any>) {
  try {
    const columns = Object.keys(data).join(", ")
    const values = Object.values(data)
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ")

    const [result] = await db.execute(
      sql`
        INSERT INTO ${sql.identifier(tableName)} (${sql.raw(columns)})
        VALUES (${sql.raw(placeholders)})
        RETURNING *
      `.append(sql`[${sql.join(values, sql`, `)}]`)
    )

    revalidatePath("/")
    return { success: true, data: result }
  } catch (error) {
    console.error(`Error in createRecordAction for ${tableName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function readRecordsAction(tableName: string, filters: Record<string, any> = {}) {
  try {
    let baseQuery = sql`SELECT * FROM ${sql.identifier(tableName)}`
    const values = Object.values(filters)

    if (values.length > 0) {
      const whereClauses = Object.keys(filters).map((key, index) => 
        sql`${sql.identifier(key)} = $${index + 1}`
      )
      baseQuery = sql`${baseQuery} WHERE ${sql.join(whereClauses, sql` AND `)}`.append(sql`[${sql.join(values, sql`, `)}]`)
    }

    const records = await db.execute(baseQuery)
    return { success: true, data: records }
  } catch (error) {
    console.error(`Error in readRecordsAction for ${tableName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function readRecordByIdAction(tableName: string, id: number | string) {
  try {
    const [record] = await db.execute(
      sql`SELECT * FROM ${sql.identifier(tableName)} WHERE id = ${id}`
    )
    return { success: true, data: record }
  } catch (error) {
    console.error(`Error in readRecordByIdAction for ${tableName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateRecordAction(tableName: string, id: number | string, data: Record<string, any>) {
  try {
    const entries = Object.entries(data)
    const values = Object.values(data)
    
    const setClauses = entries.map(([key], index) => 
      sql`${sql.identifier(key)} = $${index + 1}`
    )
    
    const [result] = await db.execute(
      sql`
        UPDATE ${sql.identifier(tableName)}
        SET ${sql.join(setClauses, sql`, `)}
        WHERE id = ${id}
        RETURNING *
      `.append(sql`[${sql.join(values, sql`, `)}]`)
    )

    revalidatePath("/")
    return { success: true, data: result }
  } catch (error) {
    console.error(`Error in updateRecordAction for ${tableName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteRecordAction(tableName: string, id: number | string) {
  try {
    await db.execute(
      sql`DELETE FROM ${sql.identifier(tableName)} WHERE id = ${id}`
    )
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error(`Error in deleteRecordAction for ${tableName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
