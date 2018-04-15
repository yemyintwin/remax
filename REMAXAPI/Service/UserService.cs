using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using REMAXAPI.Models;

namespace REMAXAPI.Service
{
    public class UserService
    {
        public User GetUserByCredentials(string email, string password) {
            User user = new User() { Id = "1", Email = "email@domain.com", Password = "P@$$w0rd", Name = "First User" };

            //if (user.Email == email && user.Password == password)
            //    return user;
            //else
            //    return null;
            user.Password = string.Empty;
            return user;
        }
    }
}