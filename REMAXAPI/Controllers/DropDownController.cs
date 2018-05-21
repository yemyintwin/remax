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

        // GET: api/DropDown/ListAllAccounts
        [HttpGet]
        [Route("api/DropDown/ListAllAccounts")]
        public Object ListAllAccounts()
        {
            Object[] objects = (from a in db.Accounts
                                orderby a.Name
                                   select new {
                                       a.Id,
                                       a.Name
                                   }).ToArray<object>();
            return objects;
        }

        // GET: api/DropDown/ListAllCountry
        [HttpGet]
        [Route("api/DropDown/ListAllCountry")]
        public Object ListAllCountry()
        {
            Object[] objects = (from c in db.Countries
                                orderby c.Name
                                select new
                                {
                                    c.Id,
                                    c.Name
                                }).ToArray<object>();
            return objects;
        }

        // GET: api/DropDown/ListAllShipType
        [HttpGet]
        [Route("api/DropDown/ListAllShipType")]
        public Object ListAllShipType()
        {
            Object[] objects = (from s in db.ShipTypes
                                orderby s.Name
                                select new
                                {
                                    s.Id,
                                    s.Name
                                }).ToArray<object>();
            return objects;
        }

        // GET: api/DropDown/ListAllShipClass
        [HttpGet]
        [Route("api/DropDown/ListAllShipClass")]
        public Object ListAllShipClass()
        {
            Object[] objects = (from c in db.ShipClasses
                                orderby c.Name
                                select new
                                {
                                    c.Id,
                                    c.Name
                                }).ToArray<object>();
            return objects;
        }
    }
}
