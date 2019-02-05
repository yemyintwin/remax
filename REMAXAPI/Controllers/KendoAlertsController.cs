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
    public class KendoAlertsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoAlerts
        public async Task<KendoResponse> GetVessels([FromUri] KendoRequest kendoRequest)
        {
            int readLevel = Util.GetResourcePermission("Vessel", Util.ReourceOperations.Read);
            if (readLevel == 0) return new KendoResponse(0, null);

            User currentUser = Util.GetCurrentUser();

            List<Alert> alerts = await(
                                    from a in db.Alerts
                                    join v in db.Vessels on a.VesselId equals v.Id
                                    where
                                                // Login user is from Owing company
                                                ((v.OwnerID == currentUser.AccountID && readLevel == Util.AccessLevel.Own))
                                                ||
                                                // Login user is from Operating company
                                                ((v.OperatorID == currentUser.AccountID && readLevel == Util.AccessLevel.Own))
                                                ||
                                                // Admin user
                                                readLevel == Util.AccessLevel.All
                                    orderby a.AlertTime descending
                                    select a
                                ).ToListAsync();

            var total = alerts.Count();

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
                        alerts = alerts.Where(string.Format(whereFormat, f.Field, f.Value)).ToList();
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

            var sortedAlerts = alerts.OrderBy(strOrderBy);

            // filtereding

            // take single page data
            if (kendoRequest.take == 0) kendoRequest.take = total;
            object[] data = sortedAlerts.Skip(kendoRequest.skip).Take(kendoRequest.take).ToArray<object>();

            return new KendoResponse(total, data);
        }

        // GET: api/KendoAlerts/5
        [ResponseType(typeof(Alert))]
        public async Task<IHttpActionResult> GetAlert(Guid id)
        {
            Alert alert = await db.Alerts.FindAsync(id);
            if (alert == null)
            {
                return NotFound();
            }

            return Ok(alert);
        }

        // PUT: api/KendoAlerts/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutAlert(Guid id, Alert alert)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != alert.Id)
            {
                return BadRequest();
            }

            db.Entry(alert).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlertExists(id))
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

        // POST: api/KendoAlerts
        [ResponseType(typeof(Alert))]
        public async Task<IHttpActionResult> PostAlert(Alert alert)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Alerts.Add(alert);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (AlertExists(alert.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = alert.Id }, alert);
        }

        // DELETE: api/KendoAlerts/5
        [ResponseType(typeof(Alert))]
        public async Task<IHttpActionResult> DeleteAlert(Guid id)
        {
            Alert alert = await db.Alerts.FindAsync(id);
            if (alert == null)
            {
                return NotFound();
            }

            db.Alerts.Remove(alert);
            await db.SaveChangesAsync();

            return Ok(alert);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AlertExists(Guid id)
        {
            return db.Alerts.Count(e => e.Id == id) > 0;
        }
    }
}