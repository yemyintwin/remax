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
    //[Authorize]
    public class KendoVesselsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoVessels
        public KendoResponse GetVessels([FromUri] KendoRequest kendoRequest)
        {
            int readLevel = Util.GetResourcePermission("Vessel", Util.ReourceOperations.Read);
            if (readLevel == 0) return new KendoResponse(0, null);

            User currentUser = Util.GetCurrentUser();

            IQueryable<Object> vessels = from v in db.Vessels
                                          where
                                           // Login user is from Owing company
                                           ((v.OwnerID == currentUser.AccountID.Value && readLevel == Util.AccessLevel.Own))
                                           ||
                                           // Login user is from Operating company
                                           ((v.OperatorID == currentUser.AccountID.Value && readLevel == Util.AccessLevel.Own))
                                           ||
                                           // Admin user
                                           readLevel == Util.AccessLevel.All
                                          select v;

            //loading related entites
            vessels = vessels.Include("OwnerAccount")
                            .Include("OperatorAccount")
                            .Include("ShipType")
                            .Include("ShipClass")
                            .Include("Country")
                            .Include("Engines")
                            .Include("Engines.EngineType");

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
                        vessels = vessels.Where(string.Format(whereFormat, f.Field, f.Value));
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