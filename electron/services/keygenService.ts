import * as forge from 'node-forge';
import { safeStorage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const KEY_FILE = path.join(app.getPath('userData'), 'device.key');

export interface KeyPair {
  publicKey: string;
  hasPrivateKey: boolean;
}

/**
 * Salva a chave privada com criptografia apropriada por plataforma:
 * - Windows/macOS: safeStorage (DPAPI/Keychain)
 * - Linux: permissão 0600 no arquivo (fallback seguro)
 */
function savePrivateKey(pem: string): void {
  if (safeStorage.isEncryptionAvailable()) {
    // Windows/macOS: criptografia via SO
    const encrypted = safeStorage.encryptString(pem);
    fs.writeFileSync(KEY_FILE, encrypted, { mode: 0o600 });
  } else {
    // Linux/headless: fallback com permissão restrita
    // (Não é o ideal mas permite desenvolvimento)
    fs.writeFileSync(KEY_FILE, pem, { mode: 0o600 });
  }
}

function loadPrivateKey(): string | null {
  if (!fs.existsSync(KEY_FILE)) {
    return null;
  }

  if (safeStorage.isEncryptionAvailable()) {
    try {
      const encrypted = fs.readFileSync(KEY_FILE);
      return safeStorage.decryptString(encrypted);
    } catch (e) {
      // Se falhar ao decriptar, tenta ler como texto plano (fallback)
      return fs.readFileSync(KEY_FILE, 'utf-8');
    }
  }

  // Sem safeStorage, lê direto (foi salvo em texto plano)
  return fs.readFileSync(KEY_FILE, 'utf-8');
}

/**
 * Generates a new RSA 2048 key pair, or loads an existing one from disk.
 * Private key is encrypted with Electron's safeStorage (OS-level) when available,
 * or with file permissions (0600) on Linux/headless environments.
 */
export function generateOrLoadKeyPair(): KeyPair {
  // Tenta carregar existente
  const existingPem = loadPrivateKey();
  if (existingPem) {
    try {
      const key = forge.pki.privateKeyFromPem(existingPem);
      // forge.pki.privateKeyFromPem retorna o objeto com .publicKey embutido,
      // mas o tipo TypeScript não expõe. Cast necessário.
      const publicKey = forge.pki.setRsaPublicKey(key.n, key.e);
      return {
        publicKey: forge.pki.publicKeyToPem(publicKey),
        hasPrivateKey: true,
      };
    } catch (e) {
      // Chave corrompida, gera nova
      console.warn('Chave existente corrompida, gerando nova');
    }
  }

  // Gerar novo par RSA 2048
  const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  const privatePem = forge.pki.privateKeyToPem(keys.privateKey);
  const publicPem = forge.pki.publicKeyToPem(keys.publicKey);

  // Salvar privado
  savePrivateKey(privatePem);

  return {
    publicKey: publicPem,
    hasPrivateKey: true,
  };
}

/**
 * Decrypts a payload encrypted with the device's public key.
 * Uses RSA-OAEP for asymmetric encryption.
 */
export function decryptWithPrivateKey(encryptedBase64: string): string {
  const pem = loadPrivateKey();
  if (!pem) {
    throw new Error('Chave privada não encontrada');
  }

  const privateKey = forge.pki.privateKeyFromPem(pem);
  const encryptedBytes = forge.util.decode64(encryptedBase64);
  const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP');

  return decrypted;
}

/**
 * Generates a SHA-256 fingerprint for the device.
 */
export function generateFingerprint(publicKey: string): string {
  const md = forge.md.sha256.create();
  md.update(publicKey);
  return md.digest().toHex();
}