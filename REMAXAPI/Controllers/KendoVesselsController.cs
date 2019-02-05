using System;
using System.Collections.Generic;
using System.IO;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Dynamic;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Reflection;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using REMAXAPI;
using REMAXAPI.Models;
using REMAXAPI.Models.Kendo;

namespace REMAXAPI.Controllers
{
    public class VesselView {
        public System.Guid Id { get; set; }
        public string IMO_No { get; set; }
        public string VesselName { get; set; }
        public System.Guid OwnerID { get; set; }
        public System.Guid OperatorID { get; set; }
        public Nullable<System.Guid> ShipTypeID { get; set; }
        public string ShipyardName { get; set; }
        public Nullable<System.Guid> ShipyardCountry { get; set; }
        public Nullable<System.DateTime> BuildYear { get; set; }
        public Nullable<System.DateTime> DeliveryToOwner { get; set; }
        public Nullable<System.Guid> ShipClassID { get; set; }
        public Nullable<decimal> DWT { get; set; }
        public Nullable<decimal> TotalPropulsionPower { get; set; }
        public Nullable<decimal> TotalGeneratorPower { get; set; }
        public Nullable<int> Status { get; set; }
        public System.Guid CreatedBy { get; set; }
        public System.DateTime CreatedOn { get; set; }
        public System.Guid ModifiedBy { get; set; }
        public System.DateTime ModifiedOn { get; set; }

        public string OperatorAccountName { get; set; }
        public Guid OperatorAccountId { get; set; }
        public string OwnerAccountName { get; set; }
        public Guid OwnerAccountId { get; set; }
        public string CountryName { get; set; }
        public Guid CountryId { get; set; }
        public List<EngineView> Engines { get; set; }
        public string ShipClassName { get; set; }
        public Guid ShipClassId { get; set; }
        public string ShipTypeName { get; set; }
        public Guid ShipTypeId { get; set; }
    }

    public class EngineView {
        public Guid Id { get; set; }
        public String SerialNo { get; set; }
        public EngineType EngineType { get; set; }
        public List<AlertView> Alerts { get; set; }
    }

    public class AlertView {
        public Guid Id { get; set; }
        public string AlertMessage { get; set; }
        public string AlertLevel { get; set; }
        public bool? Notified { get; set; }
        public DateTime? AlertTime { get; set; }
    }

