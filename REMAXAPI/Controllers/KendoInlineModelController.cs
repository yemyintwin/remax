using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic;
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
    public class KendoInlineModelController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        [HttpGet]
        [Route("api/KendoInlineModelTotal")]
        // GET: api/KendoInlineModelTotal
        public int GetKendoInlineModelTotal()
        {
            return db.Models.Count();
        }

        [HttpGet]
        // GET: api/KendoInlineModel
        public IHttpActionResult GetKendoInlineModel([FromUri]KendoRequest kendoRequest)
        {
            IQueryable<Object> models = from m in db.Models
                                         select m;

            models = models.Include("EngineType");

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
                        models = models.Where(string.Format(whereFormat, f.Field, f.Value));
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

            var sortedModels = models.OrderBy(strOrderBy);

            sortedModels = sortedModels.Skip(kendoRequest.skip).Take(kendoRequest.take);

            return Ok(sortedModels);
        }

        // POST: api/KendoInlineModel
        [HttpPost]
        [ResponseType(typeof(AlternatorMaker))]
        public async Task<IHttpActionResult> PostKendoInlineModel(Model model)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
            }
            
            var foundDup = db.Models.Where(m => m.Name == model.Name && m.EngineTypeID == model.EngineTypeID).FirstOrDefault();
            if (foundDup != null)
            {
                ModelState.AddModelError("Found Duplicate", "Duplicate engine model found.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            

            db.Models.Add(model);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ModelExists(model.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = model.Id }, model);
        }

        // PUT: api/KendoInlineModel/5
        [HttpPut]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutKendoInlineModel(Guid id, Model model)
        {
            int writeLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
            }
            var am = db.Models.Where(m => m.Name == model.Name && m.EngineTypeID == model.EngineTypeID).FirstOrDefault();
            if (am != null) ModelState.AddModelError("Duplicate", "Model name already existed.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != model.Id)
            {
                return BadRequest();
            }

            db.Entry(model).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ModelExists(id))
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

        // DELETE: api/KendoInlineModel/5
        [HttpDelete]
        [ResponseType(typeof(AlternatorMaker))]
        public async Task<IHttpActionResult> DeleteKendoInlineModel(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            Model model = await db.Models.FindAsync(id);
            if (model == null)
            {
                return NotFound();
            }

            db.Models.Remove(model);
            await db.SaveChangesAsync();

            return Ok(model);
        }


        private bool ModelExists(Guid id)
        {
            return db.Models.Count(m => m.Id == id) > 0;
        }
    }
}
