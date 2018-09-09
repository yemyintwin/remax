using REMAXAPI.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Reflection;
using System.Runtime.Caching;
using System.Security.Claims;
using System.Text;
using System.Web;
using System.Web.Http.Controllers;

namespace REMAXAPI
{
    public static class Messages {
        public static string LoginFailed = "User login failed.";
        public static string AnonymousUserDetected = "Anonymous user detected.";
        public static string UnauthorizedUser = "Unauthorized user.";
        public static string UnauthorizedOperation = "Unauthorized operation performed.";
    }

    public static class Util
    {
        public enum ReourceOperations {
            Read = 1,
            Write = 2,
            Delete = 3,
            Execute = 4
        }

        public static class AccessLevel
        {
            public static int None = 0;
            public static int Own = 1;
            public static int All = 2;
        }

        public static string ByteArrayToString(byte[] ba)
        {
            StringBuilder hex = new StringBuilder(ba.Length * 2);
            foreach (byte b in ba)
                hex.AppendFormat("{0:x2}", b);
            return hex.ToString();
        }

        public static byte[] StringToByteArray(String hex)
        {
            int NumberChars = hex.Length;
            byte[] bytes = new byte[NumberChars / 2];
            for (int i = 0; i < NumberChars; i += 2)
                bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
            return bytes;
        }

        //public static string ByteArrayToString(byte[] ba) {
        //    int length = ba.Length;
        //    char[] charArray = new char[length];
        //    Convert.ToBase64CharArray(ba, 0, length, charArray, length);
        //    string strBase64 = new string(charArray);
        //    return strBase64;
        //}

        //public static byte[] StringToByteArray(String hex) {
        //    byte[] byteArray = Convert.FromBase64CharArray(hex.ToCharArray(), 0, hex.Length);
        //    return byteArray;
        //}

        public class MemoryCacher
        {
            public object GetValue(string key)
            {
                MemoryCache memoryCache = MemoryCache.Default;
                return memoryCache.Get(key);
            }

            public bool Add(string key, object value, DateTimeOffset absExpiration)
            {
                MemoryCache memoryCache = MemoryCache.Default;
                return memoryCache.Add(key, value, absExpiration);
            }

            public void Delete(string key)
            {
                MemoryCache memoryCache = MemoryCache.Default;
                if (memoryCache.Contains(key))
                {
                    memoryCache.Remove(key);
                }
            }
        }

        public static User GetCurrentUser()
        {
            using (var db = new Remax_Entities()) {
                User user = null;
                ClaimsPrincipal currentClaim = HttpContext.Current.GetOwinContext().Authentication.User;
                if (currentClaim != null && currentClaim.Claims != null && currentClaim.Claims.Count() > 1)
                {
                    var sid = (from c in currentClaim.Claims.AsEnumerable()
                               where c.Type.EndsWith("/sid")
                               select c).FirstOrDefault();

                    Util.MemoryCacher memoryCacher = new Util.MemoryCacher();
                    var user_found_in_memory = memoryCacher.GetValue(sid.Value) as User;
                    if (user_found_in_memory != null) {
                        user = user_found_in_memory;
                    }
                    else { 
                        var user_found = (from u in db.Users
                                      where u.Id.ToString() == sid.Value
                                      select u).FirstOrDefault();
                        if (user_found != null)
                        {
                            user = user_found;
                            memoryCacher.Add(user.Id.ToString(), user, DateTime.Now.AddHours(8));
                        }
                    }
                    //foreach (var u in db.Users)
                    //{
                    //    if (u.Id.ToString() == sid.Value)
                    //    {
                    //        user = u; break;
                    //    }
                    //}
                }
                else
                {
                    throw new UnauthorizedAccessException("User login failed. Please login again.");
                }
                return user;
            }
        }

        public static int GetResourcePermission(string resource, ReourceOperations operation) {
            int highest_permission = 0;
            User currentUser = Util.GetCurrentUser();
            if (currentUser == null)
            {
                return highest_permission;
            }

            Guid? id = new Guid(currentUser.Id.ToString("D"));
            int ops = (int)operation;

            using (var db = new Remax_Entities()) {
                var permission = db.sp_ResourcePermission(id, resource, ops).ToList();


                foreach (var p in permission)
                {
                    if (p.Resource_Permission.HasValue && p.Resource_Permission.Value > highest_permission)
                        highest_permission = p.Resource_Permission.HasValue ? p.Resource_Permission.Value : highest_permission;
                }

                return highest_permission;
            }
        }

        public static DbEntityEntry GetUpdatedProperties(Object defaultObject, Object updateObject, DbEntityEntry dBEntityEntry)
        {
            List<PropertyInfo> differences = new List<PropertyInfo>();
            foreach (PropertyInfo property in defaultObject.GetType().GetProperties())
            {
                if (property.PropertyType.Name.Contains("collection") || property.PropertyType.Name.Contains("reference"))
                    continue;

                object value1 = property.GetValue(defaultObject, null);
                object value2 = property.GetValue(updateObject, null);

                try
                {
                    if ((value1 == null && value2 != null) || (value1 != null && value2 == null))
                        dBEntityEntry.Property(property.Name).IsModified = true;
                    else if (value1 == null && value2 == null)
                        dBEntityEntry.Property(property.Name).IsModified = false;
                    else
                        dBEntityEntry.Property(property.Name).IsModified = !value1.Equals(value2);
                }
                catch (Exception) { }
                
            }
            return dBEntityEntry;
        }
    }
}