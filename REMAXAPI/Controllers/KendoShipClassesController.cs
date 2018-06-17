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
    [Authorize]
    public class KendoShipClassesController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoShipClasses
        public IQueryable<ShipClass> GetShipClasses()
        {
            return db.ShipClasses;
        }

        // GET: api/KendoShipClasses/5
        [ResponseType(typeof(ShipClass))]
        public async Task<IHttpActionResult> GetShipClass(Guid id)
        {
            ShipClass shipClass = await db.ShipClasses.FindAsync(id);
            if (shipClass == null)
            {
                return NotFound();
            }

            return Ok(shipClass);
        }

        // PUT: api/KendoShipClasses/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutShipClass(Guid id, ShipClass shipClass)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != shipClass.Id)
            {
                return BadRequest();
            }

            db.Entry(shipClass).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ShipClassExists(id))
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

        // POST: api/KendoShipClasses
        [ResponseType(typeof(ShipClass))]
        public async Task<IHttpActionResult> PostShipClass(ShipClass shipClass)
        {
            int writeLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized create access.");
            }
            var sc = db.ShipClasses.Where(s => s.Name == shipClass.Name).FirstOrDefault();
            if (sc != null) ModelState.AddModelError("Duplicate", "Ship class already existed.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.ShipClasses.Add(shipClass);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ShipClassExists(shipClass.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = shipClass.Id }, shipClass);
        }

        // DELETE: api/KendoShipClasses/5
        [ResponseType(typeof(ShipClass))]
        public async Task<IHttpActionResult> DeleteShipClass(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            ShipClass shipClass = await db.ShipClasses.FindAsync(id);
            if (shipClass == null)
            {
                return NotFound();
            }

            db.ShipClasses.Remove(shipClass);
            await db.SaveChangesAsync();

            return Ok(shipClass);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ShipClassExists(Guid id)
        {
            return db.ShipClasses.Count(e => e.Id == id) > 0;
        }
    }
}