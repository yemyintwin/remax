using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Dynamic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using REMAXAPI.Models;
using REMAXAPI.Models.Kendo;

namespace REMAXAPI.Controllers
{
    [Authorize]
    public class KendoAlternatorMakersController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoAlternatorMakers
        public KendoResponse GetAlternatorMakers([FromUri] KendoRequest kendoRequest)
        {
            IQueryable<AlternatorMaker> altMakers = db.AlternatorMakers;

            // total count
            var total = db.AlternatorMakers.Count();

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
                        altMakers = altMakers.Where(string.Format(whereFormat, f.Field, f.Value));
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

            var sortedAccounts = altMakers.OrderBy(strOrderBy);

            // filtereding

            // take single page data
            if (kendoRequest.take == 0) kendoRequest.take = total;
            object[] data = sortedAccounts.Skip(kendoRequest.skip).Take(kendoRequest.take).ToArray<object>();

            return new KendoResponse(total, data);
        }

        // GET: api/KendoAlternatorMakers/5
        [ResponseType(typeof(AlternatorMaker))]
        public async Task<IHttpActionResult> GetAlternatorMaker(Guid id)
        {
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

        // POST: api/KendoAlternatorMakers
        [ResponseType(typeof(AlternatorMaker))]
        public async Task<IHttpActionResult> PostAlternatorMaker(AlternatorMaker alternatorMaker)
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