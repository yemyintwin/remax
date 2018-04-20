﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web;
using System.Web.Http;
using Microsoft.Owin.Security.OAuth;
using System.Data.Linq;
using REMAXAPI.Models;


namespace REMAXAPI.Controllers
{
    // This controller is an empty controller for authentication purpose

    public class TokenController : ApiController
    {
        [HttpPost]
        [HttpGet]
        public User GetCurrentUser() {
            User user = null;
            ClaimsPrincipal currentClaim = HttpContext.Current.GetOwinContext().Authentication.User;
            if (currentClaim != null && currentClaim.Claims != null && currentClaim.Claims.Count() > 1) {
                var sid = (from c in currentClaim.Claims.AsEnumerable()
                            where c.Type.EndsWith("/sid")
                            select c).FirstOrDefault();

                Remax_Entities entities = new Remax_Entities();
                var user_found = entities.Users.Where(u => u.Id.ToString() == sid.Value).FirstOrDefault();
                user = user_found as User;
                if (user != null) user.PasswordHash = "****";
            } 
            return user;
        }
    }
}
