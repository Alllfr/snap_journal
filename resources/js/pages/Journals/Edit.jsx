import React from 'react';
import '../../../css/journal-edit.css';
import { useForm, Link, usePage, Head } from '@inertiajs/react';

export default function Edit() {
    const { journal } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        title: journal.title || '',
        note: journal.note || '',
        _method: 'put',
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/journals/${journal.id}`);
    };

    const isBase64 = (str) => /^data:.*;base64,/.test(str);
    const isVideo = (path) => {
        if (!path) return false;
        if (isBase64(path)) {
            return /^data:video\//.test(path);
        }
        return /\.(mp4|webm|ogg|mov)$/i.test(path);
    };

    const getMediaUrl = (path) => {
        if (!path) return null;
        if (isBase64(path)) return path;
        return `${window.location.origin}/storage/${path}`;
    };

    const mediaUrl = getMediaUrl(journal.image_path);

    return (
        <div className="journal-edit-container">
            <Head title="Edit Journal" />

            <div className="journal-edit-card max-w-xl mx-auto">
                <h1 className="journal-edit-title">Edit Journal</h1>

                <form onSubmit={submit} className="journal-edit-form">
                    <label>Title</label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                    />
                    {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                    <label>Notes</label>
                    <textarea
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        rows="4"
                    />
                    {errors.note && <p className="text-red-500 text-sm">{errors.note}</p>}

                    <label>Your Emotion</label>
                    {mediaUrl && (
                        <div align="center" className="journal-edit-photo-preview mt-4">
                            {isVideo(journal.image_path) ? (
                               <video
                                    src={mediaUrl}
                                    controls
                                    className="rounded w-full h-[180px] object-cover"
                                    />
                            ) : (
                                <img
                                    src={mediaUrl}
                                    alt={journal.title}
                                    className="max-w-full rounded"
                                />
                            )}
                        </div>
                    )}
                    
                    <div className="journal-edit-actions mt-4">
                        <Link href="/journals" className="journal-edit-btn-red">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="journal-edit-btn-pink"
                            disabled={processing}
                        >
                            {processing ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
