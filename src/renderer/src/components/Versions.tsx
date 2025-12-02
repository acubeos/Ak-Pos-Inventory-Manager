import { useState } from 'react'

interface VersionInfo {
  electron: string
  chrome: string
  node: string
}

function Versions(): React.JSX.Element {
  const getVersions = (): VersionInfo => {
    try {
      const windowObj = window as unknown as Record<string, unknown>
      const electronObj = windowObj.electron as Record<string, unknown>
      const processObj = electronObj?.process as Record<string, unknown>
      const versionsObj = processObj?.versions as VersionInfo
      return versionsObj || { electron: '0', chrome: '0', node: '0' }
    } catch {
      return { electron: '0', chrome: '0', node: '0' }
    }
  }

  const [versions] = useState<VersionInfo>(getVersions())

  return (
    <ul className="versions">
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
    </ul>
  )
}

export default Versions
