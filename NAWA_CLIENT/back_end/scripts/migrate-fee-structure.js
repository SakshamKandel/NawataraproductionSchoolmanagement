import sequelize from '../config/database.js';
import ClassFee from '../models/ClassFee.js';

async function migrateFeeStructure() {
  try {
    console.log('Starting fee structure migration...');
    
    // Check current table structure
    const [columns] = await sequelize.query("DESCRIBE ClassFees");
    const columnNames = columns.map(col => col.Field);
    console.log('Current columns:', columnNames);
    
    // Add new columns if they don't exist
    if (!columnNames.includes('transportationFee')) {
      console.log('Adding transportationFee column...');
      await sequelize.query(
        "ALTER TABLE ClassFees ADD COLUMN transportationFee FLOAT NOT NULL DEFAULT 0"
      );
    }
    
    if (!columnNames.includes('examFee')) {
      console.log('Adding examFee column...');
      await sequelize.query(
        "ALTER TABLE ClassFees ADD COLUMN examFee FLOAT NOT NULL DEFAULT 0"
      );
    }
    
    // Handle computerFee migration
    if (columnNames.includes('computerFee')) {
      console.log('Migrating computerFee data to transportationFee...');
      // Copy data from computerFee to transportationFee
      await sequelize.query(
        "UPDATE ClassFees SET transportationFee = computerFee WHERE computerFee IS NOT NULL AND transportationFee = 0"
      );
      
      console.log('Removing computerFee column...');
      await sequelize.query(
        "ALTER TABLE ClassFees DROP COLUMN computerFee"
      );
    }
    
    // Remove admissionFee if it exists
    if (columnNames.includes('admissionFee')) {
      console.log('Removing admissionFee column...');
      await sequelize.query(
        "ALTER TABLE ClassFees DROP COLUMN admissionFee"
      );
    }
    
    // Check if there are any existing records
    const existingRecords = await ClassFee.count();
    
    if (existingRecords === 0) {
      console.log('No existing records found. Creating default fee structures...');
      
      const defaultFeeStructures = [
        { className: 'Nursery', monthlyFee: 2000, transportationFee: 500, examFee: 300 },
        { className: 'L.K.G.', monthlyFee: 2200, transportationFee: 500, examFee: 300 },
        { className: 'U.K.G.', monthlyFee: 2400, transportationFee: 500, examFee: 300 },
        { className: 'One', monthlyFee: 2600, transportationFee: 600, examFee: 400 },
        { className: 'Two', monthlyFee: 2800, transportationFee: 600, examFee: 400 },
        { className: 'Three', monthlyFee: 3000, transportationFee: 600, examFee: 400 },
        { className: 'Four', monthlyFee: 3200, transportationFee: 700, examFee: 500 },
        { className: 'Five', monthlyFee: 3400, transportationFee: 700, examFee: 500 },
        { className: 'Six', monthlyFee: 3600, transportationFee: 700, examFee: 500 }
      ];
      
      for (const feeStructure of defaultFeeStructures) {
        await ClassFee.create(feeStructure);
      }
      
      console.log('Default fee structures created successfully.');
    } else {
      console.log(`Found ${existingRecords} existing fee structure records.`);
    }
    
    // Verify final table structure
    const [finalColumns] = await sequelize.query("DESCRIBE ClassFees");
    
    console.log('Final table structure:');
    finalColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default !== null ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    console.log('Fee structure migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the migration
migrateFeeStructure().catch(console.error);