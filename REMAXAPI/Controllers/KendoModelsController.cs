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
    public class KendoModelsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoModels
        [HttpGet]
        public IQueryable<Object> GetModels([FromUri]PageParameterModel page)
        {
            int skip = 0;
            string strSorting = PageParameterModel.GetSortingString(page, "Name", out skip);

            var models = (from m in db.Models
                            orderby (strSorting)
                            select new
                            {
                                m.Id,
                                m.Name
                            }
                           ).Skip(skip).Take(page.pageSize);
            return models;
        }

        // GET: api/KendoModels/5
        [ResponseType(typeof(Model))]
        public async Task<IHttpActionResult> GetModel(Guid id)
        {
            Model model = await db.Models.FindAsync(id);
            if (model == null)
            {
                return NotFound();
            }

            return Ok(model);
        }

        // PUT: api/KendoModels/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutModel(Guid id, Model model)
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

        // POST: api/KendoModels
        [ResponseType(typeof(Model))]
        public async Task<IHttpActionResult> PostModel(Model model)
        {
            int writeLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized create access.");
            }

            var em = db.Models.Where(m => m.Name == model.Name && m.EngineTypeID == model.EngineTypeID).FirstOrDefault();
            if (em != null) ModelState.AddModelError("Duplicate", "Engine model already existed.");

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

        // DELETE: api/KendoModels/5
        [ResponseType(typeof(Model))]
        public async Task<IHttpActionResult> DeleteModel(Guid id)
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

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ModelExists(Guid id)
        {
            return db.Models.Count(e => e.Id == id) > 0;
        }
    }
}