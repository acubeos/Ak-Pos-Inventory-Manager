import { useState } from 'react'

interface VersionInfo {
  electron: string
  chrome: string
  node: string
}

function Versions(): React.JSX.Element {
  const windowElectron = (window as Record<string, unknown>).electron as Record<string, unknown>
  const [versions] = useState<VersionInfo>(
    windowElectron?.process?.versions || {
      electron: '0',
      chrome: '0',
      node: '0'
    }
  )

  return (
    <ul className="versions">
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
    </ul>
  )
}

export default Versions
