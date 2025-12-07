import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import InputError from "@/Components/input-error";

interface ResetPasswordProps {
  token: string;
  email: string;
}

type ResetPasswordForm = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};

const validatePassword = (value: string) => {
  return {
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
    digits: (value.match(/[0-9]/g) || []).length >= 2,
    minLength: value.length >= 8,
  };
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
  const { data, setData, post, processing, errors, reset } =
    useForm<Required<ResetPasswordForm>>({
      token,
      email,
      password: "",
      password_confirmation: "",
    });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const rules = validatePassword(data.password);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("password.store"), {
      onFinish: () => reset("password", "password_confirmation"),
    });
  };

  return (
    <>
      <Head title="Reset password" />
      <div style={styles.page}>
        <svg
          style={styles.svg as React.CSSProperties}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="url(#grad)"
            fillOpacity="1"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,192C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,0L0,0Z"
          ></path>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#ffd6e0", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#cce7ff", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg>

        <div style={styles.cardWrapper}>
          <div style={styles.card}>
            <h1 style={styles.title}>Reset your password</h1>
            <p style={styles.subtitle}>
              Enter your new password below to access your account again.
            </p>

            <form style={styles.form} onSubmit={submit}>
              <input type="hidden" name="token" value={data.token} />

              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={data.email}
                  readOnly
                  style={styles.input}
                />
                <InputError message={errors.email} />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="password">
                  New password
                </label>
                <div style={styles.passwordWrapper}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <InputError message={errors.password} />

                <ul style={styles.rules}>
                  <li style={ruleItem(rules.upper)}>
                    {rules.upper ? (
                      <CheckCircle size={16} color="green" />
                    ) : (
                      <XCircle size={16} color="#888" />
                    )}
                    <span>At least one uppercase letter</span>
                  </li>
                  <li style={ruleItem(rules.lower)}>
                    {rules.lower ? (
                      <CheckCircle size={16} color="green" />
                    ) : (
                      <XCircle size={16} color="#888" />
                    )}
                    <span>At least one lowercase letter</span>
                  </li>
                  <li style={ruleItem(rules.symbol)}>
                    {rules.symbol ? (
                      <CheckCircle size={16} color="green" />
                    ) : (
                      <XCircle size={16} color="#888" />
                    )}
                    <span>At least one symbol</span>
                  </li>
                  <li style={ruleItem(rules.digits)}>
                    {rules.digits ? (
                      <CheckCircle size={16} color="green" />
                    ) : (
                      <XCircle size={16} color="#888" />
                    )}
                    <span>At least two digits</span>
                  </li>
                  <li style={ruleItem(rules.minLength)}>
                    {rules.minLength ? (
                      <CheckCircle size={16} color="green" />
                    ) : (
                      <XCircle size={16} color="#888" />
                    )}
                    <span>Minimum 8 characters</span>
                  </li>
                </ul>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="password_confirmation">
                  Confirm password
                </label>
                <div style={styles.passwordWrapper}>
                  <input
                    id="password_confirmation"
                    type={showConfirm ? "text" : "password"}
                    value={data.password_confirmation}
                    onChange={(e) =>
                      setData("password_confirmation", e.target.value)
                    }
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={styles.eyeButton}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <InputError message={errors.password_confirmation} />
              </div>

              <button type="submit" style={styles.button} disabled={processing}>
                {processing && <LoaderCircle style={styles.loader} />}
                Reset password
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const ruleItem = (isValid: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  color: isValid ? "green" : "#888",
});

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
    minHeight: "100vh",
    padding: 0,
  },
  svg: {
    width: "100%",
    height: "140px",
    marginBottom: "-10px",
  },
  cardWrapper: {
    background: "linear-gradient(90deg, #ffd6e0, #cce7ff)",
    borderRadius: "20px",
    padding: "3px",
    maxWidth: "500px",
    width: "100%",
  },
  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "32px",
    width: "100%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "6px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "24px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "14px",
    width: "100%",
  },
  passwordWrapper: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
  },
  rules: {
    listStyle: "none",
    padding: 0,
    marginTop: "6px",
    fontSize: "13px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  button: {
    background: "linear-gradient(90deg, #ffd6e0, #cce7ff)",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    height: "16px",
    width: "16px",
    marginRight: "6px",
    animation: "spin 1s linear infinite",
  },
};
