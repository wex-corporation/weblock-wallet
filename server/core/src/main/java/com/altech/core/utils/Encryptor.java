package com.altech.core.utils;

import com.altech.core.exceptions.ErrorCode;
import com.altech.core.exceptions.InternalServerException;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

public class Encryptor {

  private static final String AES = "AES";

  public static String encrypt(String encryptorKey, String data) {
    try {
      Cipher cipher = Cipher.getInstance(AES);
      SecretKey secretKey = new SecretKeySpec(Base64.getDecoder().decode(encryptorKey), AES);
      cipher.init(Cipher.ENCRYPT_MODE, secretKey);
      byte[] encryptedData = cipher.doFinal(data.getBytes());
      return Base64.getEncoder().encodeToString(encryptedData);
    } catch (Exception e) {
      throw new InternalServerException(e.getMessage(), ErrorCode.UNKNOWN_ERROR);
    }
  }

  public static String decrypt(String encryptorKey, String encryptedData) {
    try {
      Cipher cipher = Cipher.getInstance(AES);
      SecretKey secretKey = new SecretKeySpec(Base64.getDecoder().decode(encryptorKey), AES);
      cipher.init(Cipher.DECRYPT_MODE, secretKey);
      byte[] decodedData = Base64.getDecoder().decode(encryptedData);
      byte[] decryptedData = cipher.doFinal(decodedData);
      return new String(decryptedData);
    } catch (Exception e) {
      throw new InternalServerException(e.getMessage(), ErrorCode.UNKNOWN_ERROR);
    }
  }
}
