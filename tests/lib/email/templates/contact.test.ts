import { describe, it, expect } from 'vitest';
import { contactAdminEmail, contactSenderEmail } from '@/lib/email/templates/contact';

const sample = {
  messageNumber: 'ZCM-20260507-EF56',
  name: 'Ayşe Kaya',
  email: 'ayse@example.com',
  phone: '+90 555 333 22 11',
  subject: 'Garanti hakkında',
  body: '5 yıl önce aldığım panellerin garantisi devam ediyor mu?',
};

describe('contactAdminEmail', () => {
  it('subject contains message number', () => {
    const e = contactAdminEmail(sample);
    expect(e.subject).toContain('ZCM-20260507-EF56');
  });
  it('html shows the message body', () => {
    const e = contactAdminEmail(sample);
    expect(e.html).toContain('panellerin garantisi');
  });
  it('escapes html in body to prevent injection', () => {
    const evil = { ...sample, body: '<script>alert("x")</script>' };
    const e = contactAdminEmail(evil);
    expect(e.html).not.toContain('<script>alert("x")</script>');
    expect(e.html).toContain('&lt;script&gt;');
  });
});

describe('contactSenderEmail', () => {
  it('greets sender by first name', () => {
    const e = contactSenderEmail(sample);
    expect(e.html).toContain('Ayşe');
  });
});
