import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import InputError from '@/components/input-error';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot password" />

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
                    <h1 style={styles.title}>Forgot your password?</h1>
                    <p style={styles.subtitle}>
                        Enter your email and we&apos;ll send you a password reset link.
                    </p>

                    {status && <div style={styles.status}>{status}</div>}

                    <form style={styles.form} onSubmit={submit}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label} htmlFor="email">
                                Email address
                            </label>
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

                        <button type="submit" style={styles.button} disabled={processing}>
                            {processing && <LoaderCircle style={styles.loader} />}
                            Email password reset link
                        </button>
                    </form>

                    <div style={styles.footer}>
                        Or, return to{' '}
                        <a href={route('login')} style={styles.link}>
                            Log in
                        </a>
                    </div>
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
        maxWidth: '500px',
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
    input: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        outline: 'none',
        fontSize: '14px',
        transition: 'border-color 0.2s ease',
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
        marginBottom: '16px',
        textAlign: 'center',
        color: 'green',
        fontSize: '14px',
    },
};
