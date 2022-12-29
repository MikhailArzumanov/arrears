using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace arrearsApi5_0.Utils{ 
public class TokenHandler{
    public static string BuildToken(string[] roles, IConfiguration config){
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512); //Выберите алгоритм здесь

        var token = new JwtSecurityToken(
            expires: DateTime.Now.AddMinutes(Double.Parse(config["Jwt:LifeTime"])), 
            signingCredentials: creds);
            
        token.Payload["roles"] = roles;

        return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}