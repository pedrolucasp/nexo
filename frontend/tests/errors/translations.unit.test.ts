import {
  translateError,
  translateFields,
} from '@/lib/errors/translations';

describe('translateError', () => {
  describe('message map', () => {
    it.each([
      ['Required', 'Campo obrigatório'],
      ['Invalid email', 'Email inválido'],
      ['Invalid email address', 'Email inválido'],
      ['Invalid credentials', 'Credenciais inválidas'],
      ['Record not found', 'Registro não encontrado'],
      ['Unique constraint violation', 'Email já cadastrado'],
      ['Network error', 'Erro de conexão'],
      ['Internal server error', 'Erro interno. Tente novamente.'],
      ['Invalid or expired token', 'Link inválido ou expirado'],
      ['No token provided', 'Sessão inválida'],
      [
        'periodEnd must be after periodStart and range ≤ 90 days',
        'O período deve ter entre 1 e 90 dias',
      ],
    ])('translates %p to %p', (message, expected) => {
      expect(translateError(message)).toBe(expected);
    });
  });

  describe('pattern rules', () => {
    it('interpolates the minimum length', () => {
      expect(
        translateError('String must contain at least 8 character(s)'),
      ).toBe('Deve ter pelo menos 8 caractere(s)');
    });

    it('interpolates the maximum length', () => {
      expect(
        translateError('String must contain at most 64 character(s)'),
      ).toBe('Deve ter no máximo 64 caractere(s)');
    });

    it('interpolates the lower bound', () => {
      expect(
        translateError('Number must be greater than or equal to 1'),
      ).toBe('Deve ser maior ou igual a 1');
    });

    it('interpolates a decimal upper bound', () => {
      expect(translateError('Number must be less than or equal to 10.5')).toBe(
        'Deve ser menor ou igual a 10.5',
      );
    });

    it('collapses a type mismatch to a single message', () => {
      expect(translateError('Expected string, received number')).toBe(
        'Tipo de valor inválido',
      );
    });

    it('collapses an invalid enum value', () => {
      expect(translateError("Invalid enum value. Expected 'a' | 'b'")).toBe(
        'Opção inválida',
      );
    });

    it('collapses a validation error', () => {
      expect(translateError('Validation error: too many items')).toBe(
        'Erro de validação',
      );
    });

    it('collapses a bare HTTP status', () => {
      expect(translateError('HTTP 500')).toBe(
        'Algo deu errado. Tente novamente.',
      );
    });

    it('does not collapse a status with a trailing phrase', () => {
      expect(translateError('HTTP 500 Internal Server Error')).toBe(
        'HTTP 500 Internal Server Error',
      );
    });
  });

  describe('input handling', () => {
    it('reads the message out of an Error instance', () => {
      expect(translateError(new Error('Invalid credentials'))).toBe(
        'Credenciais inválidas',
      );
    });

    it('stringifies a non-string, non-Error value', () => {
      expect(translateError(42)).toBe('42');
    });

    it('passes an unknown message through unchanged', () => {
      expect(translateError('Something nobody mapped')).toBe(
        'Something nobody mapped',
      );
    });
  });
});

describe('translateFields', () => {
  it('translates each field value and keeps the keys', () => {
    expect(
      translateFields({
        email: 'Invalid email',
        password: 'String must contain at least 8 character(s)',
        nickname: 'Untouched value',
      }),
    ).toEqual({
      email: 'Email inválido',
      password: 'Deve ter pelo menos 8 caractere(s)',
      nickname: 'Untouched value',
    });
  });

  it('returns an empty object for no fields', () => {
    expect(translateFields({})).toEqual({});
  });
});
