import React, { useEffect, useState, useMemo } from "react";

/**
 * PUBLIC_INTERFACE
 * Analytics/Summary Page for Student Management System.
 * Fetches all student records, computes stats (total students, average marks, highest/lowest scorer per class and overall),
 * and renders key summary figures with minimal charts.
 */
const API_BASE = "http://localhost:3001";
const COLOR_PRIMARY = "#1976d2";
const COLOR_ACCENT = "#ffc107";
const COLOR_ERROR = "#b80000";

function Analytics() {
  const [students, setStudents] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all students on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const res = await fetch(`${API_BASE}/students?sort_by=marks&order=desc`);
        if (!res.ok) throw new Error("Failed to fetch student records");
        const data = await res.json();
        setStudents(data || []);
      } catch (e) {
        setFetchError("Could not fetch student records.");
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Compute key statistics
  const stats = useMemo(() => {
    if (!students.length) return null;
    const total = students.length;
    const marks = students.map(s => typeof s.marks === "number" ? s.marks : parseFloat(s.marks)).filter(m => !isNaN(m));
    const sum = marks.reduce((acc, m) => acc + m, 0);
    const avg = marks.length ? (sum / marks.length) : 0;

    let highest = null, lowest = null;
    if (students.length) {
      highest = students.reduce((a, b) => (a.marks > b.marks ? a : b), students[0]);
      lowest = students.reduce((a, b) => (a.marks < b.marks ? a : b), students[0]);
    }
    // Average, hi/lo by class:
    const classesMap = {};
    for (let stu of students) {
      if (!stu.student_class) continue;
      if (!classesMap[stu.student_class]) classesMap[stu.student_class] = [];
      classesMap[stu.student_class].push(stu);
    }
    const classStats = Object.keys(classesMap).map(cls => {
      const arr = classesMap[cls];
      const sum = arr.reduce((acc, s) => acc + (typeof s.marks === "number" ? s.marks : parseFloat(s.marks)), 0);
      return {
        class: cls,
        count: arr.length,
        avgMarks: arr.length ? (sum / arr.length) : 0,
        highest: arr.reduce((a, b) => (a.marks > b.marks ? a : b), arr[0]),
        lowest: arr.reduce((a, b) => (a.marks < b.marks ? a : b), arr[0]),
      };
    });

    return {
      total, avg, highest, lowest, classStats,
    };
  }, [students]);

  // Marks Distribution (Histogram buckets: 0-19, 20-39,... 80-100)
  const hist = useMemo(() => {
    if (!students.length) return [];
    const bins = [0, 20, 40, 60, 80, 101]; // 5 bins (0-19,20-39,40-59...)
    const labels = ["0-19", "20-39", "40-59", "60-79", "80-100"];
    const counts = [0,0,0,0,0];
    for (let stu of students) {
      const m = typeof stu.marks === "number" ? stu.marks : parseFloat(stu.marks);
      let idx = bins.findIndex(b => m < b) - 1;
      if (idx < 0 || idx >= counts.length) idx = counts.length - 1;
      counts[idx]++;
    }
    return { labels, counts };
  }, [students]);

  // Bar Chart Data: Avg marks per class
  const avgMarksPerClass = useMemo(() => {
    if (!stats?.classStats) return [];
    return stats.classStats
      .sort((a, b) => a.class.localeCompare(b.class))
      .map(cs => ({
        label: cs.class,
        avg: cs.avgMarks,
      }));
  }, [stats]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: "#232628",
        fontFamily: "Segoe UI, Arial, sans-serif",
        padding: "32px 5vw",
        maxWidth: 1020,
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontWeight: 800,
          letterSpacing: "0.02em",
          fontSize: "2.1rem",
          marginBottom: 18,
          color: COLOR_PRIMARY
        }}
      >
        Analytics & Summary
      </h2>
      <p style={{ fontSize: 19, color: "#595959", marginBottom: 31, fontWeight: 500 }}>
        Overview of student statistics and key metrics. This page provides real-time insights using the latest data.
      </p>
      {loading ? (
        <div style={{ color: "#aaa", fontSize: 19, marginTop: 50 }}>Loading...</div>
      ) : fetchError ? (
        <div style={{
          color: COLOR_ERROR,
          background: "#ffe7e6",
          border: "1.5px solid #ffc0c0",
          borderRadius: 7,
          padding: "18px 19px",
          fontWeight: 500,
          fontSize: 16,
          margin: "46px 0"
        }}>{fetchError}</div>
      ) : !students.length ? (
        <div style={{
          color: "#888",
          background: "#f8f8f8",
          border: "1px dashed #ccc",
          borderRadius: 8,
          padding: "28px",
          textAlign: "center",
          marginTop: 60
        }}>
          No student records available to show analytics.
        </div>
      ) : (
        <>
          <section style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 36,
            marginBottom: 28,
          }}>
            <StatCard title="Total Students" value={stats.total} icon="👨‍🎓" color={COLOR_PRIMARY} />
            <StatCard
              title="Average Marks"
              value={stats.avg.toFixed(2)}
              icon="📊"
              color={COLOR_ACCENT}
            />
            <StatCard
              title="Top Scorer"
              value={(stats.highest?.name || "-") + (stats.highest ? ` (${stats.highest.marks})` : "")}
              icon="🥇"
              color="#188542"
              subtitle={stats.highest?.student_class && `Class: ${stats.highest.student_class}`}
            />
            <StatCard
              title="Lowest Scorer"
              value={(stats.lowest?.name || "-") + (stats.lowest ? ` (${stats.lowest.marks})` : "")}
              icon="🥲"
              color="#c60f0f"
              subtitle={stats.lowest?.student_class && `Class: ${stats.lowest.student_class}`}
            />
          </section>

          <section style={{ marginBottom: 44 }}>
            <h3 style={{ color: COLOR_PRIMARY, fontWeight: 700, fontSize: "1.25rem" }}>
              Marks Distribution
            </h3>
            <Histogram labels={hist.labels} counts={hist.counts} color={COLOR_PRIMARY} />
          </section>

          <section style={{ marginBottom: 36 }}>
            <h3 style={{ color: COLOR_PRIMARY, fontWeight: 700, fontSize: "1.22rem" }}>
              Average Marks Per Class
            </h3>
            <BarChart data={avgMarksPerClass} color={COLOR_ACCENT} />
          </section>

          {/* List table of classes & their summary */}
          <section style={{ marginBottom: 50 }}>
            <h3 style={{ color: COLOR_PRIMARY, fontWeight: 700, fontSize: "1.13rem" }}>
              Class-wise Statistics
            </h3>
            <div style={{ overflowX: "auto" }}>
            <table
              style={{
                minWidth: 540,
                width: "90%",
                background: "#fff",
                borderCollapse: "collapse",
                fontSize: 16,
                borderRadius: 8,
                boxShadow: "0 2px 13px rgba(33,40,60,0.05)",
                marginBottom: 15,
                marginTop: 7,
              }}
            >
              <thead>
                <tr style={{ background: "#e7f1ff" }}>
                  <th style={thCss}>Class</th>
                  <th style={thCss}>Students</th>
                  <th style={thCss}>Avg. Marks</th>
                  <th style={thCss}>Topper</th>
                  <th style={thCss}>Lowest Scorer</th>
                </tr>
              </thead>
              <tbody>
                {stats.classStats
                  .sort((a, b) => a.class.localeCompare(b.class))
                  .map((cs) => (
                  <tr key={cs.class}>
                    <td style={tdCss}>{cs.class}</td>
                    <td style={tdCss}>{cs.count}</td>
                    <td style={tdCss}>{cs.avgMarks.toFixed(2)}</td>
                    <td style={tdCss}>
                      {cs.highest ? `${cs.highest.name} (${cs.highest.marks})` : "-"}
                    </td>
                    <td style={tdCss}>
                      {cs.lowest ? `${cs.lowest.name} (${cs.lowest.marks})` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// Card component for showing single stat
function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <div
      style={{
        minWidth: 170,
        background: "#f7f8fa",
        border: `1.5px solid #e3e8ee`,
        borderRadius: 10,
        padding: "22px 28px",
        flex: "1 1 160px",
        boxShadow: "0 2px 10px rgba(33,40,60,0.07)",
      }}
    >
      <div style={{ fontSize: 41, marginBottom: 8 }}>{icon}</div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 26,
          color: color,
          marginBottom: 7,
          letterSpacing: ".01em",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 15.5, color: "#2e3b55", fontWeight: 600 }}>{title}</div>
      {subtitle && (
        <div style={{ color: "#666", fontSize: 13, marginTop: 7 }}>{subtitle}</div>
      )}
    </div>
  );
}

