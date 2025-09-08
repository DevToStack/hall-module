"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Toast from "@/components/toast";

function EditProfileForm({ currentUser, onUpdate }) {
    const router = useRouter();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const [fields, setFields] = useState({
        name: currentUser?.name || "",
        alternate_email: currentUser?.alternate_email || "",
        alternate_phone: currentUser?.alternate_phone || "",
    });

    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const handleChange = (key, value) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async (fieldKey) => {
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/profile/edit", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ [fieldKey]: fields[fieldKey] }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to update profile");
            } else {
                setSuccess("Profile updated successfully");
                onUpdate()
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
            setEditing(null);
        }
    };

    const handleCancel = () => {
        setFields({
            name: currentUser?.name || "",
            alternate_email: currentUser?.alternate_email || "",
            alternate_phone: currentUser?.alternate_phone || "",
        });
        setEditing(null);
    };

    const cards = [
        { key: "name", label: "Name", value: fields.name, editable: true },
        { key: "email", label: "Email", value: currentUser?.email, editable: false },
        {
            key: "alternate_email",
            label: "Alternate Email",
            value: fields.alternate_email,
            editable: true,
        },
        { key: "phone_number", label: "Phone", value: currentUser?.phone_number, editable: false },
        {
            key: "alternate_phone",
            label: "Alternate Phone",
            value: fields.alternate_phone,
            editable: true,
        },
    ];

    return (
        <div className="space-y-4">
            {error && <Toast message={error} type="error" onClose={() => setError("")} />}
            {success && <Toast message={success} type="success" onClose={() => setSuccess("")} />}

            <div className="flex flex-wrap gap-4">
                {cards.map((item) => (
                    <div
                        key={item.key}
                        className="flex-1 min-w-[290px] group relative p-4 rounded-2xl 
                 border border-gray-200 dark:border-neutral-800 
                 bg-neutral-50 dark:bg-neutral-900 shadow-sm hover:shadow-md 
                 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start">
                            {/* Left side: Label + Value */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                        {item.label}
                                    </p>

                                    {/* Actions (top-right) */}
                                    {item.editable && (
                                        <div className="flex gap-3 ml-2">
                                            {editing === item.key ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSave(item.key)}
                                                        disabled={loading}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md 
                                 bg-neutral-100 dark:bg-neutral-800 
                                 text-neutral-700 dark:text-neutral-200 
                                 hover:bg-neutral-200 dark:hover:bg-neutral-700 
                                 text-sm font-medium shadow-sm disabled:opacity-50"
                                                    >
                                                        <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                                                        {loading ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md 
                                 bg-neutral-100 dark:bg-neutral-800 
                                 text-neutral-700 dark:text-neutral-200 
                                 hover:bg-neutral-200 dark:hover:bg-neutral-700 
                                 text-sm font-medium shadow-sm"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setEditing(item.key)}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md 
                               bg-neutral-100 dark:bg-neutral-800 
                               text-neutral-700 dark:text-neutral-200 
                               hover:bg-neutral-200 dark:hover:bg-neutral-700 
                               text-sm font-medium shadow-sm"
                                                >
                                                    <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Value or Input */}
                                {editing === item.key && item.editable ? (
                                    <input
                                        type={item.key.includes("email") ? "email" : "text"}
                                        value={fields[item.key] || ""}
                                        onChange={(e) => handleChange(item.key, e.target.value)}
                                        className="mt-2 block w-full rounded-md border border-neutral-300 dark:border-neutral-700 
                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 
                         px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/80 dark:focus:ring-white/60"
                                    />
                                ) : (
                                    <p className="mt-1 text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                                        {item.value || "Not set"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>






        </div>
    );
}

export default EditProfileForm;