    [Authorize]
    public class KendoVesselsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoVessels
        public async Task<KendoResponse> GetVessels([FromUri] KendoRequest kendoRequest)
        {
            int readLevel = Util.GetResourcePermission("Vessel", Util.ReourceOperations.Read);
            if (readLevel == 0) return new KendoResponse(0, null);

            User currentUser = Util.GetCurrentUser();

            List<VesselView> vessels = await (
                                                from v in db.Vessels
                                                join oa in db.Accounts on (v.OwnerAccount != null ? v.OwnerAccount.Id : Guid.Empty) equals oa.Id into v_oa
                                                join opa in db.Accounts on (v.OperatorAccount != null ? v.OperatorAccount.Id : Guid.Empty) equals opa.Id into v_opa
                                                join st in db.ShipTypes on (v.ShipType != null ? v.ShipType.Id : Guid.Empty) equals st.Id into v_st
                                                join sc in db.ShipClasses on (v.ShipClass != null ? v.ShipClass.Id : Guid.Empty) equals sc.Id into v_sc
                                                join c in db.Countries on (v.Country != null ? v.Country.Id : Guid.Empty) equals c.Id into v_c

                                                where
                                                // Login user is from Owing company
                                                ((v.OwnerID == currentUser.AccountID && readLevel == Util.AccessLevel.Own))
                                                ||
                                                // Login user is from Operating company
                                                ((v.OperatorID == currentUser.AccountID && readLevel == Util.AccessLevel.Own))
                                                ||
                                                // Admin user
                                                readLevel == Util.AccessLevel.All
                                                orderby v.VesselName ascending
                                                select new VesselView
                                                {
                                                    Id = v.Id,
                                                    IMO_No = v.IMO_No,
                                                    VesselName = v.VesselName,
                                                    OwnerID = v.OwnerID,
                                                    OperatorID = v.OperatorID,
                                                    ShipTypeID = v.ShipTypeID,
                                                    ShipyardName = v.ShipyardName,
                                                    ShipyardCountry = v.ShipyardCountry,
                                                    BuildYear = v.BuildYear,
                                                    DeliveryToOwner = v.DeliveryToOwner,
                                                    ShipClassID = v.ShipTypeID,
                                                    DWT = v.DWT,
                                                    TotalPropulsionPower = v.TotalPropulsionPower,
                                                    TotalGeneratorPower = v.TotalGeneratorPower,
                                                    Status = v.Status,
                                                    CreatedBy = v.CreatedBy,
                                                    CreatedOn = v.CreatedOn,
                                                    ModifiedBy = v.ModifiedBy,
                                                    ModifiedOn = v.ModifiedOn,
	                                                OperatorAccountId = (v.OperatorAccount!=null ? v.OperatorAccount.Id : Guid.Empty),
	                                                OperatorAccountName = (v.OperatorAccount!=null ? v.OperatorAccount.Name : String.Empty),
                                                    OwnerAccountId = (v.OwnerAccount!=null ? v.OwnerAccount.Id : Guid.Empty),
                                                    OwnerAccountName = (v.OwnerAccount!=null ? v.OwnerAccount.Name : String.Empty),
                                                    CountryId = (v.Country!=null ? v.Country.Id : Guid.Empty),
                                                    CountryName = (v.Country!=null ? v.Country.Name : String.Empty),
                                                    ShipClassId = (v.ShipClass!=null ? v.ShipClass.Id : Guid.Empty),
                                                    ShipClassName = (v.ShipClass!=null ? v.ShipClass.Name : String.Empty),
                                                    ShipTypeId = (v.ShipType!=null ? v.ShipType.Id : Guid.Empty),
                                                    ShipTypeName = (v.ShipType!=null ? v.ShipType.Name : String.Empty)
                                                }
                                            ).ToListAsync();

            foreach (var item in vessels)
            {
                item.Engines = await db.Engines
                            .Include("EngineType")
                            .Where(e => e.VesselID == item.Id)
                            .OrderBy(e=> e.SerialNo)
                            .Select(e=> new EngineView{
                                Id = e.Id,
                                SerialNo = e.SerialNo,
                                EngineType = e.EngineType
                            })
                            .ToListAsync();

                foreach (var e in item.Engines)
                {
                    DateTime today = Util.GetToday();
                    DateTime endOfToday = today.AddDays(1).AddMilliseconds(-1);
                    e.Alerts = await db.Alerts
                                .Where(a => a.AlertTime >= today && a.AlertTime <= endOfToday && a.EngineId == e.Id)
                                .Select(a => new AlertView
                                {
                                    Id = a.Id,
                                    AlertMessage = a.AlertMessage,
                                    AlertLevel = a.AlertLevelValue,
                                    Notified = a.Notified,
                                    AlertTime = a.AlertTime
                                })
                                .ToListAsync();
                }
            }
            
            //loading related entites
            //vessels = vessels.Include("OwnerAccount")
            //                .Include("OperatorAccount")
            //                .Include("ShipType")
            //                .Include("ShipClass")
            //                .Include("Country")
            //                .Include("Engines")
            //                .Include("Engines.EngineType");

            // total count
            var total = vessels.Count();

            // filtering
            if (kendoRequest.filter != null && kendoRequest.filter.Filters != null && kendoRequest.filter.Filters.Count() > 0)
            {
                IEnumerable<DataFilter> filters = kendoRequest.filter.Filters;
                string strWhere = string.Empty;
                foreach (var f in filters)
                {
                    string whereFormat = DataFilterOperators.Operators[f.Operator];
                    if (!string.IsNullOrEmpty(whereFormat))
                    {
                        vessels = vessels.Where(string.Format(whereFormat, f.Field, f.Value)).ToList();
                    }
                }
            }

            // sorting
            string strOrderBy = string.Empty;
            if (kendoRequest.sort != null && kendoRequest.sort.Length > 0)
            {
                foreach (var s in kendoRequest.sort)
                {
                    strOrderBy += string.Format("{0} {1},", s.Field, s.Dir);
                }

                if (strOrderBy.Length > 0 && strOrderBy.EndsWith(","))
                    strOrderBy = strOrderBy.Remove(strOrderBy.Length - 1); //Removing last comma
            }
            if (strOrderBy == string.Empty) strOrderBy = "1"; //Sort Noting

            var sortedVessels = vessels.OrderBy(strOrderBy);

            // filtereding

            // take single page data
            if (kendoRequest.take == 0) kendoRequest.take = total;
            object[] data = sortedVessels.Skip(kendoRequest.skip).Take(kendoRequest.take).ToArray<object>();

            return new KendoResponse(total, data);
        }

