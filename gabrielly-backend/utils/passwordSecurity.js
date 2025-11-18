// utils/passwordSecurity.js
// 🔐 Módulo de Segurança de Senhas - Bcrypt + Validação Forte

import bcrypt from 'bcryptjs';

/**
 * Requisitos de Senha Forte
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 símbolo especial
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  HAS_UPPERCASE: /[A-Z]/,
  HAS_LOWERCASE: /[a-z]/,
  HAS_NUMBER: /\d/,
  HAS_SPECIAL: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
};

/**
 * Valida se a senha atende aos requisitos de segurança
 * @param {string} password - Senha a validar
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password) {
    return { isValid: false, errors: ['Senha é obrigatória'] };
  }

  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(`Senha deve ter no mínimo ${PASSWORD_REQUIREMENTS.MIN_LENGTH} caracteres`);
  }

  if (!PASSWORD_REQUIREMENTS.HAS_UPPERCASE.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra MAIÚSCULA');
  }

  if (!PASSWORD_REQUIREMENTS.HAS_LOWERCASE.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (!PASSWORD_REQUIREMENTS.HAS_NUMBER.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  if (!PASSWORD_REQUIREMENTS.HAS_SPECIAL.test(password)) {
    errors.push('Senha deve conter pelo menos um símbolo especial (!@#$%^&*, etc)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Hash de uma senha com bcrypt
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} Hash da senha
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(12); // 12 rounds é recomendado
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Erro ao criptografar senha: ${error.message}`);
  }
};

/**
 * Compara senha em texto plano com hash armazenado
 * @param {string} password - Senha em texto plano
 * @param {string} hashedPassword - Hash armazenado no banco
 * @returns {Promise<boolean>} True se são iguais, false caso contrário
 */
export const comparePasswords = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error(`Erro ao comparar senhas: ${error.message}`);
  }
};

/**
 * Verifica se a senha é comumente usada (não-segura)
 * @param {string} password - Senha a verificar
 * @returns {boolean} True se é comum (não permitida)
 */
export const isCommonPassword = (password) => {
  // Lista de senhas comuns que devem ser bloqueadas
  const commonPasswords = [
    'password',
    'password123',
    '123456',
    'qwerty',
    'abc123',
    'letmein',
    'welcome',
    'monkey',
    '1234567890',
    'admin',
    'root',
  ];

  return commonPasswords.some(
    common => password.toLowerCase().includes(common)
  );
};

/**
 * Valida senha completa (força + lista comum + requisitos)
 * @param {string} password - Senha a validar
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const strengthCheck = validatePasswordStrength(password);

  if (isCommonPassword(password)) {
    strengthCheck.errors.push('Essa senha é muito comum. Escolha uma mais segura');
  }

  return {
    isValid: strengthCheck.errors.length === 0,
    errors: strengthCheck.errors,
  };
};

export default {
  validatePasswordStrength,
  validatePassword,
  hashPassword,
  comparePasswords,
  isCommonPassword,
  PASSWORD_REQUIREMENTS,
};
