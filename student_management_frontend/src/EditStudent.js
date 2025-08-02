import React, { useEffect, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * EditStudent page: fetch existing student by ID, display in editable form, submit with PUT.
 *
 * Fields: Name, Roll Number (disabled), Class/Grade, Marks, Optional Gender, Optional Contact.
 * Form pre-fills with GET /students/:id, submits with PUT /students/:id.
 */
const API_BASE = "http://localhost:3001";

const COLOR_PRIMARY = "#1976d2";
const COLOR_ACCENT = "#ffc107";
const COLOR_ERROR = "#b80000";

function EditStudent({ studentId, onSuccessNav }) {
  // Form state
  const [form, setForm] = useState({
    name: "",
    roll_number: "",
    student_class: "",
    marks: "",
    gender: "",
    contact: "",
  });

  // Validation errors per field
  const [errors, setErrors] = useState({});

  // Submission status feedback
  const [status, setStatus] = useState({ type: "", message: "" });

  const [loading, setLoading] = useState(false);

  // Fetch student data for edit form
  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetch(`${API_BASE}/students/${studentId}`)
      .then((res) => res.ok ? res.json() : Promise.reject("Not found"))
      .then((data) => {
        let s = data.data ? data.data : (data.success === undefined ? data : null);
        if (!s) throw new Error("Invalid response");
        setForm({
          name: s.name || "",
          roll_number: s.roll_number || "",
          student_class: s.student_class || "",
          marks: typeof s.marks === "number" ? s.marks.toString() : s.marks || "",
          gender: s.gender || "",
          contact: s.contact || "",
        });
      })
      .catch(() => setStatus({ type: "error", message: "Could not load student data." }))
      .finally(() => setLoading(false));
  }, [studentId]);

  // Input change handler
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  // Validate form fields
  function validateFields(formData) {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.student_class.trim()) errs.student_class = "Class/Grade required";
    if (formData.marks === "" || formData.marks === undefined) errs.marks = "Marks required";
    else if (!/^\d+$/.test(formData.marks)) errs.marks = "Marks must be a number";
    else if (+formData.marks < 0 || +formData.marks > 100) errs.marks = "Marks must be 0-100";
    // Optional: Contact number validation
    if (formData.contact && !/^[\d ()+\-]{7,24}$/.test(formData.contact)) {
      errs.contact = "Contact number is invalid";
    }
    return errs;
  }

  // Submit handler
  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validateFields(form);
    setErrors(errs);
    setStatus({ type: "", message: "" });

    if (Object.keys(errs).length > 0) return;

    setLoading(true);

    // Only name/class/marks are required for backend PUT, but passing all for compatibility
    const putBody = {
      name: form.name.trim(),
      student_class: form.student_class.trim(),
      marks: parseInt(form.marks, 10),
      gender: form.gender,
      contact: form.contact.trim(),
    };

    try {
      const response = await fetch(`${API_BASE}/students/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(putBody),
      });
      const data = await response.json();
      if (response.status === 200 && data.success) {
        setStatus({ type: "success", message: "Student updated successfully!" });
        setErrors({});
        if (onSuccessNav) setTimeout(() => onSuccessNav(), 900);
      } else {
        let msg =
          data && data.message
            ? data.message
            : "Failed to update student. " +
                (data && data.detail
                  ? Array.isArray(data.detail)
                    ? data.detail.map((d) => d.msg).join("; ")
                    : data.detail
                  : "");
        setStatus({ type: "error", message: msg });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network or server error." });
    }
    setLoading(false);
  }

  // UI: render form
  return (
    <div style={{
      maxWidth: 540,
      margin: "36px auto",
      background: "#f7f9fb",
      border: "1px solid #e3e8ee",
      borderRadius: 10,
      padding: "36px 22px 28px 22px",
      boxShadow: "0 2px 11px rgba(33,40,60,0.07)",
      fontFamily: "Segoe UI, Arial, sans-serif",
    }}>
      <h2 style={{
        color: COLOR_PRIMARY,
        margin: 0,
        fontWeight: 700,
        fontSize: "1.55rem",
        marginBottom: 18
      }}>
        Edit Student
      </h2>
      {status.message && (
        <div
          aria-live="polite"
          role="alert"
          style={{
            background: status.type === "success" ? COLOR_ACCENT : "#ffd6d6",
            color: status.type === "success" ? "#444" : COLOR_ERROR,
            border: status.type === "success" ? "1.5px solid #fff2c0" : "1.5px solid #ffaeb5",
            borderRadius: 7,
            padding: "10px 16px",
            fontWeight: 500,
            fontSize: 16,
            marginBottom: 18,
            letterSpacing: "0.01em",
          }}
        >
          {status.message}
          {status.type === "success" && (
            <span style={{ marginLeft: 15, fontSize: 13, color: "#207820" }}>&#10003;</span>
          )}
        </div>
      )}

      <form
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        {/* Name */}
        <FormField
          label="Name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          autoFocus
          maxLength={100}
          placeholder="Full name"
          required
        />
        {/* Roll Number (disabled for editing, always shown but cannot change) */}
        <FormField
          label="Roll Number"
          name="roll_number"
          type="text"
          value={form.roll_number}
          onChange={() => {}}
          error={undefined}
          maxLength={32}
          placeholder="Unique identifier"
          disabled
          required
        />
        {/* Class/Grade */}
        <FormField
          label="Class / Grade"
          name="student_class"
          type="text"
          value={form.student_class}
          onChange={handleChange}
          error={errors.student_class}
          maxLength={20}
          placeholder="e.g. 10A"
          required
        />
        {/* Marks */}
        <FormField
          label="Marks"
          name="marks"
          type="number"
          value={form.marks}
          onChange={handleChange}
          error={errors.marks}
          min={0}
          max={100}
          placeholder="0-100"
          required
        />

        {/* Optional: Gender */}
        <div>
          <label
            htmlFor="gender"
            style={{ fontWeight: 500, fontSize: 15, color: "#222" }}
          >
            Gender (optional)&nbsp;
          </label>
          <select
            name="gender"
            id="gender"
            value={form.gender}
            onChange={handleChange}
            style={{
              minWidth: 110,
              fontSize: 15,
              border: "1px solid #d4d7da",
              padding: "7px 10px",
              borderRadius: 7,
              outline: "none",
              background: "#fff",
            }}
            tabIndex={5}
          >
            <option value="">-- Select --</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other/Prefer not to say</option>
          </select>
        </div>

        {/* Optional: Contact */}
        <FormField
          label="Contact (optional)"
          name="contact"
          type="text"
          value={form.contact}
          onChange={handleChange}
          error={errors.contact}
          maxLength={24}
          placeholder="e.g., +1 555-9012"
        />

        <button
          type="submit"
          style={{
            background: COLOR_PRIMARY,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "11px 29px",
            fontWeight: 600,
            fontSize: 17,
            letterSpacing: "0.04em",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.63 : 1,
            transition: "all 0.18s",
            marginTop: 9,
          }}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Student"}
        </button>
        <button
          type="button"
          style={{
            background: "#f2f2f2",
            color: "#343334",
            border: `1.3px solid #ccc`,
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            marginLeft: 0,
            marginTop: 3,
            padding: "10px 18px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.67 : 1,
          }}
          onClick={() => { if (onSuccessNav) onSuccessNav(); }}
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

// Reusable input+validation field
function FormField({
  label,
  name,
  type,
  value,
  onChange,
  error,
  ...rest
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <label htmlFor={name} style={{ fontWeight: 500, fontSize: 15, color: "#222" }}>
        {label} {rest.required && <span style={{ color: "#b70000" }}>*</span>}
      </label>
      <input
        className="input"
        name={name}
        id={name}
        type={type}
        value={value}
        onChange={onChange}
        style={
          error
            ? {
                border: "1.6px solid #d91b1b",
                background: "#ffeaea",
                color: "#b80000",
                outline: "none",
              }
            : {}
        }
        {...rest}
      />
      {error && (
        <div
          style={{
            marginTop: 4,
            color: "#c60f0f",
            fontSize: 13.5,
            fontWeight: 500,
            letterSpacing: "0.01em",
            minHeight: 18,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

export default EditStudent;