        // GET: api/KendoVessels/5
        [ResponseType(typeof(Vessel))]
        public async Task<IHttpActionResult> GetVessel(Guid id)
        {
            Vessel vessel = await db.Vessels.FindAsync(id);
            if (vessel == null)
            {
                return NotFound();
            }

            return Ok(vessel);
        }

        // PUT: api/KendoVessels/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutVessel(Guid id, Vessel vessel)
        {
            int writeLevel = Util.GetResourcePermission("Vessel", Util.ReourceOperations.Write);
            if (writeLevel != 2) {
                ModelState.AddModelError("Access Level", "Unauthorized update access.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != vessel.Id)
            {
                return BadRequest();
            }


            DbEntityEntry entry = db.Entry(vessel);
            entry.State = EntityState.Modified;

            // Marking properties to update by compareing default object
            Vessel defaultVessel = new Vessel();
            entry = Util.GetUpdatedProperties(defaultVessel, vessel, entry);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VesselExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/KendoVessels
        [ResponseType(typeof(Vessel))]
        public async Task<IHttpActionResult> PostVessel(Vessel vessel)
        {
            int writeLevel = Util.GetResourcePermission("Vessel", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized create access.");
            }
            var ves = db.Vessels.Where(v => v.IMO_No == vessel.IMO_No).FirstOrDefault();
            if (ves != null) ModelState.AddModelError("Duplicate", "Duplicate IMO Number.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            db.Vessels.Add(vessel);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = vessel.Id }, vessel);
        }

        // DELETE: api/KendoVessels/5
        [ResponseType(typeof(Vessel))]
        public async Task<IHttpActionResult> DeleteVessel(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Vessel", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            Vessel vessel = await db.Vessels.FindAsync(id);
            if (vessel == null)
            {
                return NotFound();
            }

            db.Vessels.Remove(vessel);
            await db.SaveChangesAsync();

            return Ok(vessel);
        }

        [Route("api/KendoVessels/UploadPhoto")]
        public async Task<HttpResponseMessage> UploadPhotoVessel(string fileName) {
            HttpRequestMessage request = this.Request;
            if (!request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            string root = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/VesselPhotos");
            MultipartFormDataStreamProvider provider = new MultipartFormDataStreamProvider(root);

             var task = await request.Content.ReadAsMultipartAsync(provider).
                ContinueWith<HttpResponseMessage>(o =>
                {
                    string oldFilePath = provider.FileData.First().LocalFileName;
                    string newFilePath = Path.GetDirectoryName(oldFilePath) + @"\" + fileName;
                    if (File.Exists(newFilePath)) File.Delete(newFilePath);
                    File.Move(oldFilePath, newFilePath);
                    // this is the file name on the server where the file was saved 
                    return new HttpResponseMessage()
                    {
                        StatusCode = HttpStatusCode.OK
                    };
                }
            );
            return task;
        }

        [Route("api/KendoVessels/GetPhoto")]
        [AllowAnonymous]
        public string GetPhoto(string fileName)
        {
            string root = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/VesselPhotos");
            string path = root + @"\" + fileName;
            string content = "R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
            if (File.Exists(path)) {
                byte[] b = System.IO.File.ReadAllBytes(path);
                content = Convert.ToBase64String(b);
            }
            
            return "data:image/png;base64," + content;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool VesselExists(Guid id)
        {
            return db.Vessels.Count(e => e.Id == id) > 0;
        }
    }
}