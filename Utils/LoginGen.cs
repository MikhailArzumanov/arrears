using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace arrearsApi5_0.Utils{
    public class LoginGen{
        public int i = 0;
        public string currentLogin = "";
        public string Next(){
            currentLogin = "";
            do{
                var currentDigit = i % 52;
                char currentLetter = Convert.ToChar(currentDigit > 25 ? 'A' + currentDigit - 26 : 'a' + currentDigit);
                currentLogin += currentLetter;
                i /= 52;
            } while (i > 0);
            return currentLogin;
        }
    }
}
