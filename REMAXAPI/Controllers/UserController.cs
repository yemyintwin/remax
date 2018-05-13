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

namespace REMAXAPI.Controllers
{
    public class UserController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        [HttpPost]
        [HttpGet]
        [AllowAnonymous]
        public object GetCurrentUser()
        {
            Object user = null;
            ClaimsPrincipal currentClaim = HttpContext.Current.GetOwinContext().Authentication.User;
            if (currentClaim != null && currentClaim.Claims != null && currentClaim.Claims.Count() > 1)
            {
                var sid = (from c in currentClaim.Claims.AsEnumerable()
                           where c.Type.EndsWith("/sid")
                           select c).FirstOrDefault();

                //var user_found = db.Users.Where(u => u.Id.ToString() == sid.Value).FirstOrDefault();
                var user_found = (from u in db.Users
                                  where u.Id.ToString() == sid.Value
                                  select new
                                  {
                                      u.Id,
                                      u.FullName,
                                      u.Email
                                  }).FirstOrDefault();
                if (user_found != null) user = user_found; 
            }
            return user;
        }

        [HttpGet]
        [ResponseType(typeof(User))]
        public async Task<IHttpActionResult> UserPasswordReset(Guid id)
        {
            User currentUser = Util.GetCurrentUser();
            if (currentUser == null)
            {
                return InternalServerError(new Exception(Messages.AnonymousUserDetected));
            }

            var permission = db.sp_ResourcePermission(currentUser.Id, "Password Reset", 4);


            User user = db.Users.Where(u => u.Id == id).FirstOrDefault();
            if (user != null)
            {
                string pwd = "mypassword";//System.Web.Security.Membership.GeneratePassword(8, 3);

                var fromAddress = new MailAddress("yemyintwin@gmail.com", "Ye Myint Win");
                var toAddress = new MailAddress(user.Email, user.FullName);
                string fromPassword = "Ros3_215u";
                string subject = "Security Update";
                string body = string.Format("This is your new password. {0}", pwd);

                var smtp = new SmtpClient
                {
                    Host = "smtp.gmail.com",
                    Port = 587,
                    EnableSsl = true,
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
                    db.Entry(user).State = EntityState.Modified;

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

        private bool UserExists(Guid id)
        {
            return db.Users.Count(e => e.Id == id) > 0;
        }
    }

}
