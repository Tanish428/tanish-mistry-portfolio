import { useState } from 'react';
import { submitContactMessage } from '../../api/portfolioApi.js';

export default function ContactSection({ section }) {
  const { title, subtitle, content } = section || {};
  const {
    heading,
    supportingText,
    publicEmail,
    location,
    showContactForm = true,
  } = content || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Client-side quick checks matching backend validation constraints
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedSubject = formData.subject.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      setErrorMessage('Name is required and must be between 2 and 100 characters.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage('Email is required.');
      return;
    }

    if (!trimmedSubject || trimmedSubject.length < 2 || trimmedSubject.length > 200) {
      setErrorMessage('Subject is required and must be between 2 and 200 characters.');
      return;
    }

    if (!trimmedMessage || trimmedMessage.length < 10 || trimmedMessage.length > 5000) {
      setErrorMessage('Message is required and must be between 10 and 5000 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactMessage({
        name: trimmedName,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
      });

      setSuccessMessage('Thank you! Your message has been sent successfully. I will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      if (err?.status === 429) {
        setErrorMessage('Too many contact messages submitted. Please try again after 15 minutes.');
      } else if (err?.status === 400) {
        setErrorMessage(err.message || 'Please check your input fields and try again.');
      } else if (err?.status === 0) {
        setErrorMessage('Unable to reach server. Please check your network connection.');
      } else {
        setErrorMessage(err.message || 'Failed to submit contact message. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      style={{
        padding: 'var(--space-16) 0',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      <div className="container" style={{ maxWidth: '640px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>
            {heading || title || 'Get in Touch'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>
            {supportingText || subtitle || "Have a project in mind or want to collaborate? I'd love to hear from you."}
          </p>
          {(publicEmail || location) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              {location && <span>📍 {location}</span>}
              {publicEmail && (
                <span>
                  ✉️ <a href={`mailto:${publicEmail}`} style={{ color: 'var(--color-primary)' }}>{publicEmail}</a>
                </span>
              )}
            </div>
          )}
        </div>

        {showContactForm && (
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            {successMessage && (
              <div
                role="status"
                aria-live="polite"
                className="card"
                style={{
                  backgroundColor: 'var(--color-success-bg)',
                  borderColor: 'var(--color-success)',
                  color: 'var(--color-success)',
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-6)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                }}
              >
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="card"
                style={{
                  backgroundColor: 'var(--color-danger-bg)',
                  borderColor: 'var(--color-danger)',
                  color: 'var(--color-danger)',
                  padding: 'var(--space-4)',
                  marginBottom: 'var(--space-6)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                }}
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} noValidate>
              <div>
                <label htmlFor="contact-name">Your Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-subject">Subject</label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder="Project collaboration inquiry"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Tell me about your project, timeline, and goals..."
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
