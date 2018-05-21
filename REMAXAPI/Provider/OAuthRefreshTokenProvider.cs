using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Infrastructure;
using Microsoft.Owin.Security.OAuth;
using REMAXAPI;
using REMAXAPI.Models;
using REMAXAPI.Service;

namespace REMAXAPI.Provider
{
    public class OAuthRefreshTokenProvider : AuthenticationTokenProvider
    {
        private int _tokenExpiration = 1440;

        public OAuthRefreshTokenProvider(){
            if (ConfigurationManager.AppSettings.AllKeys.Contains("TokenExpiration"))
            {
                _tokenExpiration = Convert.ToInt32(ConfigurationManager.AppSettings["TokenExpiration"]);
            }
        }

        public override void Create(AuthenticationTokenCreateContext context)
        {
            int expire = _tokenExpiration;

            // Expiration time in seconds
            context.Ticket.Properties.ExpiresUtc = new DateTimeOffset(DateTime.Now.AddMinutes(expire));
            context.SetToken(context.SerializeTicket());
        }

        public override void Receive(AuthenticationTokenReceiveContext context)
        {
            context.DeserializeTicket(context.Token);
        }
    }
}