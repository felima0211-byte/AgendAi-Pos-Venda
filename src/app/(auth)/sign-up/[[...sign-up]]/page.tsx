import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'w-full shadow-[var(--shadow-lg)] rounded-[var(--radius-2xl)] border border-[var(--color-border)]',
          headerTitle: 'text-[var(--color-text-primary)] font-semibold',
          headerSubtitle: 'text-[var(--color-text-secondary)]',
          formButtonPrimary:
            'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-[var(--radius-full)] font-medium transition-colors',
          footerActionLink: 'text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]',
        },
      }}
    />
  )
}
