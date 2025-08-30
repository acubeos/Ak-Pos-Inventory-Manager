import React from 'react'

interface ConfirmDialogProps {
  id: string // unique id for the dialog
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  id,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm
}) => {
  const closeDialog = (): void => {
    const dialog = document.getElementById(id) as HTMLDialogElement
    dialog?.close()
  }

  const handleConfirm = (): void => {
    onConfirm()
    closeDialog()
  }

  return (
    <dialog id={id} className="modal">
      <div className="modal-box text-center">
        <h3 className="font-bold text-lg pb-4">{title}</h3>
        <p>{message}</p>
        <div className="mt-4 flex justify-center gap-4">
          <button className="btn btn-error" onClick={handleConfirm}>
            {confirmText}
          </button>
          <button className="btn btn-outline btn-accent" onClick={closeDialog}>
            {cancelText}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
