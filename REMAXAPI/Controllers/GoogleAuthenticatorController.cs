using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Google.Authenticator;

namespace REMAXAPI.Controllers
{
    public class GoogleAuthenticatorController : ApiController
    {
        private string Key = "qwerty123456asdfgh";

        [HttpPost]
        [HttpGet]
        [AllowAnonymous]
        [Route("api/GoogleAuthenticator/Verify/{passcode}")]
        public async Task<IHttpActionResult> Verify(string passcode)
        {
            if (ConfigurationManager.AppSettings.AllKeys.Contains("Key")) {
                this.Key = ConfigurationManager.AppSettings["Key"].ToString();
            }

            var token = passcode;
            var authenticator = new TwoFactorAuthenticator();
            var ticks = new DateTime().AddMinutes(2).Ticks; // Time Tolerance is 2 minutes
            var isValid = authenticator.ValidateTwoFactorPIN(Key, token, new TimeSpan(ticks));
            if (isValid)
            {
                return Ok();
            }
            return Content(HttpStatusCode.BadRequest, "Invalid passcode");
        }

        [HttpPost]
        [HttpGet]
        [Route("api/GoogleAuthenticator/GetQRCodeURL")]
        public async Task<IHttpActionResult> GetQRCodeURL()
        {
            var authenticator = new TwoFactorAuthenticator();
            var result = authenticator.GenerateSetupCode("Daikai", "DRUMS", Key, 300, 300);
            return Ok(result.QrCodeSetupImageUrl);
        }
    }
}
