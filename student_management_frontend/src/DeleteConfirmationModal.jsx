import React from "react";

/**
 * PUBLIC_INTERFACE
 * DeleteConfirmationModal - Modal dialog to confirm deletion of a student.
 *
 * Props:
 *   open (bool): Whether the modal is visible.
 *   onCancel (func): Called when user cancels or closes the modal.
 *   onConfirm (func): Called when user confirms deletion.
 *   studentName (string): Name of the student to display in the prompt.
 */
function DeleteConfirmationModal({ open, onCancel, onConfirm, studentName }) {
  if (!open) return null;

  // Modal background and window; style minimal/modern
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{ ...styles.title, marginBottom: 13 }}>Confirm Delete</h3>
        <div style={{ fontSize: 16, marginBottom: 25, color: "#222" }}>
          Are you sure you want to <b>delete</b> student{' '}
          <span style={{ color: "#b80000", fontWeight: 600 }}>
            {studentName ? `"${studentName}"` : "this student"}
          </span>
          ?<br />
          This action cannot be undone.
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            type="button"
            style={styles.cancelBtn}
            onClick={onCancel}
            aria-label="Cancel delete"
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            style={styles.deleteBtn}
            onClick={onConfirm}
            aria-label="Confirm delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(22,28,35,0.23)", zIndex: 1003, display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  modal: {
    background: "#fff", borderRadius: 14, maxWidth: 330, minWidth: 295,
    boxShadow: "0 8px 58px rgba(33,40,60,0.23)", padding: "26px 20px 19px 20px",
    border: "1.5px solid #e3e8ee", fontFamily: "Segoe UI, Arial, sans-serif"
  },
  title: {
    color: "#b80000", fontWeight: 700, fontSize: "1.17rem",
    letterSpacing: "0.01em"
  },
  cancelBtn: {
    background: "#f7f9fb", color: "#444", border: "1px solid #c1c7ce",
    borderRadius: 7, padding: "8px 20px", fontWeight: 600, fontSize: 15,
    minWidth: 74, cursor: "pointer"
  },
  deleteBtn: {
    background: "#b80000", color: "#fff", border: "none",
    borderRadius: 7, padding: "8px 23px", fontWeight: 700, fontSize: 15,
    minWidth: 80, cursor: "pointer", boxShadow: "0 1.5px 4px rgba(184,0,0,0.07)"
  }
};

export default DeleteConfirmationModal;
