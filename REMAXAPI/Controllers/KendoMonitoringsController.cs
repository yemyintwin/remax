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
    public class MonitorView {
        public Guid Id { get; set; }
        public string IMONo { get; set; }
        public DateTime TimeStamp { get; set; }
        public DateTime? TimeStampDateOnly { get; set; }
        public string VesselName { get; set; }
        public string SerialNo { get; set; }
        public Guid EngineID { get; set; }
        public Guid? EngineModelID { get; set; }
        public string ModelName { get; set; }
        public string ChannelNo { get; set; }
        public string Value { get; set; }
        public string DisplayUnit { get; set; }
        public string IncomingChannelName { get; set; }
        public string ChannelName { get; set; }
        public string ChartType { get; set; }
        public bool? Processed { get; set; }
    }

    public class KendoMonitoringsController : ApiController
    {
        readonly log4net.ILog logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private Remax_Entities db = new Remax_Entities();

        // GET: api/KendoMonitorings
        public KendoResponse GetMonitorings([FromUri] KendoRequest kendoRequest)
        {
            int readLevel = Util.GetResourcePermission("Vessel", Util.ReourceOperations.Read);
            if (readLevel == 0) return new KendoResponse(0, null);

            User currentUser = Util.GetCurrentUser();

            IQueryable<MonitorView> monitorings = from m in db.Monitorings

                                                 join v in db.Vessels on m.IMO_No equals v.IMO_No into mv
                                                 from m_v in mv

                                                 join e in db.Engines on m.SerialNo equals e.SerialNo into me
                                                 from m_e in me

                                                 join ml in db.Models on m_e.EngineModelID equals ml.Id into mml
                                                 from m_ml in mml.DefaultIfEmpty()

                                                 join c in db.Channels on
                                                     new { m.ChannelNo, ID = m_ml.Id } equals
                                                     new { c.ChannelNo, ID = c.ModelID.HasValue ? c.ModelID.Value : Guid.Empty }
                                                     into mch
                                                 from m_ch in mch.DefaultIfEmpty()

                                                 join ct in db.ChartTypes on m_ch.ChartTypeID equals ct.Id into mct
                                                 from m_ct in mct.DefaultIfEmpty()

                                                 where !(m.Processed.HasValue ? m.Processed.Value : false)

                                                 select new MonitorView
                                                 {
                                                     Id = m.Id,
                                                     IMONo = m.IMO_No,
                                                     TimeStamp = m.TimeStamp,
                                                     TimeStampDateOnly = DbFunctions.TruncateTime(m.TimeStamp),
                                                     VesselName = m_v.VesselName,
                                                     SerialNo = m.SerialNo,
                                                     EngineID = m_e.Id, //!= null? m_e.Id.ToString() : "",
                                                     EngineModelID = m_e.EngineModelID,
                                                     ModelName = m_ml.Name,
                                                     ChannelNo = m.ChannelNo,
                                                     Value = m.Value,
                                                     DisplayUnit = m.Unit,
                                                     IncomingChannelName = m.ChannelDescription,
                                                     ChannelName = m_ch.Name,
                                                     ChartType = m_ct.Name,
                                                     Processed = m.Processed
                                                 };


            // filtering
            if (kendoRequest.filter != null && kendoRequest.filter.Filters != null && kendoRequest.filter.Filters.Count() > 0)
            {
                List<DataFilter> filters = kendoRequest.filter.Filters.ToList();
                string strWhere = string.Empty;

                var dateFilter = (from f in filters
                                  where f.Field.ToLower() == "timestamp"
                                  select f).FirstOrDefault();

                /*
                if (dateFilter != null)
                {
                    dateFilter.Value = dateFilter.Value.Substring(0, 33);
                    try
                    {
                        serverDateFilter = DateTime.ParseExact(dateFilter.Value, "ddd MMM dd yyyy HH:mm:ss 'GMT'zzz", System.Globalization.CultureInfo.InvariantCulture);
                    }
                    catch (Exception ex)
                    {
                        if (ex.InnerException != null)
                            logger.Error(ex.InnerException.Message, ex.InnerException);
                        else
                            logger.Error(ex.Message, ex);
                    }

                    filters.Remove(dateFilter);
                    
                    dateFilter.Field = 
                    //if (dateFilter.Operator == "eq") {
                    //    filters.Add(new DataFilter { Operator = "gte", Field = dateFilter.Field, Value = string.Format("new Date(\"{0}\")", serverDateFilter.ToShortDateString()) });
                    //}
                }
                */
                foreach (var f in filters)
                {
                    string whereFormat = DataFilterOperators.Operators[f.Operator];

                    switch (f.Field.ToLower())
                    {
                        case "engineid":
                            monitorings = monitorings.Where(string.Format("EngineID.Equals(Guid(\"{0}\"))",f.Value));
                            break;
                        case "timestamp":
                            dateFilter.Value = dateFilter.Value.ToString().Substring(0, 33);
                            try
                            {
                                DateTime parsedDateTime = DateTime.ParseExact(dateFilter.Value.ToString(), "ddd MMM dd yyyy HH:mm:ss 'GMT'zzz", System.Globalization.CultureInfo.InvariantCulture);
                                parsedDateTime = parsedDateTime.Date;

                                if (f.Operator.ToLower()=="eq")
                                    monitorings = monitorings.Where(m => m.TimeStampDateOnly.HasValue ? m.TimeStampDateOnly == parsedDateTime : false);
                                else if (f.Operator.ToLower() == "gte")
                                    monitorings = monitorings.Where(m => m.TimeStampDateOnly.HasValue ? m.TimeStampDateOnly >= parsedDateTime : false);
                                else if (f.Operator.ToLower() == "lte")
                                    monitorings = monitorings.Where(m => m.TimeStampDateOnly.HasValue ? m.TimeStampDateOnly <= parsedDateTime : false);
                            }
                            catch (Exception ex)
                            {
                                if (ex.InnerException != null)
                                    logger.Error(ex.InnerException.Message, ex.InnerException);
                                else
                                    logger.Error(ex.Message, ex);
                            }
                            break;
                        default:
                            monitorings = monitorings.Where(string.Format(whereFormat, f.Field, f.Value));
                            break;
                    }
                    
                    
                }
            }

            // total count
            var total = monitorings.Count();

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

            var sortedMonitorings = monitorings.OrderBy(strOrderBy);            

            // take single page data
            if (kendoRequest.take == 0) kendoRequest.take = total;
            object[] data = sortedMonitorings.Skip(kendoRequest.skip).Take(kendoRequest.take).ToArray<object>();
            KendoResponse response = new KendoResponse(total, data);
            response.Columns = new string[] { "Id", "IMONo", "TimeStamp", "VesselName", "SerialNo", "EngineID", "EngineModelID", "ModelName", "ChannelNo", "Value", "DisplayUnit", "IncomingChannelName", "ChannelName", "ChartType", "Processed" };
            return response;
        }

        // GET: api/KendoMonitorings/5
        [ResponseType(typeof(Monitoring))]
        public async Task<IHttpActionResult> GetMonitoring(Guid id)
        {
            Monitoring monitoring = await db.Monitorings.FindAsync(id);
            if (monitoring == null)
            {
                return NotFound();
            }

            return Ok(monitoring);
        }

        // PUT: api/KendoMonitorings/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutMonitoring(Guid id, Monitoring monitoring)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != monitoring.Id)
            {
                return BadRequest();
            }

            db.Entry(monitoring).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MonitoringExists(id))
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

        // POST: api/KendoMonitorings
        [ResponseType(typeof(Monitoring))]
        public async Task<IHttpActionResult> PostMonitoring(Monitoring monitoring)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Monitorings.Add(monitoring);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (MonitoringExists(monitoring.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = monitoring.Id }, monitoring);
        }

        // DELETE: api/KendoMonitorings/5
        [ResponseType(typeof(Monitoring))]
        public async Task<IHttpActionResult> DeleteMonitoring(Guid id)
        {
            Monitoring monitoring = await db.Monitorings.FindAsync(id);
            if (monitoring == null)
            {
                return NotFound();
            }

            db.Monitorings.Remove(monitoring);
            await db.SaveChangesAsync();

            return Ok(monitoring);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool MonitoringExists(Guid id)
        {
            return db.Monitorings.Count(e => e.Id == id) > 0;
        }
    }
}