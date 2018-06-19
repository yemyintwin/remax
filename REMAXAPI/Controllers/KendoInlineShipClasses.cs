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
    [Authorize]
    public class KendoInlineShipClassesController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        [HttpGet]
        [Route("api/KendoInlineShipClassesTotal")]
        // GET: api/KendoInlineShipClassesTotal
        public int GetKendoInlineShipClassesTotal() {
            return db.ShipClasses.Count();
        }

        [HttpGet]
        // GET: api/KendoInlineShipClasses
        public IHttpActionResult GetKendoInlineShipClasses([FromUri]KendoRequestInline kendoRequestInline)
        {
            IEnumerable<ShipClass> result = db.ShipClasses.OrderBy(a => a.Name);

            result = result.Skip(kendoRequestInline.Skip).Take(kendoRequestInline.Take);

            return Ok(result);
        }

        // POST: api/KendoInlineShipClasses
        [HttpPost]
        [ResponseType(typeof(ShipClass))]
        public async Task<IHttpActionResult> PostKendoInlineShipClasses(ShipClass shipClass)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
            }

            var foundDup = db.ShipClasses.Where(a => a.Name == shipClass.Name).FirstOrDefault();
            if (foundDup != null)
            {
                ModelState.AddModelError("Found Duplicate", "Duplicate ship class found.");
            }

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
                if (ShipClassesExists(shipClass.Id))
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

        // PUT: api/KendoShipClassess/5
        [HttpPut]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutKendoInlineShipClasses(Guid id, ShipClass shipClass)
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
                if (!ShipClassesExists(id))
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

        // DELETE: api/KendoShipClassess/5
        [HttpDelete]
        [ResponseType(typeof(ShipClass))]
        public async Task<IHttpActionResult> DeleteKendoInlineShipClasses(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            ShipClass ShipClasses = await db.ShipClasses.FindAsync(id);
            if (ShipClasses == null)
            {
                return NotFound();
            }

            db.ShipClasses.Remove(ShipClasses);
            await db.SaveChangesAsync();

            return Ok(ShipClasses);
        }

        private bool ShipClassesExists(Guid id)
        {
            return db.ShipClasses.Count(e => e.Id == id) > 0;
        }
    }
}