// Mini bar chart (horizontal): label+value per class (simple SVG)
function BarChart({ data, color }) {
  // data: [{label, avg}]
  const maxValue = Math.max(...(data.map(d => d.avg)), 100);

  return (
    <div style={{ width: "100%", marginTop: 14, marginBottom: 7 }}>
      {data.length === 0 ? (
        <div style={{
          color: "#aaa",
          background: "#f4f4f7",
          padding: "14px 12px",
          borderRadius: 6,
          fontSize: 15
        }}>
          No data per class.
        </div>
      ) : (
        <div>
          {data.map(({ label, avg }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
              <div style={{ width: 56, minWidth: 46, fontWeight: 500, color: "#1976d2" }}>{label}</div>
              <div style={{
                background: color,
                height: 18,
                width: `${(avg / maxValue) * 88 + 12}%`,
                minWidth: 32,
                maxWidth: 300,
                borderRadius: 7,
                marginLeft: 15,
                transition: "width 0.18s"
              }} />
              <div style={{
                marginLeft: 15,
                fontWeight: 600,
                color: "#282b37",
                fontSize: 15.6,
                letterSpacing: ".01em"
              }}>{avg.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Mini histogram with 5 buckets (SVG bars)
function Histogram({ labels, counts, color }) {
  const max = Math.max(...counts, 1);
  return (
    <div style={{ marginTop: 14, display: "flex", alignItems: "flex-end", gap: 17 }}>
      {labels.map((lab, i) => (
        <div key={lab} style={{ textAlign: "center", minWidth: 45 }}>
          <div
            style={{
              height: `${Math.round((counts[i] / max) * 86) + 8}px`,
              width: 22,
              background: color,
              borderRadius: "7px 7px 0 0",
              margin: "0 auto 6px auto",
              opacity: 0.88,
              transition: "height 0.23s"
            }}
            title={`Count: ${counts[i]}`}
          ></div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#1976d2" }}>{counts[i]}</div>
          <div style={{ fontSize: 12.7, color: "#888", marginTop: 2 }}>{lab}</div>
        </div>
      ))}
    </div>
  );
}

const thCss = {
  padding: "10px 10px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 16,
  background: "#e8effd"
};
const tdCss = {
  padding: "10px 10px",
  fontSize: 15.3,
  background: "#fcfdff"
};

export default Analytics;
