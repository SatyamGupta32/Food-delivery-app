export const PASSWORD_REQUIREMENTS = [
  {
    test: (password) => password.length >= 6,
    message: 'at least 6 characters',
  },
  {
    test: (password) => /[A-Z]/.test(password),
    message: 'one uppercase letter',
  },
  {
    test: (password) => /[a-z]/.test(password),
    message: 'one lowercase letter',
  },
  {
    test: (password) => /\d/.test(password),
    message: 'one number',
  },
  {
    test: (password) => /[^A-Za-z0-9]/.test(password),
    message: 'one special character',
  },
];

export const PASSWORD_RULE_MESSAGE = 'Password must have at least 6 characters, one uppercase letter, one lowercase letter, one number, and one special character.';

export const getPasswordErrors = (password) => {
  const value = String(password || '');
  return PASSWORD_REQUIREMENTS
    .filter((requirement) => !requirement.test(value))
    .map((requirement) => requirement.message);
};

export const isPasswordStrong = (password) => getPasswordErrors(password).length === 0;
