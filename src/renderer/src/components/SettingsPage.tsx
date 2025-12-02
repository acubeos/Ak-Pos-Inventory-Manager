import { useState } from 'react'
import toast from 'react-hot-toast'

const SettingsPage = (): React.JSX.Element => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExportDatabase = async (): Promise<void> => {
    setIsExporting(true)
    try {
      const result = await window.electronAPI?.utils.exportDatabase()

      if (result?.success && !result.canceled) {
        toast.success(result.msg || 'Database exported successfully!')
      } else if (result?.canceled) {
        toast('Export canceled', { icon: 'ℹ️' })
      } else {
        toast.error(result?.error || 'Failed to export database')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('An error occurred while exporting the database')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportDatabase = async (): Promise<void> => {
    const confirmed = window.confirm(
      'WARNING: Importing a database will replace all current data. A backup of your current database will be created automatically. Do you want to continue?'
    )

    if (!confirmed) {
      return
    }

    setIsImporting(true)
    try {
      const result = await window.electronAPI?.utils.importDatabase()

      if (result?.success && !result.canceled) {
        toast.success(result.msg || 'Database imported successfully! The app will reload.')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else if (result?.canceled) {
        toast('Import canceled', { icon: 'ℹ️' })
      } else {
        toast.error(result?.error || 'Failed to import database')
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error('An error occurred while importing the database')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="h-screen w-screen pl-16">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Settings</h1>

        <div className="max-w-4xl">
          {/* Database Management Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Database Management</h2>
            <p className="text-gray-600 mb-6">
              Export your database to backup your data or transfer it to another computer. Import a
              database file to restore previously backed-up data.
            </p>

            <div className="space-y-4">
              {/* Export Database */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Export Database</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Create a backup file of your entire database including products, customers, sales,
                  and payment history. You can use this file to restore your data on this or another
                  computer.
                </p>
                <button
                  onClick={handleExportDatabase}
                  disabled={isExporting}
                  className={`btn btn-primary ${isExporting ? 'loading' : ''}`}
                >
                  {isExporting ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Export Database
                    </>
                  )}
                </button>
              </div>

              {/* Import Database */}
              <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Import Database</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Replace the current database with a previously exported backup file. This will
                  restore all data from the backup.
                </p>
                <div className="alert alert-warning shadow-sm mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="text-sm">
                    <strong>Warning:</strong> This will replace all current data. A backup will be
                    created automatically before importing.
                  </span>
                </div>
                <button
                  onClick={handleImportDatabase}
                  disabled={isImporting}
                  className={`btn btn-warning ${isImporting ? 'loading' : ''}`}
                >
                  {isImporting ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Importing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Import Database
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold mb-3 text-blue-900">
              How to Transfer Data to Another Computer
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                On the current computer, click <strong>&quot;Export Database&quot;</strong> to save
                your database file.
              </li>
              <li>
                Transfer the exported .db file to the new computer (via USB drive, cloud storage,
                email, etc.).
              </li>
              <li>On the new computer, install and open the application, then go to Settings.</li>
              <li>
                Click <strong>&quot;Import Database&quot;</strong> and select the transferred .db
                file.
              </li>
              <li>All your data will be restored on the new computer!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
