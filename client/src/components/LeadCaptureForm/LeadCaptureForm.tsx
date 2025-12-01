import { useState, FormEvent } from 'react';
import styles from './LeadCaptureForm.module.css';

const LeadCaptureForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interest: 'Buying now',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Thank you! We\'ll be in touch soon.');
        setFormData({ name: '', email: '', interest: 'Buying now' });
        setErrors({});
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Name *
        </label>
        <input
          type="text"
          id="name"
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          disabled={status === 'submitting'}
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email *
        </label>
        <input
          type="email"
          id="email"
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          disabled={status === 'submitting'}
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="interest" className={styles.label}>
          I'm interested in
        </label>
        <select
          id="interest"
          className={styles.select}
          value={formData.interest}
          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
          disabled={status === 'submitting'}
        >
          <option value="Buying now">Buying now</option>
          <option value="Gifting">Gifting</option>
          <option value="Future editions">Future editions</option>
        </select>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Submitting...' : 'Submit'}
      </button>

      {status === 'success' && (
        <div className={styles.successMessage}>{message}</div>
      )}

      {status === 'error' && (
        <div className={styles.errorMessage}>{message}</div>
      )}
    </form>
  );
};

export default LeadCaptureForm;
