import { useState } from 'react';
import { submitContactMessage } from '../../api/portfolioApi.js';
import BrandLogo from '../common/BrandLogo';

export default function ContactSection({ section }) {
  const { title, subtitle, content } = section || {};
  const {
    heading,
    supportingText,
    publicEmail = 'tanishymistry@gmail.com',
    location = 'Nadiad, Gujarat, India',
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
        position: 'relative',
        padding: 'var(--space-20) 0',
        backgroundColor: '#090812',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
      }}
    >
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--weight-bold)' }}>
              // 06. CONNECT
            </span>
          </div>
          <h2 className="gradient-heading" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 'var(--weight-extrabold)', letterSpacing: '-0.02em', margin: 0 }}>
            {heading || title || "Let's Connect"}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', maxWidth: '600px', margin: 'var(--space-3) auto 0' }}>
            {supportingText || subtitle || 'Feel free to reach out regarding software engineering roles, collaborations, or technical inquiries.'}
          </p>

          {/* Contact Direct Badges */}
          <div className="contact-quick-row">
            <div className="contact-quick-pill">
              <span>📍</span>
              <span>{location}</span>
            </div>

            <a href={`mailto:${publicEmail}`} className="contact-quick-pill link">
              <BrandLogo name="email" size={16} ariaHidden={true} />
              <span>{publicEmail}</span>
            </a>

            <a href="https://github.com/Tanish428" target="_blank" rel="noopener noreferrer" className="contact-quick-pill link">
              <BrandLogo name="github" size={16} ariaHidden={true} />
              <span>GitHub</span>
            </a>

            <a href="https://www.linkedin.com/in/tanish-mistry-1531333b9/" target="_blank" rel="noopener noreferrer" className="contact-quick-pill link">
              <BrandLogo name="linkedin" size={16} ariaHidden={true} />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        {showContactForm && (
          <div className="contact-card">
            {successMessage && (
              <div
                role="status"
                aria-live="polite"
                className="contact-alert success"
              >
                <span>✓</span>
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="contact-alert error"
              >
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form" noValidate>
              <div className="contact-form-row">
                <div className="form-group">
                  <label htmlFor="contact-name">Your Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="alex@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Subject</label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder="Software Engineering Internship / Project Inquiry"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Describe your project, team opportunity, or inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary contact-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .contact-quick-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--space-3);
          margin-top: var(--space-6);
        }

        .contact-quick-pill {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 0.4rem 0.9rem;
          background: rgba(21, 17, 40, 0.7);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .contact-quick-pill.link:hover {
          background: rgba(185, 77, 255, 0.15);
          border-color: var(--color-primary);
          color: #FFFFFF;
          box-shadow: 0 0 12px rgba(185, 77, 255, 0.3);
          transform: translateY(-2px);
        }

        .contact-card {
          background: rgba(21, 17, 40, 0.75);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          backdrop-filter: blur(14px);
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.45);
        }

        @media (min-width: 640px) {
          .contact-card {
            padding: var(--space-10);
          }
        }

        .contact-alert {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-6);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
        }

        .contact-alert.success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
        }

        .contact-alert.error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .contact-form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-5);
        }

        @media (min-width: 640px) {
          .contact-form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .contact-submit-btn {
          width: 100%;
          margin-top: var(--space-2);
          padding: 0.9rem;
          font-size: var(--text-base);
          box-shadow: 0 0 20px rgba(185, 77, 255, 0.35);
        }
      `}</style>
    </section>
  );
}
