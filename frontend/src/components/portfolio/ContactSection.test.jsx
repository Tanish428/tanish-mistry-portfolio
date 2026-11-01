import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactSection from './ContactSection.jsx';
import * as portfolioApi from '../../api/portfolioApi.js';

vi.mock('../../api/portfolioApi.js');

describe('ContactSection Component (src/components/portfolio/ContactSection.jsx)', () => {
  const sectionProps = {
    section: {
      id: 'sec-contact',
      type: 'contact',
      title: 'Contact Me',
      subtitle: 'Send a note',
      content: {
        heading: 'Get In Touch',
        supportingText: 'Drop me a message below.',
        publicEmail: 'tanish@developer.io',
        location: 'Vadodara, India',
        showContactForm: true,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Contact form validation: rejects short/empty inputs before submitting', async () => {
    render(<ContactSection {...sectionProps} />);

    const submitBtn = screen.getByRole('button', { name: /Send Message/i });
    await userEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Name is required/i);
    expect(portfolioApi.submitContactMessage).not.toHaveBeenCalled();
  });

  it('2. Contact submission success: sends sanitized payload and displays confirmation', async () => {
    portfolioApi.submitContactMessage.mockResolvedValue({ id: 'msg-123' });

    render(<ContactSection {...sectionProps} />);

    await userEvent.type(screen.getByLabelText(/Your Name/i), 'Alice Developer');
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'alice@dev.com');
    await userEvent.type(screen.getByLabelText(/Subject/i), 'Project Inquiries');
    await userEvent.type(screen.getByLabelText(/Message/i), 'Hello, I would like to discuss building a web app.');

    const submitBtn = screen.getByRole('button', { name: /Send Message/i });
    await userEvent.click(submitBtn);

    expect(portfolioApi.submitContactMessage).toHaveBeenCalledWith({
      name: 'Alice Developer',
      email: 'alice@dev.com',
      subject: 'Project Inquiries',
      message: 'Hello, I would like to discuss building a web app.',
    });

    expect(await screen.findByRole('status')).toHaveTextContent(/Your message has been sent successfully/i);

    // Form inputs are cleared
    expect(screen.getByLabelText(/Your Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('');
  });

  it('3. Contact rate limiting: displays HTTP 429 warning when threshold is exceeded', async () => {
    const rateLimitError = new Error('Too many contact messages submitted');
    rateLimitError.status = 429;
    portfolioApi.submitContactMessage.mockRejectedValue(rateLimitError);

    render(<ContactSection {...sectionProps} />);

    await userEvent.type(screen.getByLabelText(/Your Name/i), 'Spam Sender');
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'spam@bot.com');
    await userEvent.type(screen.getByLabelText(/Subject/i), 'Automated outreach');
    await userEvent.type(screen.getByLabelText(/Message/i), 'Spam content message exceeding ten characters.');

    const submitBtn = screen.getByRole('button', { name: /Send Message/i });
    await userEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Too many contact messages submitted/i);
  });
});
