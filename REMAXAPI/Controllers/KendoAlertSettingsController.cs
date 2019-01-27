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
    public class KendoAlertSettingsController : ApiController
    {
        private Remax_Entities db = new Remax_Entities();

        //// GET: api/KendoAlertSettings
        //public IQueryable<AlertSetting> GetAlertSettings()
        //{
        //    return db.AlertSettings;
        //}

        public KendoResponse GetAlertSettings([FromUri] KendoRequest kendoRequest)
        {
            int readLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Read);
            if (readLevel == 0) return new KendoResponse(0, null);

            //User currentUser = Util.GetCurrentUser();

            IQueryable<AlertSetting> settings = from a in db.AlertSettings
                                           select a;

            //loading related entites
            settings = settings.Include("Model")
                        .Include("Channel");

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
                        //if (Regex.IsMatch(f.Value, @"^\d+$")) whereFormat = whereFormat.Replace("\"", "");
                        settings = settings.Where(string.Format(whereFormat, f.Field, f.Value));
                    }
                }
            }

            // total count
            var total = settings.Count();

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

            var sortedSettings = settings.OrderBy(strOrderBy);

            // take single page data
            if (kendoRequest.take == 0) kendoRequest.take = total;
            object[] data = sortedSettings.Skip(kendoRequest.skip).Take(kendoRequest.take).ToArray<object>();

            return new KendoResponse(total, data);
        }

        // GET: api/KendoAlertSettings/5
        [ResponseType(typeof(AlertSetting))]
        public async Task<IHttpActionResult> GetAlertSetting(Guid id)
        {
            AlertSetting alertSetting = await db.AlertSettings.FindAsync(id);
            if (alertSetting == null)
            {
                return NotFound();
            }

            return Ok(alertSetting);
        }

        // PUT: api/KendoAlertSettings/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutAlertSetting(Guid id, AlertSetting alertSetting)
        {
            int writeLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized update access.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != alertSetting.Id)
            {
                return BadRequest();
            }


            DbEntityEntry entry = db.Entry(alertSetting);
            entry.State = EntityState.Modified;

            // Marking properties to update by compareing default object
            AlertSetting defaultSetting = new AlertSetting();
            entry = Util.GetUpdatedProperties(defaultSetting, alertSetting, entry);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlertSettingExists(alertSetting.EngineModelID, alertSetting.ChannelID))
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

        // POST: api/KendoAlertSettings
        [ResponseType(typeof(AlertSetting))]
        public async Task<IHttpActionResult> PostAlertSetting(AlertSetting alertSetting)
        {
            int writeLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Write);
            if (writeLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized create access.");
            }
            var ch = db.AlertSettings.Where(s => s.EngineModelID == alertSetting.EngineModelID && s.ChannelID == alertSetting.ChannelID).FirstOrDefault();
            if (ch != null) ModelState.AddModelError("Duplicate", "Duplicate Channel Number for same model.");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            db.AlertSettings.Add(alertSetting);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = alertSetting.Id }, alertSetting);
        }

        // DELETE: api/KendoAlertSettings/5
        [ResponseType(typeof(AlertSetting))]
        public async Task<IHttpActionResult> DeleteAlertSetting(Guid id)
        {
            int deleteLevel = Util.GetResourcePermission("Master Data", Util.ReourceOperations.Delete);
            if (deleteLevel != 2)
            {
                ModelState.AddModelError("Access Level", "Unauthorized delete access.");
            }

            AlertSetting alertSetting = await db.AlertSettings.FindAsync(id);
            if (alertSetting == null)
            {
                return NotFound();
            }

            db.AlertSettings.Remove(alertSetting);
            await db.SaveChangesAsync();

            return Ok(alertSetting);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AlertSettingExists(Guid engineModelId, Guid channelId)
        {
            return db.AlertSettings.Count(e => e.EngineModelID == engineModelId && e.ChannelID == channelId) > 0;
        }
    }
}