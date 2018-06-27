using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using REMAXAPI.Models;

namespace REMAXAPI.Controllers
{
    public class KendoGearboxModelsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoGearboxModels
        public IQueryable<Object> GetGearboxModels([FromUri]PageParameterModel page)
        {
            int skip = 0;
            string strSorting = PageParameterModel.GetSortingString(page, "Name", out skip);

            var gearboxModels = (from m in db.GearboxModels
                          orderby (strSorting)
                          select new
                          {
                              m.Id,
                              m.Name
                          }
                           ).Skip(skip).Take(page.pageSize);
            return gearboxModels;
        }

        // GET: api/KendoGearboxModels/5
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

        // PUT: api/KendoGearboxModels/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutGearboxModel(Guid id, GearboxModel gearboxModel)
        {
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

        // POST: api/KendoGearboxModels
        [ResponseType(typeof(GearboxModel))]
        public async Task<IHttpActionResult> PostGearboxModel(GearboxModel gearboxModel)
        {
            int writeLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized create access.");
            }

            var em = db.GearboxModels.Where(m => m.Name == gearboxModel.Name).FirstOrDefault();
            if (em != null) ModelState.AddModelError("Duplicate", "Gearbox model already existed.");

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

        // DELETE: api/KendoGearboxModels/5
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