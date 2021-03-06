﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Owin;
using Microsoft.Owin.Security.OAuth;
using Owin;

using REMAXAPI.Provider;
using System.Web.Http.Owin;
using Microsoft.Owin.Security.Cookies;

namespace REMAXAPI
{
    public partial class Startup
    {
        public static OAuthAuthorizationServerOptions OAuthOptions { get; private set; }

        static Startup()
        {
            OAuthOptions = new OAuthAuthorizationServerOptions
            {
                TokenEndpointPath = new PathString("/token"),
                //Provider = new OAuthAppProvider(),
                Provider = new SimpleAuthorizationServerProvider(),
                AccessTokenExpireTimeSpan = TimeSpan.FromDays(2),
                AllowInsecureHttp = true,
                AuthorizationCodeExpireTimeSpan = new TimeSpan(1,0,0),
                //RefreshTokenProvider = new OAuthRefreshTokenProvider()
                RefreshTokenProvider = new SimpleRefreshTokenProvider()
            };
        }

        public void ConfigureAuth(IAppBuilder app)
        {
            app.UseOAuthBearerTokens(OAuthOptions);
        }
    }
}