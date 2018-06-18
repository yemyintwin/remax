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
    public class KendoInlineAlternatorMakerController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        [HttpGet]
        [Route("api/KendoInlineAlternatorMakerTotal")]
        // GET: api/KendoInlineAlternatorMakerTotal
        public int GetKendoInlineAlternatorMakerTotal() {
            return db.AlternatorMakers.Count();
        }

        [HttpGet]
        // GET: api/KendoInlineAlternatorMaker
        public IHttpActionResult GetKendoInlineAlternatorMaker([FromUri]KendoRequestInline kendoRequestInline)
        {
            IEnumerable<AlternatorMaker> result = db.AlternatorMakers.OrderBy(a => a.Name);

            result = result.Skip(kendoRequestInline.Skip).Take(kendoRequestInline.Take);

            var resultWithTotal = new {
                Total = db.AlternatorMakers.Count(),
                Models = result
            };
            return Ok(result);
        }

        // POST: api/KendoInlineAlternatorMaker
        [HttpPost]
        [ResponseType(typeof(AlternatorMaker))]
        public async Task<IHttpActionResult> PostKendoInlineAlternatorMaker(AlternatorMaker alternatorMaker)
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

        // PUT: api/KendoAlternatorMakers/5
        [HttpPut]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutKendoInlineAlternatorMaker(Guid id, AlternatorMaker alternatorMaker)
        {
            int writeLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
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

        // DELETE: api/KendoAlternatorMakers/5
        [HttpDelete]
        [ResponseType(typeof(AlternatorMaker))]
        public async Task<IHttpActionResult> DeleteKendoInlineAlternatorMaker(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            AlternatorMaker alternatorMaker = await db.AlternatorMakers.FindAsync(id);
            if (alternatorMaker == null)
            {
                return NotFound();
            }

            db.AlternatorMakers.Remove(alternatorMaker);
            await db.SaveChangesAsync();

            return Ok(alternatorMaker);
        }


        private bool AlternatorMakerExists(Guid id)
        {
            return db.AlternatorMakers.Count(e => e.Id == id) > 0;
        }
    }
}
