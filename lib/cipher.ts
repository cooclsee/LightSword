//-----------------------------------
// Copyright(c) 2015 猫王子
//-----------------------------------

'use strict'

import * as crypto from 'crypto';
import { Chacha20Stream } from './chacha20stream';

export const SupportedCiphers = {
  'aes-128-cfb': [16, 16],
  'aes-128-ofb': [16, 16],
  'aes-192-cfb': [24, 16],
  'aes-192-ofb': [24, 16],
  'aes-256-cfb': [32, 16],
  'aes-256-ofb': [32, 16],
  'bf-cfb': [16, 8],
  'camellia-128-cfb': [16, 16],
  'camellia-192-cfb': [24, 16],
  'camellia-256-cfb': [32, 16],
  'cast5-cfb': [16, 8],
  'des-cfb': [8, 8],
  'idea-cfb': [16, 8],
  'rc2-cfb': [16, 8],
  'rc4': [16, 0],
  'rc4-md5': [16, 16],
  'seed-cfb': [16, 16],
  'chacha20': [32, 8]
}

Object.freeze(SupportedCiphers);

export function createCipher(algorithm: string, password: string, iv?: Buffer): { cipher: crypto.Cipher, iv: Buffer } {
  return createDeOrCipher('cipher', algorithm, password, iv);
}

export function createDecipher(algorithm: string, password: string, iv: Buffer): crypto.Decipher {
  return createDeOrCipher('decipher', algorithm, password, iv).cipher;
}

function createDeOrCipher(type: string, algorithm: string, password: string, iv?: Buffer): { cipher: crypto.Cipher | crypto.Decipher, iv: Buffer } {
  let cipherAlgorithm = algorithm.toLowerCase();
  let keyIv = SupportedCiphers[cipherAlgorithm] || SupportedCiphers['aes-192-cfb'];
  
  let key = new Buffer(password);
  let keyLength = keyIv[0];
  
  if (key.length > keyLength) key = key.slice(0, keyLength);
  if (key.length < keyLength) key = new Buffer(password.repeat(keyLength / password.length + 1)).slice(0, keyLength);
  
  iv = iv || crypto.randomBytes(keyIv[1]);
  
  let cipher: any;
  switch (cipherAlgorithm) {
    case 'chacha20':
      cipher = new Chacha20Stream(key, iv);
      break;
    default:
      cipher = type === 'cipher' ? crypto.createCipheriv(algorithm, key, iv) : crypto.createDecipheriv(algorithm, key, iv);
      break;
  }
  
  return { cipher, iv };
}