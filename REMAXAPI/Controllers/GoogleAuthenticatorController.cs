using System;
using System.Collections.Generic;
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
        private const string Key = "drumsdrumsdrumsdrums";

        [HttpPost]
        [HttpGet]
        [AllowAnonymous]
        [Route("api/GoogleAuthenticator/Verify/{passcode}")]
        public async Task<IHttpActionResult> Verify(string passcode)
        {
            var token = passcode;
            var authenticator = new TwoFactorAuthenticator();
            var ticks = new DateTime().AddMinutes(5).Ticks; // Time Tolerance is 5 minutes
            var isValid = authenticator.ValidateTwoFactorPIN(Key, token, new TimeSpan(ticks));
            if (isValid)
            {
                return Ok();
            }
            return Content(HttpStatusCode.BadRequest, "Invalid passcode");
        }

        [HttpPost]
        [HttpGet]
        [AllowAnonymous]
        [Route("api/GoogleAuthenticator/Login")]
        public async Task<IHttpActionResult> Login()
        {
            var authenticator = new TwoFactorAuthenticator();
            var result = authenticator.GenerateSetupCode("Daikai", "DRUMS", Key, 300, 300);
            return Ok(result.QrCodeSetupImageUrl);
        }
    }
}
