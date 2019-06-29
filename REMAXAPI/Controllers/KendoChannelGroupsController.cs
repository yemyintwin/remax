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
    public class KendoChannelGroupsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoChannelGroups
        public KendoResponse GetChannelGroups([FromUri] KendoRequest kendoRequest)
        {
            int readLevel = Util.GetResourcePermission("ChannelGroup", Util.ReourceOperations.Read);
            if (readLevel == 0) return new KendoResponse(0, null);

            User currentUser = Util.GetCurrentUser();

            IQueryable<Object> channelGroups = from cg in db.ChannelGroups
                                         where readLevel == Util.AccessLevel.All
                                         select cg;

            //loading related entites
            channelGroups = channelGroups.Include("ChartType");

            // total count
            var total = channelGroups.Count();

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

            // filtereding

            // take single page data
            if (kendoRequest.take == 0) kendoRequest.take = total;
            object[] data = sortedChannelGroups.Skip(kendoRequest.skip).Take(kendoRequest.take).ToArray<object>();

            return new KendoResponse(total, data);
        }

        // GET: api/KendoChannelGroups/5
        [ResponseType(typeof(ChannelGroup))]
        public async Task<IHttpActionResult> GetChannelGroup(Guid id)
        {
            int readLevel = Util.GetResourcePermission("ChannelGroup", Util.ReourceOperations.Read);
            if (readLevel == 0) return NotFound();

            User currentUser = Util.GetCurrentUser();

            IQueryable<ChannelGroup> channelGroups = from cg in db.ChannelGroups
                                         where readLevel == Util.AccessLevel.All
                                         select cg;

            //loading related entites
            channelGroups = channelGroups.Include("ChartType");

            ChannelGroup channelGroup = await channelGroups.FirstOrDefaultAsync();
            if (channelGroup == null)
            {
                return NotFound();
            }

            return Ok(channelGroup);
        }

        // PUT: api/KendoChannelGroups/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutChannelGroup(Guid id, ChannelGroup channelGroup)
        {
            int writeLevel = Util.GetResourcePermission("ChannelGroup", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized update access.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != channelGroup.Id)
            {
                return BadRequest();
            }


            DbEntityEntry entry = db.Entry(channelGroup);
            entry.State = EntityState.Modified;

            // Marking properties to update by compareing default object
            ChannelGroup defaultChannelGroup = new ChannelGroup();
            entry = Util.GetUpdatedProperties(defaultChannelGroup, channelGroup, entry);

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

        // POST: api/KendoChannelGroups
        [ResponseType(typeof(ChannelGroup))]
        public async Task<IHttpActionResult> PostChannelGroup(ChannelGroup channelGroup)
        {
            int writeLevel = Util.GetResourcePermission("ChannelGroup", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized create access.");
            }
            var ves = db.ChannelGroups.Where(cg => cg.Name == channelGroup.Name).FirstOrDefault();
            if (ves != null) ModelState.AddModelError("Duplicate", "Duplicate Group Name.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.ChannelGroups.Add(channelGroup);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = channelGroup.Id }, channelGroup);
        }

        // DELETE: api/KendoChannelGroups/5
        [ResponseType(typeof(ChannelGroup))]
        public async Task<IHttpActionResult> DeleteChannelGroup(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("ChannelGroup", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            ChannelGroup channelGroup = await db.ChannelGroups.FindAsync(id);
            if (channelGroup == null)
            {
                return NotFound();
            }

            db.ChannelGroups.Remove(channelGroup);
            await db.SaveChangesAsync();

            return Ok(channelGroup);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ChannelGroupExists(Guid id)
        {
            return db.ChannelGroups.Count(e => e.Id == id) > 0;
        }
    }
}