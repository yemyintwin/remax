using REMAXAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Web;

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
        private static Remax_Entities db = new Remax_Entities();

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

        public static User GetCurrentUser()
        {
            User user = null;
            ClaimsPrincipal currentClaim = HttpContext.Current.GetOwinContext().Authentication.User;
            if (currentClaim != null && currentClaim.Claims != null && currentClaim.Claims.Count() > 1)
            {
                var sid = (from c in currentClaim.Claims.AsEnumerable()
                           where c.Type.EndsWith("/sid")
                           select c).FirstOrDefault();

                //var user_found = db.Users.Where(u => u.Id.ToString() == sid.Value).FirstOrDefault();
                //var user_found = (from u in db.Users
                //                  where u.Id.ToString().Contains(sid.Value)
                //                  select user).FirstOrDefault();

                foreach (var u in db.Users)
                {
                    if (u.Id.ToString() == sid.Value)
                    {
                        user = u; break;
                    }
                }
            }
            return user;
        }
    }
}