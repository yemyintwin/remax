using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Results;
using System.Web.Http.Description;
using REMAXAPI.Models;
using REMAXAPI.Models.Kendo;
using System.Threading.Tasks;
using System.Data.Entity.Infrastructure;
using System.Data.Entity;

namespace REMAXAPI.Controllers
{
    public class KendoInlineGearboxModelsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        [HttpGet]
        [Route("api/KendoInlineGearboxModelsTotal")]
        // GET: api/KendoInlineShipClassesTotal
        public int GetKendoInlineGearboxModelsTotal()
        {
            return db.GearboxModels.Count();
        }

        // GET: api/KendoInlineGearboxModels
        public IHttpActionResult GetGearboxModels([FromUri]KendoRequestInline kendoRequestInline)
        {
            IEnumerable<GearboxModel> result = db.GearboxModels.OrderBy(a => a.Name);

            result = result.Skip(kendoRequestInline.Skip).Take(kendoRequestInline.Take);

            return Ok(result);
        }

        // GET: api/KendoInlineGearboxModels/5
        [ResponseType(typeof(GearboxModel))]
        public async Task<IHttpActionResult> GetGearboxModel(Guid id)
        {
            GearboxModel gearboxModel = await db.GearboxModels.FindAsync(id);
            if (gearboxModel == null)
            {
                return NotFound();
            }

            return Ok(gearboxModel);
        }

        // PUT: api/KendoInlineGearboxModels/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutGearboxModel(Guid id, GearboxModel gearboxModel)
        {
            int writeLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != gearboxModel.Id)
            {
                return BadRequest();
            }

            db.Entry(gearboxModel).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GearboxModelExists(id))
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

        // POST: api/KendoInlineGearboxModels
        [ResponseType(typeof(GearboxModel))]
        public async Task<IHttpActionResult> PostGearboxModel(GearboxModel gearboxModel)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
            }

            var foundDup = db.GearboxModels.Where(a => a.Name == gearboxModel.Name).FirstOrDefault();
            if (foundDup != null)
            {
                ModelState.AddModelError("Found Duplicate", "Duplicate gearbox model found.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.GearboxModels.Add(gearboxModel);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (GearboxModelExists(gearboxModel.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = gearboxModel.Id }, gearboxModel);
        }

        // DELETE: api/KendoInlineGearboxModels/5
        [ResponseType(typeof(GearboxModel))]
        public async Task<IHttpActionResult> DeleteGearboxModel(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            GearboxModel gearboxModel = await db.GearboxModels.FindAsync(id);
            if (gearboxModel == null)
            {
                return NotFound();
            }

            db.GearboxModels.Remove(gearboxModel);
            await db.SaveChangesAsync();

            return Ok(gearboxModel);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GearboxModelExists(Guid id)
        {
            return db.GearboxModels.Count(e => e.Id == id) > 0;
        }
    }
}