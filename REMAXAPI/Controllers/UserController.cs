using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Net.Http;
using System.Security.Claims;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using Microsoft.Owin.Security.OAuth;
using System.Data.Linq;
using REMAXAPI.Models;
using Newtonsoft.Json;
using System.Web.Http.Description;
using System.Threading.Tasks;
using com.ymw.security;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Configuration;

namespace REMAXAPI.Controllers
{
    public class UserController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        [HttpPost]
        [HttpGet]
        [AllowAnonymous]
        [Route("api/User/GetCurrentUser")]
        public object GetCurrentUser()
        {
            User user = null;
            ClaimsPrincipal currentClaim = HttpContext.Current.GetOwinContext().Authentication.User;
            if (currentClaim != null && currentClaim.Claims != null && currentClaim.Claims.Count() > 1)
            {
                var sid = (from c in currentClaim.Claims.AsEnumerable()
                           where c.Type.EndsWith("/sid")
                           select c).FirstOrDefault();

                //var user_found = db.Users.Where(u => u.Id.ToString() == sid.Value).FirstOrDefault();
                var user_found = (from u in db.Users
                                  where u.Id.ToString() == sid.Value
                                  select u)
                                  .Include("Account")
                                  .Include("UserRoles")
                                  .Include("UserLogins")
                                  .Include("UserClaims")
                                  .FirstOrDefault();
                if (user_found != null) user = user_found; 
            }
            return user;
        }

        [HttpPost]
        [HttpGet]
        [AllowAnonymous]
        [Route("api/User/GetCurrentUserTimeZone")]
        public object GetCurrentUserTimeZone()
        {
            CountryTimezone ctz = null;
            ClaimsPrincipal currentClaim = HttpContext.Current.GetOwinContext().Authentication.User;
            if (currentClaim != null && currentClaim.Claims != null && currentClaim.Claims.Count() > 1)
            {
                var sid = (from c in currentClaim.Claims.AsEnumerable()
                           where c.Type.EndsWith("/sid")
                           select c).FirstOrDefault();

                var user_found = db.Users.Where(u => u.Id.ToString() == sid.Value).FirstOrDefault();
                if (user_found != null && user_found.Country.HasValue) {
                    var timezone = (from tz in db.CountryTimezones
                                    join c in db.Countries on tz.CountryCode equals c.Code
                                    where c.Id == user_found.Country.Value
                                    select tz).FirstOrDefault();
                    if (timezone != null) ctz = timezone;
                }
                
            }
            return ctz;
        }

        [HttpGet]
        [ResponseType(typeof(User))]
        [Authorize]
        public async Task<IHttpActionResult> UserPasswordReset(Guid id)
        {
            User user = db.Users.Where(u => u.Id == id).FirstOrDefault();
            if (user != null)
            {
                string emailHost = ConfigurationManager.AppSettings["EmailHost"];
                string emailPort = ConfigurationManager.AppSettings["EmailPort"];
                string emailSSL = ConfigurationManager.AppSettings["EmailSSL"];
                string emailAddr = ConfigurationManager.AppSettings["EmailAddress"];
                string emailName = ConfigurationManager.AppSettings["EmailName"];
                string emailPwd = ConfigurationManager.AppSettings["EmailPwd"];

                string pwd = System.Web.Security.Membership.GeneratePassword(8, 3);

                var fromAddress = new MailAddress(emailAddr, emailName);
                var toAddress = new MailAddress(user.Email, user.FullName);
                string fromPassword = emailPwd;
                string subject = "Security Update - Password Reset";
                string body = string.Format("This is your new password >>>> \t {0}", pwd);

                var smtp = new SmtpClient
                {
                    Host = emailHost,
                    Port = int.Parse(emailPort),
                    EnableSsl = bool.Parse(emailSSL),
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(fromAddress.Address, fromPassword)
                };
                using (var message = new MailMessage(fromAddress, toAddress)
                {
                    Subject = subject,
                    Body = body
                })
                {
                    byte[] hashBytes = new PasswordHash(pwd).ToArray();
                    string strBase64 =  Util.ByteArrayToString(hashBytes);
                    user.PasswordHash = strBase64;

                    DbEntityEntry entry = db.Entry(user);
                    entry.State = EntityState.Modified;

                    // Marking properties to update by compareing default object
                    User defaultUser = new User();
                    entry = Util.GetUpdatedProperties(defaultUser, user, entry);

                    try
                    {
                        await db.SaveChangesAsync();
                        await smtp.SendMailAsync(message);
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        if (!UserExists(id))
                        {
                            return NotFound();
                        }
                        else
                        {
                            throw;
                        }
                    }
                    catch (Exception) {
                        throw;
                    }
                }
                return Ok(user);
            }
            else
            {
                return InternalServerError(new Exception("User ID not found."));
            }
        }

        public class PasswordChangeData {
            public Guid Id { get; set; }
            public string OldPwd { get; set; }
            public string NewPwd { get; set; }
        }

        [HttpPost]
        [Authorize]
        [Route("api/User/UserPasswordChange")]
        public async Task<IHttpActionResult> UserPasswordChange(PasswordChangeData passwordChangeData)
        {
            //PasswordChangeData passwordChangeData = JsonConvert.DeserializeObject<PasswordChangeData>(body);

            User user = db.Users.Where(u => u.Id == passwordChangeData.Id).FirstOrDefault();
            if (user != null)
            {
                byte[] hashBytes = Util.StringToByteArray(user.PasswordHash);
                PasswordHash hash = new PasswordHash(hashBytes);
                if (!hash.Verify(passwordChangeData.OldPwd)) {
                    return InternalServerError(new Exception("Incorrect current password"));
                }

                hashBytes = new PasswordHash(passwordChangeData.NewPwd).ToArray();
                string strBase64 = Util.ByteArrayToString(hashBytes);
                user.PasswordHash = strBase64;

                DbEntityEntry entry = db.Entry(user);
                entry.State = EntityState.Modified;

                // Marking properties to update by compareing default object
                User defaultUser = new User();
                entry = Util.GetUpdatedProperties(defaultUser, user, entry);

                try
                {
                    await db.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!UserExists(passwordChangeData.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                catch (Exception)
                {
                    throw;
                }

                return Ok(user);
            }
            else
            {
                return InternalServerError(new Exception("User ID not found."));
            }
        }

        private bool UserExists(Guid id)
        {
            return db.Users.Count(e => e.Id == id) > 0;
        }
    }

}
