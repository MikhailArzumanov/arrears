using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using arrearsApi5_0.Models;


namespace arrearsApi5_0.Utils{
    public class AuthValidation {

        public static bool isAuthValid(Group group, AuthData authData, string authType) {
            var login = authData.Login;
            var password = PasswordHasher.Hash(authData.Password);
            switch (authType) {
                case "group":
                    if (group.Login != login || group.Password != password)
                        return false;
                    break;
                case "department":
                    if (group.Department.Login != login || group.Department.Password != password)
                        return false;
                    break;
                case "faculty":
                    if (group.Department.Faculty.Login != login || group.Department.Faculty.Password != password)
                        return false;
                    break;
                default:
                    return false;
            }
            return true;
        }

        public static bool isAuthValid(Department department, AuthData authData, string authType){
            var login = authData.Login;
            var password = PasswordHasher.Hash(authData.Password);
            switch (authType) {
                case "department":
                    if (department.Login != login || department.Password != password)
                        return false;
                    break;
                case "faculty":
                    if (department.Faculty.Login != login || department.Faculty.Password != password)
                        return false;
                    break;
                default:
                    return false;
            }
            return true;
        }

    }
}
