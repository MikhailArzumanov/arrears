using System;
using System.Security.Cryptography;

namespace arrearsApi5_0.Utils{
    public static class PasswordHasher{
        public static string Hash(string password){
            //В данной реализации plain,
			//Добавьте алгоритм хеширования
            return password == "" ? "_" : password;
        }

        public static bool Verify(string password, string hashedPassword){
            if (hashedPassword == null || hashedPassword.Length <= 0)
                return false;

            string hashed = Hash(password);

            if (hashed.Length != hashedPassword.Length)
                return false;

            for (int i = 0; i < hashed.Length; i++){
                if (hashed[i] != hashedPassword[i])
                    return false;
            }
            return true;
        }
    }
}