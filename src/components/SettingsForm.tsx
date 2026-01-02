"use client";

import { updateOrganization, deleteTestData } from "@/actions/settings";
import { Dictionary } from "@/lib/dictionaries";
import styles from "./SettingsForm.module.css";
import { useState, useRef } from "react";

interface SettingsFormProps {
    organization: any;
    dict: Dictionary;
}

export default function SettingsForm({ organization, dict }: SettingsFormProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(organization?.logoUrl || null);
    const [logoFile, setLogoFile] = useState<Blob | null>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = 240;
                canvas.height = 240;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    // Draw and resize (contain or cover? Let's do contain to avoid distortion, or stretch if requested. 
                    // User said "resized 240x240", implies exact dim. Let's try to fit it nicely.)
                    // White background
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, 240, 240);

                    // Allow scaling
                    ctx.drawImage(img, 0, 0, 240, 240);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            setLogoFile(blob);
                            setPreviewUrl(URL.createObjectURL(blob));
                        }
                    }, "image/png");
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (formData: FormData) => {
        if (logoFile) {
            formData.set("logo", logoFile, "logo.png");
        }
        await updateOrganization(formData);
        alert(dict.settings.form.saved);
    };

    return (
        <form action={handleSubmit} className={styles.form}>
            <div className={styles.section}>
                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.name}</label>
                        <input name="name" defaultValue={organization?.name} className={styles.input} />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.company_id}</label>
                        <input name="companyId" defaultValue={organization?.companyId} className={styles.input} />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.vat_number}</label>
                        <input name="vatNumber" defaultValue={organization?.vatNumber} className={styles.input} />
                    </div>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>{dict.settings.form.address}</label>
                    <input name="address" defaultValue={organization?.address} className={styles.input} />
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.city}</label>
                        <input name="city" defaultValue={organization?.city} className={styles.input} />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.zip_code}</label>
                        <input name="zipCode" defaultValue={organization?.zipCode} className={styles.input} />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.country}</label>
                        <input name="country" defaultValue={organization?.country} className={styles.input} />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.email}</label>
                        <input name="email" type="email" defaultValue={organization?.email} className={styles.input} />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.phone}</label>
                        <input name="phone" defaultValue={organization?.phone} className={styles.input} />
                    </div>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>{dict.settings.form.website}</label>
                    <input name="website" defaultValue={organization?.website} className={styles.input} />
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>{dict.settings.form.logo}</label>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className={styles.input} />
                    {previewUrl && (
                        <img src={previewUrl} alt="Logo Preview" className={styles.preview} />
                    )}
                </div>
            </div>

            <button type="submit" className={styles.button}>
                {dict.settings.form.submit}
            </button>

            <div className={styles.section} style={{ marginTop: "3rem", borderTop: "1px solid #eee", paddingTop: "2rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>{dict.settings.test_data.title}</h3>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <a
                        href="/api/seed?count=5"
                        target="_blank"
                        className={styles.button}
                        style={{ backgroundColor: "#10b981", textDecoration: "none", textAlign: "center" }}
                    >
                        {dict.settings.test_data.create}
                    </a>
                    <button
                        type="button"
                        onClick={async () => {
                            if (confirm(dict.settings.test_data.remove + "?")) {
                                await deleteTestData();
                                alert("Deleted");
                            }
                        }}
                        className={styles.button}
                        style={{ backgroundColor: "#ef4444" }}
                    >
                        {dict.settings.test_data.remove}
                    </button>
                </div>
            </div>
        </form>
    );
}
