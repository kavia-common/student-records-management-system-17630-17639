import React, { useEffect, useState, useMemo } from "react";

/**
 * PUBLIC_INTERFACE
 * ViewStudents page: display all students, support search/filter/sort,
 * render a table with edit/delete actions and modern minimal styling.
 *
 * - GET all students from backend (`/students`)
 * - Table columns: Name, Roll Number, Class, Marks/Average, Edit/Delete
 * - Search box: filter by Name or Roll Number (partial matches)
 * - Sorting/filtering controls for columns
 */
const API_BASE = "http://localhost:3001";

const COLOR_PRIMARY = "#1976d2";
const COLOR_ACCENT = "#ffc107";
const COLOR_ERROR = "#b80000";
const COLOR_SECONDARY = "#424242";

function ViewStudents({ onEdit, onDelete }) {
  const [students, setStudents] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(false);

  // Search/filter/sort state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterClass, setFilterClass] = useState("");
  const [filterMinMarks, setFilterMinMarks] = useState("");
  const [filterMaxMarks, setFilterMaxMarks] = useState("");

  // Table action status
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });

  // Fetch all students with applied sort/filter parameters
  const fetchStudents = async () => {
    setLoading(true);
    setFetchError("");
    let params = [];
    if (sortBy) params.push(`sort_by=${sortBy}`);
    if (sortOrder) params.push(`order=${sortOrder}`);
    if (filterClass) params.push(`class=${encodeURIComponent(filterClass)}`);
    if (filterMinMarks) params.push(`min_marks=${filterMinMarks}`);
    if (filterMaxMarks) params.push(`max_marks=${filterMaxMarks}`);

    try {
      const url = `${API_BASE}/students${params.length ? "?" + params.join("&") : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data || []);
    } catch (e) {
      setFetchError("Error fetching students.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [sortBy, sortOrder, filterClass, filterMinMarks, filterMaxMarks]);

  // Get unique classes from list for filter dropdown
  const classOptions = useMemo(
    () =>
      Array.from(
        new Set(students.map((s) => s.student_class).filter(Boolean))
      ).sort(),
    [students]
  );

  // Filter students by search text (name/roll_number)
  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const s = search.trim().toLowerCase();
    return students.filter(
      (stu) =>
        (stu.name && stu.name.toLowerCase().includes(s)) ||
        (stu.roll_number && stu.roll_number.toString().toLowerCase().includes(s))
    );
  }, [students, search]);

  // Handle sorting column (toggle order if same column selected)
  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder((old) => (old === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

  // Handle action button events (Edit, Delete)
  const handleEdit = (student) => {
    // If onEdit is provided, use that, else navigate to edit page
    if (onEdit) {
      onEdit(student);
      setActionStatus({ type: "", message: "" });
    } else if (student && student.id) {
      window.location.hash = `#/edit/${student.id}`;
    }
  };
  const handleDelete = async (student) => {
    if (!window.confirm(`Delete student "${student.name}"?`)) return;
    setLoading(true);
    setActionStatus({ type: "", message: "" });
    try {
      const res = await fetch(`${API_BASE}/students/${student.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data?.message || "Failed to delete student");
      setActionStatus({ type: "success", message: `Student deleted.` });
      fetchStudents();
    } catch (err) {
      setActionStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // UI rendering
  return (
    <div
      style={{
        background: "#fff",
        minHeight: "100vh",
        fontFamily: "Segoe UI, Arial, sans-serif",
        padding: "24px 4vw 50px 4vw",
        maxWidth: 1020,
        margin: "0 auto"
      }}
    >
      <h2
        style={{
          color: COLOR_PRIMARY,
          fontWeight: 700,
          fontSize: "1.75rem",
          margin: "18px 0 22px 0",
          letterSpacing: "0.01em"
        }}
      >
        All Students
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "center",
          marginBottom: 21
        }}
      >
        {/* Search box */}
        <input
          className="input"
          type="text"
          placeholder="Search name or roll number..."
          aria-label="Search"
          value={search}
          style={{
            minWidth: 210,
            fontSize: 16,
            border: "1px solid #d4d7da",
            borderRadius: 7,
            padding: "8px 14px",
            outline: "none",
          }}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Sort by */}
        <label style={{ fontSize: 15, color: COLOR_SECONDARY }}>
          Sort by:&nbsp;
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              fontSize: 15,
              borderRadius: 5,
              border: "1px solid #d4d7da",
              color: COLOR_PRIMARY,
              padding: "3px 10px"
            }}
          >
            <option value="name">Name</option>
            <option value="roll_number">Roll Number</option>
            <option value="student_class">Class</option>
            <option value="marks">Marks</option>
          </select>
          <button
            type="button"
            title="Toggle sort order"
            style={{
              marginLeft: 7,
              background: "none",
              border: "none",
              color: COLOR_PRIMARY,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 16
            }}
            onClick={() =>
              setSortOrder((s) => (s === "asc" ? "desc" : "asc"))
            }
            aria-label={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </label>

        {/* Filter by class */}
        <label style={{ fontSize: 15, color: COLOR_SECONDARY }}>
          Class:&nbsp;
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            style={{
              minWidth: 60,
              fontSize: 15,
              borderRadius: 5,
              border: "1px solid #d4d7da",
              color: COLOR_SECONDARY
            }}
          >
            <option value="">All</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {/* Filter: Marks */}
        <label style={{ fontSize: 15, color: COLOR_SECONDARY }}>
          Marks:&nbsp;
          <input
            type="number"
            min={0}
            max={100}
            value={filterMinMarks}
            onChange={e => setFilterMinMarks(e.target.value.replace(/\D/, ""))}
            placeholder="min"
            style={{
              width: 58,
              fontSize: 15,
              padding: "3px 6px",
              border: "1px solid #d4d7da",
              borderRadius: 5,
              marginRight: 3
            }}
          />
          –
          <input
            type="number"
            min={0}
            max={100}
            value={filterMaxMarks}
            onChange={e => setFilterMaxMarks(e.target.value.replace(/\D/, ""))}
            placeholder="max"
            style={{
              width: 58,
              fontSize: 15,
              padding: "3px 6px",
              border: "1px solid #d4d7da",
              borderRadius: 5,
              marginLeft: 5
            }}
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
            fontWeight: 600,
            fontSize: 14,
            padding: "7px 15px",
            cursor: "pointer"
          }}
          onClick={fetchStudents}
        >
          Apply
        </button>
        {(!!filterClass || !!filterMinMarks || !!filterMaxMarks) && (
          <button
            type="button"
            style={{
              marginLeft: 10,
              background: "#f1f1f1",
              color: COLOR_SECONDARY,
              border: "none",
              borderRadius: 5,
              fontWeight: 500,
              fontSize: 13,
              padding: "6px 13px",
              cursor: "pointer"
            }}
            onClick={() => {
              setFilterClass("");
              setFilterMinMarks("");
              setFilterMaxMarks("");
            }}
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Action status message */}
      {actionStatus.message && (
        <div
          aria-live="polite"
          role="alert"
          style={{
            background: actionStatus.type === "success" ? COLOR_ACCENT : "#ffd6d6",
            color: actionStatus.type === "success" ? "#444" : COLOR_ERROR,
            border: actionStatus.type === "success"
              ? "1.5px solid #fff2c0"
              : "1.5px solid #ffaeb5",
            borderRadius: 7,
            padding: "8px 15px",
            fontWeight: 500,
            fontSize: 15,
            marginBottom: 18,
            letterSpacing: "0.01em"
          }}
        >
          {actionStatus.message}
        </div>
      )}

      {/* Loading/Error/No Records */}
      {loading ? (
        <div style={{ margin: "55px 0", color: "#aaa", fontSize: 19 }}>
          Loading...
        </div>
      ) : fetchError ? (
        <div
          style={{
            marginTop: 34,
            color: COLOR_ERROR,
            background: "#fff1f16d",
            borderRadius: 5,
            fontSize: 16,
            padding: "16px"
          }}
        >
          {fetchError}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            border: "1px dashed #d6e2ef",
            color: "#bbb",
            fontSize: 17,
            padding: "28px",
            borderRadius: 8,
            marginTop: 40,
            background: "#fcfcfc",
          }}
        >
          No student records to display.
        </div>
      ) : (
        <div style={{ marginTop: 10, overflowX: "auto" }}>
          <table
            style={{
              minWidth: 710,
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 16,
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 4px 16px rgba(41,56,114,0.045)",
              overflow: "hidden"
            }}
          >
            <thead>
              <tr style={{ background: "#e3e8ee", color: "#292929" }}>
                <ThSort
                  field="name"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onClick={handleSort}
                >
                  Name
                </ThSort>
                <ThSort
                  field="roll_number"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onClick={handleSort}
                >
                  Roll Number
                </ThSort>
                <ThSort
                  field="student_class"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onClick={handleSort}
                >
                  Class
                </ThSort>
                <ThSort
                  field="marks"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onClick={handleSort}
                >
                  Marks
                </ThSort>
                <th style={thCss}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stu) => (
                <tr key={stu.id} style={{}}>
                  <td style={tdCss}>{stu.name}</td>
                  <td style={tdCss}>{stu.roll_number}</td>
                  <td style={tdCss}>{stu.student_class}</td>
                  <td style={tdCss}>{stu.marks}</td>
                  <td style={{ ...tdCss, minWidth: 112 }}>
                    <button
                      type="button"
                      style={actionBtnCss({ color: "#fff", bg: COLOR_PRIMARY })}
                      aria-label={`Edit ${stu.name}`}
                      title="Edit"
                      onClick={() => handleEdit(stu)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      style={actionBtnCss({ color: "#fff", bg: "#dc3545" })}
                      aria-label={`Delete ${stu.name}`}
                      title="Delete"
                      onClick={() => handleDelete(stu)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Sorting header component
function ThSort({ field, sortBy, sortOrder, children, onClick }) {
  return (
    <th
      style={{
        ...thCss,
        cursor: "pointer",
        color: field === sortBy ? "#1976d2" : "#292929",
        background: field === sortBy ? "#d3e9ff" : "#e3e8ee"
      }}
      onClick={() => onClick(field)}
      aria-sort={field === sortBy ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
      tabIndex={0}
      title={`Sort by ${children}`}
      scope="col"
    >
      {children}{" "}
      {field === sortBy ? (
        <span style={{ fontWeight: 700 }}>{sortOrder === "asc" ? "↑" : "↓"}</span>
      ) : (
        <span style={{ color: "#acb4c1" }}>↕</span>
      )}
    </th>
  );
}

// Table cell and header CSS
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

// Action button styling
function actionBtnCss({ color = "#fff", bg = "#1976d2" }) {
  return {
    background: bg,
    color,
    border: "none",
    borderRadius: 6,
    padding: "7px 18px",
    fontWeight: 600,
    fontSize: 15,
    marginRight: 9,
    cursor: "pointer",
    transition: "all 0.14s",
    outline: "none",
    boxShadow: "0 1px 2px rgba(41,51,93,0.05)",
  };
}

// PUBLIC_INTERFACE
export default ViewStudents;
