import { DialogContext } from 'src/modals'

/**
 * Ensure a file handle has the required permissions
 * Checks current permissions and requests if needed
 * This function MUST be called from a user interaction (onClick handler)
 */
export async function ensurePermission(
  handle: FileSystemFileHandle,
  mode: FileSystemPermissionMode = 'read',
  dialogCtx: DialogContext,
): Promise<boolean> {
  const queryResult = await handle.queryPermission({ mode })
  if (queryResult !== 'prompt') {
    return queryResult === 'granted'
  }

  const requestResult = await handle.requestPermission({ mode }).catch(err => {
    console.error(err)
    return 'prompt'
  })
  if (requestResult !== 'prompt') {
    return requestResult === 'granted'
  }

  return await new Promise(resolve => {
    dialogCtx.showPermissionRequest(
      handle.name,
      async () => {
        const result = await handle.requestPermission({ mode })
        resolve(result === 'granted')
      },
      () => resolve(false),
    )
  })
}
