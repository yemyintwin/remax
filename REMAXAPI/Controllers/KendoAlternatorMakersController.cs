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
    public class KendoAlternatorMakersController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoAlternatorMakers
        public IQueryable<AlternatorMaker> GetAlternatorMakers()
        {
            return db.AlternatorMakers;
        }

        // GET: api/KendoAlternatorMakers/5
        [ResponseType(typeof(AlternatorMaker))]
        public async Task<IHttpActionResult> GetAlternatorMaker(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
            }

            AlternatorMaker alternatorMaker = await db.AlternatorMakers.FindAsync(id);
            if (alternatorMaker == null)
            {
                return NotFound();
            }

            return Ok(alternatorMaker);
        }

        // PUT: api/KendoAlternatorMakers/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutAlternatorMaker(Guid id, AlternatorMaker alternatorMaker)
        {
            int writeLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized create access.");
            }
            var am = db.AlternatorMakers.Where(a => a.Name == alternatorMaker.Name).FirstOrDefault();
            if (am != null) ModelState.AddModelError("Duplicate", "Alternator Maker already existed.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != alternatorMaker.Id)
            {
                return BadRequest();
            }

            db.Entry(alternatorMaker).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlternatorMakerExists(id))
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

        // POST: api/KendoAlternatorMakers
        [ResponseType(typeof(AlternatorMaker))]
        public async Task<IHttpActionResult> PostAlternatorMaker(AlternatorMaker alternatorMaker)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.AlternatorMakers.Add(alternatorMaker);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (AlternatorMakerExists(alternatorMaker.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = alternatorMaker.Id }, alternatorMaker);
        }

        // DELETE: api/KendoAlternatorMakers/5
        [ResponseType(typeof(AlternatorMaker))]
        public async Task<IHttpActionResult> DeleteAlternatorMaker(Guid id)
        {
            AlternatorMaker alternatorMaker = await db.AlternatorMakers.FindAsync(id);
            if (alternatorMaker == null)
            {
                return NotFound();
            }

            db.AlternatorMakers.Remove(alternatorMaker);
            await db.SaveChangesAsync();

            return Ok(alternatorMaker);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AlternatorMakerExists(Guid id)
        {
            return db.AlternatorMakers.Count(e => e.Id == id) > 0;
        }
    }
}