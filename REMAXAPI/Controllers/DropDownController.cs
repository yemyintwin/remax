using REMAXAPI.Models;
using REMAXAPI.Models.Kendo;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Dynamic;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Net.Http;

namespace REMAXAPI.Controllers
{
    public class DropDownController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/DropDown
        [HttpGet]
        public Object ListAllAccounts()
        {
            Object[] objects = (from a in db.Accounts
                                   select new {
                                       a.Id,
                                       a.Name
                                   }).ToArray<object>();
            return objects;
        }
    }
}
