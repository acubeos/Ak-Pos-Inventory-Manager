# Database Export/Import Feature

This application now supports exporting and importing the SQLite database, allowing you to backup your data and transfer it between computers.

## Features

### Export Database
- **Location**: Settings page (click the gear icon in the sidebar)
- **Function**: Creates a backup copy of your entire database
- **Includes**: All products, customers, sales, payment history, and other data
- **File Format**: SQLite database file (.db)
- **Usage**: 
  1. Navigate to Settings
  2. Click "Export Database"
  3. Choose where to save the file
  4. The database will be copied to your selected location

### Import Database
- **Location**: Settings page (click the gear icon in the sidebar)
- **Function**: Restores data from a previously exported database file
- **Safety**: Automatically creates a backup of your current database before importing
- **Warning**: This operation replaces ALL current data
- **Usage**:
  1. Navigate to Settings
  2. Click "Import Database"
  3. Confirm the warning dialog
  4. Select the database file to import
  5. The app will reload with the imported data

## Transferring Data to a New Computer

Follow these steps to move your data to another computer:

1. **On the source computer:**
   - Open the application
   - Go to Settings (gear icon in sidebar)
   - Click "Export Database"
   - Save the database file to a location you can transfer (USB drive, cloud storage, email, etc.)

2. **Transfer the file:**
   - Copy the .db file to the new computer using your preferred method

3. **On the new computer:**
   - Install and open the application
   - Go to Settings
   - Click "Import Database"
   - Select the transferred .db file
   - Wait for the import to complete
   - The app will reload with all your data

## Technical Details

### API Methods

The following API methods have been added to `window.electronAPI.utils`:

```typescript
// Export database to user-selected location
window.electronAPI.utils.exportDatabase(): Promise<{
  success: boolean
  data?: string  // File path where database was exported
  msg: string
  canceled?: boolean
}>

// Import database from user-selected file
window.electronAPI.utils.importDatabase(): Promise<{
  success: boolean
  data?: string  // Source file path
  msg: string
  canceled?: boolean
}>
```

### File Location

The database file is stored at:
- **Windows**: `%APPDATA%/[app-name]/inventory.db`
- **macOS**: `~/Library/Application Support/[app-name]/inventory.db`
- **Linux**: `~/.config/[app-name]/inventory.db`

### Backup Files

When importing a database, the current database is automatically backed up to:
`inventory-before-import-[timestamp].db` in the same directory as the main database file.

## Quick Access

A quick access banner has been added to the Dashboard home page that links directly to the Settings page for easy access to backup/restore features.

## Notes

- Database files are portable across operating systems
- The import process automatically reinitializes the database connection
- All data validation and migrations are run on the imported database
- Toast notifications provide feedback on success/failure of operations
