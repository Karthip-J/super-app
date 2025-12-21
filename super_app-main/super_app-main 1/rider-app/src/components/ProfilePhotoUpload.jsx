import React, { useRef, useState } from 'react';

const ProfilePhotoUpload = ({ onUpload }) => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onUpload) onUpload(file);
      alert('Profile photo uploaded!');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#eee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        {preview ? <img src={preview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#aaa', fontSize: 40 }}>👤</span>}
      </div>
      <input type="file" accept="image/*" ref={inputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      <button type="button" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }} onClick={() => inputRef.current.click()}>Choose Photo</button>
      <button type="button" disabled={!file || loading} style={{ background: file ? '#4CAF50' : '#ccc', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: file ? 'pointer' : 'not-allowed' }} onClick={handleUpload}>{loading ? 'Uploading...' : 'Upload'}</button>
    </div>
  );
};

export default ProfilePhotoUpload; 