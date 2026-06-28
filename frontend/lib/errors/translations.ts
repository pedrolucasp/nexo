const MESSAGE_MAP: Record<string, string> = {
  'Required': 'Campo obrigatório',
  'Invalid email': 'Email inválido',
  'Invalid email address': 'Email inválido',
  'Invalid credentials': 'Credenciais inválidas',
  'Record not found': 'Registro não encontrado',
  'Unique constraint violation': 'Email já cadastrado',
  'Network error': 'Erro de conexão',
  'Internal server error': 'Erro interno. Tente novamente.',
  'Invalid or expired token': 'Link inválido ou expirado',
  'No token provided': 'Sessão inválida',
};

const PATTERN_MAP: Array<[RegExp, string | ((m: RegExpMatchArray) => string)]> = [
  [/String must contain at least (\d+) character\(s\)/, (m) => `Deve ter pelo menos ${m[1]} caractere(s)`],
  [/String must contain at most (\d+) character\(s\)/, (m) => `Deve ter no máximo ${m[1]} caractere(s)`],
  [/Number must be greater than or equal to ([\d.]+)/, (m) => `Deve ser maior ou igual a ${m[1]}`],
  [/Number must be less than or equal to ([\d.]+)/, (m) => `Deve ser menor ou igual a ${m[1]}`],
  [/Expected (\w+), received (\w+)/, () => 'Tipo de valor inválido'],
  [/Invalid enum value/, () => 'Opção inválida'],
  [/Validation error:/, () => 'Erro de validação'],
  [/^HTTP \d+$/, () => 'Algo deu errado. Tente novamente.'],
];

export function translateError(message: string): string {
  if (MESSAGE_MAP[message]) return MESSAGE_MAP[message];

  for (const [pattern, replacement] of PATTERN_MAP) {
    const match = message.match(pattern);
    if (match) {
      return typeof replacement === 'function' ? replacement(match) : replacement;
    }
  }

  return message;
}

export function translateFields(
  fields: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, translateError(v)]),
  );
}
