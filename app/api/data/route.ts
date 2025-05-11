import { NextResponse } from 'next/server';
import { db } from '@/lib/services/database';
import { sql } from 'drizzle-orm';

// Validate table name against SQL injection and invalid characters
function isValidTableName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

// Validate column name against SQL injection and invalid characters
function isValidColumnName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

// Type validation for column values
function validateValue(value: any, type: string): { valid: boolean; value: any } {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }

  try {
    switch (type.toLowerCase()) {
      case 'integer':
      case 'bigint':
        const num = Number(value);
        return { valid: !isNaN(num) && Number.isInteger(num), value: num };
      case 'numeric':
      case 'decimal':
      case 'real':
      case 'double precision':
        const float = Number(value);
        return { valid: !isNaN(float), value: float };
      case 'boolean':
        return { valid: true, value: Boolean(value) };
      case 'date':
        const date = new Date(value);
        return { valid: !isNaN(date.getTime()), value: value };
      case 'timestamp':
      case 'timestamp without time zone':
        const timestamp = new Date(value);
        return { valid: !isNaN(timestamp.getTime()), value: value };
      default:
        return { valid: true, value: String(value) };
    }
  } catch {
    return { valid: false, value: null };
  }
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  isNotNull: boolean;
  isIdentity: boolean;
  isPrimaryKey: boolean;
  isSerial: boolean;
  column_default: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');

    if (!tableName || !isValidTableName(tableName)) {
      return NextResponse.json(
        { error: 'Invalid table name' },
        { status: 400 }
      );
    }

    // Get column information with added type information
    const columnsQuery = await db.execute(sql`
      SELECT 
        column_name as name,
        data_type as type,
        is_nullable = 'NO' as "isNotNull",
        column_default as "defaultValue",
        character_maximum_length as "maxLength",
        numeric_precision as "precision",
        numeric_scale as "scale",
        column_name = ANY(
          SELECT column_name 
          FROM information_schema.key_column_usage 
          WHERE table_name = ${tableName} 
          AND constraint_name = (
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = ${tableName} 
            AND constraint_type = 'PRIMARY KEY'
          )
        ) as "isPrimaryKey"
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position;
    `);

    // Get table data with pagination and sorting
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 100;
    const offset = (page - 1) * limit;
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder')?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const rowsQuery = await db.execute(
      sortBy && isValidColumnName(sortBy)
        ? sql`
          SELECT * FROM ${sql.identifier(tableName)}
          ORDER BY ${sql.identifier(sortBy)} ${sql.raw(sortOrder)}
          LIMIT ${limit} OFFSET ${offset};
        `
        : sql`
          SELECT * FROM ${sql.identifier(tableName)}
          LIMIT ${limit} OFFSET ${offset};
        `
    );

    // Format the response
    const columns = (columnsQuery as any[]).map(col => ({
      name: col.name,
      type: col.type,
      isNotNull: col.isNotNull,
      isPrimaryKey: col.isPrimaryKey,
      defaultValue: col.defaultValue,
      maxLength: col.maxLength,
      precision: col.precision,
      scale: col.scale
    }));

    const rows = (rowsQuery as any[]);

    return NextResponse.json({
      columns,
      rows,
      pagination: {
        page,
        limit,
        total: rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching table data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');

    if (!tableName || !isValidTableName(tableName)) {
      return NextResponse.json(
        { error: 'Invalid table name' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { data } = body;

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }

    // Get column information including identity/serial columns
    const columnsResult = await db.execute(sql`
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable = 'NO' as "isNotNull",
        c.column_default,
        c.is_identity = 'YES' as "isIdentity",
        c.column_name = ANY(
          SELECT column_name 
          FROM information_schema.key_column_usage 
          WHERE table_name = ${tableName} 
          AND constraint_name = (
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = ${tableName} 
            AND constraint_type = 'PRIMARY KEY'
          )
        ) as "isPrimaryKey",
        CASE 
          WHEN c.column_default LIKE 'nextval%' THEN true 
          ELSE false 
        END as "isSerial"
      FROM information_schema.columns c
      WHERE c.table_name = ${tableName}
        AND c.table_schema = 'public'
      ORDER BY c.ordinal_position;
    `);
    
    const columns = (columnsResult as any[]).map(col => ({
      column_name: col.column_name,
      data_type: col.data_type,
      isNotNull: col.isNotNull,
      isIdentity: col.isIdentity,
      isPrimaryKey: col.isPrimaryKey,
      isSerial: col.isSerial,
      column_default: col.column_default
    })) as ColumnInfo[];

    // Validate data
    const validatedData: Record<string, any> = {};
    const errors: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (!isValidColumnName(key)) {
        errors.push(`Invalid column name: ${key}`);
        continue;
      }

      const column = columns.find(col => col.column_name === key);
      if (!column) {
        errors.push(`Column does not exist: ${key}`);
        continue;
      }

      // Allow primary key if it's not an identity/serial column or if a value is explicitly provided
      if (column.isPrimaryKey && (column.isIdentity || column.isSerial) && value === null) {
        continue; // Skip auto-incrementing primary keys when null
      }

      const { valid, value: validatedValue } = validateValue(value, column.data_type);
      if (!valid) {
        errors.push(`Invalid value for column ${key}: ${value}`);
        continue;
      }

      if (column.isNotNull && validatedValue === null && !column.column_default) {
        errors.push(`Column ${key} cannot be null`);
        continue;
      }

      validatedData[key] = validatedValue;
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Build and execute the INSERT query
    const insertColumns = Object.keys(validatedData);
    const insertValues = Object.values(validatedData);
    
    if (insertColumns.length === 0) {
      return NextResponse.json(
        { error: 'No valid columns to insert' },
        { status: 400 }
      );
    }

    // Create the parameterized query
    const placeholders = insertValues.map((_, i) => sql`${sql.param(insertValues[i])}`);
    const columnsSql = sql.join(insertColumns.map(c => sql.identifier(c)), sql`, `);
    const valuesSql = sql.join(placeholders, sql`, `);

    const query = sql`
      INSERT INTO ${sql.identifier(tableName)} (${columnsSql})
      VALUES (${valuesSql})
      RETURNING *;
    `;

    // Log the query for debugging
    console.log('Executing INSERT query for table:', tableName);
    console.log('With columns:', insertColumns);
    console.log('With values:', insertValues);

    const result = await db.execute(query);
    
    if (!result?.[0]) {
      throw new Error('Insert succeeded but returned no data');
    }

    return NextResponse.json({
      message: 'Record created successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create record',
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');

    if (!tableName || !isValidTableName(tableName)) {
      return NextResponse.json(
        { error: 'Invalid table name' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { data, where } = body;

    if (!data || typeof data !== 'object' || Array.isArray(data) || 
        !where || typeof where !== 'object' || Array.isArray(where)) {
      return NextResponse.json(
        { error: 'Invalid data or where clause provided' },
        { status: 400 }
      );
    }

    // Get column information for validation
    const columnsResult = await db.execute(sql`
      SELECT column_name, data_type, is_nullable = 'NO' as "isNotNull"
      FROM information_schema.columns 
      WHERE table_name = ${tableName};
    `);
    
    const columns = (columnsResult as any[]).map(col => ({
      column_name: col.column_name,
      data_type: col.data_type,
      isNotNull: col.isNotNull
    })) as ColumnInfo[];
    
    // Validate data and where clause
    const validatedData: Record<string, any> = {};
    const validatedWhere: Record<string, any> = {};
    const errors: string[] = [];

    // Validate update data
    for (const [key, value] of Object.entries(data)) {
      if (!isValidColumnName(key)) {
        errors.push(`Invalid column name: ${key}`);
        continue;
      }

      const column = columns.find(col => col.column_name === key);
      if (!column) {
        errors.push(`Column does not exist: ${key}`);
        continue;
      }

      const { valid, value: validatedValue } = validateValue(value, column.data_type);
      if (!valid) {
        errors.push(`Invalid value for column ${key}: ${value}`);
        continue;
      }

      if (column.isNotNull && validatedValue === null) {
        errors.push(`Column ${key} cannot be null`);
        continue;
      }

      validatedData[key] = validatedValue;
    }

    // Validate where clause
    for (const [key, value] of Object.entries(where)) {
      if (!isValidColumnName(key)) {
        errors.push(`Invalid column name in where clause: ${key}`);
        continue;
      }

      const column = columns.find(col => col.column_name === key);
      if (!column) {
        errors.push(`Column does not exist: ${key}`);
        continue;
      }

      const { valid, value: validatedValue } = validateValue(value, column.data_type);
      if (!valid) {
        errors.push(`Invalid value in where clause for column ${key}: ${value}`);
        continue;
      }

      validatedWhere[key] = validatedValue;
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Build the UPDATE query
    const setColumns = Object.entries(validatedData).map(([key, value]) => 
      sql`${sql.identifier(key)} = ${sql.param(value)}`
    );
    
    const whereColumns = Object.entries(validatedWhere).map(([key, value]) => 
      sql`${sql.identifier(key)} = ${sql.param(value)}`
    );

    const query = sql`
      UPDATE ${sql.identifier(tableName)}
      SET ${sql.join(setColumns, sql`, `)}
      WHERE ${sql.join(whereColumns, sql` AND `)}
      RETURNING *;
    `;

    const result = await db.execute(query);

    if (!result.length) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Record updated successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update record',
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');
    const id = searchParams.get('id');

    if (!tableName || !isValidTableName(tableName)) {
      return NextResponse.json(
        { error: 'Invalid table name' },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Validate ID format (assuming it's a number, adjust if using UUIDs)
    const validatedId = Number(id);
    if (isNaN(validatedId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const result = await db.execute(sql`
      DELETE FROM ${sql.identifier(tableName)}
      WHERE id = ${sql.param(validatedId)}
      RETURNING *;
    `);

    if (!result.length) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Record deleted successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete record',
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 