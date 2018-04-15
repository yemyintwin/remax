﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using REMAXAPI;
using REMAXAPI.Models;
using REMAXAPI.Service;

namespace REMAXAPI.Provider
{
    public class OAuthAppProvider:OAuthAuthorizationServerProvider
    {
        public override Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {
            return Task.Factory.StartNew(()=> {
                var username = context.UserName; // User name is email.
                var password = context.Password;
                var userService = new UserService();

                User user = userService.GetUserByCredentials(username, password);
                if (user != null) {
                    var claims = new List<Claim>() {
                        new Claim(ClaimTypes.Name, user.Name),
                        new Claim(ClaimTypes.Sid, user.Id.ToString()),
                        new Claim(ClaimTypes.Email, user.Email)
                    };

                    ClaimsIdentity oAuthIdentity = new ClaimsIdentity(claims, Startup.OAuthOptions.AuthenticationType);
                    context.Validated(new AuthenticationTicket(oAuthIdentity, new AuthenticationProperties() { }));
                }
                else {
                    context.SetError("invalid_grant", "The user name or password is incorrect");
                }
            });
        }

        public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            if (context.ClientId == null) {
                context.Validated();
            }
            return Task.FromResult<object>(null);
        }
    }
}