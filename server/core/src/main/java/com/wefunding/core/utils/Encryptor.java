package com.wefunding.core.utils;

import com.wefunding.core.exceptions.ErrorCode;
import com.wefunding.core.exceptions.InternalServerException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class Encryptor {

  private static final String AES = "AES";
  // AES/ECB (the "AES" default) leaks plaintext structure and provides no integrity.
  // New ciphertext is AES/GCM (authenticated, random IV). Existing ciphertext was
  // produced by AES/ECB and is decrypted via the legacy path below for backward
  // compatibility. The "v2:" prefix is the discriminator; ':' is not in the base64
  // alphabet, so a legacy (bare base64) value can never collide with it.
  private static final String AES_GCM = "AES/GCM/NoPadding";
  private static final String GCM_PREFIX = "v2:";
  private static final int GCM_IV_BYTES = 12;
  private static final int GCM_TAG_BITS = 128;
  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  public static String encrypt(String encryptorKey, String data) {
    try {
      byte[] iv = new byte[GCM_IV_BYTES];
      SECURE_RANDOM.nextBytes(iv);

      Cipher cipher = Cipher.getInstance(AES_GCM);
      cipher.init(Cipher.ENCRYPT_MODE, secretKey(encryptorKey), new GCMParameterSpec(GCM_TAG_BITS, iv));
      byte[] ciphertext = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));

      byte[] combined = new byte[iv.length + ciphertext.length];
      System.arraycopy(iv, 0, combined, 0, iv.length);
      System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);
      return GCM_PREFIX + Base64.getEncoder().encodeToString(combined);
    } catch (Exception e) {
      throw new InternalServerException(e.getMessage(), ErrorCode.UNKNOWN_ERROR);
    }
  }

  public static String decrypt(String encryptorKey, String encryptedData) {
    try {
      if (encryptedData != null && encryptedData.startsWith(GCM_PREFIX)) {
        byte[] combined = Base64.getDecoder().decode(encryptedData.substring(GCM_PREFIX.length()));
        Cipher cipher = Cipher.getInstance(AES_GCM);
        cipher.init(
            Cipher.DECRYPT_MODE,
            secretKey(encryptorKey),
            new GCMParameterSpec(GCM_TAG_BITS, combined, 0, GCM_IV_BYTES));
        byte[] decrypted = cipher.doFinal(combined, GCM_IV_BYTES, combined.length - GCM_IV_BYTES);
        return new String(decrypted, StandardCharsets.UTF_8);
      }

      // Legacy AES/ECB ciphertext (pre-GCM). Decrypt exactly as before.
      Cipher cipher = Cipher.getInstance(AES);
      cipher.init(Cipher.DECRYPT_MODE, secretKey(encryptorKey));
      byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
      return new String(decrypted);
    } catch (Exception e) {
      throw new InternalServerException(e.getMessage(), ErrorCode.UNKNOWN_ERROR);
    }
  }

  private static SecretKey secretKey(String encryptorKey) {
    return new SecretKeySpec(Base64.getDecoder().decode(encryptorKey), AES);
  }
}
