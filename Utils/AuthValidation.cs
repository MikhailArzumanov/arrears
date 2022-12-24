using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using arrearsApi5_0.Models;


namespace arrearsApi5_0.Utils{
    public class AuthValidation {
        
        public static bool isAuthValid(Student student, AuthData authData, string authType, bool selfRedaction = false) {
            var login = authData.Login;
            var password = PasswordHasher.Hash(authData.Password);
            switch (authType) {
                case "student":
                    if (student.Login != login || student.Password != password)
                        return selfRedaction;
                    break;
                case "group":
                    if (student.Group.Login != login || student.Group.Password != password)
                        return false;
                    break;
                case "department":
                    if (student.Group.Department.Login != login || student.Group.Department.Password != password)
                        return false;
                    break;
                case "faculty":
                    if (student.Group.Department.Faculty.Login != login || student.Group.Department.Faculty.Password != password)
                        return false;
                    break;
                default:
                    return false;
            }
            return true;
        }
        public static bool isAuthValid(Magister magister, AuthData authData, string authType, bool selfRedaction = false) {
            var login = authData.Login;
            var password = PasswordHasher.Hash(authData.Password);
            switch (authType) {
                case "magister":
                    if (magister.Login != login || magister.Password != password)
                        return selfRedaction;
                    break;
                case "department":
                    if (magister.Department.Login != login || magister.Department.Password != password)
                        return false;
                    break;
                case "faculty":
                    if (magister.Department.Faculty.Login != login || magister.Department.Faculty.Password != password)
                        return false;
                    break;
                default:
                    return false;
            }
            return true;
        }
        public static bool isAuthValid(Group group, AuthData authData, string authType, bool selfRedaction = false) {
            var login = authData.Login;
            var password = PasswordHasher.Hash(authData.Password);
            switch (authType) {
                case "group":
                    if (group.Login != login || group.Password != password)
                        return selfRedaction;
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
        
        public static bool isAuthValid(Department department, AuthData authData, string authType, bool selfRedaction = false){
            var login = authData.Login;
            var password = PasswordHasher.Hash(authData.Password);
            switch (authType) {
                case "department":
                    if (department.Login != login || department.Password != password)
                        return selfRedaction;
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
        public static bool isAuthValid(Faculty faculty, AuthData authData){
            var login = authData.Login;
            var password = PasswordHasher.Hash(authData.Password);
            return faculty.Login == login && faculty.Password == password;
        }

    }
}
