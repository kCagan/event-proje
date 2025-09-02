using System.Security.Cryptography;
using System.Text;

namespace EventProje.Services
{

    public class EncryptionService
    {
        
            private readonly string _key;

            public EncryptionService(IConfiguration configuration)
            {
                _key = configuration["Encryption:Key"];
            }

            public string Encrypt(string plainText)
            {
                using (Aes aesAlg = Aes.Create())
                {
                    aesAlg.Key = Encoding.UTF8.GetBytes(_key);
                    aesAlg.GenerateIV();

                    ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                    using var msEncrypt = new MemoryStream();
                    msEncrypt.Write(aesAlg.IV, 0, aesAlg.IV.Length); // IV başa yaz
                    using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    using (var swEncrypt = new StreamWriter(csEncrypt))
                        swEncrypt.Write(plainText);

                    return Convert.ToBase64String(msEncrypt.ToArray());
                }
            }

            public string Decrypt(string cipherText)
        {
            try
            {
                byte[] fullCipher = Convert.FromBase64String(cipherText);
                
                using Aes aesAlg = Aes.Create();
                aesAlg.Key = Encoding.UTF8.GetBytes(_key);

                // IV'yi ilk 16 bayttan al
                byte[] iv = new byte[16];
                Array.Copy(fullCipher, 0, iv, 0, iv.Length);
                aesAlg.IV = iv;

                // Geriye kalan veri gerçek şifreli veridir
                byte[] cipher = new byte[fullCipher.Length - iv.Length];
                Array.Copy(fullCipher, iv.Length, cipher, 0, cipher.Length);

                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                using var msDecrypt = new MemoryStream(cipher);
                using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
                using var srDecrypt = new StreamReader(csDecrypt);
                return srDecrypt.ReadToEnd();
            }
            catch (CryptographicException ex)
            {
                throw new Exception("❌ Şifre çözümlenemedi. Muhtemelen yanlış şifre girildi.", ex);
            }
        }
        }
    }

