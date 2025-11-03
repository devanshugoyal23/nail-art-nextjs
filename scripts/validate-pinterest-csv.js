#!/usr/bin/env node

/**
 * Pinterest CSV Validator
 * Validates CSV files against Pinterest bulk upload requirements
 */

const fs = require('fs');
const path = require('path');

function validatePinterestCSV(filePath) {
  console.log(`🔍 Validating Pinterest CSV: ${path.basename(filePath)}\n`);

  // Read file
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    console.error('❌ CSV must have at least a header row and one data row');
    process.exit(1);
  }

  // Parse header
  const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  // Required columns
  const requiredColumns = ['Title', 'Media URL', 'Pinterest board'];
  const optionalColumns = ['Description', 'Link', 'Publish date', 'Keywords'];
  
  console.log('📋 Header Analysis:');
  const foundRequired = requiredColumns.filter(col => header.includes(col));
  const foundOptional = optionalColumns.filter(col => header.includes(col));
  
  console.log(`Required columns found: [${foundRequired.map(c => ` '${c}'`)} ]`);
  console.log(`Optional columns found: [${foundOptional.map(c => ` '${c}'`)} ]`);
  
  if (foundRequired.length !== requiredColumns.length) {
    const missing = requiredColumns.filter(col => !header.includes(col));
    console.error(`❌ Missing required columns: ${missing.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ All required columns present\n');

  // Validate data rows
  let validRows = 0;
  let invalidRows = 0;
  const issues = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Simple CSV parsing (handles quoted fields)
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.replace(/^"|"$/g, ''));

    // Validate field count
    if (fields.length !== header.length) {
      issues.push(`Row ${i}: Expected ${header.length} fields, got ${fields.length}`);
      invalidRows++;
      continue;
    }

    // Validate title (max 100 chars)
    const titleIdx = header.indexOf('Title');
    if (titleIdx >= 0) {
      const title = fields[titleIdx];
      if (title.length > 100) {
        issues.push(`Row ${i}: Title exceeds 100 characters (${title.length})`);
        invalidRows++;
        continue;
      }
      if (!title.trim()) {
        issues.push(`Row ${i}: Title is empty`);
        invalidRows++;
        continue;
      }
    }

    // Validate Media URL
    const mediaIdx = header.indexOf('Media URL');
    if (mediaIdx >= 0) {
      const url = fields[mediaIdx];
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        issues.push(`Row ${i}: Invalid Media URL format`);
        invalidRows++;
        continue;
      }
    }

    // Validate description (max 500 chars if present)
    const descIdx = header.indexOf('Description');
    if (descIdx >= 0 && fields[descIdx]) {
      const desc = fields[descIdx];
      if (desc.length > 500) {
        issues.push(`Row ${i}: Description exceeds 500 characters (${desc.length})`);
        invalidRows++;
        continue;
      }
    }

    validRows++;
  }

  // Report results
  console.log('📊 Validation Results:');
  console.log(`✅ Valid rows: ${validRows}`);
  console.log(`❌ Rows with issues: ${invalidRows}`);

  if (issues.length > 0) {
    console.log('\n⚠️  Issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    process.exit(1);
  } else {
    console.log('\n🎉 All rows are valid! Ready for Pinterest upload.');
  }
}

// Main
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node validate-pinterest-csv.js <csv-file>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

validatePinterestCSV(filePath);


