import { Head, useForm } from "@inertiajs/react";
import { LoaderCircle, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import React, { FormEventHandler, useState } from "react";
import InputError from "@/Components/input-error";

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

const validatePassword = (value: string) => {
    const upper = /[A-Z]/.test(value);
    const lower = /[a-z]/.test(value);
    const symbol = /[^A-Za-z0-9]/.test(value);
    const digits = (value.match(/[0-9]/g) || []).length >= 2;
    const minLength = value.length >= 8;
    if (!upper) return "Must contain at least one uppercase letter";
    if (!lower) return "Must contain at least one lowercase letter";
    if (!symbol) return "Must contain at least one symbol";
    if (!digits) return "Must contain at least two digits";
    if (!minLength) return "Minimum length is 8 characters";
    return "";
};

const getPasswordRules = (value: string) => ({
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
    digits: (value.match(/[0-9]/g) || []).length >= 2,
    minLength: value.length >= 8,
});

const ruleItem = (isValid: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: isValid ? "#16a34a" : "#888",
    fontSize: "13px",
});

const Register: React.FC = () => {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const rules = getPasswordRules(data.password);

    const handlePasswordChange = (value: string) => {
        setData("password", value);
        setPasswordError(validatePassword(value));
    };

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        const err = validatePassword(data.password);
        if (err) {
            setPasswordError(err);
            return;
        }
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Create an account" />
            <div style={styles.page}>
                <svg
                    style={styles.svg}
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

                <div style={styles.card}>
                    <h1 style={styles.title}>Create an account</h1>
                    <p style={styles.subtitle}>
                        Enter your details below to create your account.
                    </p>

                    <form style={styles.form} onSubmit={submit}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label} htmlFor="name">Name</label>
                            <input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                placeholder="Full name"
                                style={styles.input}
                                disabled={processing}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label} htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                placeholder="email@example.com"
                                style={styles.input}
                                disabled={processing}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label} htmlFor="password">Password</label>
                            <div style={styles.passwordWrapper}>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    placeholder="Password"
                                    style={styles.input}
                                    disabled={processing}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <InputError message={passwordError || errors.password} />

                            <ul style={styles.rules}>
                                <li style={ruleItem(rules.minLength)}>
                                    {rules.minLength ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#b3b3b3" />}<span>Minimum 8 characters</span>
                                </li>
                                <li style={ruleItem(rules.upper)}>
                                    {rules.upper ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#b3b3b3" />}<span>At least one uppercase letter</span>
                                </li>
                                <li style={ruleItem(rules.lower)}>
                                    {rules.lower ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#b3b3b3" />}<span>At least one lowercase letter</span>
                                </li>
                                <li style={ruleItem(rules.symbol)}>
                                    {rules.symbol ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#b3b3b3" />}<span>At least one symbol</span>
                                </li>
                                <li style={ruleItem(rules.digits)}>
                                    {rules.digits ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#b3b3b3" />}<span>At least two digits</span>
                                </li>
                            </ul>
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label} htmlFor="password_confirmation">Confirm password</label>
                            <div style={styles.passwordWrapper}>
                                <input
                                    id="password_confirmation"
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData("password_confirmation", e.target.value)}
                                    placeholder="Confirm password"
                                    style={styles.input}
                                    disabled={processing}
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
                            Create account
                        </button>
                    </form>

                    <div style={styles.footer}>
                        Already have an account?{" "}
                        <a href={route("login")} style={styles.link}>
                            Log in
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

const styles: Record<string, React.CSSProperties> = {
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
    card: {
        background: "#fff",
        border: "3px solid transparent",
        borderRadius: "20px",
        borderImage: "linear-gradient(90deg, #ffd6e0, #cce7ff)",
        borderImageSlice: 1,
        padding: "32px",
        maxWidth: "420px",
        width: "100%",
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
        gap: "4px",
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
        transition: "border-color 0.2s ease",
        width: "100%",
    },
    passwordWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    eyeButton: {
        position: "absolute",
        right: "10px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    rules: {
        listStyle: "none",
        padding: 0,
        marginTop: "8px",
        fontSize: "13px",
        lineHeight: "1.6",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
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
    link: {
        color: "#ff69b4",
        textDecoration: "none",
        fontWeight: "500",
    },
    footer: {
        marginTop: "16px",
        fontSize: "14px",
        textAlign: "center",
        color: "#555",
    },
};

export default Register;
