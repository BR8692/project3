import { useState } from "react";
import { DOMAINS } from "./Domains.jsx";

const emailRe = /^\S+@\S+\.\S+$/;
const phoneRe = /^[0-9+\-\s]{10,15}$/;

const initial = {
  teamName: "",
  teamSize: 2,
  leaderName: "",
  leaderEmail: "",
  leaderPhone: "",
  college: "Jeppiaar Institute of Technology",
  department: "",
  year: "",
  domain: "",
  idea: "",
  website: "" // honeypot
};

const blankMembers = (n) => Array.from({ length: n - 1 }, () => ({ name: "", email: "" }));

function Field({ label, error, children }) {
  return (
    <div className={"field" + (error ? " invalid" : "")}>
      <label>{label}</label>
      {children}
    </div>
  );
}

export default function Registration() {
  const [form, setForm] = useState(initial);
  const [members, setMembers] = useState(blankMembers(2));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const changeSize = (e) => {
    const size = parseInt(e.target.value, 10);
    setForm((f) => ({ ...f, teamSize: size }));
    // keep already-typed members, resize the list
    setMembers((prev) => {
      const next = blankMembers(size);
      return next.map((blank, i) => prev[i] || blank);
    });
  };

  const setMember = (i, key, value) =>
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));

  const validate = () => {
    const e = {};
    ["teamName", "leaderName", "college", "department", "year", "domain"].forEach((k) => {
      if (!String(form[k]).trim()) e[k] = true;
    });
    if (!emailRe.test(form.leaderEmail.trim())) e.leaderEmail = true;
    if (!phoneRe.test(form.leaderPhone.trim())) e.leaderPhone = true;
    members.forEach((m, i) => {
      if (!m.name.trim()) e["mn" + i] = true;
      if (!emailRe.test(m.email.trim())) e["me" + i] = true;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setStatus({ type: "", message: "" });

    if (!validate()) {
      setStatus({ type: "error", message: "Please fill all required fields correctly." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          teamName: form.teamName.trim(),
          leaderEmail: form.leaderEmail.trim().toLowerCase(),
          members: members.map((m) => ({ name: m.name.trim(), email: m.email.trim() }))
        })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus({ type: "success", message: "🎉 Registration successful! See you at QuantiX'26." });
        setForm(initial);
        setMembers(blankMembers(2));
        setErrors({});
      } else {
        setStatus({ type: "error", message: data.error || "Something went wrong. Please try again." });
      }
    } catch {
      setStatus({ type: "error", message: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section registration" id="register">
      <p className="section-tag">SECURE YOUR SPOT</p>
      <h2>Ready to <span>Hack?</span></h2>

      <p className="section-description">
        Register your team and become part of an exciting innovation experience.
      </p>

      <div className="form-container">
        <form onSubmit={submit} noValidate>
          <div className="form-row">
            <Field label="Team Name *" error={errors.teamName}>
              <input name="teamName" value={form.teamName} onChange={set} maxLength={80} />
            </Field>
            <Field label="Team Size *">
              <select name="teamSize" value={form.teamSize} onChange={changeSize}>
                <option value={2}>2 Members</option>
                <option value={3}>3 Members</option>
                <option value={4}>4 Members</option>
              </select>
            </Field>
          </div>

          <h4 className="form-heading">Team Leader</h4>

          <div className="form-row">
            <Field label="Full Name *" error={errors.leaderName}>
              <input name="leaderName" value={form.leaderName} onChange={set} maxLength={80} />
            </Field>
            <Field label="Email *" error={errors.leaderEmail}>
              <input type="email" name="leaderEmail" value={form.leaderEmail} onChange={set} maxLength={120} />
            </Field>
          </div>

          <div className="form-row">
            <Field label="Phone *" error={errors.leaderPhone}>
              <input
                type="tel"
                name="leaderPhone"
                value={form.leaderPhone}
                onChange={set}
                maxLength={15}
                placeholder="10-digit mobile number"
              />
            </Field>
            <Field label="College *" error={errors.college}>
              <input name="college" value={form.college} onChange={set} maxLength={120} />
            </Field>
          </div>

          <div className="form-row">
            <Field label="Department *" error={errors.department}>
              <input name="department" value={form.department} onChange={set} maxLength={80} />
            </Field>
            <Field label="Year *" error={errors.year}>
              <select name="year" value={form.year} onChange={set}>
                <option value="">Select year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </Field>
          </div>

          <h4 className="form-heading">Other Team Members</h4>

          {members.map((m, i) => (
            <div className="form-row" key={i}>
              <Field label={`Member ${i + 1} Name *`} error={errors["mn" + i]}>
                <input value={m.name} onChange={(e) => setMember(i, "name", e.target.value)} maxLength={80} />
              </Field>
              <Field label={`Member ${i + 1} Email *`} error={errors["me" + i]}>
                <input type="email" value={m.email} onChange={(e) => setMember(i, "email", e.target.value)} maxLength={120} />
              </Field>
            </div>
          ))}

          <h4 className="form-heading">Project</h4>

          <Field label="Domain *" error={errors.domain}>
            <select name="domain" value={form.domain} onChange={set}>
              <option value="">Select domain</option>
              {DOMAINS.map(([, name]) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </Field>

          <Field label="Idea / Problem Statement (optional)">
            <textarea name="idea" rows={4} maxLength={1000} value={form.idea} onChange={set} />
          </Field>

          {/* Honeypot: hidden from humans, bots fill it */}
          <div className="hp" aria-hidden="true">
            <input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set} />
          </div>

          <button type="submit" className="primary-btn submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Register Team →"}
          </button>

          <p className={"form-status " + status.type} role="status" aria-live="polite">
            {status.message}
          </p>
        </form>
      </div>
    </section>
  );
}
