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
    public class ChannelsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        [HttpGet]
        // GET: api/Channels/Model
        public IQueryable<Object> GetChannels([FromUri]PageParameterModel page)
        {
            //int skip = (page.pageNumber - 1) * page.pageSize;
            //string[] sorting = page.sorting.Split(new char[] { ' ' });
            //string sortColumn, sortOrder, strSorting;

            //sortColumn = sortOrder = strSorting = string.Empty;

            //if (sorting.Length == 2) {
            //    sortColumn = sorting[0];
            //    sortOrder = sorting[1].ToLower();
            //}

            //if (new Channel().GetType().GetProperty(sortColumn) == null) sortColumn = "ChannelNo";
            //if (sortOrder != "asc" && sortOrder != "desc") sortOrder = "asc";
            //strSorting = string.Format("{0} {1}", sortColumn, sortOrder);

            int skip = 0;
            string strSorting = PageParameterModel.GetSortingString(page, "ChannelNo", out skip);

            var channels = (from c in db.Channels
                            orderby(strSorting)
                            select new {
                                c.Id, 
                                c.ChannelNo,
                                c.MinRange,
                                c.MaxRange,
                                c.Scale,
                                c.DisplayUnit,
                                c.LowerLimit,
                                c.UpperLimit,
                                c.MonitoringTimer
                            }
                           ).Skip(skip).Take(page.pageSize);
            return channels;
        }

        // GET: api/Channels/5
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

        // PUT: api/Channels/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutChannel(Guid id, Channel channel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != channel.Id)
            {
                return BadRequest();
            }

            db.Entry(channel).State = EntityState.Modified;

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

        // POST: api/Channels
        [ResponseType(typeof(Channel))]
        public async Task<IHttpActionResult> PostChannel(Channel channel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Channels.Add(channel);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ChannelExists(channel.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = channel.Id }, channel);
        }

        // DELETE: api/Channels/5
        [ResponseType(typeof(Channel))]
        public async Task<IHttpActionResult> DeleteChannel(Guid id)
        {
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