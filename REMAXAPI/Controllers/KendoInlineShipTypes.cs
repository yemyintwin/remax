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
    public class KendoInlineShipTypesController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        [HttpGet]
        [Route("api/KendoInlineShipTypesTotal")]
        // GET: api/KendoInlineShipTypesTotal
        public int GetKendoInlineShipTypesTotal() {
            return db.ShipTypes.Count();
        }

        [HttpGet]
        // GET: api/KendoInlineShipTypes
        public IHttpActionResult GetKendoInlineShipTypes([FromUri]KendoRequestInline kendoRequestInline)
        {
            IEnumerable<ShipType> result = db.ShipTypes.OrderBy(a => a.Name);

            result = result.Skip(kendoRequestInline.Skip).Take(kendoRequestInline.Take);

            return Ok(result);
        }

        // POST: api/KendoInlineShipTypes
        [HttpPost]
        [ResponseType(typeof(ShipType))]
        public async Task<IHttpActionResult> PostKendoInlineShipTypes(ShipType shipType)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
            }

            var foundDup = db.ShipTypes.Where(a => a.Name == shipType.Name).FirstOrDefault();
            if (foundDup != null)
            {
                ModelState.AddModelError("Found Duplicate", "Duplicate ship type found.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.ShipTypes.Add(shipType);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ShipTypesExists(shipType.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = shipType.Id }, shipType);
        }

        // PUT: api/KendoShipTypess/5
        [HttpPut]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutKendoInlineShipTypes(Guid id, ShipType shipType)
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
                if (!ShipTypesExists(id))
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

        // DELETE: api/KendoShipTypess/5
        [HttpDelete]
        [ResponseType(typeof(ShipClass))]
        public async Task<IHttpActionResult> DeleteKendoInlineShipTypes(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            ShipType ShipTypes = await db.ShipTypes.FindAsync(id);
            if (ShipTypes == null)
            {
                return NotFound();
            }

            db.ShipTypes.Remove(ShipTypes);
            await db.SaveChangesAsync();

            return Ok(ShipTypes);
        }

        private bool ShipTypesExists(Guid id)
        {
            return db.ShipTypes.Count(e => e.Id == id) > 0;
        }
    }
}
