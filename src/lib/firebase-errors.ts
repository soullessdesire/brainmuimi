const AUTH_ERRORS: Record<string, string> = {
  'auth/user-not-found':         'No account found with that email.',
  'auth/wrong-password':         'Incorrect password. Please try again.',
  'auth/invalid-credential':     'Invalid email or password.',
  'auth/email-already-in-use':   'An account with this email already exists.',
  'auth/invalid-email':          'Please enter a valid email address.',
  'auth/weak-password':          'Password is too weak — use at least 6 characters.',
  'auth/too-many-requests':      'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/user-disabled':          'This account has been disabled. Contact support.',
}

export function friendlyAuthError(code: string): string {
  return AUTH_ERRORS[code] ?? 'Something went wrong. Please try again.'
}