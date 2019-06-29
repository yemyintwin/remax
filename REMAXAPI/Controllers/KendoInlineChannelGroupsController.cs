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
    public class KendoInlineChannelGroupsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        [HttpGet]
        [Route("api/KendoInlineChannelGroupTotal")]
        // GET: api/KendoInlineChannelGroupTotal
        public int GetKendoInlineChannelGroupTotal()
        {
            return db.ChannelGroups.Count();
        }

        [HttpGet]
        // GET: api/KendoInlineChannelGroup
        public IHttpActionResult GetKendoInlineChannelGroup([FromUri]KendoRequest kendoRequest)
        {
            IQueryable<Object> channelGroups = from m in db.ChannelGroups
                                        select m;

            channelGroups = channelGroups.Include("EngineType");

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
                        channelGroups = channelGroups.Where(string.Format(whereFormat, f.Field, f.Value));
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

            var sortedChannelGroups = channelGroups.OrderBy(strOrderBy);

            sortedChannelGroups = sortedChannelGroups.Skip(kendoRequest.skip).Take(kendoRequest.take);

            return Ok(sortedChannelGroups);
        }

        // POST: api/KendoInlineChannelGroup
        [HttpPost]
        [ResponseType(typeof(AlternatorMaker))]
        public async Task<IHttpActionResult> PostKendoInlineChannelGroup(ChannelGroup ChannelGroup)
        {
            int deleteLevel = Util.GetResourcePermission("ChannelGroup", Util.ReourceOperations.Write);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
            }

            var foundDup = db.ChannelGroups.Where(m => m.Name == ChannelGroup.Name).FirstOrDefault();
            if (foundDup != null)
            {
                ModelState.AddModelError("Found Duplicate", "Duplicate channel group name found.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            db.ChannelGroups.Add(ChannelGroup);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ChannelGroupExists(ChannelGroup.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = ChannelGroup.Id }, ChannelGroup);
        }

        // PUT: api/KendoInlineChannelGroup/5
        [HttpPut]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutKendoInlineChannelGroup(Guid id, ChannelGroup ChannelGroup)
        {
            int writeLevel = Util.GetResourcePermission("ChannelGroup", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized write access.");
            }
            var am = db.ChannelGroups.Where(a => a.Name == ChannelGroup.Name).FirstOrDefault();
            if (am != null) ModelState.AddModelError("Duplicate", "Channel group name already existed.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != ChannelGroup.Id)
            {
                return BadRequest();
            }

            db.Entry(ChannelGroup).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ChannelGroupExists(id))
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

        // DELETE: api/KendoInlineChannelGroup/5
        [HttpDelete]
        [ResponseType(typeof(AlternatorMaker))]
        public async Task<IHttpActionResult> DeleteKendoInlineChannelGroup(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("ChannelGroup", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            ChannelGroup ChannelGroup = await db.ChannelGroups.FindAsync(id);
            if (ChannelGroup == null)
            {
                return NotFound();
            }

            db.ChannelGroups.Remove(ChannelGroup);
            await db.SaveChangesAsync();

            return Ok(ChannelGroup);
        }


        private bool ChannelGroupExists(Guid id)
        {
            return db.ChannelGroups.Count(m => m.Id == id) > 0;
        }
    }
}