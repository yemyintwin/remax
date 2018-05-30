using System;
using System.Collections.Generic;
using System.IO;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Dynamic;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Reflection;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using REMAXAPI;
using REMAXAPI.Models;
using REMAXAPI.Models.Kendo;

namespace REMAXAPI.Controllers
{
    [Authorize]
    public class KendoChannelsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoChannels
        public KendoResponse GetChannels([FromUri] KendoRequest kendoRequest)
        {
            int readLevel = Util.GetResourcePermission("Channel", Util.ReourceOperations.Read);
            if (readLevel == 0) return new KendoResponse(0, null);

            //User currentUser = Util.GetCurrentUser();

            IQueryable<Object> channels = from c in db.Channels
                                          select c;

            //loading related entites
            channels = channels.Include("Model")
                        .Include("ChartType");

            // total count
            var total = channels.Count();

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
                        channels = channels.Where(string.Format(whereFormat, f.Field, f.Value));
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

            var sortedChannels = channels.OrderBy(strOrderBy);

            // filtereding

            // take single page data
            if (kendoRequest.take == 0) kendoRequest.take = total;
            object[] data = sortedChannels.Skip(kendoRequest.skip).Take(kendoRequest.take).ToArray<object>();

            return new KendoResponse(total, data);
        }

        // GET: api/KendoChannels/5
        [ResponseType(typeof(Channel))]
        public async Task<IHttpActionResult> GetChannel(Guid id)
        {
            Channel channel = await db.Channels.FindAsync(id);
            if (channel == null)
            {
                return NotFound();
            }

            return Ok(channel);
        }

        // PUT: api/KendoChannels/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutChannel(Guid id, Channel channel)
        {
            int writeLevel = Util.GetResourcePermission("Channel", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized update access.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != channel.Id)
            {
                return BadRequest();
            }


            DbEntityEntry entry = db.Entry(channel);
            entry.State = EntityState.Modified;

            // Marking properties to update by compareing default object
            Channel defaultChannel = new Channel();
            entry = Util.GetUpdatedProperties(defaultChannel, channel, entry);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ChannelExists(id))
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

        // POST: api/KendoChannels
        [ResponseType(typeof(Channel))]
        public async Task<IHttpActionResult> PostChannel(Channel channel)
        {
            int writeLevel = Util.GetResourcePermission("Channel", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized create access.");
            }
            var ch = db.Channels.Where(c => c.ChannelNo == channel.ChannelNo && c.ModelID == channel.ModelID).FirstOrDefault();
            if (ch != null) ModelState.AddModelError("Duplicate", "Duplicate Channel Number for same model.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            db.Channels.Add(channel);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = channel.Id }, channel);
        }

        // DELETE: api/KendoChannels/5
        [ResponseType(typeof(Channel))]
        public async Task<IHttpActionResult> DeleteChannel(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Channel", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            Channel channel = await db.Channels.FindAsync(id);
            if (channel == null)
            {
                return NotFound();
            }

            db.Channels.Remove(channel);
            await db.SaveChangesAsync();

            return Ok(channel);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ChannelExists(Guid id)
        {
            return db.Channels.Count(e => e.Id == id) > 0;
        }
    }
}