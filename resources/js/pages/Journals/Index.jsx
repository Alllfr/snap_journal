import React, { useRef } from 'react';
import '../../../css/journal.css';
import { Link, usePage } from '@inertiajs/react';
import { FaLock, FaBook, FaImages, FaLightbulb } from "react-icons/fa";

const BACKEND_URL = 'http://127.0.0.1:8000';
const getMediaUrl = (path) => (path ? `${BACKEND_URL}/storage/${path}` : null);

export default function Index() {
    const { journals, auth } = usePage().props;
    const journalRef = useRef(null);

    const scrollToJournals = () => {
        if (journalRef.current) {
            journalRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const renderMedia = (journal) => {
        let mediaUrl = null;
        let isVideo = false;

        if (journal.image_path) {
            if (journal.image_path.startsWith('data:video')) {
                mediaUrl = journal.image_path;
                isVideo = true;
            } else {
                mediaUrl = getMediaUrl(journal.image_path);
                isVideo = /\.(mp4|webm|ogg|mov)$/i.test(journal.image_path);
            }
        } else {
            return <p className="text-gray-500">No media available</p>;
        }

        return isVideo ? (
            <video src={mediaUrl} controls className="w-full rounded" preload="metadata" />
        ) : (
            <img src={mediaUrl} alt={journal.title} className="w-full rounded" />
        );
    };

    return (
        <div>
            {/* Dashboard Section */}
            <div className="dashboard-container">
                <nav className="dashboard-nav">
                   <h1 className="dashboard-title">{auth?.user?.name + "'s Diary"}</h1>
                    <div className="nav-buttons">
                        <button onClick={scrollToJournals} className="btn-gradient-border">
                            My Journal
                        </button>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="btn-gradient-border"
                        >
                            Logout
                        </Link>
                    </div>
                </nav>
                <img 
                        src={`${BACKEND_URL}/storage/emotions.jpg`} 
                        alt="Emotion" 
                        className="emotion-image"
                    />
                <div className="dashboard-content text-justify leading-relaxed">
                    <p className="dashboard-welcome-text">
                        Welcome back, {auth?.user?.name || 'Guest'}! This is your personal space to
                        record your thoughts, reflect on your daily activities, and store meaningful
                        memories in a secure and private environment.
                    </p>
                    <p className="dashboard-welcome-text">
                        In the <strong>My Journal</strong> section, you can easily add new entries,
                        attach photos or short videos, and revisit your past reflections anytime you
                        want. Your journal is a safe space — only you have access to it.
                    </p>
                    <p className="dashboard-welcome-text">
                        Remember — great journeys often begin with small steps. Start writing today
                        and watch your personal archive of experiences grow.
                    </p>
                </div>
                <div className="dashboard-icons-container">
                    <div className="dashboard-icon-card">
                        <div className="icon-wrapper green"><FaLock /></div>
                        <div>
                            <h3>Private & Secure</h3>
                            <p>All your journal entries are protected and only accessible by you, ensuring your memories stay safe.</p>
                        </div>
                    </div>
                    <div className="dashboard-icon-card">
                        <div className="icon-wrapper pink"><FaBook /></div>
                        <div>
                            <h3>Daily Reflections</h3>
                            <p>Write about your day, track your feelings, and document your journey of growth.</p>
                        </div>
                    </div>
                    <div className="dashboard-icon-card">
                        <div className="icon-wrapper lilac"><FaImages /></div>
                        <div>
                            <h3>Media Memories</h3>
                            <p>Attach short videos to your entries to make your stories come alive visually.</p>
                        </div>
                    </div>
                    <div className="dashboard-icon-card">
                        <div className="icon-wrapper teal"><FaLightbulb /></div>
                        <div>
                            <h3>Creative Freedom</h3>
                            <p>Use your journal for goal setting, idea brainstorming, dream recording, or anything inspiring.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== My Journal Section ===== */}
            <div ref={journalRef} className="journal-containers">
                <div className="flex justify-between items-center w-full px-6 mb-4">
                    <h1 className="journal-title">My Journal</h1>
                    <Link href="/journals/create" className="btn-gradient-border">
                        + Add Journal
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto relative">
                    {journals.length === 0 ? (
                   <p className="text-gray-600 text-center transform translate-x-[196px]">
                        No journals yet. Start your first entry today!
                   </p>

                    ) : (
                        <div className="journal-list grid grid-cols-1 md:grid-cols-2 gap-6">
                            {journals.map((journal) => (
                                <div
                                    key={journal.id}
                                    className="journal-item border rounded p-4 shadow-sm bg-white flex flex-col items-center justify-center text-center"
                                >
                                    <h2 className="font-bold text-lg mb-2">{journal.title}</h2>
                                    {renderMedia(journal)}
                                    {journal.note && (
                                        <p className="text-gray-700 mt-2 text-justify">
                                            {journal.note}
                                        </p>
                                    )}
                                    <div className="mt-3 flex gap-2 justify-center">
                                        <Link
                                            href={`/journals/${journal.id}/edit`}
                                            className="btn-pink w-full"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            as="button"
                                            method="delete"
                                            href={`/journals/${journal.id}`}
                                            className="btn-pink w-full"
                                        >
                                            Delete
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
