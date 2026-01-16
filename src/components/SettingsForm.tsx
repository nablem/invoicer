"use client";

import { updateOrganization, deleteTestData } from "@/actions/settings";
import { Dictionary } from "@/lib/dictionaries";
import styles from "./SettingsForm.module.css";
import { useState, useRef } from "react";

interface SettingsFormProps {
    organization: any;
    dict: Dictionary;
    defaultLanguage: "fr" | "en";
}

export default function SettingsForm({ organization, dict, defaultLanguage }: SettingsFormProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(organization?.logoUrl || null);
    const [logoFile, setLogoFile] = useState<Blob | null>(null);

    // Numbering Settings State
    const [includePrefix, setIncludePrefix] = useState(organization?.invoiceIncludePrefix ?? true);
    const [includeYear, setIncludeYear] = useState(organization?.invoiceIncludeYear ?? false);
    const [includeMonth, setIncludeMonth] = useState(organization?.invoiceIncludeMonth ?? false);
    const [prefix, setPrefix] = useState(organization?.invoicePrefix ?? "INV-");
    const [sequence, setSequence] = useState(organization?.invoiceSequence ?? 1);
    const [digits, setDigits] = useState(organization?.invoiceDigits ?? 3);

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIncludeMonth(checked);
        if (checked) {
            setIncludeYear(true);
        }
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIncludeYear(checked);
        if (!checked) {
            setIncludeMonth(false); // Optional: Uncheck month if year is unchecked? User didn't specify, but makes sense.
        }
    };

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

    const [saved, setSaved] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        if (logoFile) {
            formData.set("logo", logoFile, "logo.png");
        }
        await updateOrganization(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
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

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.vat_rate}</label>
                        <input
                            name="defaultVat"
                            type="number"
                            step="0.1"
                            defaultValue={organization?.defaultVat ?? 0}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.currency}</label>
                        <select
                            name="currency"
                            defaultValue={organization?.currency || "EUR"}
                            className={styles.input}
                        >
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="JPY">JPY (¥)</option>
                            <option value="AUD">AUD ($)</option>
                            <option value="CAD">CAD ($)</option>
                            <option value="CHF">CHF (Fr)</option>
                            <option value="CNY">CNY (¥)</option>
                            <option value="HKD">HKD ($)</option>
                            <option value="NZD">NZD ($)</option>
                            <option value="AED">AED (د.إ)</option>
                        </select>
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.number_format}</label>
                        <select
                            name="decimalSeparator"
                            defaultValue={organization?.decimalSeparator || ","}
                            className={styles.input}
                        >
                            <option value=",">1 234,56</option>
                            <option value=".">1,234.56</option>
                        </select>
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
                </div>

                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.country}</label>
                        <input name="country" defaultValue={organization?.country} className={styles.input} />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>{dict.settings.form.language}</label>
                        <select
                            key={organization?.language}
                            name="language"
                            defaultValue={organization?.language || defaultLanguage}
                            className={styles.input}
                        >
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                        </select>
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

                {/* Bank Details Section */}
                <div className={styles.section} style={{ paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>{dict.settings.form.bank.title}</h3>
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label className={styles.label}>{dict.settings.form.bank.beneficiary}</label>
                            <input name="bankBeneficiary" defaultValue={organization?.bankBeneficiary} className={styles.input} />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>{dict.settings.form.bank.bank_name}</label>
                            <input name="bankName" defaultValue={organization?.bankName} className={styles.input} />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.group}>
                            <label className={styles.label}>{dict.settings.form.bank.iban}</label>
                            <input name="iban" defaultValue={organization?.iban} className={styles.input} />
                        </div>
                        <div className={styles.group}>
                            <label className={styles.label}>{dict.settings.form.bank.bic}</label>
                            <input name="bic" defaultValue={organization?.bic} className={styles.input} />
                        </div>
                    </div>
                </div>

                {/* Numbering Section */}
                <div className={styles.section} style={{ paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{dict.settings.form.numbering.title}</h3>

                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="invoiceIncludePrefix"
                                checked={includePrefix}
                                onChange={(e) => setIncludePrefix(e.target.checked)}
                            />
                            {dict.settings.form.numbering.prefix}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="invoiceIncludeYear"
                                checked={includeYear}
                                onChange={handleYearChange}
                            />
                            {dict.settings.form.numbering.year}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="invoiceIncludeMonth"
                                checked={includeMonth}
                                onChange={handleMonthChange}
                            />
                            {dict.settings.form.numbering.month}
                        </label>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0',
                        padding: '1.5rem',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        flexWrap: 'wrap'
                    }}>
                        {includePrefix && (
                            <input
                                name="invoicePrefix"
                                value={prefix}
                                onChange={e => setPrefix(e.target.value)}
                                className={styles.input}
                                style={{
                                    width: '100px',
                                    textAlign: 'center',
                                    marginRight: '0.5rem',
                                    fontWeight: 'bold'
                                }}
                                placeholder="INV-"
                            />
                        )}

                        {includeYear && (
                            <div style={{
                                padding: '0.6rem 1rem',
                                background: '#e5e7eb',
                                borderRadius: '4px',
                                color: '#6b7280',
                                fontWeight: 'bold',
                                marginRight: '0.25rem',
                                fontSize: '0.9rem'
                            }}>
                                {dict.settings.form.numbering.year_label}
                            </div>
                        )}

                        {includeMonth && (
                            <div style={{
                                padding: '0.6rem 1rem',
                                background: '#e5e7eb',
                                borderRadius: '4px',
                                color: '#6b7280',
                                fontWeight: 'bold',
                                marginRight: '0.5rem',
                                fontSize: '0.9rem'
                            }}>
                                {dict.settings.form.numbering.month_label}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    left: '0',
                                    fontSize: '0.7rem',
                                    color: '#6b7280'
                                }}>{dict.settings.form.numbering.sequence}</span>
                                <input
                                    type="number"
                                    name="invoiceSequence"
                                    value={sequence}
                                    onChange={e => setSequence(Math.max(1, parseInt(e.target.value) || 1))}
                                    className={styles.input}
                                    style={{
                                        width: '100px',
                                        textAlign: 'center',
                                        background: '#e5e7eb',
                                        fontWeight: 'bold',
                                        color: '#374151'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginLeft: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    left: '0',
                                    fontSize: '0.7rem',
                                    color: '#6b7280',
                                    whiteSpace: 'nowrap'
                                }}>{dict.settings.form.numbering.digits}</span>
                                <input
                                    type="number"
                                    name="invoiceDigits"
                                    value={digits}
                                    onChange={e => setDigits(Math.max(0, parseInt(e.target.value) || 0))}
                                    className={styles.input}
                                    style={{
                                        width: '80px',
                                        textAlign: 'center',
                                        background: 'white'
                                    }}
                                    min="0"
                                    max="10"
                                />
                            </div>
                        </div>

                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        {dict.settings.form.numbering.preview} <strong>
                            {includePrefix ? prefix : ''}
                            {includeYear ? new Date().getFullYear() : ''}
                            {includeMonth ? String(new Date().getMonth() + 1).padStart(2, '0') : ''}
                            {String(sequence).padStart(digits, '0')}
                        </strong>
                    </div>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>{dict.settings.form.logo}</label>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className={styles.input} />
                    {previewUrl && (
                        <img src={previewUrl} alt="Logo Preview" className={styles.preview} />
                    )}
                </div>
            </div>

            <button type="submit" className={styles.button} disabled={saved} style={saved ? { background: '#22c55e' } : {}}>
                {saved ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        ✓ {dict.common.saved}
                    </span>
                ) : (
                    dict.settings.form.submit
                )}
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
        </form >
    );
}
