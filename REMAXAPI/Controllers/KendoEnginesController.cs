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
    [Authorize]
    public class KendoEnginesController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoEngines
        public KendoResponse GetEngines([FromUri] KendoRequest kendoRequest)
        {
            int readLevel = Util.GetResourcePermission("Engine", Util.ReourceOperations.Read);
            if (readLevel == 0) return new KendoResponse(0, null);

            User currentUser = Util.GetCurrentUser();

            IQueryable<Object> engines = from e in db.Engines
                                         join v in db.Vessels
                                            on e.VesselID equals v.Id 
                                         where
                                          // Login user is from Owing company
                                          ((v.OwnerID == currentUser.AccountID && readLevel == Util.AccessLevel.Own))
                                          ||
                                          // Login user is from Operating company
                                          ((v.OperatorID == currentUser.AccountID && readLevel == Util.AccessLevel.Own))
                                          ||
                                          // Admin user
                                          readLevel == Util.AccessLevel.All
                                         select e;

            //loading related entites
            engines = engines.Include("AlternatorMaker")
                        .Include("EngineType")
                        .Include("Model")
                        .Include("Vessel");

            // total count
            var total = engines.Count();
  
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
                        engines = engines.Where(string.Format(whereFormat, f.Field, f.Value));
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

            var sortedEngines = engines.OrderBy(strOrderBy);

            // filtereding

            // take single page data
            if (kendoRequest.take == 0) kendoRequest.take = total;
            object[] data = sortedEngines.Skip(kendoRequest.skip).Take(kendoRequest.take).ToArray<object>();

            return new KendoResponse(total, data);
        }

        // GET: api/KendoEngines/5
        [ResponseType(typeof(Engine))]
        public async Task<IHttpActionResult> GetEngine(Guid id)
        {
            Engine engine = await db.Engines.FindAsync(id);
            if (engine == null)
            {
                return NotFound();
            }

            return Ok(engine);
        }

        // PUT: api/KendoEngines/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutEngine(Guid id, Engine engine)
        {
            int writeLevel = Util.GetResourcePermission("Engine", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized update access.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != engine.Id)
            {
                return BadRequest();
            }


            DbEntityEntry entry = db.Entry(engine);
            entry.State = EntityState.Modified;

            // Marking properties to update by compareing default object
            Engine defaultEngine = new Engine();
            entry = Util.GetUpdatedProperties(defaultEngine, engine, entry);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EngineExists(id))
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

        // POST: api/KendoEngines
        [ResponseType(typeof(Engine))]
        public async Task<IHttpActionResult> PostEngine(Engine engine)
        {
            int writeLevel = Util.GetResourcePermission("Engine", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized create access.");
            }
            var ves = db.Engines.Where(e => e.SerialNo == engine.SerialNo).FirstOrDefault();
            if (ves != null) ModelState.AddModelError("Duplicate", "Duplicate Enginer Serial Number.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Engines.Add(engine);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = engine.Id }, engine);
        }

        // DELETE: api/KendoEngines/5
        [ResponseType(typeof(Engine))]
        public async Task<IHttpActionResult> DeleteEngine(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Engine", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            Engine engine = await db.Engines.FindAsync(id);
            if (engine == null)
            {
                return NotFound();
            }

            db.Engines.Remove(engine);
            await db.SaveChangesAsync();

            return Ok(engine);
        }

        [Route("api/KendoEngines/UploadPhoto")]
        public async Task<HttpResponseMessage> UploadPhotoVessel(string fileName)
        {
            HttpRequestMessage request = this.Request;
            if (!request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            string root = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/EnginePhotos");
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

        [Route("api/KendoEngines/GetPhoto")]
        [AllowAnonymous]
        public string GetPhoto(string fileName)
        {
            string root = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/EnginePhotos");
            string path = root + @"\" + fileName;
            string content = "R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
            if (File.Exists(path))
            {
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

        private bool EngineExists(Guid id)
        {
            return db.Engines.Count(e => e.Id == id) > 0;
        }
    }
}