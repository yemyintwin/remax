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
    public class KendoShipTypesController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoShipTypes
        public IQueryable<ShipType> GetShipTypes()
        {
            return db.ShipTypes;
        }

        // GET: api/KendoShipTypes/5
        [ResponseType(typeof(ShipType))]
        public async Task<IHttpActionResult> GetShipType(Guid id)
        {
            ShipType shipType = await db.ShipTypes.FindAsync(id);
            if (shipType == null)
            {
                return NotFound();
            }

            return Ok(shipType);
        }

        // PUT: api/KendoShipTypes/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutShipType(Guid id, ShipType shipType)
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

            if (id != shipType.Id)
            {
                return BadRequest();
            }

            db.Entry(shipType).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ShipTypeExists(id))
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

        // POST: api/KendoShipTypes
        [ResponseType(typeof(ShipType))]
        public async Task<IHttpActionResult> PostShipType(ShipType shipType)
        {
            int writeLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized create access.");
            }

            var st = db.ShipTypes.Where(s => s.Name == shipType.Name).FirstOrDefault();
            if (st != null) ModelState.AddModelError("Duplicate", "Ship type already existed.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.ShipTypes.Add(shipType);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = shipType.Id }, shipType);
        }

        // DELETE: api/KendoShipTypes/5
        [ResponseType(typeof(ShipType))]
        public async Task<IHttpActionResult> DeleteShipType(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            ShipType shipType = await db.ShipTypes.FindAsync(id);
            if (shipType == null)
            {
                return NotFound();
            }

            db.ShipTypes.Remove(shipType);
            await db.SaveChangesAsync();

            return Ok(shipType);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ShipTypeExists(Guid id)
        {
            return db.ShipTypes.Count(e => e.Id == id) > 0;
        }
    }
}