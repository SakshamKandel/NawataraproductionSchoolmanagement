// Script to help check and fix student import issues
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Path to your input Excel files
const INPUT_FOLDER = './';

// Function to load and analyze Excel file
function analyzeExcelFile(filepath) {
  console.log(chalk.blue.bold(`\nAnalyzing file: ${filepath}`));
  
  try {
    // Read Excel file
    const workbook = XLSX.readFile(filepath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(chalk.green(`✓ Successfully loaded Excel file`));
    console.log(`Total rows: ${jsonData.length}`);
    
    // Check for empty file
    if (jsonData.length === 0) {
      console.log(chalk.red('✗ File is empty - no data rows found'));
      return;
    }
    
    // Check headers
    const headers = Object.keys(jsonData[0]);
    console.log(chalk.cyan('\nHeaders found:'));
    console.log(headers);
    
    // Check if required columns exist
    const requiredColumns = ['Student Name'];
    const expectedColumns = [
      'Student Name', 
      'Address', 
      "Father's Name",
      "Mother's Name", 
      "Father's Phone", 
      "Mother's Phone"
    ];
    
    const missingRequired = requiredColumns.filter(col => !headers.includes(col));
    const missingExpected = expectedColumns.filter(col => !headers.includes(col));
    
    if (missingRequired.length > 0) {
      console.log(chalk.red(`\n✗ CRITICAL: Missing required columns: ${missingRequired.join(', ')}`));
    } else {
      console.log(chalk.green('\n✓ All required columns present'));
    }
    
    if (missingExpected.length > 0) {
      console.log(chalk.yellow(`\n⚠ Warning: Missing recommended columns: ${missingExpected.join(', ')}`));
    }
    
    // Check column name spelling (common issues)
    const columnMapping = {
      'Student Name': ['student name', 'studentname', 'name', 'studentName'],
      'Address': ['address', 'addr', 'location'],
      "Father's Name": ['fathers name', 'father name', 'fathername', 'fatherName'],
      "Mother's Name": ['mothers name', 'mother name', 'mothername', 'motherName'],
      "Father's Phone": ['fathers phone', 'father phone', 'fatherphone', 'fatherPhone'],
      "Mother's Phone": ['mothers phone', 'mother phone', 'motherphone', 'motherPhone']
    };
    
    const potentialMismatches = [];
    for (const header of headers) {
      for (const [expected, variations] of Object.entries(columnMapping)) {
        if (header !== expected && variations.includes(header.toLowerCase())) {
          potentialMismatches.push({ found: header, shouldBe: expected });
        }
      }
    }
    
    if (potentialMismatches.length > 0) {
      console.log(chalk.yellow('\n⚠ Possible column name mismatches:'));
      potentialMismatches.forEach(mismatch => {
        console.log(`  - Found "${mismatch.found}" should be "${mismatch.shouldBe}"`);
      });
    }
    
    // Data validation
    console.log(chalk.cyan('\nData validation:'));
    
    // Check phone number format
    const phoneErrors = [];
    jsonData.forEach((row, index) => {
      const rowNum = index + 2; // Excel row number (accounting for header)
      
      const fatherPhone = row["Father's Phone"] !== undefined ? String(row["Father's Phone"]).trim() : '';
      const motherPhone = row["Mother's Phone"] !== undefined ? String(row["Mother's Phone"]).trim() : '';
      
      if (fatherPhone && !/^\d{10}$/.test(fatherPhone)) {
        phoneErrors.push(`Row ${rowNum}: Father's phone "${fatherPhone}" is not 10 digits`);
      }
      
      if (motherPhone && !/^\d{10}$/.test(motherPhone)) {
        phoneErrors.push(`Row ${rowNum}: Mother's phone "${motherPhone}" is not 10 digits`);
      }
    });
    
    if (phoneErrors.length > 0) {
      console.log(chalk.red(`✗ Found ${phoneErrors.length} phone number issues:`));
      phoneErrors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
      if (phoneErrors.length > 5) {
        console.log(`  ... and ${phoneErrors.length - 5} more errors`);
      }
    } else {
      console.log(chalk.green('✓ All phone numbers have correct format (or are empty)'));
    }
    
    // Empty required fields check
    const emptyFields = [];
    jsonData.forEach((row, index) => {
      const rowNum = index + 2;
      
      if (!row['Student Name'] || String(row['Student Name']).trim() === '') {
        emptyFields.push(`Row ${rowNum}: Missing Student Name`);
      }
    });
    
    if (emptyFields.length > 0) {
      console.log(chalk.red(`✗ Found ${emptyFields.length} rows with empty required fields:`));
      emptyFields.slice(0, 5).forEach(err => console.log(`  - ${err}`));
      if (emptyFields.length > 5) {
        console.log(`  ... and ${emptyFields.length - 5} more errors`);
      }
    } else {
      console.log(chalk.green('✓ No empty required fields'));
    }
    
    // Sample data
    console.log(chalk.cyan('\nSample data rows:'));
    jsonData.slice(0, 3).forEach((row, i) => {
      console.log(`Row ${i + 2}:`, row);
    });
    
    return {
      headers,
      rowCount: jsonData.length,
      potentialMismatches,
      phoneErrors,
      emptyFields
    };
  } catch (error) {
    console.log(chalk.red(`Error analyzing file: ${error.message}`));
    return null;
  }
}

// Create a fixed version with correct headers
function createFixedExcel(inputFile, outputFile, analysis) {
  if (!analysis || !analysis.potentialMismatches || analysis.potentialMismatches.length === 0) {
    console.log('No header fixes needed');
    return;
  }
  
  try {
    // Read the original file
    const workbook = XLSX.readFile(inputFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get the data
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Create a mapping of old headers to new headers
    const headerMapping = {};
    analysis.potentialMismatches.forEach(mismatch => {
      headerMapping[mismatch.found] = mismatch.shouldBe;
    });
    
    // Create new data with fixed headers
    const fixedData = jsonData.map(row => {
      const newRow = {};
      
      for (const oldHeader in row) {
        const newHeader = headerMapping[oldHeader] || oldHeader;
        newRow[newHeader] = row[oldHeader];
      }
      
      return newRow;
    });
    
    // Create a new workbook with the fixed data
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(fixedData);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Students');
    
    // Write to file
    XLSX.writeFile(newWorkbook, outputFile);
    
    console.log(chalk.green(`\n✓ Created fixed Excel file: ${outputFile}`));
    console.log(chalk.cyan('Header changes:'));
    analysis.potentialMismatches.forEach(mismatch => {
      console.log(`  - "${mismatch.found}" → "${mismatch.shouldBe}"`);
    });
    
  } catch (error) {
    console.log(chalk.red(`\nError creating fixed file: ${error.message}`));
  }
}

// Main function
function main() {
  console.log(chalk.blue.bold('========================================'));
  console.log(chalk.blue.bold('Student Import Excel File Analysis Tool'));
  console.log(chalk.blue.bold('========================================'));
  
  // Get all Excel files in the current directory
  const files = fs.readdirSync(INPUT_FOLDER)
    .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
    .filter(file => !file.includes('fixed_') && !file.includes('_template'));
  
  if (files.length === 0) {
    console.log(chalk.yellow('No Excel files found in the current directory'));
    return;
  }
  
  console.log(chalk.cyan(`Found ${files.length} Excel files to analyze:`));
  files.forEach(file => console.log(` - ${file}`));
  
  // Analyze each file
  files.forEach(file => {
    const filePath = path.join(INPUT_FOLDER, file);
    const analysis = analyzeExcelFile(filePath);
    
    // Create fixed file if needed
    if (analysis && analysis.potentialMismatches && analysis.potentialMismatches.length > 0) {
      const outputFile = path.join(INPUT_FOLDER, `fixed_${file}`);
      createFixedExcel(filePath, outputFile, analysis);
    }
  });
  
  console.log(chalk.blue.bold('\n========================================'));
  console.log(chalk.green.bold('Analysis complete!'));
  console.log(chalk.blue.bold('========================================'));
}

// Run the main function
main();
