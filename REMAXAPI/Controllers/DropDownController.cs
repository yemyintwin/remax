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
    [Authorize]
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

        [HttpGet]
        [Route("api/DropDown/ListAllVessels")]
        public Object ListAllVessels()
        {
            int readLevel = Util.GetResourcePermission("Vessel", Util.ReourceOperations.Read);
            if (readLevel == 0) return new KendoResponse(0, null);

            User currentUser = Util.GetCurrentUser();

            Object[] objects = (
                                    from v in db.Vessels
                                    where
                                        // Login user is from Owing company
                                        ((v.OwnerID == currentUser.AccountID && readLevel == Util.AccessLevel.Own))
                                        ||
                                        // Login user is from Operating company
                                        ((v.OperatorID == currentUser.AccountID && readLevel == Util.AccessLevel.Own))
                                        ||
                                        // Admin user
                                        readLevel == Util.AccessLevel.All
                                    select new
                                    {
                                        v.Id,
                                        Name =  v.VesselName + ( string.IsNullOrEmpty(v.IMO_No)?"":" - " + v.IMO_No )
                                    }
                                ).ToArray<object>();
            return objects;
        }

        [HttpGet]
        [Route("api/DropDown/ListAllModels")]
        public Object ListAllModels()
        {
            Object[] objects = (from m in db.Models
                                orderby m.Name
                                select new
                                {
                                    m.Id,
                                    m.Name,
                                    m.EngineTypeID
                                }).ToArray<object>();
            return objects;
        }
        
        [HttpGet]
        [Route("api/DropDown/ListAllEngineTypes")]
        public Object ListAllEngineTypes()
        {
            Object[] objects = (from e in db.EngineTypes
                                orderby e.Name
                                select new
                                {
                                    e.Id,
                                    e.Name
                                }).ToArray<object>();
            return objects;
        }

        [HttpGet]
        [Route("api/DropDown/ListAllAlternatorMakers")]
        public Object ListAllAlternatorMakers()
        {
            Object[] objects = (from a in db.AlternatorMakers
                                orderby a.Name
                                select new
                                {
                                    a.Id,
                                    a.Name
                                }).ToArray<object>();
            return objects;
        }

        [HttpGet]
        [Route("api/DropDown/ListAllChartTypes")]
        public Object ListAllChartTypes()
        {
            Object[] objects = (from c in db.ChartTypes
                                orderby c.Name
                                select new
                                {
                                    Id = c.Id,
                                    Name = c.Name
                                }).ToArray<object>();
            return objects;
        }

        [HttpGet]
        [Route("api/DropDown/ListAllOptionSetGroup")]
        public Object ListAllOptionSetGroup()
        {
            Object[] objects = (from osg in db.OptionSetGroups
                                orderby osg.Name
                                select new
                                {
                                    osg.Id,
                                    osg.Name
                                }).ToArray<object>();
            return objects;
        }

        [HttpGet]
        [Route("api/DropDown/ListAllOptionSetById")]
        public Object ListAllOptionSetById(Guid groupid)
        {
            if (groupid == null) groupid = Guid.Empty;

            Object[] objects = (from os in db.OptionSets
                                where os.GroupId.Equals(groupid)
                                orderby os.Name
                                select new
                                {
                                    Id = os.Value,
                                    Name = os.Name
                                }).ToArray<object>();
            return objects;
        }

        [HttpGet]
        [Route("api/DropDown/ListAllOptionSetByName")]
        public Object ListAllOptionSetByName(string groupname)
        {
            if (string.IsNullOrWhiteSpace(groupname)) return new object();

            Object[] objects = (from os in db.OptionSets
                                join osg in db.OptionSetGroups on os.GroupId equals osg.Id 
                                where osg.Name.ToLower() == groupname.ToLower()
                                orderby os.Name
                                select new
                                {
                                    Id = os.Value,
                                    Name = os.Name
                                }).ToArray<object>();
            return objects;
        }
    }
}
