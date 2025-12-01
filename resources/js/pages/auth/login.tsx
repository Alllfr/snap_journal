import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import InputError from '@/Components/input-error';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false); 

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />
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
                            <stop offset="0%" style={{ stopColor: '#ffd6e0', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#cce7ff', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                </svg>

                <div style={styles.card}>
                    <h1 style={styles.title}>Welcome to Diary Journal</h1>
                    <p style={styles.subtitle}>
                        Log in to continue your personal journaling journey.
                    </p>

                    <form style={styles.form} onSubmit={submit}>
                        {/* Email */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.label} htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                                style={styles.input}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div style={styles.fieldGroup}>
                            <div style={styles.labelRow}>
                                <label style={styles.label} htmlFor="password">Password</label>
                                {canResetPassword && (
                                    <a href={route('password.request')} style={styles.link}>
                                        Forgot password?
                                    </a>
                                )}
                            </div>

                            <div style={styles.passwordWrapper}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Password"
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
                        </div>

                        <button type="submit" style={styles.button} disabled={processing}>
                            {processing && <LoaderCircle style={styles.loader} />}
                            Log in
                        </button>
                    </form>

                    <div style={styles.footer}>
                        Don't have an account?{' '}
                        <a href={route('register')} style={styles.link}>
                            Sign up
                        </a>
                    </div>

                    {status && <div style={styles.status}>{status}</div>}
                </div>
            </div>
        </>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#fff',
        minHeight: '100vh',
        padding: 0,
    },
    svg: {
        width: '100%',
        height: '140px',
        marginBottom: '-10px',
    },
    card: {
        background: '#fff',
        border: '3px solid transparent',
        borderRadius: '20px',
        borderImage: 'linear-gradient(90deg, #ffd6e0, #cce7ff)',
        borderImageSlice: 1,
        padding: '32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '6px',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '24px',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '500',
    },
    labelRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    input: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        outline: 'none',
        fontSize: '14px',
        transition: 'border-color 0.2s ease',
        width: '100%',
    },
    passwordWrapper: {
        position: 'relative', 
        display: 'flex',
        alignItems: 'center',
    },
    eyeButton: {
        position: 'absolute', 
        right: '10px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        background: 'linear-gradient(90deg, #ffd6e0, #cce7ff)',
        border: 'none',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loader: {
        height: '16px',
        width: '16px',
        marginRight: '6px',
        animation: 'spin 1s linear infinite',
    },
    link: {
        color: '#ff69b4',
        textDecoration: 'none',
        fontWeight: '500',
    },
    footer: {
        marginTop: '16px',
        fontSize: '14px',
        textAlign: 'center',
        color: '#555',
    },
    status: {
        marginTop: '10px',
        textAlign: 'center',
        color: 'green',
        fontSize: '14px',
    },
};
