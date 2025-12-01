import { useState, useEffect } from 'react';
import { Spread } from '../components/VirtualPhotoBook/types';
import styles from './AdminPage.module.css';

interface Settings {
  bookTitle: string;
  subtitle: string;
  autoplayIntervalMs: number;
  inactivityTimeoutMs: number;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
  detailsText: string;
  bulletPoints: string[];
  thumbnails: string[];
}

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState<'spreads' | 'settings'>('spreads');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const storedAuth = localStorage.getItem('adminAuth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      const [bookRes, settingsRes] = await Promise.all([
        fetch('/api/book'),
        fetch('/api/settings'),
      ]);

      if (bookRes.ok && settingsRes.ok) {
        setSpreads(await bookRes.json());
        setSettings(await settingsRes.json());
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple client-side check - in production, verify with backend
    if (password) {
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminPassword', password);
      setIsAuthenticated(true);
      loadData();
    } else {
      setAuthError('Please enter a password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
    setPassword('');
  };

  const saveSpreads = async () => {
    setSaveStatus('saving');
    const adminPassword = localStorage.getItem('adminPassword');

    try {
      const response = await fetch('/api/book', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword || '',
        },
        body: JSON.stringify(spreads),
      });

      if (response.ok) {
        setSaveStatus('success');
        setSaveMessage('Spreads saved successfully!');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const data = await response.json();
        setSaveStatus('error');
        setSaveMessage(data.message || 'Failed to save spreads');
      }
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage('Network error. Please try again.');
    }
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    const adminPassword = localStorage.getItem('adminPassword');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword || '',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus('success');
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const data = await response.json();
        setSaveStatus('error');
        setSaveMessage(data.message || 'Failed to save settings');
      }
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage('Network error. Please try again.');
    }
  };

  const addSpread = () => {
    const newSpread: Spread = {
      id: `spread-${Date.now()}`,
      imageUrl: '',
      title: '',
      caption: '',
      ctaLabel: '',
      ctaLink: '',
    };
    setSpreads([...spreads, newSpread]);
  };

  const updateSpread = (index: number, field: keyof Spread, value: string) => {
    const updated = [...spreads];
    updated[index] = { ...updated[index], [field]: value };
    setSpreads(updated);
  };

  const deleteSpread = (index: number) => {
    if (confirm('Are you sure you want to delete this spread?')) {
      setSpreads(spreads.filter((_, i) => i !== index));
    }
  };

  const moveSpread = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= spreads.length) return;

    const updated = [...spreads];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSpreads(updated);
  };

  const updateSettings = (field: keyof Settings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const updateBulletPoint = (index: number, value: string) => {
    if (settings) {
      const updated = [...settings.bulletPoints];
      updated[index] = value;
      setSettings({ ...settings, bulletPoints: updated });
    }
  };

  const addBulletPoint = () => {
    if (settings) {
      setSettings({ ...settings, bulletPoints: [...settings.bulletPoints, ''] });
    }
  };

  const deleteBulletPoint = (index: number) => {
    if (settings) {
      setSettings({
        ...settings,
        bulletPoints: settings.bulletPoints.filter((_, i) => i !== index),
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginBox}>
          <h1>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError('');
              }}
              className={styles.loginInput}
            />
            {authError && <p className={styles.authError}>{authError}</p>}
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.header}>
        <h1>Content Admin</h1>
        <div className={styles.headerActions}>
          <a href="/" className={styles.viewSiteLink}>
            View Site
          </a>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'spreads' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('spreads')}
        >
          Book Spreads
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings & Copy
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'spreads' && (
          <div className={styles.spreadsSection}>
            <div className={styles.sectionHeader}>
              <h2>Manage Book Spreads</h2>
              <button onClick={addSpread} className={styles.addButton}>
                + Add New Spread
              </button>
            </div>

            {spreads.map((spread, index) => (
              <div key={spread.id} className={styles.spreadCard}>
                <div className={styles.spreadHeader}>
                  <h3>Spread {index + 1}</h3>
                  <div className={styles.spreadActions}>
                    <button
                      onClick={() => moveSpread(index, 'up')}
                      disabled={index === 0}
                      className={styles.iconButton}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSpread(index, 'down')}
                      disabled={index === spreads.length - 1}
                      className={styles.iconButton}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => deleteSpread(index)}
                      className={styles.deleteButton}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Image URL *</label>
                    <input
                      type="text"
                      value={spread.imageUrl}
                      onChange={(e) => updateSpread(index, 'imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Title *</label>
                    <input
                      type="text"
                      value={spread.title}
                      onChange={(e) => updateSpread(index, 'title', e.target.value)}
                      placeholder="Spread title"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Caption *</label>
                    <textarea
                      value={spread.caption}
                      onChange={(e) => updateSpread(index, 'caption', e.target.value)}
                      placeholder="Description that appears on hover/tap"
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>CTA Button Label (optional)</label>
                    <input
                      type="text"
                      value={spread.ctaLabel || ''}
                      onChange={(e) => updateSpread(index, 'ctaLabel', e.target.value)}
                      placeholder="Learn More"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>CTA Button Link (optional)</label>
                    <input
                      type="text"
                      value={spread.ctaLink || ''}
                      onChange={(e) => updateSpread(index, 'ctaLink', e.target.value)}
                      placeholder="#details"
                    />
                  </div>
                </div>

                {spread.imageUrl && (
                  <div className={styles.preview}>
                    <img src={spread.imageUrl} alt="Preview" />
                  </div>
                )}
              </div>
            ))}

            <button onClick={saveSpreads} className={styles.saveButton}>
              {saveStatus === 'saving' ? 'Saving...' : 'Save All Spreads'}
            </button>
          </div>
        )}

        {activeTab === 'settings' && settings && (
          <div className={styles.settingsSection}>
            <h2>Site Settings & Copy</h2>

            <div className={styles.settingsGroup}>
              <h3>Hero Section</h3>
              <div className={styles.formGroup}>
                <label>Book Title</label>
                <input
                  type="text"
                  value={settings.bookTitle}
                  onChange={(e) => updateSettings('bookTitle', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Subtitle</label>
                <textarea
                  value={settings.subtitle}
                  onChange={(e) => updateSettings('subtitle', e.target.value)}
                  rows={2}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Primary CTA Label</label>
                  <input
                    type="text"
                    value={settings.primaryCtaLabel}
                    onChange={(e) => updateSettings('primaryCtaLabel', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Primary CTA Link</label>
                  <input
                    type="text"
                    value={settings.primaryCtaLink}
                    onChange={(e) => updateSettings('primaryCtaLink', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Secondary CTA Label</label>
                  <input
                    type="text"
                    value={settings.secondaryCtaLabel}
                    onChange={(e) => updateSettings('secondaryCtaLabel', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Secondary CTA Link</label>
                  <input
                    type="text"
                    value={settings.secondaryCtaLink}
                    onChange={(e) => updateSettings('secondaryCtaLink', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.settingsGroup}>
              <h3>Book Details Section</h3>
              <div className={styles.formGroup}>
                <label>Details Text</label>
                <textarea
                  value={settings.detailsText}
                  onChange={(e) => updateSettings('detailsText', e.target.value)}
                  rows={3}
                  placeholder="Short paragraph about the book"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bullet Points</label>
                {settings.bulletPoints.map((point, index) => (
                  <div key={index} className={styles.bulletItem}>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => updateBulletPoint(index, e.target.value)}
                      placeholder="Feature or benefit"
                    />
                    <button
                      onClick={() => deleteBulletPoint(index)}
                      className={styles.deleteSmall}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button onClick={addBulletPoint} className={styles.addSmallButton}>
                  + Add Bullet Point
                </button>
              </div>
            </div>

            <div className={styles.settingsGroup}>
              <h3>Animation Timing</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Autoplay Interval (ms)</label>
                  <input
                    type="number"
                    value={settings.autoplayIntervalMs}
                    onChange={(e) =>
                      updateSettings('autoplayIntervalMs', parseInt(e.target.value))
                    }
                    min="1000"
                    step="500"
                  />
                  <small>Time between automatic page turns (3000 = 3 seconds)</small>
                </div>
                <div className={styles.formGroup}>
                  <label>Inactivity Timeout (ms)</label>
                  <input
                    type="number"
                    value={settings.inactivityTimeoutMs}
                    onChange={(e) =>
                      updateSettings('inactivityTimeoutMs', parseInt(e.target.value))
                    }
                    min="1000"
                    step="500"
                  />
                  <small>Wait time before resuming autoplay (5000 = 5 seconds)</small>
                </div>
              </div>
            </div>

            <button onClick={saveSettings} className={styles.saveButton}>
              {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}

        {saveStatus === 'success' && (
          <div className={styles.successToast}>{saveMessage}</div>
        )}
        {saveStatus === 'error' && (
          <div className={styles.errorToast}>{saveMessage}</div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
