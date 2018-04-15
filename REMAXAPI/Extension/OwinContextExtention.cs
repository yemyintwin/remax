using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Owin;

namespace REMAXAPI.Extension
{
    public static class OwinContextExtention
    {
        public static string GetUserId(this IOwinContext ctx) {
            var result = "-1";
            var claim = ctx.Authentication.User.Claims.FirstOrDefault(c => c.Type == "UserID");
            if (claim!= null){
                result = claim.Value;
            }
            return result;
        }
    }
}