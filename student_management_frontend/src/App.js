import React, { useEffect, useState } from "react";
import "./App.css";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

// Helper: API endpoint; adjust if needed for deployment
const API_BASE = "http://localhost:3001";

// Theme palette
const COLOR_PRIMARY = "#1976d2";
const COLOR_SECONDARY = "#424242";
const COLOR_ACCENT = "#ffc107";

/**
 * PUBLIC_INTERFACE
 * Student Management App (UI for CRUD, sort, filter, feedback)
 */
function App() {
  // Student record structure: { id, name, student_class, marks }
  const emptyForm = { id: "", name: "", student_class: "", marks: "" };
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Modal: track student to delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Sorting and filtering
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterClass, setFilterClass] = useState("");
  const [filterMinMarks, setFilterMinMarks] = useState("");
  const [filterMaxMarks, setFilterMaxMarks] = useState("");

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Fetch students list
  const fetchStudents = async () => {
    setLoading(true);
    let params = [];
    if (sortBy) params.push(`sort_by=${sortBy}`);
    if (sortOrder) params.push(`order=${sortOrder}`);
    if (filterClass) params.push(`class=${encodeURIComponent(filterClass)}`);
    if (filterMinMarks) params.push(`min_marks=${filterMinMarks}`);
    if (filterMaxMarks) params.push(`max_marks=${filterMaxMarks}`);
    const url = `${API_BASE}/students${params.length ? "?" + params.join("&") : ""}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data || []);
    } catch (e) {
      setFeedback({ type: "error", message: "Error fetching students" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [sortBy, sortOrder, filterClass, filterMinMarks, filterMaxMarks]);

  // PUBLIC_INTERFACE
  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prevErrs) => ({ ...prevErrs, [name]: undefined }));
  };

  // Validate form fields
  function validateForm({ name, student_class, marks }) {
    let errs = {};
    if (!name || !name.trim()) errs.name = "Name is required";
    if (!student_class || !student_class.trim()) errs.student_class = "Class is required";
    if (marks === undefined || marks === "") errs.marks = "Marks required";
    else if (!/^\d+$/.test(marks)) errs.marks = "Marks must be a number";
    else if (+marks < 0 || +marks > 100) errs.marks = "Marks must be 0-100";
    return errs;
  }

  // PUBLIC_INTERFACE
  // Form submit handler (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setFeedback({ type: "", message: "" });
    // If editId set, do PUT, else do POST
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API_BASE}/students/${editId}` : `${API_BASE}/students`;
    const payload = {
      name: form.name.trim(),
      student_class: form.student_class.trim(),
      marks: parseInt(form.marks, 10),
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to save student");
      }
      setFeedback({
        type: "success",
        message: `Student ${editId ? "updated" : "added"} successfully!`,
      });
      setForm(emptyForm);
      setEditId(null);
      fetchStudents();
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  // Start editing a student
  const handleEditClick = (student) => {
    setEditId(student.id);
    setForm({
      id: student.id,
      name: student.name,
      student_class: student.student_class,
      marks: student.marks.toString(),
    });
    setFeedback({ type: "", message: "" });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // PUBLIC_INTERFACE
  // Cancel edit mode
  const handleEditCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setErrors({});
  };

  // PUBLIC_INTERFACE
  // Trigger delete: show modal
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
    setFeedback({ type: "", message: "" });
  };

  // Handle actual confirm (after modal confirmed)
  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setLoading(true);
    setDeleteModalOpen(false);
    setFeedback({ type: "", message: "" });
    try {
      const res = await fetch(`${API_BASE}/students/${studentToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.message || "Failed to delete student");
      setFeedback({ type: "success", message: `Student deleted.` });
      fetchStudents();
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setStudentToDelete(null);
      setLoading(false);
    }
  };

  // Handle modal close/cancel
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setStudentToDelete(null);
  };

  // Unique class values for filter dropdown
  const classOptions = Array.from(
    new Set(students.map((s) => s.student_class).filter(Boolean))
  );

  // Main render
  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "Segoe UI, Arial, sans-serif" }}>
      <header
        style={{
          background: COLOR_PRIMARY,
          color: "#fff",
          padding: "32px 20px 16px",
          boxShadow: "0px 4px 10px rgba(25, 118, 210, 0.09)",
          textAlign: "center",
          marginBottom: 0,
        }}
      >
        <h1 style={{ letterSpacing: "1px", margin: 0, fontWeight: 700, fontSize: "2.1rem" }}>
          Student Management System
        </h1>
        <div style={{ marginTop: 8, fontSize: 16, opacity: 0.95 }}>Minimal, modern interface</div>
      </header>
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 16px" }}>
        {/* Feedback messages */}
        {feedback.message && (
          <div
            aria-live="polite"
            role="alert"
            style={{
              background: feedback.type === "success" ? COLOR_ACCENT : "#ffd6d6",
              color: feedback.type === "success" ? COLOR_SECONDARY : "#a30000",
              border: `1px solid ${feedback.type === "success" ? "#fff2c0" : "#ffaeb5"}`,
              borderRadius: 8,
              margin: "0 0 22px 0",
              padding: "10px 18px",
              fontWeight: 500,
              fontSize: 17,
              display: "inline-block",
              minWidth: 240,
              boxShadow: "0 4px 12px rgba(33,40,60,0.04)"
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Add/Edit Student Form */}
        <section
          style={{
            background: "#f7f9fb",
            border: `1px solid #e3e8ee`,
            borderRadius: 10,
            padding: 28,
            boxShadow: "0 2px 6px rgba(33,40,60,0.03)",
            marginBottom: 34,
          }}
        >
          <h2 style={{ margin: 0, color: COLOR_PRIMARY, fontWeight: 500, fontSize: "1.33rem" }}>
            {editId ? "Edit Student" : "Add Student"}
          </h2>
          <form
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: 16,
              marginTop: 14,
            }}
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {/* Name */}
            <div style={{ flex: "1 1 200px", minWidth: 170 }}>
              <label htmlFor="name" style={{ fontWeight: 500, color: "#222", fontSize: 15 }}>
                Name
              </label>
              <input
                name="name"
                id="name"
                className="input"
                style={fieldErrStyle(errors.name)}
                type="text"
                tabIndex={1}
                autoFocus
                placeholder="Student name"
                value={form.name}
                maxLength={100}
                onChange={handleInputChange}
              />
              {errors?.name && <ErrorMsg text={errors.name} />}
            </div>
            {/* Class */}
            <div style={{ flex: "0 1 120px", minWidth: 100 }}>
              <label htmlFor="student_class" style={{ fontWeight: 500, color: "#222", fontSize: 15 }}>
                Class
              </label>
              <input
                name="student_class"
                id="student_class"
                className="input"
                style={fieldErrStyle(errors.student_class)}
                type="text"
                maxLength={20}
                placeholder="e.g. 10A"
                tabIndex={2}
                value={form.student_class}
                onChange={handleInputChange}
              />
              {errors?.student_class && <ErrorMsg text={errors.student_class} />}
            </div>
            {/* Marks */}
            <div style={{ flex: "0 1 90px", minWidth: 80 }}>
              <label htmlFor="marks" style={{ fontWeight: 500, color: "#222", fontSize: 15 }}>
                Marks
              </label>
              <input
                name="marks"
                id="marks"
                className="input"
                style={fieldErrStyle(errors.marks)}
                type="number"
                min={0}
                max={100}
                tabIndex={3}
                placeholder="0-100"
                value={form.marks}
                onChange={handleInputChange}
              />
              {errors?.marks && <ErrorMsg text={errors.marks} />}
            </div>
            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "row", gap: 8, marginTop: 0 }}>
              <button
                type="submit"
                style={{
                  background: COLOR_PRIMARY,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 26px",
                  fontWeight: 600,
                  fontSize: 16,
                  letterSpacing: "0.5px",
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                tabIndex={4}
                disabled={loading}
              >
                {editId ? "Update" : "Add"}
              </button>
              {editId && (
                <button
                  type="button"
                  style={{
                    background: "#f2f2f2",
                    color: COLOR_SECONDARY,
                    border: `1px solid #ccc`,
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    marginLeft: 4,
                    padding: "10px 16px",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                  onClick={handleEditCancel}
                  tabIndex={5}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Sorting & Filtering Controls */}
        <section
          style={{
            marginBottom: 12,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 15,
            color: "#262b2e",
            fontSize: 15,
          }}
        >
          {/* Sort by */}
          <div>
            <label style={{ marginRight: 7 }}>
              Sort by:
              <select
                aria-label="sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  marginLeft: 8,
                  padding: "2px 9px",
                  border: "1px solid #d4d7da",
                  borderRadius: 5,
                  color: COLOR_PRIMARY,
                  background: "#fff",
                  fontWeight: 500,
                }}
              >
                <option value="name">Name</option>
                <option value="class">Class</option>
                <option value="marks">Marks</option>
              </select>
            </label>
            <button
              type="button"
              style={{
                marginLeft: 4,
                background: "none",
                border: "none",
                color: COLOR_PRIMARY,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 15,
              }}
              aria-label="Toggle sort order"
              title={`Sort order: ${sortOrder}`}
              onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
          {/* Filter: Class */}
          <div>
            <label style={{ marginRight: 3 }}>
              Filter by class:
              <select
                aria-label="filter class"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                style={{
                  marginLeft: 7,
                  padding: "2px 9px",
                  border: "1px solid #d4d7da",
                  borderRadius: 5,
                  color: COLOR_SECONDARY,
                  background: "#fff",
                  fontWeight: 500,
                  minWidth: 65,
                }}
              >
                <option value="">All</option>
                {classOptions.map((v) => (
                  <option value={v} key={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {/* Filter: Marks */}
          <div>
            <label style={{ marginRight: 3 }}>
              Marks:
              <input
                type="number"
                placeholder="min"
                min={0}
                max={100}
                value={filterMinMarks}
                style={{
                  width: 55,
                  fontSize: 15,
                  padding: "2px 4px",
                  marginLeft: 7,
                  marginRight: 3,
                  border: "1px solid #d4d7da",
                  borderRadius: 5,
                  color: COLOR_SECONDARY,
                }}
                onChange={(e) => setFilterMinMarks(e.target.value.replace(/\D/, ""))}
              />
              –
              <input
                type="number"
                placeholder="max"
                min={0}
                max={100}
                value={filterMaxMarks}
                style={{
                  width: 55,
                  fontSize: 15,
                  padding: "2px 4px",
                  marginLeft: 5,
                  border: "1px solid #d4d7da",
                  borderRadius: 5,
                  color: COLOR_SECONDARY,
                }}
                onChange={(e) => setFilterMaxMarks(e.target.value.replace(/\D/, ""))}
              />
            </label>
            <button
              type="button"
              style={{
                marginLeft: 7,
                color: "#fff",
                background: COLOR_ACCENT,
                border: "none",
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 600,
                padding: "6px 15px",
                cursor: "pointer",
              }}
              aria-label="Apply filter"
              onClick={() => fetchStudents()}
            >
              Apply
            </button>
          </div>
          {(!!filterClass || !!filterMinMarks || !!filterMaxMarks) && (
            <button
              type="button"
              aria-label="Clear all filters"
              style={{
                background: "#e3e8ee",
                color: COLOR_SECONDARY,
                border: "none",
                borderRadius: 5,
                marginLeft: 7,
                fontSize: 14,
                padding: "5px 14px",
                fontWeight: 600,
              }}
              onClick={() => {
                setFilterClass("");
                setFilterMinMarks("");
                setFilterMaxMarks("");
              }}
            >
              Clear Filters
            </button>
          )}
        </section>

        {/* Student Table */}
        <section style={{ marginTop: 13 }}>
          <TableSection
            students={students}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </section>
      </main>
      <footer
        style={{
          textAlign: "center",
          background: "#fafafa",
          color: "#949494",
          fontSize: 15,
          padding: "14px",
          borderTop: "1px solid #eee",
        }}
      >
        Student Management System &nbsp; | &nbsp; Modern Minimal UI
      </footer>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onCancel={handleDeleteCancel}
        onConfirm={confirmDeleteStudent}
        studentName={studentToDelete ? studentToDelete.name : ""}
      />
    </div>
  );
}

/**
 * Student Table Section
 * @param {Array} students
 * @param {boolean} loading
 * @param {function} onEdit
 * @param {function} onDelete
 */
function TableSection({ students, loading, onEdit, onDelete }) {
  if (loading)
    return (
      <div style={{ marginTop: 50, marginBottom: 40, color: "#aaa", fontSize: 19 }}>
        Loading...
      </div>
    );
  if (!students.length)
    return (
      <div
        style={{
          border: "1px dashed #d6e2ef",
          color: "#bbb",
          fontSize: 17,
          padding: "28px",
          borderRadius: 8,
          marginTop: 30,
          background: "#fcfcfc",
        }}
      >
        No student records to display.
      </div>
    );
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          minWidth: 600,
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 16,
          background: "#fff",
          borderRadius: 9,
          overflow: "hidden",
          boxShadow: "0 4px 14px rgba(33,56,114,0.03)",
        }}
      >
        <thead>
          <tr style={{ background: "#e3e8ee", color: "#292929" }}>
            <th style={thCss}>Name</th>
            <th style={thCss}>Class</th>
            <th style={thCss}>Marks</th>
            <th style={thCss}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((stu) => (
            <tr key={stu.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={tdCss}>{stu.name}</td>
              <td style={tdCss}>{stu.student_class}</td>
              <td style={tdCss}>{stu.marks}</td>
              <td style={{ ...tdCss, minWidth: 110 }}>
                <button
                  type="button"
                  style={actionBtnCss({ color: "#fff", bg: COLOR_PRIMARY })}
                  aria-label={`Edit ${stu.name}`}
                  title="Edit"
                  onClick={() => onEdit(stu)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  style={actionBtnCss({ color: "#fff", bg: "#dc3545" })}
                  aria-label={`Delete ${stu.name}`}
                  title="Delete"
                  onClick={() => onDelete(stu)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Helper for field error styles
 */
function fieldErrStyle(isErr) {
  return isErr
    ? {
        border: "1.6px solid #d91b1b",
        background: "#ffeaea",
        color: "#b80000",
        outline: "none",
      }
    : undefined;
}

/**
 * Error message component for form fields
 */
function ErrorMsg({ text }) {
  return (
    <div
      style={{
        marginTop: 5,
        color: "#c60f0f",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "0.01em",
      }}
      aria-live="polite"
    >
      {text}
    </div>
  );
}

/**
 * Action button styling
 */
function actionBtnCss({ color = "#fff", bg = "#1976d2" }) {
  return {
    background: bg,
    color,
    border: "none",
    borderRadius: 6,
    padding: "6px 18px",
    fontWeight: 600,
    fontSize: 15,
    marginRight: 9,
    cursor: "pointer",
    transition: "all 0.15s",
    outline: "none",
    boxShadow: "0 1px 2px rgba(41,51,93,0.05)",
  };
}

const thCss = {
  padding: "13px 10px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 16,
  letterSpacing: 0.02,
};

const tdCss = {
  padding: "10px 10px",
  verticalAlign: "middle",
  fontSize: 15.5,
  color: "#222",
  background: "#fff",
};

// PUBLIC_INTERFACE
export default App;
