export interface Channel {
  key: string
  type: string
  label: string
  color: string
}

// Plain const object instead of a TS `enum` (Vite's tsconfig enables
// `erasableSyntaxOnly`, which disallows enums). Same call-sites, same values.
const EMessageType = {
  EmailSent: 'EMAIL_SENT',
  LinkedInMessageSent: 'LINKEDIN_MESSAGE_SENT',
  LinkedInInMailSent: 'LINKEDIN_INMAIL_SENT'
  // others not needed for this demo project
} as const

export const CHANNELS: readonly Channel[] = [
  { key: 'email', type: EMessageType.EmailSent, label: 'Email', color: '#3f51b6' },
  { key: 'message', type: EMessageType.LinkedInMessageSent, label: 'Message LinkedIn', color: '#139BE3' },
  { key: 'inmail', type: EMessageType.LinkedInInMailSent, label: 'LinkedIn InMail', color: '#644fb7' }
] as const
